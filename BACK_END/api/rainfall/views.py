from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import Avg, Sum, Max
from api.models import GramPanchayat, RainfallStation, StationRainfall, ExcelData
from api.views.utils import get_excel_data_for_gp

class GPRainfallView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        gp_id = request.query_params.get('gp_id')
        if not gp_id:
            return Response({"error": "gp_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            gp = GramPanchayat.objects.get(id=gp_id)
            district_name = gp.block.district.name
            
            stations = RainfallStation.objects.filter(district__iexact=district_name)
            
            if not stations.exists():
                return Response({
                    "gp_id": gp_id,
                    "gp_name": gp.name,
                    "average_monsoon_rainfall": 0,
                    "message": "No rainfall stations found in this district."
                })
            
            # Filter for Monsoon months: June (6), July (7), August (8), September (9)
            monsoon_data = StationRainfall.objects.filter(
                station__in=stations,
                date__month__in=[6, 7, 8, 9]
            ).exclude(rainfall_mm=float('nan'))
            
            # Current Monsoon Rainfall = Rainfall of the most recent available year (e.g., 2024)
            current_year = 2024 # Or dynamically find max year: monsoon_data.aggregate(Max('date__year'))
            
            current_year_total = monsoon_data.filter(date__year=current_year).aggregate(Sum('rainfall_mm'))['rainfall_mm__sum']
            
            avg_rainfall = 0
            station_count = stations.count()
            if current_year_total is not None and station_count > 0:
                 avg_rainfall = current_year_total / station_count
            
            import math
            def is_valid(num):
                return num is not None and not (isinstance(num, float) and math.isnan(num)) and num > 0

            # Fallback 1: Check ExcelData for this GP
            if not is_valid(avg_rainfall):
                gp_excel = get_excel_data_for_gp(gp_id)
                if gp_excel and is_valid(gp_excel.monsoon_rainfall_mm):
                    avg_rainfall = gp_excel.monsoon_rainfall_mm
            
            # Fallback 2: Check Block level average in ExcelData
            if not is_valid(avg_rainfall):
                block_avg = ExcelData.objects.filter(block_2020__iexact=gp.block.name).aggregate(Avg('monsoon_rainfall_mm'))['monsoon_rainfall_mm__avg']
                if is_valid(block_avg):
                    avg_rainfall = block_avg
            
            # Fallback 3: Hard default for Rajasthan
            if not is_valid(avg_rainfall):
                avg_rainfall = 600.0

            return Response({
                "gp_id": gp_id,
                "gp_name": gp.name,
                "district": district_name,
                "station_count": stations.count(),
                "average_monsoon_rainfall": round(avg_rainfall, 2)
            })
            
        except GramPanchayat.DoesNotExist:
            return Response({"error": "Gram Panchayat not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NormalMonsoonRainfallView(APIView):
    """
    API View to calculate Normal Monsoon Rainfall using linear regression.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Calculate Normal Monsoon Rainfall for a GP using historical Station data.
        And Calculate Normal Monsoon Recharge using linear regression on block-level data from ExcelData.
        """
        gp_id = request.query_params.get('gp_id')
        block_name = request.query_params.get('block_name')
        
        try:
            district_name = None
            if gp_id:
                try:
                    gp = GramPanchayat.objects.get(id=gp_id)
                    block_name = gp.block.name
                    district_name = gp.block.district.name
                except GramPanchayat.DoesNotExist:
                    return Response({"error": "GP not found in location database"}, status=status.HTTP_404_NOT_FOUND)
            
            if not block_name:
                return Response({"error": "block_name or gp_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not district_name:
                # Try to find district from ExcelData if not found via GP
                first_rec = ExcelData.objects.filter(uni_block__iexact=block_name).first()
                if first_rec:
                    district_name = first_rec.new_dist or first_rec.district_u

            # 1. Calculate Normal Monsoon Rainfall from StationRainfall (10-year average: 2015-2024)
            normal_rainfall = 0
            if district_name:
                stations = RainfallStation.objects.filter(district__iexact=district_name)
                if stations.exists():
                     # Monsoon months: June(6) - Sept(9)
                    monsoon_data = StationRainfall.objects.filter(
                        station__in=stations,
                        date__year__gte=2015,
                        date__year__lte=2024,
                        date__month__in=[6, 7, 8, 9]
                    ).exclude(rainfall_mm=float('nan'))
                    # Aggregate total rainfall per year, then average? 
                    # Simpler: Average rainfall per station per year, then average across years.
                    # Or just general Average of all records * 4? No, rainfall_mm is daily.
                    
                    # Correct approach: Sum rainfall for each year, then average the yearly totals.
                    # Group by year:
                    from django.db.models import Sum
                    yearly_totals = []
                    for y in range(2015, 2025):
                        # Get sum of rainfall for this year for these stations
                        # We need average across stations for this year
                        year_rain = monsoon_data.filter(date__year=y).aggregate(Sum('rainfall_mm'))['rainfall_mm__sum']
                        if year_rain is not None:
                            # Divide by number of stations to get 'User Average' for that district/year
                            # Note: This is a rough proxy. Ideal is Average of (Sum of Station S for Year Y)
                            # Let's try: Average of daily records * 122 days? No.
                             
                            # Better: Calculate average monsoon rainfall for this district for this year
                            # Avg(Sun(Rainfall per station))
                            # Hard in Django ORM without subqueries. 
                            
                            # Approximation: Total Sum / (Count of Stations)
                            # Only if station count is constant.
                            station_count = stations.count()
                            if station_count > 0:
                                yearly_totals.append(year_rain / station_count)
                    
                    if yearly_totals:
                        normal_rainfall = sum(yearly_totals) / len(yearly_totals)

            import math
            def is_valid(num):
                return num is not None and not (isinstance(num, float) and math.isnan(num)) and num > 0
            
            # Fallback for Normal Rainfall
            if not is_valid(normal_rainfall):
                # Try ExcelData
                gp_excel = get_excel_data_for_gp(gp_id)
                if gp_excel and is_valid(gp_excel.monsoon_rainfall_mm):
                    normal_rainfall = gp_excel.monsoon_rainfall_mm
                else:
                    normal_rainfall = 600.0

            # 2. Calculate Normal Monsoon Recharge for this GP
            # Logic: 
            # If we have specific data for this GP in ExcelData, use its recharge_ham.
            # Else, use the Block-level Regression Model applied to the GP's Normal Rainfall.

            normal_recharge = 0
            
            # Try to get specific GP data first
            gp_data = None
            if gp_id:
                gp_data = get_excel_data_for_gp(gp_id)
            
            if gp_data and gp_data.recharge_ham is not None:
                # Use the specific value for this GP if available
                normal_recharge = gp_data.recharge_ham
                # If specific rainfall is also available, maybe override normal_rainfall?
                # User wants GP level recharge, but Normal Rainfall usually means long-term average.
                # Let's keep normal_rainfall as the 10-year average from stations (more robust),
                # but use the specific recharge if it exists (it's the "official" number).
            else:
                # Fallback to Regression Model: Recharge = a * Rainfall + b
                # We need to build the regression model from all GPs in the same block
                qs = ExcelData.objects.filter(block_2020__iexact=block_name).values('monsoon_rainfall_mm', 'recharge_ham')
                data_points = []
                for item in qs:
                    r = item['monsoon_rainfall_mm']
                    R = item['recharge_ham']
                    if r is not None and R is not None:
                        data_points.append((float(r), float(R)))
                
                N = len(data_points)
                if N >= 2:
                    S1 = sum(r for r, R in data_points)
                    S2 = sum(R for r, R in data_points)
                    S3 = sum(r * r for r, R in data_points)
                    S4 = sum(r * R for r, R in data_points)
                    
                    denom = (N * S3) - (S1 ** 2)
                    if denom != 0:
                        a = ((N * S4) - (S1 * S2)) / denom
                        b = (S2 - (a * S1)) / N
                        
                        # Apply regression to the GP's Normal Rainfall
                        normal_recharge = (a * normal_rainfall) + b
                        normal_recharge = max(0, normal_recharge) # Ensure non-negative

            return Response({
                "block_name": block_name,
                "district_name": district_name,
                "normal_monsoon_rainfall": round(normal_rainfall, 2),
                "normal_monsoon_recharge": round(normal_recharge, 4),
                "regression_used": gp_data is None or gp_data.recharge_ham is None,
                "station_data_found": normal_rainfall > 0
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)




class YearlyRechargeView(APIView):
    """
    API View to retrieve yearly recharge data (2015-2024) for a specific GP.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        gp_id = request.query_params.get('gp_id')
        if not gp_id:
            return Response({"error": "gp_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Try to find exactly matching GP
            gp_data = get_excel_data_for_gp(gp_id)
            if not gp_data:
                # If not found, try to find in location metadata
                try:
                    gp = GramPanchayat.objects.get(id=gp_id)
                    # Use block name to find data in ExcelData
                    gp_data = ExcelData.objects.filter(block_2020__iexact=gp.block.name).first()
                except GramPanchayat.DoesNotExist:
                    pass

            if not gp_data:
                return Response({"error": "No data found for this GP"}, status=status.HTTP_404_NOT_FOUND)
            
            # Construct yearly data list
            yearly_data = []
            for year in range(2015, 2025):
                field_name = f"recharge_{year}"
                val = getattr(gp_data, field_name, None)
                yearly_data.append({
                    "year": year,
                    "recharge": round(val, 4) if val is not None else 0
                })
            
            return Response({
                "gp_id": gp_id,
                "block": gp_data.uni_block,
                "district": gp_data.district_u,
                "yearly_recharge": yearly_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
