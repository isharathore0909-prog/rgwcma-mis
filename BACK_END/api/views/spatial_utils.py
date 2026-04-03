from django.db import connection
from django.core.cache import cache
import math
import urllib.request
from urllib.parse import urlencode
import xml.etree.ElementTree as ET
import re
from concurrent.futures import ThreadPoolExecutor
from ..models import GramPanchayat, RainfallInfiltrationFactor, SpecificYield

GEO_KEYWORDS = [
    'PLAIN', 'HILL', 'PEDIMENT', 'FOREST', 'WATER', 'LAND', 'CROP', 'BUILT', 
    'SCRUB', 'SAND', 'DUNE', 'VALLEY', 'RIDGE', 'PLATEAU', 'SALT', 'FALLOW', 
    'AGRICULTURE', 'VEGETATION', 'WASTE', 'COMPLEX', 'ORIGIN', 'ALLUVIAL', 'AEOLIAN',
    'URBAN', 'RURAL', 'PLANTATION', 'SETTLEMENT', 'ROCKY', 'BARREN', 'WETLAND'
]

def get_command_area_breakdown(gp_id):
    """
    Calculates the spatial intersection between a Gram Panchayat and canal Command Areas.
    Returns the total Area, Command Area, and Non-Command Area in Hectares.
    Applies the GEC-2015 100-Hectare Rule: If command area < 100 Ha, command area is ignored.
    Uses 'locationApi_grampanchayat' for GP boundaries and 'layersApi_spatiallayer' for waterbodies.
    """
    with connection.cursor() as cursor:
        cursor.execute("""
            WITH gp_meta AS (
                -- DETECT if coordinates are degrees or UTM (despite being labeled 4326)
                SELECT 
                    id,
                    geometry as raw_geom,
                    ST_X(ST_Centroid(geometry)) as cx,
                    ST_Y(ST_Centroid(geometry)) as cy
                FROM "locationApi_grampanchayat" 
                WHERE id = %s
            ),
            gp_info AS (
                SELECT 
                    id,
                    -- If Centroid X > 180, it's UTM Zone 43N or 42N (Rajasthan)
                    CASE 
                        WHEN cx > 200 THEN ST_Transform(ST_SetSRID(raw_geom, 32643), 4326)
                        ELSE ST_SetSRID(raw_geom, 4326)
                    END as geom_4326,
                    CASE 
                        WHEN cx > 200 THEN raw_geom -- Use raw for projected math
                        ELSE raw_geom
                    END as geom_projected,
                    (cx > 200) as is_projected
                FROM gp_meta
            ),
            gp_geom AS (
                SELECT 
                    geom_4326,
                    -- AREA in Hectares
                    CASE 
                        WHEN is_projected THEN (ST_Area(geom_projected) / 10000)
                        ELSE (ST_Area(geom_4326::geography) / 10000)
                    END as area_ha
                FROM gp_info
            ),
            canal_geom AS (
                -- ST_Union multiple canal features that INTERSECT true degree-based GP
                SELECT ST_Union(ST_MakeValid(geometry)) as geom 
                FROM "layersApi_spatiallayer" 
                WHERE layer_type IN ('canal', 'waterbody')
                AND ST_Intersects(geometry, (SELECT geom_4326 FROM gp_info))
            )
            SELECT 
                gp_geom.area_ha,
                COALESCE((ST_Area(ST_Intersection(gp_geom.geom_4326, COALESCE(canal_geom.geom, ST_GEOMFROMTEXT('POLYGON EMPTY', 4326)))::geography) / 10000), 0) AS command_area_ha
            FROM gp_geom
            LEFT JOIN canal_geom ON ST_Intersects(gp_geom.geom_4326, canal_geom.geom);
        """, [gp_id])
        
        row = cursor.fetchone()
        
    if not row:
         return {"has_command_area": False, "command_area": 0.0, "non_command_area": 0.0}

    total_area = row[0] or 0.0
    command_area = row[1] or 0.0

    # GEC-2015 Rule: Ignore Command Area if < 100 Hectares
    if command_area < 100:
        return {
            "has_command_area": False,
            "command_area": 0.0,
            "non_command_area": total_area
        }
    else:
        return {
            "has_command_area": True,
            "command_area": command_area,
            "non_command_area": total_area - command_area
        }

def get_gp_aquifer_formation(gp_id):
    """
    Identifies the primary aquifer for a GP by spatial intersection.
    Returns the aquifer name (Formation).
    """
    with connection.cursor() as cursor:
        cursor.execute("""
            WITH gp_geom AS (
                SELECT 
                    CASE 
                        WHEN ST_X(ST_Centroid(geometry)) > 200 THEN ST_Transform(ST_SetSRID(geometry, 32643), 4326)
                        ELSE ST_SetSRID(geometry, 4326)
                    END as geom_4326
                FROM "locationApi_grampanchayat" 
                WHERE id = %s
            )
            SELECT name 
            FROM "layersApi_spatiallayer" 
            WHERE (layer_type = 'aquifer' OR name ILIKE '%%aquifer%%')
            AND ST_Intersects(geometry, (SELECT geom_4326 FROM gp_geom))
            ORDER BY ST_Area(ST_Intersection(geometry, (SELECT geom_4326 FROM gp_geom))) DESC
            LIMIT 1
        """, [gp_id])
        row = cursor.fetchone()
        return row[0] if row else "Alluvium"

def map_formation_to_gec_seepage(formation_name):
    """
    Maps an aquifer formation name to a GEC-2015 Canal Seepage Norm category string.
    Based on the provided formation-to-seepage mapping table.
    """
    if not formation_name:
        return "Unlined canals in normal soils with some clay content along with sand"
        
    name = formation_name.lower()
    
    # Mapping based on user provided table
    sandy_keywords = ['younger alluvium', 'sandstone', 'jodhpur', 'lathi', 'nagaur', 'tertiary']
    hard_rock_keywords = [
        'granite', 'gneiss', 'bgc', 'schist', 'phyllite', 'quartzite', 
        'basalt', 'deccan trap', 'rhyolite', 'ryolite', 'hills', 'hilly area'
    ]
    normal_keywords = ['older alluvium', 'alluvium', 'bilara', 'limestone', 'shale', 'phyllite & schist']

    # Priority check for Hard Rock (often contains specific names but classified as Hard Rock)
    if any(k in name for k in hard_rock_keywords):
        return "All canals in hard rock area"
        
    # Check for Sandy
    if any(k in name for k in sandy_keywords):
        return "Unlined canals in sandy soil with some silt content"
        
    # Check for Normal
    if any(k in name for k in normal_keywords):
        return "Unlined canals in normal soils with some clay content along with sand"
    
    # Default fallback
    return "Unlined canals in normal soils with some clay content along with sand"


def get_gec_norms_for_gp(gp_id):
    """
    Identifies the primary aquifer for a GP and returns the recommended 
    Rainfall Infiltration Factor (RIF) and Specific Yield (SY) norms.
    """
    with connection.cursor() as cursor:
        cursor.execute("""
            WITH gp_geom AS (
                SELECT 
                    CASE 
                        WHEN ST_X(ST_Centroid(geometry)) > 200 THEN ST_Transform(ST_SetSRID(geometry, 32643), 4326)
                        ELSE ST_SetSRID(geometry, 4326)
                    END as geom_4326
                FROM "locationApi_grampanchayat" 
                WHERE id = {0}
            )
            SELECT name, properties
            FROM "layersApi_spatiallayer" 
            WHERE (layer_type = 'aquifer' OR name ILIKE '%%aquifer%%')
            AND ST_Intersects(geometry, (SELECT geom_4326 FROM gp_geom))
            ORDER BY ST_Area(ST_Intersection(geometry, (SELECT geom_4326 FROM gp_geom))) DESC
            LIMIT 1
        """.format(int(gp_id)))
        row = cursor.fetchone()

    if not row:
        return {"rif": 0.10, "sy": 0.02, "aquifer_name": "Unknown"}

    aquifer_name = row[0]
    props = row[1]
    if isinstance(props, str):
        import json
        try:
            props = json.loads(props)
        except:
            props = {}
    
    zone = props.get('Zone', 'B')
    is_arid = zone == 'A'
    
    # Mapping based on Rajasthan GWD nomenclature to GEC codes
    name_lower = aquifer_name.lower()
    gec_code = "AL01" # Default
    
    if "younger alluvium" in name_lower: gec_code = "AL01"
    elif "older alluvium" in name_lower: gec_code = "AL03"
    elif "sandstone" in name_lower:
        gec_code = "ST05" if is_arid else "ST01"
    elif "limestone" in name_lower: gec_code = "LS02"
    elif "shale" in name_lower: gec_code = "SH04"
    elif "granite" in name_lower or "rhyolite" in name_lower: gec_code = "GR01"
    elif "gneiss" in name_lower: gec_code = "GN02"
    elif "bgc" in name_lower: gec_code = "BG01"
    elif "schist" in name_lower: gec_code = "SC01"
    elif "phyllite" in name_lower: gec_code = "SC02"
    elif "quartzite" in name_lower: gec_code = "QZ01"
    elif "basalt" in name_lower: gec_code = "BS01"
    elif "ultra basic" in name_lower: gec_code = "BS02"
    
    # Fetch from DB models
    rif_val = 10.0
    sy_val = 2.0
    
    try:
        rif_obj = RainfallInfiltrationFactor.objects.filter(major_aquifer_code=gec_code).first()
        if rif_obj:
            rif_val = rif_obj.recommended_percent
            
        sy_obj = SpecificYield.objects.filter(major_aquifer_code=gec_code).first()
        if sy_obj:
            sy_val = sy_obj.recommended_percent
    except Exception as e:
        print(f"Error fetching norms for {gec_code}: {e}")

    return {
        "rif": rif_val / 100.0 if rif_val > 1.0 else rif_val,
        "sy": sy_val / 100.0 if sy_val > 0.5 else sy_val, # SY is usually < 0.5 decimal
        "aquifer_name": aquifer_name,
        "aquifer_code": gec_code,
        "zone": zone
    }


def is_legit_unit(p):
    if not p: return False
    p = p.strip()
    p_up = p.upper()
    if ':' in p: return False
    if p.replace('.','').replace(',','').replace('-','').isdigit(): return False
    if re.search(r'\.\d{4,}', p) or re.search(r'_\d{4,}', p): return False 
    if len(p) < 4: return False
    return any(k in p_up for k in GEO_KEYWORDS)

def get_gp_boundary(gp_id):
    cache_key = f"gp_boundary_{gp_id}"
    cached = cache.get(cache_key)
    if cached: return cached

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT ST_AsGeoJSON(
                ST_Transform(
                    CASE 
                        WHEN ST_X(ST_Centroid(geometry)) > 200 
                        THEN ST_SetSRID(geometry, 32643)
                        ELSE ST_SetSRID(geometry, 4326)
                    END,
                    4326
                )
            )::json
            FROM "locationApi_grampanchayat" 
            WHERE id = %s
        """, [gp_id])
        row = cursor.fetchone()

    if not row or not row[0]: return None, None
    result = (row[0], row[0]['coordinates'])
    cache.set(cache_key, result, 86400)
    return result

def get_block_boundary(block_id):
    cache_key = f"block_boundary_{block_id}"
    cached = cache.get(cache_key)
    if cached: return cached
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT ST_AsGeoJSON(
                ST_Transform(
                    CASE 
                        WHEN ST_X(ST_Centroid(geometry)) > 200 
                        THEN ST_SetSRID(geometry, 32643)
                        ELSE ST_SetSRID(geometry, 4326)
                    END,
                    4326
                )
            )::json FROM "locationApi_block" WHERE id = %s
        """, [block_id])
        row = cursor.fetchone()
    res = row[0] if row else None
    cache.set(cache_key, res, 86400)
    return res

def get_district_boundary(district_id):
    cache_key = f"district_boundary_{district_id}"
    cached = cache.get(cache_key)
    if cached: return cached
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT ST_AsGeoJSON(
                ST_Transform(
                    CASE 
                        WHEN ST_X(ST_Centroid(geometry)) > 200 
                        THEN ST_SetSRID(geometry, 32643)
                        ELSE ST_SetSRID(geometry, 4326)
                    END,
                    4326
                )
            )::json FROM "locationApi_district" WHERE id = %s
        """, [district_id])
        row = cursor.fetchone()
    res = row[0] if row else None
    cache.set(cache_key, res, 86400)
    return res

def get_bbox(coords, margin=0.0):
    min_x, max_x = float('inf'), float('-inf')
    min_y, max_y = float('inf'), float('-inf')
    def visit(node):
        nonlocal min_x, max_x, min_y, max_y
        if isinstance(node[0], (int, float)):
            min_x = min(min_x, node[0]); max_x = max(max_x, node[0])
            min_y = min(min_y, node[1]); max_y = max(max_y, node[1])
        else:
            for child in node: visit(child)
    visit(coords)
    if margin > 0:
        dx, dy = max_x - min_x, max_y - min_y
        min_x -= dx * margin; max_x += dx * margin
        min_y -= dy * margin; max_y += dy * margin
    return min_x, min_y, max_x, max_y

def get_map_scope(request, gp_id):
    lat = request.query_params.get('lat')
    lon = request.query_params.get('lon')
    if lat and lon and lat != 'undefined' and lon != 'undefined' and lat != 'null' and lon != 'null':
        try:
            lat_v, lon_v = float(lat), float(lon)
            if lat_v == 0 or lon_v == 0:
                raise ValueError("Zero coordinates")
                
            d_lat = 5.0 / 111.32
            d_lon = 5.0 / (111.32 * math.cos(math.radians(lat_v)))
            min_x, max_x = lon_v - d_lon, lon_v + d_lon
            min_y, max_y = lat_v - d_lat, lat_v + d_lat
            bbox_str = f"{min_x},{min_y},{max_x},{max_y}"
            
            # Create a circular buffer for clipping
            buffer_coords = []
            for a in range(0, 361, 10):
                angle = math.radians(a)
                buffer_coords.append([
                    lon_v + d_lon * math.cos(angle),
                    lat_v + d_lat * math.sin(angle)
                ])
                
            boundary_data = {
                "type": "Polygon",
                "coordinates": [buffer_coords],
                "is_buffer": True,
                "center": [lon_v, lat_v],
                "radius_km": 5
            }
            return boundary_data, boundary_data['coordinates'], bbox_str, (min_x, min_y, max_x, max_y)
        except Exception as e:
            print(f"DEBUG: Failed to parse lat/lon for buffer: {e}")
            pass
    boundary_data, coords = get_gp_boundary(gp_id)
    if not boundary_data:
        # Fallback: Try to find center of wells for this GP
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT AVG(aq.longitude), AVG(aq.latitude) 
                FROM "aquiferApi_aquiferdata" aq
                INNER JOIN "locationApi_village" v ON aq.village_id = v.id
                WHERE v.grampanchayat_id = %s AND aq.latitude IS NOT NULL AND aq.longitude IS NOT NULL
            """, [gp_id])
            row = cursor.fetchone()
            if row and row[0] and row[1]:
                lon_v, lat_v = float(row[0]), float(row[1])
                # Create a 5km buffer around well center
                d_lat = 5.0 / 111.32
                d_lon = 5.0 / (111.32 * math.cos(math.radians(lat_v)))
                min_x, max_x = lon_v - d_lon, lon_v + d_lon
                min_y, max_y = lat_v - d_lat, lat_v + d_lat
                bbox_str = f"{min_x},{min_y},{max_x},{max_y}"
                
                buffer_coords = []
                for a in range(0, 361, 10):
                    angle = math.radians(a)
                    buffer_coords.append([lon_v + d_lon * math.cos(angle), lat_v + d_lat * math.sin(angle)])
                
                boundary_data = {
                    "type": "Polygon",
                    "coordinates": [buffer_coords],
                    "is_buffer": True,
                    "center": [lon_v, lat_v],
                    "radius_km": 5,
                    "inferred": True
                }
                return boundary_data, boundary_data['coordinates'], bbox_str, (min_x, min_y, max_x, max_y)
        
        # Second Fallback: Try parent Block
        try:
            gp_obj = GramPanchayat.objects.get(id=gp_id)
            block_data = get_block_boundary(gp_obj.block_id)
            if block_data:
                coords = block_data['coordinates']
                min_x, min_y, max_x, max_y = get_bbox(coords)
                bbox_str = f"{min_x},{min_y},{max_x},{max_y}"
                return block_data, coords, bbox_str, (min_x, min_y, max_x, max_y)
        except Exception as be:
            print(f"DEBUG: Block fallback failed: {be}")
            pass

        return None, None, None, None
        
    min_x, min_y, max_x, max_y = get_bbox(coords)
    margin_x, margin_y = (max_x - min_x) * 0.1, (max_y - min_y) * 0.1
    bbox_str = f"{min_x - margin_x},{min_y - margin_y},{max_x + margin_x},{max_y + margin_y}"
    return boundary_data, coords, bbox_str, (min_x, min_y, max_x, max_y)

def get_aspect_ratio_dims(min_x, min_y, max_x, max_y, base_width=1000):
    dx, dy = max_x - min_x, max_y - min_y
    if dy == 0: return base_width, base_width
    
    # Correction for longitudinal distance based on latitude
    avg_lat = (min_y + max_y) / 2
    cos_lat = math.cos(math.radians(avg_lat))
    
    # Geographic Aspect Ratio on screen = (dx * cos_lat) / dy
    # We want Width/Height = dx_corrected / dy
    width = base_width
    height = int(width * (dy / (dx * cos_lat)))
    
    if height > 1500:
        height = 1200
        width = int(height * (dx * cos_lat / dy))
    
    return width, height

def discover_via_gfi_single(layer, bbox_str, x, y):
    gfi_params = {
        'SERVICE': 'WMS', 'VERSION': '1.1.1', 'REQUEST': 'GetFeatureInfo', 'LAYERS': layer, 'QUERY_LAYERS': layer,
        'BBOX': bbox_str, 'WIDTH': '1000', 'HEIGHT': '1000', 'X': str(x), 'Y': str(y), 'FORMAT': 'image/png',
        'INFO_FORMAT': 'text/html', 'SRS': 'EPSG:4326'
    }
    try:
        url = f"https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms?{urlencode(gfi_params)}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as res:
            html = res.read().decode('utf-8', errors='ignore')
            return {p.strip() for p in re.findall(r'>([^<]{3,100})<', html) if is_legit_unit(p)}
    except: return set()

def discover_via_gfi(layer, bbox_str):
    samples = [(500, 500), (250, 250), (750, 750), (250, 750), (750, 250)]
    discovered = set()
    with ThreadPoolExecutor(max_workers=5) as executor:
        for res in executor.map(lambda p: discover_via_gfi_single(layer, bbox_str, p[0], p[1]), samples):
            discovered.update(res)
    return discovered

def get_map_legend_data(gp_id, layer_name, bbox_str, palette):
    # Use both GP ID and BBOX to ensure different collections for buffer vs GP
    import hashlib
    bbox_hash = hashlib.md5(bbox_str.encode()).hexdigest()[:8]
    cache_key = f"legend_{layer_name}_{gp_id}_{bbox_hash}"
    cached = cache.get(cache_key)
    if cached: return cached
    discovered = set()
    try:
        [min_x, min_y, max_x, max_y] = [float(c) for c in bbox_str.split(',')]
        wfs_params = {
            'service': 'WFS', 'version': '1.1.0', 'request': 'GetFeature', 'typeName': layer_name,
            'srsName': 'EPSG:4326', 'bbox': f"{min_x},{min_y},{max_x},{max_y}", 'maxFeatures': '200'
        }
        url = f"https://bhuvan-vec2.nrsc.gov.in/bhuvan/wfs?{urlencode(wfs_params)}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as res:
            content = res.read()
            try:
                root = ET.fromstring(content)
                ns = {'gml': 'http://www.opengis.net/gml', 'd': 'http://www.bhuvan.nrsc.gov.in'} 
                for f in root.findall('.//gml:featureMember', ns):
                    for child in f[0]:
                        tag = child.tag.split('}')[-1]
                        val = child.text.strip() if child.text else ""
                        if tag in ['LULC_C', 'L3_DESC', 'L1_DESC', 'GEOM_UNIT', 'DESCR', 'LITHOLOGY'] and is_legit_unit(val):
                            discovered.add(val)
            except: pass
            if len(discovered) < 2:
                for m in re.findall(r'>([^<]{4,60})<', content.decode('utf-8', errors='ignore')):
                    if is_legit_unit(m): discovered.add(m.strip())
    except: pass
    if not discovered or any('DISABLED' in u.upper() for u in discovered):
        discovered.update(discover_via_gfi(layer_name, bbox_str))
    final = []
    seen = set()
    for unit in sorted(list(discovered)):
        if unit.upper() in seen: continue
        color = None
        for k, v in palette.items():
            if k.lower() in unit.lower() or unit.lower() in k.lower():
                color = v; break
        final.append({'name': unit, 'color': color or "#94A3B8"})
        seen.add(unit.upper())
    cache.set(cache_key, final, 86400); return final
