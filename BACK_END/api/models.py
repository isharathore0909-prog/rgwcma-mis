from django.db import models

class ExcelData(models.Model):
    s_no = models.IntegerField(null=True, blank=True)
    gp_final = models.CharField(max_length=255, null=True, blank=True)
    gp_unique = models.CharField(max_length=255, null=True, blank=True)
    new_dist = models.CharField(max_length=255, null=True, blank=True)
    district_u = models.CharField(max_length=255, null=True, blank=True)
    uni_block = models.CharField(max_length=255, null=True, blank=True)
    block_2020 = models.CharField(max_length=255, null=True, blank=True)
    sw_discharge_cumec = models.FloatField(null=True, blank=True)
    sw_hrs = models.FloatField(null=True, blank=True)
    sw_days = models.FloatField(null=True, blank=True)
    sw_irrigation_mcm = models.FloatField(null=True, blank=True)
    canal_days = models.FloatField(null=True, blank=True)
    canal_mcm = models.FloatField(null=True, blank=True)
    tp_days = models.FloatField(null=True, blank=True)
    tp_mcm = models.FloatField(null=True, blank=True)
    total_human_population = models.FloatField(null=True, blank=True)
    
    # Kharif Crop
    kharif_crop_category = models.CharField(max_length=255, null=True, blank=True)
    kharif_crop_type = models.CharField(max_length=255, null=True, blank=True)
    kharif_crop_name = models.CharField(max_length=255, null=True, blank=True)
    kharif_area_ha = models.FloatField(null=True, blank=True)
    kharif_nir_mm = models.FloatField(null=True, blank=True)
    kharif_action = models.CharField(max_length=255, null=True, blank=True)
    
    # Rabi Crop
    rabi_crop_category = models.CharField(max_length=255, null=True, blank=True)
    rabi_crop_type = models.CharField(max_length=255, null=True, blank=True)
    rabi_crop_name = models.CharField(max_length=255, null=True, blank=True)
    rabi_area_ha = models.FloatField(null=True, blank=True)
    rabi_nir_mm = models.FloatField(null=True, blank=True)
    rabi_action = models.CharField(max_length=255, null=True, blank=True)
    
    # Zaid Crop
    zaid_crop_category = models.CharField(max_length=255, null=True, blank=True)
    zaid_crop_type = models.CharField(max_length=255, null=True, blank=True)
    zaid_crop_name = models.CharField(max_length=255, null=True, blank=True)
    zaid_area_ha = models.FloatField(null=True, blank=True)
    zaid_nir_mm = models.FloatField(null=True, blank=True)
    zaid_action = models.CharField(max_length=255, null=True, blank=True)
    
    # Industry
    industry_name = models.CharField(max_length=255, null=True, blank=True)
    industry_daily_water_req_l_day = models.FloatField(null=True, blank=True)
    industry_no_of_days_in_use = models.FloatField(null=True, blank=True)
    
    # Other Use
    other_type_of_use = models.CharField(max_length=255, null=True, blank=True)
    other_daily_water_req_l_day = models.FloatField(null=True, blank=True)
    other_no_of_days_in_use = models.FloatField(null=True, blank=True)
    
    # Aquifer / Heads
    bottom_of_unconfined_aquifer = models.FloatField(null=True, blank=True)
    confined_aquifer_area = models.FloatField(null=True, blank=True)
    pre_monsoon_piezometric_heads = models.FloatField(null=True, blank=True)
    post_monsoon_piezometric_heads = models.FloatField(null=True, blank=True)
    bottom_of_confining_layer = models.FloatField(null=True, blank=True)

    # Sprinkler Irrigation
    sprinkler_kharif_crop_category = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_kharif_crop_type = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_kharif_crop_name = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_kharif_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    sprinkler_kharif_net_water_requirement_mm = models.FloatField(null=True, blank=True)
    sprinkler_kharif_area_proposed_for_sprinkler_ha = models.FloatField(null=True, blank=True)
    sprinkler_rabi_crop_category = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_rabi_crop_type = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_rabi_crop_name = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_rabi_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    sprinkler_rabi_net_water_requirement_mm = models.FloatField(null=True, blank=True)
    sprinkler_rabi_area_proposed_for_sprinkler_ha = models.FloatField(null=True, blank=True)
    sprinkler_summer_crop_category = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_summer_crop_type = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_summer_crop_name = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_summer_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    sprinkler_summer_net_water_requirement_mm = models.FloatField(null=True, blank=True)
    sprinkler_summer_area_proposed_for_sprinkler_ha = models.FloatField(null=True, blank=True)
    sprinkler_funding_total_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    sprinkler_funding_total_area_proposed_for_sprinkler_ha = models.FloatField(null=True, blank=True)
    sprinkler_funding_area_proposed_for_sprinkler_ha = models.FloatField(null=True, blank=True)
    sprinkler_funding_financial_year = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_funding_department_name = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_funding_scheme_name = models.CharField(max_length=255, null=True, blank=True)
    sprinkler_funding_approximate_estimated_cost_in_lakh = models.FloatField(null=True, blank=True)

    # Drip Irrigation
    drip_kharif_crop_category = models.CharField(max_length=255, null=True, blank=True)
    drip_kharif_crop_type = models.CharField(max_length=255, null=True, blank=True)
    drip_kharif_crop_name = models.CharField(max_length=255, null=True, blank=True)
    drip_kharif_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    drip_kharif_net_water_requirement_mm = models.FloatField(null=True, blank=True)
    drip_kharif_area_proposed_for_drip_ha = models.FloatField(null=True, blank=True)
    drip_rabi_crop_category = models.CharField(max_length=255, null=True, blank=True)
    drip_rabi_crop_type = models.CharField(max_length=255, null=True, blank=True)
    drip_rabi_crop_name = models.CharField(max_length=255, null=True, blank=True)
    drip_rabi_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    drip_rabi_net_water_requirement_mm = models.FloatField(null=True, blank=True)
    drip_rabi_area_proposed_for_drip_ha = models.FloatField(null=True, blank=True)
    drip_summer_crop_category = models.CharField(max_length=255, null=True, blank=True)
    drip_summer_crop_type = models.CharField(max_length=255, null=True, blank=True)
    drip_summer_crop_name = models.CharField(max_length=255, null=True, blank=True)
    drip_summer_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    drip_summer_net_water_requirement_mm = models.FloatField(null=True, blank=True)
    drip_summer_area_proposed_for_drip_ha = models.FloatField(null=True, blank=True)
    drip_funding_total_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    drip_funding_total_area_proposed_for_drip_ha = models.FloatField(null=True, blank=True)
    drip_funding_area_proposed_for_drip_ha = models.FloatField(null=True, blank=True)
    drip_funding_financial_year = models.CharField(max_length=255, null=True, blank=True)
    drip_funding_department_name = models.CharField(max_length=255, null=True, blank=True)
    drip_funding_scheme_name = models.CharField(max_length=255, null=True, blank=True)
    drip_funding_approximate_estimated_cost_in_lakh = models.FloatField(null=True, blank=True)

    # Pipeline
    pipeline_kharif_crop_category = models.CharField(max_length=255, null=True, blank=True)
    pipeline_kharif_crop_type = models.CharField(max_length=255, null=True, blank=True)
    pipeline_kharif_crop_name = models.CharField(max_length=255, null=True, blank=True)
    pipeline_kharif_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    pipeline_kharif_net_water_requirement_mm = models.FloatField(null=True, blank=True)
    pipeline_kharif_area_proposed_for_pipelines_ha = models.FloatField(null=True, blank=True)
    pipeline_rabi_crop_category = models.CharField(max_length=255, null=True, blank=True)
    pipeline_rabi_crop_type = models.CharField(max_length=255, null=True, blank=True)
    pipeline_rabi_crop_name = models.CharField(max_length=255, null=True, blank=True)
    pipeline_rabi_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    pipeline_rabi_net_water_requirement_mm = models.FloatField(null=True, blank=True)
    pipeline_rabi_area_proposed_for_pipelines_ha = models.FloatField(null=True, blank=True)
    pipeline_summer_crop_category = models.CharField(max_length=255, null=True, blank=True)
    pipeline_summer_crop_type = models.CharField(max_length=255, null=True, blank=True)
    pipeline_summer_crop_name = models.CharField(max_length=255, null=True, blank=True)
    pipeline_summer_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    pipeline_summer_net_water_requirement_mm = models.FloatField(null=True, blank=True)
    pipeline_summer_area_proposed_for_pipelines_ha = models.FloatField(null=True, blank=True)
    pipeline_funding_total_area_under_conventional_irrigation_ha = models.FloatField(null=True, blank=True)
    pipeline_funding_total_area_proposed_for_pipelines_ha = models.FloatField(null=True, blank=True)
    pipeline_funding_area_proposed_for_pipelines_ha = models.FloatField(null=True, blank=True)
    pipeline_funding_financial_year = models.CharField(max_length=255, null=True, blank=True)
    pipeline_funding_department_name = models.CharField(max_length=255, null=True, blank=True)
    pipeline_funding_scheme_name = models.CharField(max_length=255, null=True, blank=True)
    pipeline_funding_approximate_estimated_cost_in_lakh = models.FloatField(null=True, blank=True)

    # Crop Diversification
    div_kharif_original_crop_category = models.CharField(max_length=255, null=True, blank=True)
    div_kharif_original_crop_type = models.CharField(max_length=255, null=True, blank=True)
    div_kharif_original_crop_name = models.CharField(max_length=255, null=True, blank=True)
    div_kharif_original_water_req_mm = models.FloatField(null=True, blank=True)
    div_kharif_original_area_ha = models.FloatField(null=True, blank=True)
    div_kharif_changed_crop_category = models.CharField(max_length=255, null=True, blank=True)
    div_kharif_changed_crop_type = models.CharField(max_length=255, null=True, blank=True)
    div_kharif_changed_crop_name = models.CharField(max_length=255, null=True, blank=True)
    div_kharif_changed_water_req_mm = models.FloatField(null=True, blank=True)
    div_kharif_changed_area_ha = models.FloatField(null=True, blank=True)
    div_rabi_original_crop_category = models.CharField(max_length=255, null=True, blank=True)
    div_rabi_original_crop_type = models.CharField(max_length=255, null=True, blank=True)
    div_rabi_original_crop_name = models.CharField(max_length=255, null=True, blank=True)
    div_rabi_original_water_req_mm = models.FloatField(null=True, blank=True)
    div_rabi_original_area_ha = models.FloatField(null=True, blank=True)
    div_rabi_changed_crop_category = models.CharField(max_length=255, null=True, blank=True)
    div_rabi_changed_crop_type = models.CharField(max_length=255, null=True, blank=True)
    div_rabi_changed_crop_name = models.CharField(max_length=255, null=True, blank=True)
    div_rabi_changed_water_req_mm = models.FloatField(null=True, blank=True)
    div_rabi_changed_area_ha = models.FloatField(null=True, blank=True)
    div_summer_original_crop_category = models.CharField(max_length=255, null=True, blank=True)
    div_summer_original_crop_type = models.CharField(max_length=255, null=True, blank=True)
    div_summer_original_crop_name = models.CharField(max_length=255, null=True, blank=True)
    div_summer_original_water_req_mm = models.FloatField(null=True, blank=True)
    div_summer_original_area_ha = models.FloatField(null=True, blank=True)
    div_summer_changed_crop_category = models.CharField(max_length=255, null=True, blank=True)
    div_summer_changed_crop_type = models.CharField(max_length=255, null=True, blank=True)
    div_summer_changed_crop_name = models.CharField(max_length=255, null=True, blank=True)
    div_summer_changed_water_req_mm = models.FloatField(null=True, blank=True)
    div_summer_changed_area_ha = models.FloatField(null=True, blank=True)
    div_funding_total_area_shifted_ha = models.FloatField(null=True, blank=True)
    div_funding_area_proposed_ha = models.FloatField(null=True, blank=True)
    div_funding_financial_year = models.CharField(max_length=255, null=True, blank=True)
    div_funding_department_name = models.CharField(max_length=255, null=True, blank=True)
    div_funding_scheme_name = models.CharField(max_length=255, null=True, blank=True)
    div_funding_estimated_cost_in_lakh = models.FloatField(null=True, blank=True)

    # Innovative Measures
    inn_kharif_measure = models.CharField(max_length=255, null=True, blank=True)
    inn_kharif_crop_category = models.CharField(max_length=255, null=True, blank=True)
    inn_kharif_crop_type = models.CharField(max_length=255, null=True, blank=True)
    inn_kharif_crop_name = models.CharField(max_length=255, null=True, blank=True)
    inn_kharif_water_req_mm = models.FloatField(null=True, blank=True)
    inn_kharif_water_saving_percent = models.FloatField(null=True, blank=True)
    inn_kharif_area_proposed_ha = models.FloatField(null=True, blank=True)
    inn_rabi_measure = models.CharField(max_length=255, null=True, blank=True)
    inn_rabi_crop_category = models.CharField(max_length=255, null=True, blank=True)
    inn_rabi_crop_type = models.CharField(max_length=255, null=True, blank=True)
    inn_rabi_crop_name = models.CharField(max_length=255, null=True, blank=True)
    inn_rabi_water_req_mm = models.FloatField(null=True, blank=True)
    inn_rabi_water_saving_percent = models.FloatField(null=True, blank=True)
    inn_rabi_area_proposed_ha = models.FloatField(null=True, blank=True)
    inn_summer_measure = models.CharField(max_length=255, null=True, blank=True)
    inn_summer_crop_category = models.CharField(max_length=255, null=True, blank=True)
    inn_summer_crop_type = models.CharField(max_length=255, null=True, blank=True)
    inn_summer_crop_name = models.CharField(max_length=255, null=True, blank=True)
    inn_summer_water_req_mm = models.FloatField(null=True, blank=True)
    inn_summer_water_saving_percent = models.FloatField(null=True, blank=True)
    inn_summer_area_proposed_ha = models.FloatField(null=True, blank=True)
    inn_funding_total_area_proposed_ha = models.FloatField(null=True, blank=True)
    inn_funding_selected_measure = models.CharField(max_length=255, null=True, blank=True)
    inn_funding_total_area_selected_measure_ha = models.FloatField(null=True, blank=True)
    inn_funding_area_proposed_ha = models.FloatField(null=True, blank=True)
    inn_funding_financial_year = models.CharField(max_length=255, null=True, blank=True)
    inn_funding_department_name = models.CharField(max_length=255, null=True, blank=True)
    inn_funding_scheme_name = models.CharField(max_length=255, null=True, blank=True)
    inn_funding_estimated_cost_in_lakh = models.FloatField(null=True, blank=True)

    # ARS
    ars_village_name = models.CharField(max_length=255, null=True, blank=True)
    ars_location_details = models.CharField(max_length=255, null=True, blank=True)
    ars_type_of_artificial_recharge_structure = models.CharField(max_length=255, null=True, blank=True)
    ars_latitude = models.FloatField(null=True, blank=True)
    ars_longitude = models.FloatField(null=True, blank=True)
    ars_work_proposed = models.CharField(max_length=255, null=True, blank=True)
    ars_storage_capacity_ha_m = models.FloatField(null=True, blank=True)
    ars_annual_no_of_fillings = models.FloatField(null=True, blank=True)
    ars_recharge_percent = models.FloatField(null=True, blank=True)
    ars_annual_gw_recharge_ha_m = models.FloatField(null=True, blank=True)
    ars_financial_year = models.CharField(max_length=255, null=True, blank=True)
    ars_department_name = models.CharField(max_length=255, null=True, blank=True)
    ars_scheme_name = models.CharField(max_length=255, null=True, blank=True)
    ars_estimated_cost_in_lakh = models.FloatField(null=True, blank=True)
    
    # WCS
    wcs_village_name = models.CharField(max_length=255, null=True, blank=True)
    wcs_location_details = models.CharField(max_length=255, null=True, blank=True)
    wcs_type_of_water_conservation_structure = models.CharField(max_length=255, null=True, blank=True)
    wcs_latitude = models.FloatField(null=True, blank=True)
    wcs_longitude = models.FloatField(null=True, blank=True)
    wcs_work_proposed = models.CharField(max_length=255, null=True, blank=True)
    wcs_storage_capacity_ha_m = models.FloatField(null=True, blank=True)
    wcs_annual_no_of_fillings = models.FloatField(null=True, blank=True)
    wcs_effective_storage_available_ha_m = models.FloatField(null=True, blank=True)
    wcs_financial_year = models.CharField(max_length=255, null=True, blank=True)
    wcs_department_name = models.CharField(max_length=255, null=True, blank=True)
    wcs_scheme_name = models.CharField(max_length=255, null=True, blank=True)
    wcs_estimated_cost_in_lakh = models.FloatField(null=True, blank=True)

    # Added fields for rainfall analysis
    monsoon_rainfall_mm = models.FloatField(null=True, blank=True)
    recharge_ham = models.FloatField(null=True, blank=True)

    # Yearly recharge data (2015-2024)
    recharge_2015 = models.FloatField(null=True, blank=True)
    recharge_2016 = models.FloatField(null=True, blank=True)
    recharge_2017 = models.FloatField(null=True, blank=True)
    recharge_2018 = models.FloatField(null=True, blank=True)
    recharge_2019 = models.FloatField(null=True, blank=True)
    recharge_2020 = models.FloatField(null=True, blank=True)
    recharge_2021 = models.FloatField(null=True, blank=True)
    recharge_2022 = models.FloatField(null=True, blank=True)
    recharge_2023 = models.FloatField(null=True, blank=True)
    recharge_2024 = models.FloatField(null=True, blank=True)

    class Meta:
        managed = True
        db_table = 'api_exceldata'

    def __str__(self):
        return f"{self.gp_final} - {self.gp_unique}"

class RainfallInfiltrationFactor(models.Model):
    sl_no = models.IntegerField(null=True, blank=True)
    principal_aquifer = models.CharField(max_length=255, null=True, blank=True)
    major_aquifer_code = models.CharField(max_length=50, null=True, blank=True)
    major_aquifer_name = models.CharField(max_length=500, null=True, blank=True)
    age = models.CharField(max_length=255, null=True, blank=True)
    recommended_percent = models.FloatField(null=True, blank=True)
    minimum_percent = models.FloatField(null=True, blank=True)
    maximum_percent = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.major_aquifer_code} - {self.major_aquifer_name[:30]}"

class SpecificYield(models.Model):
    sl_no = models.IntegerField(null=True, blank=True)
    principal_aquifer = models.CharField(max_length=255, null=True, blank=True)
    major_aquifer_code = models.CharField(max_length=50, null=True, blank=True)
    major_aquifer_name = models.CharField(max_length=500, null=True, blank=True)
    age = models.CharField(max_length=255, null=True, blank=True)
    recommended_percent = models.FloatField(null=True, blank=True)
    minimum_percent = models.FloatField(null=True, blank=True)
    maximum_percent = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.major_aquifer_code} - {self.major_aquifer_name[:30]}"

class District(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)

    class Meta:
        db_table = 'locationApi_district'
        managed = False

    def __str__(self):
        return self.name

class Block(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    district = models.ForeignKey(District, on_delete=models.CASCADE)

    class Meta:
        db_table = 'locationApi_block'
        managed = False

    def __str__(self):
        return self.name

class GramPanchayat(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    block = models.ForeignKey(Block, on_delete=models.CASCADE)

    class Meta:
        db_table = 'locationApi_grampanchayat'
        managed = False

    def __str__(self):
        return self.name

class Village(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    gram_panchayat = models.ForeignKey(GramPanchayat, on_delete=models.CASCADE, db_column='grampanchayat_id')

    class Meta:
        db_table = 'locationApi_village'
        managed = False

    def __str__(self):
        return self.name

class RainfallStation(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    district = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rainfallApi_rainfallstation'
        managed = False

    def __str__(self):
        return self.name

class StationRainfall(models.Model):
    id = models.AutoField(primary_key=True)
    station = models.ForeignKey(RainfallStation, on_delete=models.CASCADE)
    date = models.DateField()
    rainfall_mm = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rainfallApi_stationrainfall'
        managed = False

    def __str__(self):
        return f"{self.station.name} - {self.date}"


class AquiferData(models.Model):
    id = models.AutoField(primary_key=True)
    village = models.ForeignKey(Village, on_delete=models.CASCADE, db_column='village_id', null=True, blank=True)
    well_id = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    well_depth = models.FloatField(null=True, blank=True)
    aquifer = models.CharField(max_length=255, null=True, blank=True)
    
    # Pre-monsoon water levels
    pre_2015 = models.FloatField(null=True, blank=True)
    pre_2016 = models.FloatField(null=True, blank=True)
    pre_2017 = models.FloatField(null=True, blank=True)
    pre_2018 = models.FloatField(null=True, blank=True)
    pre_2019 = models.FloatField(null=True, blank=True)
    pre_2020 = models.FloatField(null=True, blank=True)
    pre_2021 = models.FloatField(null=True, blank=True)
    pre_2022 = models.FloatField(null=True, blank=True)
    pre_2023 = models.FloatField(null=True, blank=True)
    pre_2024 = models.FloatField(null=True, blank=True)
    
    # Post-monsoon water levels
    pst_2015 = models.FloatField(null=True, blank=True)
    pst_2016 = models.FloatField(null=True, blank=True)
    pst_2017 = models.FloatField(null=True, blank=True)
    pst_2018 = models.FloatField(null=True, blank=True)
    pst_2019 = models.FloatField(null=True, blank=True)
    pst_2020 = models.FloatField(null=True, blank=True)
    pst_2021 = models.FloatField(null=True, blank=True)
    pst_2022 = models.FloatField(null=True, blank=True)
    pst_2023 = models.FloatField(null=True, blank=True)
    pst_2024 = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'aquiferApi_aquiferdata'
        managed = False
        
    def __str__(self):
        return f"Aquifer Data - {self.well_id}"

class WaterQuality(models.Model):
    id = models.AutoField(primary_key=True)
    village = models.ForeignKey(Village, on_delete=models.CASCADE, db_column='village_id', null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    well_id = models.CharField(max_length=255, null=True, blank=True)
    type_of_well = models.CharField(max_length=255, null=True, blank=True)
    well_depth = models.FloatField(null=True, blank=True)
    meta_date = models.DateField(null=True, blank=True)
    ph = models.FloatField(null=True, blank=True)
    hardness = models.FloatField(null=True, blank=True)
    alkalinity = models.FloatField(null=True, blank=True)
    nitrate = models.FloatField(null=True, blank=True)
    fluoride = models.FloatField(null=True, blank=True)
    ec = models.FloatField(null=True, blank=True)
    tds = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'water_qualityApi_waterquality'
        managed = False

    def __str__(self):
        return f"Water Quality - {self.id}"

class SpatialWaterbody(models.Model):
    name = models.CharField(max_length=500, null=True, blank=True)
    river = models.CharField(max_length=500, null=True, blank=True)
    type_code = models.CharField(max_length=50, null=True, blank=True)
    # Using Generic geometry field since PostGIS is enabled
    # In migrations we would use PointField if strictly points, but dataset might have polygons
    geometry = models.TextField(null=True, blank=True) # Fallback for now, raw SQL handles spatial

    class Meta:
        db_table = 'spatial_waterbody'
        managed = False # Handled by custom import script

    def __str__(self):
        return self.name or self.river or f"Waterbody {self.id}"
