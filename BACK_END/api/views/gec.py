from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from ..models import RainfallInfiltrationFactor, SpecificYield
from ..services.calculations import GECCalculator, WaterUtilizationCalculator

class RainfallInfiltrationFactorListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        rif_data = RainfallInfiltrationFactor.objects.all().order_by('sl_no')
        results = []
        for item in rif_data:
            results.append({
                "sl_no": item.sl_no,
                "principal_aquifer": item.principal_aquifer,
                "major_aquifer_code": item.major_aquifer_code,
                "major_aquifer_name": item.major_aquifer_name,
                "age": item.age,
                "recommended": item.recommended_percent,
                "minimum": item.minimum_percent,
                "maximum": item.maximum_percent
            })
        return Response(results, status=status.HTTP_200_OK)

class SpecificYieldListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        sy_data = SpecificYield.objects.all().order_by('sl_no')
        results = []
        for item in sy_data:
            results.append({
                "sl_no": item.sl_no,
                "principal_aquifer": item.principal_aquifer,
                "major_aquifer_code": item.major_aquifer_code,
                "major_aquifer_name": item.major_aquifer_name,
                "age": item.age,
                "recommended": item.recommended_percent,
                "minimum": item.minimum_percent,
                "maximum": item.maximum_percent
            })
        return Response(results, status=status.HTTP_200_OK)

class GECCalculationView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        data = request.data
        try:
            result = GECCalculator.calculate_water_balance(data)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class WaterUtilizationCalculationView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        data = request.data
        action = request.query_params.get('action')
        
        try:
            if action == 'human_demand':
                res = WaterUtilizationCalculator.calculate_human_demand(data.get('population'), data.get('dailyReq'))
            elif action == 'livestock_demand':
                res = WaterUtilizationCalculator.calculate_livestock_demand(data.get('livestockData'))
            elif action == 'total_utilization':
                res = WaterUtilizationCalculator.calculate_total_utilization(data.get('demandMetData'))
            elif action == 'water_balance':
                res = WaterUtilizationCalculator.calculate_water_balance(
                    data.get('available_gw'),
                    data.get('available_sw'),
                    data.get('utilized_gw'),
                    data.get('utilized_sw')
                )
            else:
                return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(res, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
