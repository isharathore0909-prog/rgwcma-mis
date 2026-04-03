import math

class GECCalculator:
    """
    GEC 2015 Methodology Calculations
    Ported from frontend logic
    """

    @staticmethod
    def safe_parse(value, default=0.0):
        try:
            return float(value)
        except (ValueError, TypeError):
            return default

    @staticmethod
    def get_return_flow_fraction(is_groundwater, crop_type='PADDY', depth_mbgl=10.0, is_continuous=False):
        import json
        import os
        
        # Load norms from JSON
        norms_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'gec_norms.json')
        irr_norms = []
        try:
            if os.path.exists(norms_path):
                with open(norms_path, 'r') as f:
                    norms_data = json.load(f)
                    irr_norms = norms_data.get('irrigation_recharge_norms', [])
        except Exception:
            pass

        # Use safe parse for depth
        depth = GECCalculator.safe_parse(depth_mbgl, 10.0)

        # If data didn't load, use a safe default or hardcoded fallback
        if not irr_norms:
            # Fallback table if JSON is missing
            table_10_fallback = {
                10: {'gw_p': 45, 'gw_np': 25, 'sw_p': 50, 'sw_np': 30},
                25: {'gw_p': 20, 'gw_np': 5, 'sw_p': 25, 'sw_np': 10}
            }
            d_val = round(min(25, max(10, depth)))
            row = table_10_fallback.get(10 if d_val <= 10 else 25)
            is_paddy = str(crop_type).upper() == 'PADDY'
            percent = (row['gw_p'] if is_paddy else row['gw_np']) if is_groundwater else (row['sw_p'] if is_paddy else row['sw_np'])
            return percent / 100.0

        target_key = ""
        if depth <= 10:
            target_key = "<=10"
        elif depth >= 25:
            target_key = ">=25"
        else:
            target_key = str(int(round(depth)))

        target_row = next((item for item in irr_norms if item.get('dtw_m_bgl') == target_key), irr_norms[0])
        
        is_paddy = str(crop_type).upper() == 'PADDY'
        
        if is_groundwater:
            percent = target_row.get('gw_paddy' if is_paddy else 'gw_non_paddy', 0)
        else:
            percent = target_row.get('sw_paddy' if is_paddy else 'sw_non_paddy', 0)

        if is_continuous:
            percent += 5

        return percent / 100.0

    @staticmethod
    def calculate_irrigation_return_recharge(applied_volume_ham, is_groundwater, crop_type='NON-PADDY', depth_mbgl=10, is_continuous=False):
        if applied_volume_ham <= 0:
            return 0.0
        fraction = GECCalculator.get_return_flow_fraction(is_groundwater, crop_type, depth_mbgl, is_continuous)
        return applied_volume_ham * fraction

    @staticmethod
    def calculate_sw_irrigation_recharge(discharge_m3_per_hr, pumping_hours_per_day, days, return_flow_fraction):
        if discharge_m3_per_hr <= 0 or pumping_hours_per_day <= 0 or days <= 0 or return_flow_fraction <= 0:
            return 0.0
        applied_volume_ham = (discharge_m3_per_hr * pumping_hours_per_day * days) / 10000.0
        return applied_volume_ham * return_flow_fraction

    @staticmethod
    def calculate_canal_seepage(wetted_area_million_m2, days, seepage_factor=None, formation_type=None):
        if wetted_area_million_m2 <= 0 or days <= 0:
            return 0.0
            
        final_factor = seepage_factor
        if formation_type:
            import json
            import os
            norms_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'gec_norms.json')
            try:
                if os.path.exists(norms_path):
                    with open(norms_path, 'r') as f:
                        norms_data = json.load(f)
                        canal_norms = norms_data.get('canal_seepage_norms', [])
                        for norm in canal_norms:
                            if norm.get('formation') == formation_type:
                                final_factor = norm.get('recommended')
                                break
            except Exception:
                pass
        
        if final_factor is None:
            final_factor = 17.5 # Default fallback
            
        return float(wetted_area_million_m2) * float(final_factor) * float(days)

    @staticmethod
    def calculate_tank_recharge(area_ha, days, seepage_factor=0.0014):
        if area_ha <= 0 or days <= 0 or seepage_factor <= 0:
            return 0.0
        return area_ha * (seepage_factor / 1000.0 if seepage_factor > 0.1 else seepage_factor) * days

    @staticmethod
    def calculate_conservation_recharge(storage_ham, efficiency_fraction=0.2, fillings=1):
        # GEC 2015: 40% annual, 20% monsoon, 20% non-monsoon
        if storage_ham <= 0 or fillings < 1:
            return 0.0
        return storage_ham * 0.2 * round(fillings)

    @staticmethod
    def calculate_wt_rainfall_component(delta_s, gross_extraction, total_other_recharge):
        return (float(delta_s) or 0.0) + (float(gross_extraction) or 0.0) - (float(total_other_recharge) or 0.0)

    @staticmethod
    def calculate_rif_recharge(area_ha, normal_monsoon_rain, rif_factor):
        if area_ha <= 0 or normal_monsoon_rain <= 0 or rif_factor <= 0:
            return 0.0
        # Formula: (Area * NormalRainfall / 1000) * RIF_Factor
        return (area_ha * normal_monsoon_rain / 1000.0) * rif_factor

    @staticmethod
    def calculate_non_monsoon_rif(area_ha, non_monsoon_rain, rif_base):
        if area_ha <= 0 or non_monsoon_rain <= 0:
            return 0.0
        # Formula: Area * (Rainfall / 1000) * RIF
        return (area_ha * non_monsoon_rain / 1000.0) * rif_base

    @staticmethod
    def calculate_natural_discharge(total_recharge, default_percent=5, user_value=None, terrain_fixed_discharge=None):
        if terrain_fixed_discharge is not None and float(terrain_fixed_discharge) > 0:
            return float(terrain_fixed_discharge)
        if user_value is not None:
            return float(user_value)
        return total_recharge * (default_percent / 100.0)

    @staticmethod
    def calculate_percent_deviation(wt_rain, rif_rain):
        if rif_rain == 0:
            return 0.0
        return ((wt_rain - rif_rain) / rif_rain) * 100.0

    @staticmethod
    def adopt_rainfall_recharge(wt_rain, rif_rain, pd=None, forced_method=None):
        if forced_method:
            return {'value': rif_rain, 'method': forced_method}
        
        if pd is None:
            return {'value': rif_rain, 'method': 'RIF (PD Missing)'}

        if -20 <= pd <= 20:
            return {'value': wt_rain, 'method': 'WT'}
        elif pd > 20:
            return {'value': 1.2 * rif_rain, 'method': '1.2 * RIF'}
        else:
            return {'value': 0.8 * rif_rain, 'method': '0.8 * RIF'}

    @staticmethod
    def calculate_stage_of_extraction(withdrawal, availability):
        if availability <= 0:
            return 0.0
        return (withdrawal / availability) * 100.0

    @staticmethod
    def calculate_linear_trend(values_list):
        """
        Calculates the slope of a line using Ordinary Least Squares regression.
        values_list: List of water levels ordered chronologically (e.g., [2015, 2016, ..., 2024])
        Returns the slope. A positive slope means depth is increasing (water declining).
        """
        valid_data = [(i, val) for i, val in enumerate(values_list) if val is not None and val > 0]
        
        n = len(valid_data)
        if n < 3:
             return 0.0

        sum_x = sum(i for i, _ in valid_data)
        sum_y = sum(val for _, val in valid_data)
        sum_xy = sum(i * val for i, val in valid_data)
        sum_xx = sum(i * i for i, _ in valid_data)

        denominator = (n * sum_xx) - (sum_x * sum_x)
        if denominator == 0:
            return 0.0
            
        slope = ((n * sum_xy) - (sum_x * sum_y)) / denominator
        return slope

    @staticmethod
    def categorize_unit(stage, trends_significantly_declining=False):
        if stage <= 70:
            provisional = 'SAFE'
        elif stage <= 90:
            provisional = 'SEMI-CRITICAL'
        elif stage <= 100:
            provisional = 'CRITICAL'
        else:
            provisional = 'OVER-EXPLOITED'

        if trends_significantly_declining:
            if provisional == 'SAFE':
                return 'SEMI-CRITICAL'
            elif provisional == 'SEMI-CRITICAL':
                return 'CRITICAL'
            elif provisional == 'CRITICAL':
                return 'OVER-EXPLOITED'

        return provisional

    @staticmethod
    def calculate_future_domestic_demand(current_population, annual_growth_rate, lpcd=70):
        """
        GEC-2015 Section 6.1: Projection for 25 years.
        Future Population = P * (1 + r)^25
        """
        p = float(current_population)
        r = float(annual_growth_rate) / 100.0
        future_pop = p * math.pow(1 + r, 25)
        
        # Convert LPCD to Ha-m/year
        annual_ha_m = (future_pop * lpcd * 365) / 10000000.0
        return round(annual_ha_m, 4)

    @classmethod
    def calculate_water_balance(cls, data):
        updated = data.copy()
        
        # 1. Basic Common Parameters
        total_area_ha = cls.safe_parse(updated.get('areaHa'))
        sy_raw = cls.safe_parse(updated.get('specificYield'))
        specific_yield = sy_raw / 100.0 if sy_raw > 1 else sy_raw
        
        normal_monsoon_rain = cls.safe_parse(updated.get('normalMonsoonRainfall'))
        normal_non_monsoon_rain = cls.safe_parse(updated.get('nonMonsoonRainfall'))
        annual_normal_rain = normal_monsoon_rain + normal_non_monsoon_rain
        updated['annualRainfall'] = annual_normal_rain
        is_urban = updated.get('unitType') == 'URBAN'
        
        # Area Split (GEC Requirement)
        area_ha = cls.safe_parse(updated.get('areaHa'), 0.0)
        area_command = cls.safe_parse(updated.get('areaCommandHa'), 0.0)
        area_non_command = cls.safe_parse(updated.get('areaNonCommandHa'), 0.0)
        
        # If total exists but sub-units don't, assume non-command
        if area_ha > 0 and area_command <= 0 and area_non_command <= 0:
            area_non_command = area_ha
        elif area_ha <= 0 and (area_command > 0 or area_non_command > 0):
            area_ha = area_command + area_non_command
            updated['areaHa'] = area_ha

        rif_base = cls.safe_parse(updated.get('rifValue'), 0.10)
        # Ensure rif_base is a fraction (e.g. 0.12 instead of 12)
        if rif_base > 1.0: rif_base = rif_base / 100.0
        
        rif_monsoon = rif_base * 0.30 if is_urban else rif_base
        rif_monsoon = min(max(rif_monsoon, 0), 1)

        # 2. Recharge Components Calculation (Monsoon)
        
        # SW irrigation (Monsoon)
        sw_avg_discharge = cls.safe_parse(updated.get('rswi_avgDischarge'), 0.0)
        sw_depth = cls.safe_parse(updated.get('preMonsoonDepth'), 10.0)
        rff_sw = cls.get_return_flow_fraction(False, updated.get('rswi_cropType', 'NON-PADDY'), sw_depth, updated.get('isContinuousSupply', False))
        updated['rswi_returnFlowFactor'] = rff_sw
        
        sw_irr_recharge_monsoon = 0.0
        if sw_avg_discharge > 0:
            sw_irr_recharge_monsoon = cls.calculate_sw_irrigation_recharge(
                sw_avg_discharge,
                cls.safe_parse(updated.get('rswi_pumpingHours'), 10),
                cls.safe_parse(updated.get('rswi_days'), 120),
                rff_sw
            )
        updated['gwRechargeFromIrrigationMonsoon'] = sw_irr_recharge_monsoon

        # GW irrigation (Monsoon)
        gw_irr_vol = cls.safe_parse(updated.get('gwExtractionMonsoon'), 0.0)
        gw_depth = cls.safe_parse(updated.get('preMonsoonDepth'), 10.0)
        rff_gw = cls.get_return_flow_fraction(True, updated.get('rgwi_cropType', 'NON-PADDY'), gw_depth, updated.get('isContinuousSupply', False))
        updated['rgwi_returnFlowFactor'] = rff_gw
        gw_irr_recharge_monsoon = gw_irr_vol * rff_gw
        updated['gwRechargeFromGWIirrigationMonsoon'] = gw_irr_recharge_monsoon

        # Canal seepage
        canal_recharge_monsoon = cls.calculate_canal_seepage(
            cls.safe_parse(updated.get('rc_wettedArea'), 0.0),
            cls.safe_parse(updated.get('rc_days'), 120),
            cls.safe_parse(updated.get('rc_seepageFactor'), 17.5),
            updated.get('rc_canalType')
        )
        updated['gwRechargeFromCanalsMonsoon'] = canal_recharge_monsoon

        # Tanks (Monsoon)
        tanks_recharge_monsoon = cls.calculate_tank_recharge(
            cls.safe_parse(updated.get('rtp_avgWaterSpreadArea'), 0.0),
            cls.safe_parse(updated.get('rtp_days'), 120),
            cls.safe_parse(updated.get('rtp_rechargeFactor'), 0.0014)
        )
        updated['gwRechargeFromTanksMonsoon'] = tanks_recharge_monsoon

        # WCS (Monsoon)
        wcs_recharge_monsoon = cls.calculate_conservation_recharge(
            cls.safe_parse(updated.get('rwcs_grossStorage'), 0.0),
            cls.safe_parse(updated.get('rwcs_rechargeFactor'), 0.2)
        )
        updated['gwRechargeFromWCSMonsoon'] = wcs_recharge_monsoon

        # Urban pipelines
        pipeline_recharge = 0.0
        if is_urban:
            loss = cls.safe_parse(updated.get('pipelineLosses'), 0.0)
            factor = cls.safe_parse(updated.get('pipelineLossFactor'), 0.5)
            pipeline_recharge = loss * factor
        updated['gwRechargeFromPipelines'] = pipeline_recharge

        # Aggregate Other Sources
        total_others_monsoon = canal_recharge_monsoon + sw_irr_recharge_monsoon + \
                               tanks_recharge_monsoon + wcs_recharge_monsoon + \
                               pipeline_recharge + gw_irr_recharge_monsoon
        
        updated['gwRechargeOtherMonsoon'] = total_others_monsoon
        # Also map to the individual keys the frontend expects
        updated['gwRechargeFromGWIirrigationMonsoon'] = gw_irr_recharge_monsoon
        updated['gwRechargeFromIrrigationMonsoon'] = sw_irr_recharge_monsoon
        updated['gwRechargeFromCanalsMonsoon'] = canal_recharge_monsoon
        updated['gwRechargeFromTanksMonsoon'] = tanks_recharge_monsoon
        updated['gwRechargeFromWCSMonsoon'] = wcs_recharge_monsoon
        updated['gwRechargeFromPipelines'] = pipeline_recharge

        # 3. Sub-Unit Calculations (Command vs Non-Command Split)
        # Total GW extraction and its return flow (RGWI) are often given for the unit; split by area.
        ext_total = cls.safe_parse(updated.get('gwExtractionMonsoon'), 0.0)
        rgwi_total = updated.get('gwRechargeFromGWIirrigationMonsoon', 0.0)
        
        # Command subunit components
        other_c = canal_recharge_monsoon + sw_irr_recharge_monsoon
        ext_c = 0.0
        if area_ha > 0:
            other_c += (rgwi_total * (area_command / area_ha))
            ext_c = ext_total * (area_command / area_ha)
        
        # Non-Command subunit components
        other_nc = tanks_recharge_monsoon + wcs_recharge_monsoon + pipeline_recharge
        ext_nc = 0.0
        if area_ha > 0:
            other_nc += (rgwi_total * (area_non_command / area_ha))
            ext_nc = ext_total - ext_c
        else:
            other_nc += rgwi_total
            ext_nc = ext_total

        def calculate_subunit_recharge(area, extraction, other_recharge_val):
            if area <= 0: 
                return {
                    'wt_raw': 0.0, 'wt_norm': 0.0, 'rif': 0.0, 'final': 0.0, 
                    'pd': 0.0, 'method': 'None'
                }
            
            # Water Table Fluctuation Method (Raw)
            pre = cls.safe_parse(updated.get('preMonsoonDepth'), 10.0)
            post = cls.safe_parse(updated.get('postMonsoonDepth'), 5.0)
            fluctuation = pre - post
            
            delta_s = area * specific_yield * fluctuation
            wt_rain = delta_s + extraction - other_recharge_val
            
            # Normalization (GEC Equation 8 with 10% Threshold Deduction)
            # Rajasthan GWD requirement: (P_norm - 10% P_norm) / (P_actual - 10% P_norm)
            actual_rain = cls.safe_parse(updated.get('currentMonsoonRainfall'), normal_monsoon_rain)
            
            # Apply Rainfall Cap (e.g., 3000 mm) to both to avoid unrealistic recharge
            RAIN_CAP = 3000.0
            p_actual = min(actual_rain, RAIN_CAP)
            p_norm = min(normal_monsoon_rain, RAIN_CAP)
            
            threshold = 0.1 * p_norm
            
            wt_rain_norm = wt_rain
            if p_actual > threshold and p_norm > threshold:
                # Normalization factor with threshold deduction
                normalization_factor = (p_norm - threshold) / (p_actual - threshold)
                wt_rain_norm = wt_rain * normalization_factor
            elif p_actual <= threshold:
                # If actual rain is below 10% of normal, WT recharge is rejected/zeroed
                wt_rain_norm = 0.0
            
            # RIF Method
            rif_rain = cls.calculate_rif_recharge(area, normal_monsoon_rain, rif_monsoon)
            
            # Adoption Rule
            if fluctuation <= 0 or wt_rain_norm <= 0:
                return {
                    'wt_raw': wt_rain, 'wt_norm': wt_rain_norm, 
                    'rif': rif_rain, 'final': rif_rain, 'pd': 0.0, 'method': 'WT Rejected'
                }
            else:
                pd = cls.calculate_percent_deviation(wt_rain_norm, rif_rain)
                adopted = cls.adopt_rainfall_recharge(wt_rain_norm, rif_rain, pd)
                return {
                    'wt_raw': wt_rain, 'wt_norm': wt_rain_norm, 
                    'rif': rif_rain, 'final': adopted['value'], 'pd': pd, 'method': adopted['method']
                }

        res_c = calculate_subunit_recharge(area_command, ext_c, other_c)
        res_nc = calculate_subunit_recharge(area_non_command, ext_nc, other_nc)
        
        updated['subunit_results'] = {'command': res_c, 'non_command': res_nc}
        updated['gwRechargeWtMethod'] = res_c['wt_raw'] + res_nc['wt_raw']
        updated['gwRechargeWtRainfallNormalized'] = res_c['wt_norm'] + res_nc['wt_norm']
        updated['gwRechargeRifMethod'] = res_c['rif'] + res_nc['rif']
        updated['finalRainfallRecharge'] = res_c['final'] + res_nc['final']
        updated['gwRechargeRainfallMonsoon'] = updated['finalRainfallRecharge']
        
        # Weighted PD calculation
        updated['percentDeviation'] = (res_c['pd'] + res_nc['pd']) / 2.0 if (area_command > 0 and area_non_command > 0) else (res_c['pd'] or res_nc['pd'])
        updated['adoptedRainfallMethod'] = f"C:{res_c['method']} | NC:{res_nc['method']}"


        # 4. Non-Monsoon Rainfall Recharge (RIF Method with GEC Rule)
        nm_rain_recharge = cls.calculate_non_monsoon_rif(total_area_ha, normal_non_monsoon_rain, rif_base)
        
        is_below = False
        if annual_normal_rain > 0:
            is_below = (normal_non_monsoon_rain / annual_normal_rain) < 0.10
        
        updated['isNonMonsoonRainfallBelowThreshold'] = is_below
        updated['gwRechargeRainfallNonMonsoon'] = 0.0 if is_below else max(0.0, nm_rain_recharge)

        # 5. Non-Monsoon Return Flow & Other Sources
        post_monsoon_depth = updated.get('postMonsoonDepth') or updated.get('preMonsoonDepth')
        nm_depth = cls.safe_parse(post_monsoon_depth, 10.0)
        
        gw_rff_nm = cls.get_return_flow_fraction(True, updated.get('rgwi_cropType', 'NON-PADDY'), nm_depth, updated.get('isContinuousSupply', False))
        sw_rff_nm = cls.get_return_flow_fraction(False, updated.get('rgwi_cropType', 'NON-PADDY'), nm_depth, updated.get('isContinuousSupply', False))
        
        updated['rgwi_gw_rff_nm'] = gw_rff_nm
        updated['rgwi_sw_rff_nm'] = sw_rff_nm
        
        gw_draft_nm = cls.safe_parse(updated.get('rgwi_gw_draft_nm'), 0.0)
        sw_draft_nm = cls.safe_parse(updated.get('rgwi_sw_draft_nm'), 0.0)
        
        nm_irrigation = (gw_draft_nm * gw_rff_nm) + (sw_draft_nm * sw_rff_nm)
        updated['gwRechargeFromIrrigationNonMonsoon'] = nm_irrigation

        nm_canals = 0.0
        if area_command > 0:
            nm_canals = cls.calculate_canal_seepage(
                cls.safe_parse(updated.get('rc_wettedArea_nm'), 0.0),
                cls.safe_parse(updated.get('rc_days_nm'), 245),
                cls.safe_parse(updated.get('rc_seepageFactor_nm'), 17.5),
                updated.get('rc_canalType_nm')
            )
        updated['gwRechargeFromCanalsNonMonsoon'] = nm_canals

        nm_wcs = cls.calculate_conservation_recharge(
            cls.safe_parse(updated.get('rwcs_grossStorage_nm'), 0.0),
            cls.safe_parse(updated.get('rwcs_rechargeFactor_nm'), 0.2)
        )
        updated['gwRechargeFromWCSNonMonsoon'] = nm_wcs

        nm_tanks = cls.calculate_tank_recharge(
            cls.safe_parse(updated.get('rtp_avgWaterSpreadArea_nm'), 0.0),
            cls.safe_parse(updated.get('rtp_days_nm'), 245),
            cls.safe_parse(updated.get('rtp_rechargeFactor_nm'), 0.0014)
        )
        updated['gwRechargeFromTanksNonMonsoon'] = nm_tanks

        total_others_nm = nm_irrigation + nm_canals + nm_tanks + nm_wcs
        updated['gwRechargeOtherNonMonsoonTotal'] = total_others_nm
        
        total_non_monsoon = max(0.0, (updated.get('gwRechargeRainfallNonMonsoon') or 0.0) + total_others_nm)
        updated['totalNonMonsoonRecharge'] = total_non_monsoon
        
        # Summary for Non-Monsoon (used in annual tab)
        updated['gwRechargeOtherNonMonsoon'] = total_others_nm


        # 6. Final Aggregation
        total_recharge = max(0.0, updated['gwRechargeRainfallMonsoon'] + updated['gwRechargeOtherMonsoon'] + total_non_monsoon)
        
        nd_default = updated.get('custom_nd_percent')
        if nd_default is None:
            nd_default = 5 if 'WT' in updated['adoptedRainfallMethod'] else 10
            
        nd_final = cls.calculate_natural_discharge(
            total_recharge, 
            nd_default, 
            updated.get('userNaturalDischarge'),
            updated.get('terrainFixedDischarge')
        )
        updated['naturalDischargeLosses'] = nd_final
        updated['totalGwAvailable'] = max(0.0, total_recharge - nd_final)

        # Static / Instorage Resources
        bottom_unconfined = cls.safe_parse(updated.get('bottomOfUnconfinedAquifer'))
        pre_monsoon_depth = cls.safe_parse(updated.get('preMonsoonDepth'))
        static_thickness = max(0.0, bottom_unconfined - pre_monsoon_depth)
        updated['staticGroundWaterResource'] = total_area_ha * static_thickness * specific_yield

        # Confined Resources
        confined_area = cls.safe_parse(updated.get('confinedArea'))
        storativity = cls.safe_parse(updated.get('storativity'))
        piezo_pre = cls.safe_parse(updated.get('piezometricHeadPre'))
        piezo_post = cls.safe_parse(updated.get('piezometricHeadPost'))
        bottom_confining = cls.safe_parse(updated.get('bottomOfTopConfiningLayer'))

        updated['dynamicConfinedResource'] = confined_area * storativity * abs(piezo_post - piezo_pre)
        updated['instorageConfinedResource'] = confined_area * storativity * max(0.0, piezo_pre - bottom_confining)
        updated['totalConfinedResource'] = updated['dynamicConfinedResource'] + updated['instorageConfinedResource']

        # Stage of Extraction
        ext_monsoon = cls.safe_parse(updated.get('gwExtractionMonsoon'))
        # Use Non-Monsoon Draft (rgwi_gw_draft_nm) as the extraction for non-monsoon
        ext_non_monsoon = cls.safe_parse(updated.get('rgwi_gw_draft_nm'), 0.0)
        updated['gwWithdrawal'] = ext_monsoon + ext_non_monsoon
        updated['stageOfExtraction'] = cls.calculate_stage_of_extraction(updated['gwWithdrawal'], updated['totalGwAvailable'])
        
        # Categorization
        pre_history = updated.get('historical_pre_monsoon', [])
        post_history = updated.get('historical_post_monsoon', [])
        pre_trend_slope = cls.calculate_linear_trend(pre_history)
        post_trend_slope = cls.calculate_linear_trend(post_history)
        
        SIGNIFICANT_DECLINE_THRESHOLD = 0.1 
        # Rajasthan GWD: Decline in EITHER pre- OR post-monsoon is enough for reassessment
        trends_significantly_declining = (pre_trend_slope > SIGNIFICANT_DECLINE_THRESHOLD) or (post_trend_slope > SIGNIFICANT_DECLINE_THRESHOLD)
        
        updated['provisionalCategory'] = cls.categorize_unit(updated['stageOfExtraction'])
        updated['finalCategory'] = cls.categorize_unit(updated['stageOfExtraction'], trends_significantly_declining)
        updated['trendsSignificantlyDeclining'] = trends_significantly_declining
        
        # --- Compatibility Aliases for Frontend ---
        updated['final_category'] = updated['finalCategory']
        updated['provisional_category'] = updated['provisionalCategory']
        updated['pre_slope'] = pre_trend_slope
        updated['pst_slope'] = post_trend_slope
        updated['trends_declining'] = trends_significantly_declining


        # Surface Water Available
        total_sw = 0.0
        sw_bodies = updated.get('surfaceWaterBodies', [])
        if isinstance(sw_bodies, list):
            for body in sw_bodies:
                total_sw += cls.safe_parse(body.get('capacity'), 0.0)
        
        if total_sw == 0 and updated.get('totalStorageCapacity'):
            total_sw = cls.safe_parse(updated.get('totalStorageCapacity'))
        updated['totalSwAvailable'] = total_sw

        # Final Summary Fields
        updated['totalGwRechargeRainfall'] = updated['gwRechargeRainfallMonsoon'] + updated['gwRechargeRainfallNonMonsoon']
        updated['gwRechargeOtherNonMonsoonTotal'] = nm_irrigation + nm_canals + nm_tanks + nm_wcs
        updated['totalGwRechargeOther'] = updated['gwRechargeOtherMonsoon'] + updated['gwRechargeOtherNonMonsoonTotal']
        updated['totalWaterAvailable'] = updated['totalGwAvailable'] + updated['totalSwAvailable']

        return updated


class WaterUtilizationCalculator:
    """
    Water Utilization Calculations
    Ported from frontend logic
    """
    @staticmethod
    def calculate_human_demand(population, daily_req_lpcd):
        pop = float(population) or 0.0
        req = float(daily_req_lpcd) or 0.0
        daily_l = pop * req
        # Convert Liters/day to Ha-m/year
        annual_ha_m = (daily_l * 365) / 10000000.0
        return round(annual_ha_m, 4)

    @staticmethod
    def calculate_livestock_demand(livestock_data):
        if not isinstance(livestock_data, list):
            return 0.0
        daily_l = sum(((GECCalculator.safe_parse(item.get('count')) or 0.0) * (GECCalculator.safe_parse(item.get('requirement')) or 0.0)) for item in livestock_data)
        annual_ha_m = (daily_l * 365) / 10000000.0
        return round(annual_ha_m, 4)

    @staticmethod
    def calculate_demand_met(requirement, gw_pct, sw_pct):
        req = float(requirement) or 0.0
        g_pct = float(gw_pct) or 0.0
        s_pct = float(sw_pct) or 0.0
        return {
            'gwVol': round((req * g_pct) / 100.0, 4),
            'swVol': round((req * s_pct) / 100.0, 4)
        }

    @staticmethod
    def calculate_irrigation_demand(crops):
        if not isinstance(crops, list):
            return 0.0
        demand = 0.0
        for crop in crops:
            area = float(crop.get('area', 0))
            requirement = float(crop.get('requirement', 0))
            demand += (area * requirement / 1000.0)
        return round(demand, 4)

    @staticmethod
    def calculate_total_volume(daily_req, days):
        return (float(daily_req) * float(days)) / 10000000.0

    @staticmethod
    def calculate_abstraction_draft(count, discharge, hours, days):
        total_m3 = (float(count) * float(discharge) * float(hours) * float(days))
        return round(total_m3 / 10000.0, 4)

    @staticmethod
    def calculate_water_balance(available_gw, available_sw, utilized_gw, utilized_sw):
        gw_balance = float(available_gw) - float(utilized_gw)
        sw_balance = float(available_sw) - float(utilized_sw)
        return {
            'gwBalance': round(gw_balance, 2),
            'swBalance': round(sw_balance, 2),
            'totalBalance': round(gw_balance + sw_balance, 2)
        }

    @staticmethod
    def calculate_total_utilization(form_data):
        total_gw = 0.0
        total_sw = 0.0
        
        # 1. Drinking/Domestic
        demand_met_data = form_data.get('demandMetData', {})
        if isinstance(demand_met_data, dict):
            for sector in demand_met_data.values():
                total_gw += float(sector.get('gwVol', 0))
                total_sw += float(sector.get('swVol', 0))
        
        # 2. Irrigation
        irrigation_data = form_data.get('irrigationData', {})
        total_gw += float(irrigation_data.get('gwVol', 0))
        total_sw += float(irrigation_data.get('swVol', 0))

        # 3. Industrial
        industrial_data = form_data.get('industrialData', {})
        for entry in industrial_data.get('entries', []):
            total_gw += float(entry.get('gwVol', 0))
            total_sw += float(entry.get('swVol', 0))

        # 4. Other Uses
        other_uses_data = form_data.get('otherUsesData', {})
        for entry in other_uses_data.get('entries', []):
            total_gw += float(entry.get('gwVol', 0))
            total_sw += float(entry.get('swVol', 0))

        return {
            'totalGW': round(total_gw, 2),
            'totalSW': round(total_sw, 2),
            'totalCombined': round(total_gw + total_sw, 2)
        }
