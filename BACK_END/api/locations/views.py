from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from api.models import District, Block, GramPanchayat
from .serializers import DistrictSerializer, BlockSerializer, GramPanchayatSerializer
from django.db import connection

class DistrictListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        districts = District.objects.all().order_by('name')
        serializer = DistrictSerializer(districts, many=True)
        return Response(serializer.data)

class BlockListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        district_id = request.query_params.get('district_id')
        if not district_id:
            return Response({"error": "district_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        blocks = Block.objects.filter(district_id=district_id).order_by('name')
        serializer = BlockSerializer(blocks, many=True)
        return Response(serializer.data)

class GramPanchayatListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        block_id = request.query_params.get('block_id')
        if not block_id:
            return Response({"error": "block_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        gps = GramPanchayat.objects.filter(block_id=block_id).order_by('name')
        serializer = GramPanchayatSerializer(gps, many=True)
        return Response(serializer.data)

class GPBoundaryView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        gp_id = request.query_params.get('gp_id')
        if not gp_id:
            return Response({"error": "gp_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with connection.cursor() as cursor:
                # Fetch geometry. Force conversion to WGS84 for frontend alignment.
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
                
                if row and row[0]:
                    return Response(row[0], status=status.HTTP_200_OK)
                else:
                    return Response({"error": "GP boundary not found or geometry missing"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error fetching boundary: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
