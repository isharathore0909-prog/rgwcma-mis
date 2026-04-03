
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import connection
from django.core.cache import cache

from ..spatial_utils import get_map_scope

class AquiferMapView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            gp_id = request.query_params.get('gp_id')
            boundary_data, coords, bbox_str, bbox_vals = get_map_scope(request, gp_id)
            
            if not boundary_data:
                return Response({'error': 'Scope could not be determined'}, status=status.HTTP_400_BAD_REQUEST)

            with connection.cursor() as cursor:
                # 1. Resolve Table Name (Cached)
                table_cache_key = "spatial_layer_table_name"
                vals_table_name = cache.get(table_cache_key)
                
                if not vals_table_name:
                    cursor.execute("""
                        SELECT table_name FROM information_schema.tables 
                        WHERE table_name ILIKE 'layer%spatiallayer' LIMIT 1
                    """)
                    table_match = cursor.fetchone()
                    vals_table_name = table_match[0] if table_match else 'layerApi_spatiallayer'
                    cache.set(table_cache_key, vals_table_name, 3600)

                # 2. Get Columns (Cached)
                col_cache_key = f"cols_{vals_table_name}"
                columns = cache.get(col_cache_key)
                if not columns:
                    cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{vals_table_name}'")
                    columns = [row[0] for row in cursor.fetchall()]
                    cache.set(col_cache_key, columns, 3600)
                
                geom_col = next((c for c in columns if c.lower() in ['geometry', 'geom', 'the_geom']), 'geometry')
                prop_cols = [c for c in columns if c.lower() not in ['geometry', 'geom', 'the_geom', 'id']]
                has_layer_type = 'layer_type' in columns
                props_select = ', '.join([f'l."{c}"' for c in prop_cols]) if prop_cols else "'No properties' as info"
                
                # 3. Build Query
                layer_condition = "AND l.layer_type = 'aquifer'" if has_layer_type else ""
                
                if boundary_data.get('is_buffer'):
                    lon_v, lat_v = boundary_data['center']
                    mask_geom = f"ST_Buffer(ST_SetSRID(ST_Point({lon_v}, {lat_v}), 4326)::geography, 5000)::geometry"
                    where_clause = f'ST_Intersects(l."{geom_col}", {mask_geom}) {layer_condition}'
                else:
                    mask_geom = """
                        CASE 
                            WHEN ST_X(ST_Centroid(gp.geometry)) > 200 
                            THEN ST_Transform(ST_SetSRID(gp.geometry, 32643), 4326) 
                            ELSE gp.geometry 
                        END
                    """
                    where_clause = f'gp.id = %s AND ST_Intersects(l."{geom_col}", {mask_geom}) {layer_condition}'

                query = f"""
                    SELECT 
                        ST_AsGeoJSON(ST_Transform(ST_Intersection(ST_MakeValid(l."{geom_col}"), ST_MakeValid({mask_geom})), 4326))::json as geojson,
                        {props_select}
                    FROM "{vals_table_name}" l
                    {"" if boundary_data.get("is_buffer") else ', "locationApi_grampanchayat" gp'}
                    WHERE {where_clause}
                """
                
                if boundary_data.get('is_buffer'):
                    cursor.execute(query)
                else:
                    cursor.execute(query, [gp_id])
                    
                rows = cursor.fetchall()
                
                features = []
                for row in rows:
                    geometry = row[0]
                    properties = {col: row[i+1] for i, col in enumerate(prop_cols)} if prop_cols else {}
                    if geometry:
                        features.append({"type": "Feature", "geometry": geometry, "properties": properties})
                
                from ..spatial_utils import get_aspect_ratio_dims
                min_x, min_y, max_x, max_y = bbox_vals
                width, height = get_aspect_ratio_dims(min_x, min_y, max_x, max_y, base_width=600)

                return Response({
                    "type": "FeatureCollection", 
                    "features": features, 
                    "count": len(features),
                    "width": width,
                    "height": height,
                    "bbox": list(bbox_vals),
                    "boundary": boundary_data
                })

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
