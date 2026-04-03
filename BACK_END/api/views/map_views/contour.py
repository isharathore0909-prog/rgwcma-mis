
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import F
import math

from ...models import GramPanchayat, WaterQuality, AquiferData
from ...services.mapping import generate_contour_map, get_parameter_analysis, utm_to_latlon
from ..spatial_utils import get_map_scope

class ContourMapView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            gp_id = request.query_params.get('gp_id')
            parameter = request.query_params.get('parameter', 'pre_2024')
            
            if not gp_id:
                return Response({'error': 'gp_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                gp = GramPanchayat.objects.get(id=gp_id)
            except GramPanchayat.DoesNotExist:
                return Response({'error': f'GramPanchayat with id {gp_id} not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # 1. Fetch Scope and Boundary
            boundary_data, coords, bbox_str, bbox_vals = get_map_scope(request, gp_id)
            if not boundary_data:
                return Response({
                    'error': 'Map scope could not be determined',
                    'heatmap_url': None,
                    'analysis': {'buckets': [], 'unit': 'N/A', 'is_quality': False},
                    'well_count': 0
                }, status=status.HTTP_200_OK)
            
            min_x, min_y, max_x, max_y = bbox_vals
            
            # 2. Fetch Well Points 
            # (We use a slightly larger area than the display box 
            # to ensure interpolation is smooth at the edges)
            padding = (max_x - min_x) * 0.2
            search_min_x, search_max_x = min_x - padding, max_x + padding
            search_min_y, search_max_y = min_y - padding, max_y + padding

            p_lower = parameter.lower()
            is_decadal = p_lower in ['decadal_pre', 'decadal_pst']
            # Improved check: if it starts with pre_ or pst_, it's aquifer data. 
            # Otherwise, if it's not decadal, it's quality data.
            is_aquifer = is_decadal or p_lower.startswith('pre_') or p_lower.startswith('pst_')
            is_quality = not is_aquifer
            
            from django.db.models import Q
            try:
                # Build a robust query:
                # 1. Spatial search (find neighbors for smooth contours)
                # 2. Block-based search (ensure we get all wells in the target area)
                
                if is_decadal:
                    prefix = "pre" if "pre" in p_lower else "pst"
                    years = range(2015, 2025)
                    cols = [f"{prefix}_{y}" for y in years]
                    
                    spatial_query = Q(
                        latitude__range=(search_min_y, search_max_y),
                        longitude__range=(search_min_x, search_max_x)
                    )
                    block_query = Q(village__gram_panchayat__block_id=gp.block_id)
                    
                    raw_wells = AquiferData.objects.filter(spatial_query | block_query).distinct()
                    
                    pts_data = []
                    for w in raw_wells:
                        vals = [getattr(w, c) for c in cols if getattr(w, c) is not None]
                        vals = [v for v in vals if not (isinstance(v, float) and (math.isnan(v) or math.isinf(v)))]
                        if vals:
                            avg_val = sum(vals) / len(vals)
                            pts_data.append({'lat': w.latitude, 'lon': w.longitude, 'val': avg_val})
                    raw_pts = pts_data
                elif is_quality:
                    spatial_query = Q(
                        latitude__range=(search_min_y, search_max_y),
                        longitude__range=(search_min_x, search_max_x)
                    )
                    block_query = Q(village__gram_panchayat__block_id=gp.block_id)
                    
                    raw_pts = WaterQuality.objects.filter(spatial_query | block_query).distinct().values('latitude', 'longitude', val=F(parameter))
                else:
                    spatial_query = Q(
                        latitude__range=(search_min_y, search_max_y),
                        longitude__range=(search_min_x, search_max_x)
                    )
                    block_query = Q(village__gram_panchayat__block_id=gp.block_id)
                    
                    raw_pts = AquiferData.objects.filter(spatial_query | block_query).distinct().values('latitude', 'longitude', val=F(parameter))
            except Exception as fe:
                return Response({'error': f'Parameter "{parameter}" not available: {str(fe)}'}, status=status.HTTP_400_BAD_REQUEST)

            def extract_pts(source_pts):
                clean_pts = []
                for p in source_pts:
                    # Strict None checks to handle 0.0 correctly
                    lat = p.get('latitude') if p.get('latitude') is not None else p.get('lat')
                    lon = p.get('longitude') if p.get('longitude') is not None else p.get('lon')
                    val = p.get('val')
                    
                    if lat is None or lon is None or val is None: continue
                    
                    # Skip (0,0) placeholder coordinates which cause flat maps
                    if abs(float(lat)) < 0.001 and abs(float(lon)) < 0.001: 
                        continue
                        
                    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)): continue
                    
                    # Detect and convert UTM (Rajasthan Northing is ~3M, Easting ~500k)
                    if lon > 200 or lat > 100: 
                        lon, lat = utm_to_latlon(lon, lat)
                        
                    clean_pts.append({'lat': lat, 'lon': lon, 'val': val})
                return clean_pts

            pts = extract_pts(raw_pts)

            # Fallback Logic: If no data found for the specific year, look back in time
            if not pts and is_aquifer and not is_decadal:
                try:
                    import re
                    match = re.search(r'(\d{4})', parameter)
                    if match:
                        requested_year = int(match.group(1))
                        prefix = "pre_" if "pre" in parameter.lower() else "pst_"
                        for yr in range(requested_year - 1, max(2014, requested_year - 5), -1):
                            fallback_param = f"{prefix}{yr}"
                            subset = AquiferData.objects.filter(spatial_query | block_query).distinct()
                            fallback_pts_raw = subset.values('latitude', 'longitude', val=F(fallback_param))
                            pts = extract_pts(fallback_pts_raw)
                            if pts:
                                print(f"DEBUG: Found {len(pts)} points in fallback year {yr}")
                                parameter = fallback_param 
                                break
                except Exception as ex:
                    print(f"DEBUG: Fallback error: {ex}")
                    pass

            if not pts:
                print(f"DEBUG: No data points found for {gp_id} after filtering/fallback.")
                return Response({
                    'message': 'No monitoring data with valid coordinates found for this area (2015-2024)',
                    'heatmap_url': "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", 
                    'analysis': get_parameter_analysis(parameter, []),
                    'well_count': 0,
                    'boundary': boundary_data,
                    'bbox': [min_x, min_y, max_x, max_y],
                    'contour_geojson': {'type': 'FeatureCollection', 'features': []}
                }, status=status.HTTP_200_OK)

            # 4. Calculate Analysis
            all_vals = [p['val'] for p in pts]
            analysis = get_parameter_analysis(parameter, all_vals)
            
            # 5. Determine Projection bounds
            b_min_x, b_min_y, b_max_x, b_max_y = min_x, min_y, max_x, max_y
            
            dx = b_max_x - b_min_x or 0.01
            dy = b_max_y - b_min_y or 0.01
            avg_lat = (b_min_y + b_max_y) / 2
            cos_lat = math.cos(math.radians(avg_lat))

            # To make geographic distance equal in X and Y on screen (Plate Carree),
            # we need PixelWidth/PixelHeight = (dx * cos_lat) / dy
            width = 600
            height = int(width * (dy / (dx * cos_lat)))

            # Sanity check: cap dimensions to avoid excessive memory usage
            if height > 1000:
                height = 1000
                width = int(height * (dx * cos_lat / dy))
            elif height < 100:
                height = 100
                width = int(height * (dx * cos_lat / dy))
            
            proj_bounds = {
                'minX': b_min_x - dx * 0.05,
                'maxX': b_max_x + dx * 0.05,
                'minY': b_min_y - dy * 0.05,
                'maxY': b_max_y + dy * 0.05
            }

            def project_pt(lon, lat, b):
                px = ((lon - b['minX']) / (b['maxX'] - b['minX'])) * width
                py = height - ((lat - b['minY']) / (b['maxY'] - b['minY'])) * height
                return px, py

            proj_pts = []
            for p in pts:
                px, py = project_pt(p['lon'], p['lat'], proj_bounds)
                proj_pts.append({'x': px, 'y': py, 'v': p['val']})

            # 6. Generate Map Image
            heatmap_url = generate_contour_map(
                proj_pts, proj_bounds, width, height, p=2.5, 
                buckets=analysis['buckets'], show_labels=True,
                high_density=not analysis['is_quality']
            )



            return Response({
                'heatmap_url': heatmap_url,
                'analysis': analysis,
                'well_count': len(pts),
                'boundary': boundary_data,
                'bbox': [min_x, min_y, max_x, max_y],
                'width': width,
                'height': height,
                'contour_geojson': {'type': 'FeatureCollection', 'features': []}
            })

        except Exception as e:
            import traceback
            print(f"ERROR in ContourMapView: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
