
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import connection
from django.core.cache import cache
from django.http import HttpResponse

import urllib.request
from urllib.parse import urlencode
import numpy as np
import tempfile
import os

from ..spatial_utils import get_map_scope, get_aspect_ratio_dims
from .utils import get_wms_image

class DEMMapView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            gp_id = request.query_params.get('gp_id')
            boundary_data, coords, bbox_str, bbox_vals = get_map_scope(request, gp_id)
            
            if not boundary_data:
                return Response({'error': 'Scope could not be determined'}, status=status.HTTP_400_BAD_REQUEST)
            
            min_x, min_y, max_x, max_y = bbox_vals
            img_w, img_h = get_aspect_ratio_dims(min_x, min_y, max_x, max_y, base_width=800)

            # If requesting info metadata
            if request.query_params.get('info') == 'true':
                return Response({
                    'bbox': [min_x, min_y, max_x, max_y],
                    'boundary': boundary_data,
                    'width': img_w,
                    'height': img_h,
                    'layer_info': {'theme': 'Digital Elevation Model (SRTM Hillshade)', 'source': 'Terrestris / NASA SRTM', 'layer': 'SRTM30-Hillshade'}
                })

            params = {
                'SERVICE': 'WMS', 'VERSION': '1.1.1', 'REQUEST': 'GetMap',
                'LAYERS': 'SRTM30-Colored' if request.query_params.get('type') == 'colored' else 'SRTM30-Hillshade',
                'STYLES': '', 'SRS': 'EPSG:4326', 'BBOX': bbox_str,
                'WIDTH': str(img_w), 'HEIGHT': str(img_h), 'FORMAT': 'image/png', 'TRANSPARENT': 'TRUE'
            }
            wms_url = f"https://ows.terrestris.de/osm/service?{urlencode(params)}"
            
            # Cache Key
            lat = request.query_params.get('lat', '')
            lon = request.query_params.get('lon', '')
            cache_key = f"dem_{params['LAYERS']}_{gp_id}_{lat}_{lon}_{bbox_str}"
            
            img_data, content_type = get_wms_image(wms_url, cache_key)
            
            if not img_data:
                # Fallback to alternative layer if primary fails
                params['LAYERS'] = 'TOPO-WMS'
                wms_url_fb = f"https://ows.terrestris.de/osm/service?{urlencode(params)}"
                img_data, content_type = get_wms_image(wms_url_fb)
            
            if img_data:
                return HttpResponse(img_data, content_type=content_type)
            else:
                return Response({'error': 'WMS Service Unavailable'}, status=status.HTTP_504_GATEWAY_TIMEOUT)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DEMContourMapView(APIView):
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
                return Response({
                    'bbox': [min_x, min_y, max_x, max_y],
                    'boundary': boundary_data,
                    'width': 600, # Base width for contours
                    'height': get_aspect_ratio_dims(min_x, min_y, max_x, max_y, base_width=600)[1],
                    'layer_info': {
                        'theme': 'Elevation Contours (10m)',
                        'source': 'OpenTopography (SRTMGL1)',
                    }
                })

            # Fetch with Cache
            lat = request.query_params.get('lat', '')
            lon = request.query_params.get('lon', '')
            cache_key = f"dem_contour_json_v3_{gp_id if gp_id else 'point'}_{lat}_{lon}"
            cached_json = cache.get(cache_key)
            if cached_json:
                return Response(cached_json)

            # OpenTopography API
            api_key = "ffb09ce3488434d6f723f065827c6679"
            dem_api_url = f"https://portal.opentopography.org/API/globaldem?demtype=SRTMGL1&south={min_y}&north={max_y}&west={min_x}&east={max_x}&outputFormat=GTiff&API_Key={api_key}"
            
            try:
                import rasterio
                from matplotlib.figure import Figure
                from matplotlib.backends.backend_agg import FigureCanvasAgg
                print("DEBUG: Successfully imported rasterio and matplotlib")
            except ImportError as ie:
                print(f"DEBUG: Import error: {ie}")
                return Response({'error': f'Missing required library: {str(ie)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            req = urllib.request.Request(dem_api_url, headers={'User-Agent': 'Mozilla/5.0'})
            try:
                print(f"DEBUG: Fetching DEM from {dem_api_url[:100]}...")
                with urllib.request.urlopen(req, timeout=60) as res:
                    tiff_data = res.read()
                print(f"DEBUG: Downloaded {len(tiff_data)} bytes")
                
                with tempfile.NamedTemporaryFile(suffix='.tif', delete=False) as tmp_file:
                    tmp_file.write(tiff_data)
                    tmp_path = tmp_file.name
                print(f"DEBUG: Saved to {tmp_path}")

                try:
                    # Step 1: Read DEM and convert to float32 with NaN for nodata
                    with rasterio.open(tmp_path) as src:
                        dem = src.read(1).astype("float32")
                        transform = src.transform
                        nodata = src.nodata
                        
                        # Replace nodata with NaN
                        if nodata is not None:
                            dem[dem == nodata] = np.nan
                    
                    print(f"DEBUG: Read DEM, shape: {dem.shape}")
                    
                    # Step 2: Fill sinks using pysheds
                    try:
                        from pysheds.grid import Grid
                        grid = Grid.from_raster(tmp_path)
                        dem_filled = grid.fill_depressions(grid.read_raster(tmp_path))
                        dem_filled = grid.resolve_flats(dem_filled)
                        dem = np.array(dem_filled, dtype='float32')
                        print(f"DEBUG: Filled sinks and resolved flats")
                    except ImportError:
                        print(f"DEBUG: pysheds not available, skipping sink filling")
                    except Exception as e:
                        print(f"DEBUG: Sink filling failed: {e}, continuing without it")
                    
                    # Step 3: Smooth DEM to remove noise
                    try:
                        from scipy.ndimage import gaussian_filter
                        dem = gaussian_filter(dem, sigma=1)
                        print(f"DEBUG: Applied Gaussian smoothing")
                    except ImportError:
                        print(f"DEBUG: scipy not available, skipping smoothing")
                    
                    # Calculate elevation range
                    min_elev = np.nanmin(dem)
                    max_elev = np.nanmax(dem)
                    relief = max_elev - min_elev
                    print(f"DEBUG: Elevation range: {min_elev} to {max_elev}, relief: {relief}")
                    
                    # Use fixed 10m interval for consistency as requested
                    interval = 10
                    print(f"DEBUG: Using standard contour interval: {interval}m")

                    
                    # Avoid empty range
                    if min_elev == max_elev:
                        levels = [min_elev]
                    else:
                        levels = np.arange(int(min_elev), int(max_elev) + 1, interval)
                    print(f"DEBUG: Generated {len(levels)} contour levels")

                    # Step 5: Extract Contours with correct method
                    # Use Figure and FigureCanvasAgg to avoid thread-safety issues with pyplot
                    fig = Figure(figsize=(6, 6))
                    _ = FigureCanvasAgg(fig) # Attach canvas
                    ax = fig.add_subplot(111)
                    cs = ax.contour(dem, levels=levels)
                    print(f"DEBUG: Extracted contours")
                    
                    features = []

                    for level, segs in zip(cs.levels, cs.allsegs):
                        for seg in segs:
                            if len(seg) < 2:
                                continue
                            
                            # seg is array of [col, row] pairs (x, y in pixel coordinates)
                            rows = seg[:, 1]
                            cols = seg[:, 0]
                            
                            # Convert pixel coordinates to geographic coordinates
                            xs, ys = rasterio.transform.xy(transform, rows, cols)
                            
                            # Create GeoJSON LineString
                            coords = [
                                [float(x), float(y)]
                                for x, y in zip(xs, ys)
                            ]
                            
                            features.append({
                                "type": "Feature",
                                "geometry": {
                                    "type": "LineString",
                                    "coordinates": coords
                                },
                                "properties": {
                                    "elevation": float(level)
                                }
                            })
                    
                    # plt.close(fig) # Not needed when using Figure object directly as it will be GC'd
                    
                    print(f"DEBUG: Created {len(features)} contour features")
                    geojson = {"type": "FeatureCollection", "features": features}
                    
                    try: os.remove(tmp_path)
                    except: pass
                        
                    width, height = get_aspect_ratio_dims(min_x, min_y, max_x, max_y, base_width=600)
                    res_data = {
                        'contour_geojson': geojson,
                        'bbox': [min_x, min_y, max_x, max_y],
                        'boundary': boundary_data,
                        'width': width,
                        'height': height,
                        'elevation_range': {'min': float(min_elev), 'max': float(max_elev)},
                        'layer_info': {
                            'theme': 'Elevation Contours (10m)',
                            'source': 'OpenTopography (SRTMGL1)',
                        }
                    }
                    cache.set(cache_key, res_data, 86400)
                    return Response(res_data)

                except Exception as inner_e:
                    print(f"DEBUG: Inner exception: {inner_e}")
                    import traceback
                    traceback.print_exc()
                    if os.path.exists(tmp_path):
                        try: os.remove(tmp_path)
                        except: pass
                    raise inner_e
            except Exception as e:
                # If API fails, return error
                print(f"DEBUG: Outer exception: {e}")
                import traceback
                traceback.print_exc()
                return Response({'error': f"Failed to generate contours: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
