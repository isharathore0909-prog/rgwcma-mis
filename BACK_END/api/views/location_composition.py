from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import connection
from rest_framework.permissions import AllowAny
from ..models import GramPanchayat, AquiferData, WaterQuality
from .spatial_utils import get_gp_boundary, get_block_boundary, get_district_boundary, get_map_scope
from django.core.cache import cache
import json
import os
from django.conf import settings

class LocationCompositionView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        gp_id = request.query_params.get('gp_id')
        if not gp_id:
            return Response({'error': 'gp_id is required'}, status=400)

        try:
            gp = GramPanchayat.objects.get(id=gp_id)
            block = gp.block
            district = block.district

            data = {
                'meta': {
                    'gp': gp.name,
                    'block': block.name,
                    'district': district.name
                },
                'gp_boundary': None,
                'block_boundary': None,
                'district_boundary': None,
                'rajasthan_boundary': None,
                'wells': []
            }

            # 1. Load Rajasthan GeoJSON (Cached)
            rj_cache_key = "rajasthan_geojson_geom"
            rj_geom = cache.get(rj_cache_key)
            if not rj_geom:
                rj_path = os.path.join(settings.BASE_DIR, 'data', 'Rajasthan.geojson')
                if os.path.exists(rj_path):
                    with open(rj_path, 'r') as f:
                        f_data = json.load(f)
                        if f_data.get('features'):
                            rj_geom = f_data['features'][0]['geometry']
                            cache.set(rj_cache_key, rj_geom, 86400 * 7) # Cache for 1 week
            data['rajasthan_boundary'] = rj_geom

            # 2. Fetch Boundaries
            scope_data, coords, bbox_str, bbox_vals = get_map_scope(request, gp_id)
            
            if scope_data:
                min_x, min_y, max_x, max_y = bbox_vals
                data['gp_boundary'], _ = get_gp_boundary(gp_id) # The real GP boundary
                data['project_area'] = scope_data if scope_data.get('is_buffer') else None
                data['block_boundary'] = get_block_boundary(block.id)
                data['district_boundary'] = get_district_boundary(district.id)
            else:
                # Fallback values if no spatial scope could be determined
                min_x, min_y, max_x, max_y = 0, 0, 0, 0
                data['gp_boundary'] = None
                data['project_area'] = None
                data['block_boundary'] = None
                data['district_boundary'] = None

            # 3. Wells (Optimized Fetching with buffer logic)
            is_buffer_mode = scope_data.get('is_buffer') if scope_data else False
            
            if is_buffer_mode:
                wells_qs = AquiferData.objects.filter(latitude__range=(min_y, max_y), longitude__range=(min_x, max_x)).values('well_id', 'latitude', 'longitude')
                q_wells_qs = WaterQuality.objects.filter(latitude__range=(min_y, max_y), longitude__range=(min_x, max_x)).values('well_id', 'latitude', 'longitude', 'type_of_well')
            else:
                wells_qs = AquiferData.objects.filter(village__gram_panchayat_id=gp_id).values('well_id', 'latitude', 'longitude')
                q_wells_qs = WaterQuality.objects.filter(village__gram_panchayat_id=gp_id).values('well_id', 'latitude', 'longitude', 'type_of_well')

            for w in wells_qs:
                data['wells'].append({'id': w['well_id'], 'lat': w['latitude'], 'lon': w['longitude'], 'type': 'GWD Well'})
            for w in q_wells_qs:
                data['wells'].append({'id': w['well_id'], 'lat': w['latitude'], 'lon': w['longitude'], 'type': w['type_of_well'] or 'CGWB Well'})

            return Response(data)

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=500)
