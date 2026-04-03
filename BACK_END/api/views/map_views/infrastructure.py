
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import connection, models
from django.core.cache import cache

import urllib.request
from urllib.parse import urlencode
import json

from ..spatial_utils import get_map_scope
from .utils import haversine

class InfrastructureInfoView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            gp_id = request.query_params.get('gp_id')
            boundary_data, coords, bbox_str, bbox_vals = get_map_scope(request, gp_id)
            
            if not boundary_data:
                return Response({'error': 'Scope could not be determined'}, status=status.HTTP_400_BAD_REQUEST)

            # Get center of the area
            if boundary_data.get('is_buffer'):
                lon_center, lat_center = boundary_data['center']
            else:
                min_x, min_y, max_x, max_y = bbox_vals
                lat_center = (min_y + max_y) / 2
                lon_center = (min_x + max_x) / 2

            cache_key = f"infra_v2_{gp_id}_{lat_center}_{lon_center}"
            cached_data = cache.get(cache_key)
            if cached_data:
                return Response(cached_data)

            # Overpass API query
            overpass_url = "https://overpass-api.de/api/interpreter"
            query = f"""
            [out:json][timeout:25];
            (
              node["amenity"~"hospital|health|clinic"](around:20000,{lat_center},{lon_center});
              way["amenity"~"hospital|health|clinic"](around:20000,{lat_center},{lon_center});
              node["railway"="station"](around:50000,{lat_center},{lon_center});
              node["amenity"="bus_station"](around:20000,{lat_center},{lon_center});
              node["aeroway"="aerodrome"](around:100000,{lat_center},{lon_center});
            );
            out center;
            """
            
            data = urlencode({'data': query}).encode()
            req = urllib.request.Request(overpass_url, data=data)
            
            infrastructure = {
                'hospital': None,
                'railway_station': None,
                'bus_station': None,
                'airport': None
            }

            try:
                with urllib.request.urlopen(req, timeout=15) as response:
                    res = json.loads(response.read().decode())
                    elements = res.get('elements', [])
                    
                    def get_el_pos(el):
                        lat = el.get('lat')
                        lon = el.get('lon')
                        if lat is None or lon is None:
                             lat = el.get('center', {}).get('lat')
                             lon = el.get('center', {}).get('lon')
                        return lat, lon

                    hospitals, railways, buses, airports = [], [], [], []
                    
                    for el in elements:
                        tags = el.get('tags', {})
                        lat, lon = get_el_pos(el)
                        if lat is None or lon is None: continue
                        
                        dist_km = haversine(lat_center, lon_center, lat, lon)
                        item = {'name': tags.get('name') or "Unnamed", 'distance_km': round(dist_km, 2)}
                        
                        if tags.get('amenity') in ['hospital', 'health', 'clinic']:
                            hospitals.append(item)
                        elif tags.get('railway') == 'station':
                            railways.append(item)
                        elif tags.get('amenity') == 'bus_station':
                            buses.append(item)
                        elif tags.get('aeroway') == 'aerodrome':
                            airports.append(item)

                    def get_best(items):
                        if not items: return None
                        return min(items, key=lambda x: x['distance_km'])

                    infrastructure['hospital'] = get_best(hospitals)
                    infrastructure['railway_station'] = get_best(railways)
                    infrastructure['bus_station'] = get_best(buses)
                    infrastructure['airport'] = get_best(airports)
            except Exception as e:
                print(f"DEBUG: Overpass API failed: {e}")

            cache.set(cache_key, infrastructure, 86400 * 7)
            return Response(infrastructure)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class WaterbodiesInfoView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            gp_id = request.query_params.get('gp_id')
            lat = request.query_params.get('lat')
            lon = request.query_params.get('lon')

            if not (lat and lon) and gp_id:
                # Use standard project utility for consistent coordinate/SRID handling
                from ..spatial_utils import get_map_scope
                scope = get_map_scope(request, gp_id)
                boundary_data, coords, bbox_str, bbox_vals = scope
                if bbox_vals:
                    min_x, min_y, max_x, max_y = bbox_vals
                    # Use center of bounding box as the point for spatial query
                    lon = (min_x + max_x) / 2
                    lat = (min_y + max_y) / 2
            
            if lat is None or lon is None:
                return Response({'error': 'Coordinates could not be determined for this GP/Point'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                lat_f = float(lat)
                lon_f = float(lon)
            except (ValueError, TypeError) as e:
                return Response({'error': f'Invalid coordinate format: {e}'}, status=status.HTTP_400_BAD_REQUEST)

            with connection.cursor() as cursor:
                cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'spatial_waterbody');")
                if not cursor.fetchone()[0]:
                    return Response({
                        'wetland_status': 'NO',
                        'major_water_bodies': 'Water layer not loaded',
                        'found_count': 0
                    })

                cursor.execute("""
                    SELECT DISTINCT river, name, type_code, ST_Distance(
                        geometry::geography, 
                        ST_SetSRID(ST_Point(%s, %s), 4326)::geography
                    ) as dist
                    FROM spatial_waterbody
                    WHERE ST_DWithin(
                        geometry::geography, 
                        ST_SetSRID(ST_Point(%s, %s), 4326)::geography,
                        5000
                    )
                    ORDER BY dist ASC;
                """, [lon_f, lat_f, lon_f, lat_f])
                
                rows = cursor.fetchall()
            
            major_bodies_set = set()
            for river, name, tcode, dist in rows:
                # Prefer river name if available
                val = river.strip() if river and river.strip() else name.strip()
                if val and val.lower() not in ["", "unknown", "none", "n/a", "-"] and len(val) > 2:
                    major_bodies_set.add(val)
            
            # Convert to sorted list and pick top 5
            major_bodies = sorted(list(major_bodies_set))[:5]
                
            return Response({
                'wetland_status': 'YES' if rows else 'NO',
                'major_water_bodies': ', '.join(major_bodies) if major_bodies else 'None found within 5km radius',
                'found_count': len(rows)
            })

        except Exception as e:
            import traceback
            traceback.print_exc() # Print to terminal for debugging
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
