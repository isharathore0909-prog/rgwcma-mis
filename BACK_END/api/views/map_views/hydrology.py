
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.cache import cache

import urllib.request
import urllib.error
from urllib.parse import urlencode

from ..spatial_utils import get_map_scope, get_aspect_ratio_dims

class DrainageMapView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            gp_id = request.query_params.get('gp_id')
            boundary_data, coords, bbox_str, bbox_vals = get_map_scope(request, gp_id)
            
            if not boundary_data:
                return Response({'error': 'Scope could not be determined'}, status=status.HTTP_400_BAD_REQUEST)
            
            min_x, min_y, max_x, max_y = bbox_vals
            
            # If requesting info metadata only
            if request.query_params.get('info') == 'true':
                width, height = get_aspect_ratio_dims(min_x, min_y, max_x, max_y, base_width=1000)
                return Response({
                    'bbox': [min_x, min_y, max_x, max_y],
                    'boundary': boundary_data,
                    'width': width,
                    'height': height,
                    'layer_info': {
                        'theme': 'Scientific Drainage Pattern',
                        'source': 'OpenTopography (SRTMGL1)',
                        'method': 'Pysheds D8 (Sinks Filled)'
                    }
                })

            # Fetch with Cache
            lat = request.query_params.get('lat', '')
            lon = request.query_params.get('lon', '')
            cache_key = f"drainage_json_v6_final_{gp_id if gp_id else 'point'}_{lat}_{lon}"
            cached_json = cache.get(cache_key)
            if cached_json:
                return Response(cached_json)

            # OpenTopography API for SRTM GLO-30 / SRTMGL1
            api_key = "ffb09ce3488434d6f723f065827c6679"
            dem_api_url = f"https://portal.opentopography.org/API/globaldem?demtype=SRTMGL1&south={min_y}&north={max_y}&west={min_x}&east={max_x}&outputFormat=GTiff&API_Key={api_key}"
            
            import tempfile
            import os
            from pysheds.grid import Grid
            from rasterio.features import shapes
            from skimage.morphology import skeletonize
            
            req = urllib.request.Request(dem_api_url, headers={'User-Agent': 'Mozilla/5.0'})
            try:
                with urllib.request.urlopen(req, timeout=60) as res:
                    tiff_data = res.read()
                
                with tempfile.NamedTemporaryFile(suffix='.tif', delete=False) as tmp_file:
                    tmp_file.write(tiff_data)
                    tmp_path = tmp_file.name

                try:
                    grid = Grid.from_raster(tmp_path)
                    dem = grid.read_raster(tmp_path)
                    
                    try:
                        pit_filled_dem = grid.fill_pits(dem)
                        flooded_dem = grid.fill_depressions(pit_filled_dem)
                        resolved_dem = grid.resolve_flats(flooded_dem)
                    except Exception as e:
                        print(f"DEBUG: Sink filling failed ({e}), using raw DEM")
                        resolved_dem = dem

                    d8 = grid.flowdir(resolved_dem)
                    acc = grid.accumulation(d8)
                    
                    max_acc = acc.max()
                    # Scientific thresholding: 0.1% of max accumulation for major drainage
                    threshold = max(20, max_acc * 0.001) 

                    print(f"DEBUG: Hydrology Analysis - Max Acc: {max_acc}, Threshold: {threshold}")

                    streams_mask = (acc > threshold).astype('uint8')
                    # Skeletonize to get single-pixel lines
                    skeleton = skeletonize(streams_mask).astype('uint8')
                    
                    # Vectorize
                    results = []
                    # shapes returns polygons. For skeleton, these are tiny rectangles.
                    for s, v in shapes(skeleton, mask=(skeleton == 1), transform=grid.affine):
                        results.append({
                            "type": "Feature",
                            "properties": {"v": float(v)},
                            "geometry": s
                        })
                        if len(results) >= 20000: break
                    
                    geojson = {"type": "FeatureCollection", "features": results}
                    
                    try: os.remove(tmp_path)
                    except: pass
                        
                    width, height = get_aspect_ratio_dims(min_x, min_y, max_x, max_y, base_width=1000)
                    res_data = {
                        'calculated_drainage': geojson,
                        'bbox': [min_x, min_y, max_x, max_y],
                        'boundary': boundary_data,
                        'width': width,
                        'height': height,
                        'layer_info': {
                            'theme': 'Scientific Drainage Pattern',
                            'source': 'OpenTopography (SRTMGL1)',
                            'method': 'Pysheds D8 (Sinks Filled)',
                            'threshold_applied': threshold
                        }
                    }
                    cache.set(cache_key, res_data, 86400)
                    return Response(res_data)

                except Exception as inner_e:
                    if os.path.exists(tmp_path):
                        try: os.remove(tmp_path)
                        except: pass
                    raise inner_e
            except urllib.error.URLError as url_err:
                 raise Exception(f"OpenTopography API check failed: {url_err}")

        except (ImportError, Exception) as proc_err:
            import traceback
            error_details = traceback.format_exc()
            print(f"DEBUG: Drainage calculation failed: {proc_err}")
            # Fallback to Bhuvan WMS handled below


            # Fallback to Bhuvan WMS - using a more appropriate drainage layer
            layer_name = "india:RJ_Drainage" 
            wms_base = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms"
            
            img_w, img_h = get_aspect_ratio_dims(min_x, min_y, max_x, max_y, base_width=1000)
            
            params = {
                'SERVICE': 'WMS', 'VERSION': '1.1.1', 'REQUEST': 'GetMap',
                'LAYERS': layer_name, 'STYLES': '', 'SRS': 'EPSG:4326',
                'BBOX': bbox_str, 'WIDTH': str(img_w), 'HEIGHT': str(img_h),
                'FORMAT': 'image/png', 'TRANSPARENT': 'TRUE'
            }
            
            # If this specific layer fails, the frontend will show the error status
            return Response({
                'map_url': f"{wms_base}?{urlencode(params)}",
                'bbox': [min_x, min_y, max_x, max_y],
                'boundary': boundary_data,
                'width': img_w,
                'height': img_h,
                'error': f'Scientific calculation failed ({str(proc_err)}). Using fallback drainage.',
                'layer_info': {
                    'theme': 'Surface Drainage (Fallback)',
                    'source': 'Bhuvan (NRSC/ISRO)',
                    'layer': layer_name
                }
            })

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
