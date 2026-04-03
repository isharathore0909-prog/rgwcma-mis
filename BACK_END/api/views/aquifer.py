from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import connection
from django.db.models import Avg, F, Sum

from ..models import GramPanchayat, AquiferData, WaterQuality, Village, RainfallStation, StationRainfall
from .utils import get_excel_data_for_gp
from ..services.calculations import GECCalculator
from .spatial_utils import (
    get_command_area_breakdown, 
    get_gp_aquifer_formation, 
    map_formation_to_gec_seepage,
    get_gec_norms_for_gp
)
import math

class GPAquiferDataView(APIView):
    """
    API View to retrieve Aquifer Data (Pre/Post 2024 water levels) for a specific GP.
    Uses raw SQL to query aquiferApi_aquiferdata table.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        gp_id = request.query_params.get('gp_id')
        if not gp_id:
            return Response({"error": "gp_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get GP name
            try:
                gp = GramPanchayat.objects.get(id=gp_id)
                gp_name = gp.name
            except GramPanchayat.DoesNotExist:
                gp_name = f"GP {gp_id}"

            # Use raw SQL to query the table
            # First, discover what columns actually exist
            with connection.cursor() as cursor:
                # Get column names from the table
                cursor.execute("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'aquiferApi_aquiferdata'
                    ORDER BY ordinal_position;
                """)
                columns = [row[0] for row in cursor.fetchall()]
                print(f"DEBUG: Available columns in aquiferApi_aquiferdata: {columns}")
                
                # The table has village_id, not gp_id
                # We need to find all villages that belong to this GP
                # Then query aquifer data for those villages
                
                # Query to get aquifer data by joining with villages through GP
                sql = """
                    SELECT 
                        AVG(aq.pre_2015), AVG(aq.pre_2016), AVG(aq.pre_2017), AVG(aq.pre_2018), AVG(aq.pre_2019),
                        AVG(aq.pre_2020), AVG(aq.pre_2021), AVG(aq.pre_2022), AVG(aq.pre_2023), AVG(aq.pre_2024),
                        AVG(aq.pst_2015), AVG(aq.pst_2016), AVG(aq.pst_2017), AVG(aq.pst_2018), AVG(aq.pst_2019),
                        AVG(aq.pst_2020), AVG(aq.pst_2021), AVG(aq.pst_2022), AVG(aq.pst_2023), AVG(aq.pst_2024),
                        COUNT(*) as count
                    FROM "aquiferApi_aquiferdata" aq
                    INNER JOIN "locationApi_village" v ON aq.village_id = v.id
                    WHERE v.grampanchayat_id = %s
                """
                
                try:
                    cursor.execute(sql, [gp_id])
                    result = cursor.fetchone()
                    print(f"DEBUG: Query result: {result}")
                    
                    # 1.5. Check for Salinity / Poor Quality Area Proportion
                    # GEC-2015 Section 5.0: Fresh and Saline areas must be estimated separately.
                    # We estimate saline proportion by checking wells with EC > 3000 or TDS > 2000
                    cursor.execute("""
                        SELECT 
                            COUNT(*) as total_wells,
                            COUNT(CASE WHEN ec > 3000 OR tds > 2000 THEN 1 END) as saline_wells
                        FROM "water_qualityApi_waterquality" wq
                        INNER JOIN "locationApi_village" v ON wq.village_id = v.id
                        WHERE v.grampanchayat_id = %s
                    """, [gp_id])
                    wq_stats = cursor.fetchone()
                    saline_proportion = 0.0
                    if wq_stats and wq_stats[0] > 0:
                        saline_proportion = float(wq_stats[1]) / float(wq_stats[0])
                    
                    if result is None or result[20] == 0:
                        print(f"DEBUG: No aquifer level data found for GP {gp_id}, proceeding with Excel Data only")
                        avg_pre, avg_post, count = None, None, 0
                        pre_history = []
                        post_history = []
                    else:
                        pre_history = [float(x) if x is not None else None for x in result[0:10]]
                        post_history = [float(x) if x is not None else None for x in result[10:20]]
                        
                        count = result[20]
                        # Prioritize later years if 2024 isn't available
                        avg_pre = next((x for x in reversed(pre_history) if x is not None), None)
                        avg_post = next((x for x in reversed(post_history) if x is not None), None)
                    
                    # Use refreshed helper for ExcelData matching
                    excel_data = get_excel_data_for_gp(gp_id)

                    sw_discharge_cumec = excel_data.sw_discharge_cumec if excel_data else 0
                    sw_hrs = excel_data.sw_hrs if excel_data else 0
                    sw_days = excel_data.sw_days if excel_data else 0
                    area_ha = excel_data.kharif_area_ha if excel_data else 0
                    population = excel_data.total_human_population if excel_data else 0
                    bottom_unconfined = excel_data.bottom_of_unconfined_aquifer if excel_data else 0
                    canal_days = excel_data.canal_days if excel_data else 0
                    canal_mcm = excel_data.canal_mcm if excel_data else 0
                    tp_days = excel_data.tp_days if excel_data else 0
                    tp_mcm = excel_data.tp_mcm if excel_data else 0
                    wcs_storage = excel_data.wcs_storage_capacity_ha_m if excel_data else 0
                    
                    # New confined aquifer fields
                    confined_area = excel_data.confined_aquifer_area if excel_data else 0
                    pre_piezo = excel_data.pre_monsoon_piezometric_heads if excel_data else 0
                    post_piezo = excel_data.post_monsoon_piezometric_heads if excel_data else 0
                    bottom_confining = excel_data.bottom_of_confining_layer if excel_data else 0
                    
                    # Convert cumec to m3/hr
                    sw_discharge_m3_hr = round(float(sw_discharge_cumec or 0) * 3600, 2)
                    
                    # 0. Get Command/Non-Command Area Split (Spatial Engine)
                    command_split = get_command_area_breakdown(gp_id)
                    has_command = command_split.get('has_command_area', False)
                    gis_total = command_split.get('command_area', 0) + command_split.get('non_command_area', 0)
                    
                    if gis_total > 0:
                        total_unit_area = gis_total
                    elif excel_data:
                        total_unit_area = getattr(excel_data, 'kharif_area_ha', 0) or 0
                    else:
                        total_unit_area = 0

                    # 0.5. GEC-2015 Section 5.0: Saline Area Exclusion
                    # Subtract Saline Area from the Total Assessment Area before recharge calculations
                    fresh_area_ha = total_unit_area * (1.0 - saline_proportion)
                    saline_area_ha = total_unit_area * saline_proportion
                    
                    # Split the FRESH area into command/non-command based on spatial ratio
                    command_ratio = (command_split.get('command_area', 0) / gis_total) if gis_total > 0 else 0
                    if not has_command: command_ratio = 0
                    
                    command_area_ha = fresh_area_ha * command_ratio
                    non_command_area_ha = fresh_area_ha - command_area_ha
                    
                    # 0.7. Get Aquifer Formation & Seepage Category
                    formation_name = get_gp_aquifer_formation(gp_id)
                    seepage_norm_desc = map_formation_to_gec_seepage(formation_name)
                    
                    # 0.8. Get Recommended GEC Norms (RIF/SY) based on Aquifer & Zone
                    recommended_norms = get_gec_norms_for_gp(gp_id)

                    print(f"DEBUG: Fresh Area: {fresh_area_ha}, Saline Area: {saline_area_ha}")

                    response_data = {
                        "gp_id": gp_id,
                        "gp_name": gp_name,
                        "pre_monsoon_avg": round(float(avg_pre), 2) if avg_pre is not None else None,
                        "post_monsoon_avg": round(float(avg_post), 2) if avg_post is not None else None,
                        "record_count": count,
                        "sw_avg_discharge_m3_hr": sw_discharge_m3_hr,
                        "sw_pumping_hours": sw_hrs,
                        "sw_pumping_days": sw_days,
                        "area_ha": round(total_unit_area, 2),
                        "aquifer_details": {
                            "formation_name": formation_name,
                            "seepage_norm_category": seepage_norm_desc,
                            "recommended_rif": recommended_norms.get('rif'),
                            "recommended_sy": recommended_norms.get('sy'),
                            "aquifer_code": recommended_norms.get('aquifer_code'),
                            "zone": recommended_norms.get('zone')
                        },
                        "population": population,
                        "bottom_unconfined": bottom_unconfined,
                        "canal_days": canal_days,
                        "canal_mcm": canal_mcm,
                        "tp_days": tp_days,
                        "tp_mcm": tp_mcm,
                        "wcs_storage": wcs_storage,
                        "confined_aquifer_area": confined_area,
                        "pre_monsoon_piezometric_heads": pre_piezo,
                        "post_monsoon_piezometric_heads": post_piezo,
                        "bottom_of_confining_layer": bottom_confining,
                        
                        "utilization": {
                            "kharif": {
                                "category": excel_data.kharif_crop_category if excel_data else "",
                                "type": excel_data.kharif_crop_type if excel_data else "",
                                "name": excel_data.kharif_crop_name if excel_data else "",
                                "area": excel_data.kharif_area_ha if excel_data else 0,
                                "nir": excel_data.kharif_nir_mm if excel_data else 0
                            },
                            "rabi": {
                                "category": excel_data.rabi_crop_category if excel_data else "",
                                "type": excel_data.rabi_crop_type if excel_data else "",
                                "name": excel_data.rabi_crop_name if excel_data else "",
                                "area": excel_data.rabi_area_ha if excel_data else 0,
                                "nir": excel_data.rabi_nir_mm if excel_data else 0
                            },
                            "zaid": {
                                "category": excel_data.zaid_crop_category if excel_data else "",
                                "type": excel_data.zaid_crop_type if excel_data else "",
                                "name": excel_data.zaid_crop_name if excel_data else "",
                                "area": excel_data.zaid_area_ha if excel_data else 0,
                                "nir": excel_data.zaid_nir_mm if excel_data else 0
                            },
                            "industry": {
                                "name": excel_data.industry_name if excel_data else "",
                                "daily_req": excel_data.industry_daily_water_req_l_day if excel_data else 0,
                                "days": excel_data.industry_no_of_days_in_use if excel_data else 0
                            },
                            "other": {
                                "type": excel_data.other_type_of_use if excel_data else "",
                                "daily_req": excel_data.other_daily_water_req_l_day if excel_data else 0,
                                "days": excel_data.other_no_of_days_in_use if excel_data else 0
                            }
                        }
                    }

                    # --- Draft / Utilization Math ---
                    u_k = ((excel_data.kharif_area_ha or 0) * (excel_data.kharif_nir_mm or 0) / 1000) if excel_data else 0
                    u_r = ((excel_data.rabi_area_ha or 0) * (excel_data.rabi_nir_mm or 0) / 1000) if excel_data else 0
                    u_z = ((excel_data.zaid_area_ha or 0) * (excel_data.zaid_nir_mm or 0) / 1000) if excel_data else 0
                    total_utilization = u_k + u_r + u_z

                    # Helper to get value from request or fallback to excel_data or default
                    def get_val(key, excel_attr=None, default=0.0):
                        import math
                        req_val = request.query_params.get(key)
                        if req_val is not None:
                            try:
                                v = float(req_val)
                                if not math.isnan(v): return v
                            except: pass
                        if excel_attr and excel_data:
                            v = getattr(excel_data, excel_attr, default)
                            if v is not None and not (isinstance(v, float) and math.isnan(v)):
                                return v
                        return default

                    # Calculate correct rainfall to avoid relying on fallback during initial load
                    true_current = get_val('currentMonsoonRainfall', 'monsoon_rainfall_mm', 600)
                    true_normal = get_val('normalMonsoonRainfall', 'monsoon_rainfall_mm', 600)
                    
                    try:
                        from ..models import RainfallStation, StationRainfall
                        d_name = gp.block.district.name
                        stations = RainfallStation.objects.filter(district__iexact=d_name)
                        if stations.exists():
                            m_data = StationRainfall.objects.filter(
                                station__in=stations, 
                                date__month__in=[6, 7, 8, 9]
                            ).exclude(rainfall_mm=float('nan'))
                            
                            c_tot = m_data.filter(date__year=2024).aggregate(Sum('rainfall_mm'))['rainfall_mm__sum']
                            
                            if c_tot is not None and stations.count() > 0:
                                tc = float(c_tot) / stations.count()
                                if tc > 0: true_current = tc
                                
                            y_tots = []
                            for y in range(2015, 2025):
                                yr_rain = m_data.filter(date__year=y).aggregate(Sum('rainfall_mm'))['rainfall_mm__sum']
                                if yr_rain is not None and stations.count() > 0:
                                    y_tots.append(float(yr_rain) / stations.count())
                            if y_tots:
                                tn = sum(y_tots) / len(y_tots)
                                if tn > 0: true_normal = tn
                    except Exception as e:
                        print(f"DEBUG: Rainfall initial fetch failed: {e}")

                    true_current = round(true_current, 2)
                    true_normal = round(true_normal, 2)

                    # --- GEC & Water Budget Calculation ---
                    input_data = {
                        'areaHa': round(fresh_area_ha, 2),
                        'areaCommandHa': round(command_area_ha, 2),
                        'areaNonCommandHa': round(non_command_area_ha, 2),
                        'specificYield': (get_val('specificYield', 'specific_yield', recommended_norms.get('sy', 0.02) * 100)) if get_val('specificYield', 'specific_yield', recommended_norms.get('sy', 0.02) * 100) < 1 else get_val('specificYield', 'specific_yield', recommended_norms.get('sy', 0.02) * 100), 
                        'normalMonsoonRainfall': true_normal,
                        'nonMonsoonRainfall': get_val('nonMonsoonRainfall', None, 0), 
                        'rifValue': get_val('rifValue', None, recommended_norms.get('rif', 0.10)), 
                        'preMonsoonDepth': get_val('preMonsoonDepth', None, avg_pre or 10),
                        'postMonsoonDepth': get_val('postMonsoonDepth', None, avg_post or 5),
                        'unitType': request.query_params.get('unitType', 'RURAL'),
                        
                        # Command-Specific (Live Overrides + Excel Fallback)
                        'rswi_avgDischarge': get_val('rswi_avgDischarge', None, float(excel_data.sw_discharge_cumec if excel_data else 0) * 3600),
                        'rswi_pumpingHours': get_val('rswi_pumpingHours', 'sw_hrs', 0),
                        'rswi_days': get_val('rswi_days', 'sw_days', 120),
                        'rswi_cropType': request.query_params.get('rswi_cropType', (excel_data.kharif_crop_type if excel_data else 'NON-PADDY') or 'NON-PADDY'),
                        'rc_wettedArea': get_val('rc_wettedArea', 'canal_mcm', 0),
                        'rc_days': get_val('rc_days', 'canal_days', 120),
                        'rc_canalType': request.query_params.get('rc_canalType', seepage_norm_desc),
                        'rc_seepageFactor': get_val('rc_seepageFactor', None, 17.5),
                        
                        # Non-Monsoon Canals
                        'rc_wettedArea_nm': get_val('rc_wettedArea_nm', 'canal_mcm', 0),
                        'rc_days_nm': get_val('rc_days_nm', 'canal_days', 245),
                        'rc_canalType_nm': request.query_params.get('rc_canalType_nm', seepage_norm_desc),
                        'rc_seepageFactor_nm': get_val('rc_seepageFactor_nm', None, 17.5),

                        # Tanks (Monsoon & NM)
                        'rtp_avgWaterSpreadArea': get_val('rtp_avgWaterSpreadArea', 'tp_mcm', 0),
                        'rtp_days': get_val('rtp_days', 'tp_days', 120),
                        'rtp_rechargeFactor': get_val('rtp_rechargeFactor', None, 0.0014),
                        
                        'rtp_avgWaterSpreadArea_nm': get_val('rtp_avgWaterSpreadArea_nm', 'tp_mcm', 0),
                        'rtp_days_nm': get_val('rtp_days_nm', 'tp_days', 245),
                        'rtp_rechargeFactor_nm': get_val('rtp_rechargeFactor_nm', None, 0.0014),
                        
                        # WCS (Monsoon & NM)
                        'rwcs_grossStorage': get_val('rwcs_grossStorage', 'wcs_storage_capacity_ha_m', 0),
                        'rwcs_rechargeFactor': get_val('rwcs_rechargeFactor', None, 0.2),

                        'rwcs_grossStorage_nm': get_val('rwcs_grossStorage_nm', 'wcs_storage_capacity_ha_m', 0),
                        'rwcs_rechargeFactor_nm': get_val('rwcs_rechargeFactor_nm', None, 0.2),

                        # Shared / Extraction
                        'gwExtractionMonsoon': get_val('gwExtractionMonsoon', None, u_k),
                        'rgwi_cropType': request.query_params.get('rgwi_cropType', (excel_data.kharif_crop_type if excel_data else 'NON-PADDY') or 'NON-PADDY'),
                        'rgwi_gw_draft_nm': get_val('rgwi_gw_draft_nm', None, u_r + u_z),
                        'rgwi_sw_draft_nm': get_val('rgwi_sw_draft_nm', None, 0),
                        'isContinuousSupply': request.query_params.get('isContinuousSupply', 'false').lower() == 'true',
                        
                        'currentMonsoonRainfall': true_current,
                        
                        'historical_pre_monsoon': pre_history,
                        'historical_post_monsoon': post_history,
                        'aquifer_formation': formation_name
                    }





                    # Natural Discharge & Terrain Logic (GEC Section 4.3.2)
                    nd_percent = 5 if input_data.get('specificYield', 0) > 10 else 10 
                    if avg_pre is not None and avg_pre < 5: nd_percent = 15
                    
                    terrain = getattr(excel_data, 'terrain_type', 'Plain').lower() if excel_data else 'plain'
                    if 'hilly' in terrain or 'hill' in terrain: 
                        nd_percent = 15
                        input_data['terrainFixedDischarge'] = getattr(excel_data, 'spring_discharge_ha_m', None)

                    input_data['custom_nd_percent'] = nd_percent

                    # Single Integrated Split Calculation
                    final_res = GECCalculator.calculate_water_balance(input_data)

                    # --- Prepare Flat Response for Frontend ---
                    # Merge all calculated fields from final_res into response_data
                    for key, value in final_res.items():
                        if isinstance(value, (int, float, str, list, dict)):
                            response_data[key] = value

                    # Extract key values for dependencies
                    total_availability = final_res.get('totalGwAvailable', 0)
                    future_domestic = GECCalculator.calculate_future_domestic_demand(population, getattr(excel_data, 'decadal_growth_rate', 1.2))

                    # Override/Add specific formatting for the report
                    response_data.update({
                        "total_utilization": total_utilization,
                        "projected_domestic_25yr": future_domestic,
                        "net_future_availability_future": round(total_availability - total_utilization - future_domestic, 2),
                        "saline_area_proportion": round(saline_proportion * 100, 2),
                        "saline_area_ha": round(saline_area_ha, 2),
                        "fresh_area_ha": round(fresh_area_ha, 2),
                        "pre_slope": round(float(final_res.get('pre_slope', 0) or 0), 3),
                        "pst_slope": round(float(final_res.get('pst_slope', 0) or 0), 3),
                        "has_command": has_command,
                        "command_area_ha": round(command_area_ha, 2),
                        "non_command_area_ha": round(non_command_area_ha, 2),
                        "monsoon_rainfall": input_data['currentMonsoonRainfall'],
                        "area_ha": round(total_unit_area, 2)
                    })

                    
                    return Response(response_data, status=status.HTTP_200_OK)

                    
                except Exception as e:
                    print(f"DEBUG: Query failed: {str(e)}")
                    # Try to at least return formation info if we failed later
                    try:
                        f_name = get_gp_aquifer_formation(gp_id)
                        s_desc = map_formation_to_gec_seepage(f_name)
                    except:
                        f_name = "Alluvium"
                        s_desc = "Unlined canals in normal soils with some clay content along with sand"

                    return Response({
                        "gp_id": gp_id,
                        "gp_name": gp_name,
                        "message": f"Error querying aquifer data: {str(e)}",
                        "pre_monsoon_avg": None,
                        "post_monsoon_avg": None,
                        "aquifer_details": {
                            "formation_name": f_name,
                            "seepage_norm_category": s_desc
                        }
                    }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class WaterQualityDataView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            gp_id = request.query_params.get('gp_id')
            if not gp_id:
                return Response({'error': 'gp_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                gp = GramPanchayat.objects.get(id=gp_id)
                # Regional Search: Fetch all wells in the same BLOCK to create a valid interpolation gradient
                records = WaterQuality.objects.filter(
                    village__gram_panchayat__block=gp.block_id
                ).select_related('village').annotate(
                    village_name=F('village__name'),
                    gp_id_val=F('village__gram_panchayat_id')
                ).values()
                return Response(list(records), status=status.HTTP_200_OK)
            except GramPanchayat.DoesNotExist:
                return Response({'error': 'GP not found'}, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            import traceback
            print(f"ERROR in WaterQualityDataView: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AquiferWaterLevelDataView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            gp_id = request.query_params.get('gp_id')
            if not gp_id:
                return Response({'error': 'gp_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                gp = GramPanchayat.objects.get(id=gp_id)
                # Regional Search: Fetch all wells in the same BLOCK.
                # This ensures that even if a GP has only 1 well, neighboring wells from the same block
                # provide enough data points for the contour engine to calculate gradients.
                records = AquiferData.objects.filter(
                    village__gram_panchayat__block=gp.block_id
                ).select_related('village__gram_panchayat').annotate(
                    village_name=F('village__name'),
                    gp_id_val=F('village__gram_panchayat_id')
                ).values()
                return Response(list(records), status=status.HTTP_200_OK)
            except GramPanchayat.DoesNotExist:
                return Response({'error': 'GP not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            import traceback
            print(f"ERROR in AquiferWaterLevelDataView: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AquiferTrendView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        gp_id = request.query_params.get('gp_id')
        if not gp_id:
            return Response({"error": "gp_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Find all villages in this GP
            villages = Village.objects.filter(gram_panchayat_id=gp_id)
            if not villages.exists():
                return Response({'error': 'No villages found for this GP'}, status=status.HTTP_404_NOT_FOUND)

            v_ids = [v.id for v in villages]
            
            # Determine District for Rainfall Data
            district_name = None
            try:
                # navigation: Village -> GP -> Block -> District
                # Village.gram_panchayat is a FK to GramPanchayat
                gp = GramPanchayat.objects.get(id=gp_id)
                district_name = gp.block.district.name
            except Exception:
                pass
                
            rainfall_stations = RainfallStation.objects.none()
            if district_name:
                rainfall_stations = RainfallStation.objects.filter(district__iexact=district_name)

            # Aggregate trends (2015-2024) in a single query
            agg_kwargs = {}
            for y in range(2015, 2025):
                agg_kwargs[f'pre_{y}'] = Avg(f'pre_{y}')
                agg_kwargs[f'pst_{y}'] = Avg(f'pst_{y}')
            
            stats = AquiferData.objects.filter(village_id__in=v_ids).aggregate(**agg_kwargs)
            
            # Fetch Rainfall for all years in parallel or efficient query
            rainfall_data = {}
            if rainfall_stations.exists():
                num_stations = rainfall_stations.count()
                if num_stations > 0:
                    rain_stats = StationRainfall.objects.filter(
                        station__in=rainfall_stations,
                        date__year__gte=2015,
                        date__year__lte=2024
                    ).values('date__year').annotate(total_rain=Sum('rainfall_mm'))
                    
                    for r in rain_stats:
                        year_val = r.get('date__year')
                        if year_val:
                            total_rain = r.get('total_rain') or 0
                            rainfall_data[year_val] = float(total_rain) / num_stations

            trend = []
            for year in range(2015, 2025):
                pre_val = stats.get(f'pre_{year}')
                pst_val = stats.get(f'pst_{year}')
                rain_val = rainfall_data.get(year, 0)
                
                # Helper to ensure JSON compliance (handles NaN/Inf)
                def clean_float(val, precision):
                    if val is None: return None
                    try:
                        f = float(val)
                        if math.isnan(f) or math.isinf(f): return None
                        return round(f, precision)
                    except: return None

                trend.append({
                    'year': year,
                    'pre': clean_float(pre_val, 2),
                    'post': clean_float(pst_val, 2),
                    'rainfall': clean_float(rain_val, 1)
                })

            return Response(trend, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
