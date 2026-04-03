
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.cache import cache
from django.http import HttpResponse

import urllib.request
from urllib.parse import urlencode

from ..spatial_utils import get_map_scope, get_map_legend_data, get_aspect_ratio_dims
from .constants import GEOMORPHOLOGY_PALETTE, LULC_PALETTE

class GeomorphologyMapView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            gp_id = request.query_params.get('gp_id')
            boundary_data, coords, bbox_str, bbox_vals = get_map_scope(request, gp_id)
            
            if not boundary_data:
                return Response({'error': 'Scope could not be determined'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Bhuvan WMS
            layer_name = "geomorphology:RJ_GM50K_0506"
            wms_base = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms"
            
            min_x, min_y, max_x, max_y = bbox_vals
            img_w, img_h = get_aspect_ratio_dims(min_x, min_y, max_x, max_y, base_width=1200)
            
            params = {
                'SERVICE': 'WMS', 'VERSION': '1.1.1', 'REQUEST': 'GetMap',
                'LAYERS': layer_name, 'STYLES': '', 'SRS': 'EPSG:4326',
                'BBOX': bbox_str, 'WIDTH': str(img_w), 'HEIGHT': str(img_h),
                'FORMAT': 'image/png', 'TRANSPARENT': 'TRUE'
            }
            wms_url = f"{wms_base}?{urlencode(params)}"
            
            # Discovery
            units_with_colors = get_map_legend_data(gp_id if gp_id else "POINT", layer_name, bbox_str, GEOMORPHOLOGY_PALETTE)

            # If requesting info metadata only
            if request.query_params.get('info') == 'true':
                return Response({
                    'bbox': list(bbox_vals),
                    'boundary': boundary_data,
                    'found_units': units_with_colors,
                    'width': img_w,
                    'height': img_h,
                    'layer_info': {'theme': 'Geomorphology', 'source': 'Bhuvan (NRSC/ISRO)', 'layer': layer_name}
                })

            # Fetch with Cache
            cache_key = f"geomorph_{gp_id}_{bbox_str}"
            cached_img = cache.get(cache_key)
            if cached_img:
                return HttpResponse(cached_img, content_type='image/png')

            try:
                req = urllib.request.Request(wms_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=15) as response:
                    img_data = response.read()
                    cache.set(cache_key, img_data, 86400)
                    return HttpResponse(img_data, content_type='image/png')
            except Exception as e:
                # If proxy fails, return metadata with the direct URL as fallback for frontend
                return Response({
                    'map_url': wms_url, # Fallback
                    'bbox': list(bbox_vals),
                    'boundary': boundary_data,
                    'found_units': units_with_colors,
                    'width': img_w,
                    'height': img_h,
                    'layer_info': {'theme': 'Geomorphology', 'source': 'Bhuvan (NRSC/ISRO)', 'layer': layer_name}
                })

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LULCMapView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            gp_id = request.query_params.get('gp_id')
            boundary_data, coords, bbox_str, bbox_vals = get_map_scope(request, gp_id)
            
            if not boundary_data:
                return Response({'error': 'Scope could not be determined'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Bhuvan WMS (LULC)
            layer_name = "lulc:RJ_LULC50K_1516" 
            wms_base = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms"
            
            min_x, min_y, max_x, max_y = bbox_vals
            img_w, img_h = get_aspect_ratio_dims(min_x, min_y, max_x, max_y, base_width=1200)

            params = {
                'SERVICE': 'WMS', 'VERSION': '1.1.1', 'REQUEST': 'GetMap',
                'LAYERS': layer_name, 'STYLES': '', 'SRS': 'EPSG:4326',
                'BBOX': bbox_str, 'WIDTH': str(img_w), 'HEIGHT': str(img_h),
                'FORMAT': 'image/png', 'TRANSPARENT': 'TRUE'
            }
            wms_url = f"{wms_base}?{urlencode(params)}"
            
            units_with_colors = get_map_legend_data(gp_id if gp_id else "POINT", layer_name, bbox_str, LULC_PALETTE)

            # If requesting info metadata only
            if request.query_params.get('info') == 'true':
                return Response({
                    'bbox': list(bbox_vals),
                    'boundary': boundary_data,
                    'found_units': units_with_colors,
                    'width': img_w,
                    'height': img_h,
                    'layer_info': {'theme': 'Land Use / Land Cover', 'source': 'Bhuvan (NRSC/ISRO)', 'layer': layer_name}
                })

            # Fetch with Cache
            cache_key = f"lulc_{gp_id}_{bbox_str}"
            cached_img = cache.get(cache_key)
            if cached_img:
                return HttpResponse(cached_img, content_type='image/png')

            try:
                req = urllib.request.Request(wms_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=15) as response:
                    img_data = response.read()
                    cache.set(cache_key, img_data, 86400)
                    return HttpResponse(img_data, content_type='image/png')
            except Exception as e:
                return Response({
                    'map_url': wms_url, # Fallback
                    'bbox': list(bbox_vals),
                    'boundary': boundary_data,
                    'found_units': units_with_colors,
                    'width': img_w,
                    'height': img_h,
                    'layer_info': {'theme': 'Land Use / Land Cover', 'source': 'Bhuvan (NRSC/ISRO)', 'layer': layer_name}
                })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
