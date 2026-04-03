
import os
import sys
from django.core.management.base import BaseCommand
from api.models import ExcelData

class Command(BaseCommand):
    help = 'Load full GP data from Excel into ExcelData table'

    def handle(self, *args, **options):
        try:
            import pandas as pd
        except ImportError:
            self.stdout.write(self.style.ERROR("Error: 'pandas' is not installed. Please run: pip install pandas openpyxl"))
            return

        file_path = r'D:\MIS_RSGWA\gdf_gp_full_dummy.xlsx'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write(f'Reading file: {file_path}...')
        try:
            # Explicitly specify engine for robustness
            df = pd.read_excel(file_path, engine='openpyxl')
            
            # Normalize column names
            df.columns = [str(c).strip().lower().replace(' ', '_').replace('-', '_').replace('__', '_') for c in df.columns]
        except ImportError:
             self.stdout.write(self.style.ERROR("Error: 'openpyxl' is likely missing. Please run: pip install openpyxl"))
             return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error reading Excel file: {str(e)}'))
            return

        self.stdout.write(f'Found {len(df)} rows and {len(df.columns)} columns.')
        
        # Validate critical columns
        required_verification = ['sprinkler_kharif_crop_category', 'drip_kharif_crop_category', 'sw_irrigation_mcm']
        missing = [c for c in required_verification if c not in df.columns]
        if missing:
             self.stdout.write(self.style.WARNING(f"Warning: Expected normalized columns missing in Excel: {missing}"))
             self.stdout.write(f"Available columns: {list(df.columns)}")

        # Mapping: normalized_excel_col -> model_field
        # Keys are the normalized column names from Excel
        # Values are the model field names
        column_mapping = {
            's.no.': 's_no',
            'gp_final': 'gp_final',
            'gp_unique_': 'gp_unique',
            'new_dist': 'new_dist',
            'district_u': 'district_u',
            'uni_block': 'uni_block',
            'block_2020': 'block_2020',
            
            # SW
            'sw_discharge_cumec': 'sw_discharge_cumec',
            'sw_hrs': 'sw_hrs',
            'sw_days': 'sw_days',
            'sw_irrigation_mcm': 'sw_irrigation_mcm',
            
            # Canal
            'canal_days': 'canal_days',
            'canal_mcm': 'canal_mcm',
            
            # TP
            'tp_days': 'tp_days',
            'tp_mcm': 'tp_mcm',
            
            # Population
            'total_human_population': 'total_human_population',
            
            # Kharif
            'kharif_crop_category': 'kharif_crop_category',
            'kharif_crop_type': 'kharif_crop_type',
            'kharif_crop_name': 'kharif_crop_name',
            'kharif_area_(ha)': 'kharif_area_ha',
            'kharif_nir_(mm)': 'kharif_nir_mm',
            'kharif_action': 'kharif_action',
            
            # Rabi
            'rabi_crop_category': 'rabi_crop_category',
            'rabi_crop_type': 'rabi_crop_type',
            'rabi_crop_name': 'rabi_crop_name',
            'rabi_area_(ha)': 'rabi_area_ha',
            'rabi_nir_(mm)': 'rabi_nir_mm',
            'rabi_action': 'rabi_action',
            
            # Zaid
            'zaid_crop_category': 'zaid_crop_category',
            'zaid_crop_type': 'zaid_crop_type',
            'zaid_crop_name': 'zaid_crop_name',
            'zaid_area_(ha)': 'zaid_area_ha',
            'zaid_nir_(mm)': 'zaid_nir_mm',
            'zaid_action': 'zaid_action',
            
            # Industry
            'industry_name': 'industry_name',
            'industry_daily_water_requirement_(l/day)': 'industry_daily_water_req_l_day',
            'industry_no._of_days_in_use': 'industry_no_of_days_in_use',
            
            # Other
            'other_type_of_use': 'other_type_of_use',
            'other_daily_water_requirement_(l/day)': 'other_daily_water_req_l_day',
            'other_no._of_days_in_use': 'other_no_of_days_in_use',
            
            # Aquifer
            'bottom_of_unconfined_aquifer': 'bottom_of_unconfined_aquifer',
            'confined_aquifer_area': 'confined_aquifer_area',
            'pre_monsoon_piezometric_heads': 'pre_monsoon_piezometric_heads',
            'post_monsoon_piezometric_heads': 'post_monsoon_piezometric_heads',
            'bottom_of_confining_layer': 'bottom_of_confining_layer',
            
            # Rainfall
            'monsoon_rainfall_mm': 'monsoon_rainfall_mm',
            'recharge_ham': 'recharge_ham',

            # Sprinkler
            'sprinkler_kharif_crop_category': 'sprinkler_kharif_crop_category',
            'sprinkler_kharif_crop_type': 'sprinkler_kharif_crop_type',
            'sprinkler_kharif_crop_name': 'sprinkler_kharif_crop_name',
            'sprinkler_kharif_area_under_conventional_irrigation_(ha)': 'sprinkler_kharif_area_under_conventional_irrigation_ha',
            'sprinkler_kharif_net_water_requirement_(mm)': 'sprinkler_kharif_net_water_requirement_mm',
            'sprinkler_kharif_area_proposed_for_sprinkler_(ha)': 'sprinkler_kharif_area_proposed_for_sprinkler_ha',
            'sprinkler_rabi_crop_category': 'sprinkler_rabi_crop_category',
            'sprinkler_rabi_crop_type': 'sprinkler_rabi_crop_type',
            'sprinkler_rabi_crop_name': 'sprinkler_rabi_crop_name',
            'sprinkler_rabi_area_under_conventional_irrigation_(ha)': 'sprinkler_rabi_area_under_conventional_irrigation_ha',
            'sprinkler_rabi_net_water_requirement_(mm)': 'sprinkler_rabi_net_water_requirement_mm',
            'sprinkler_rabi_area_proposed_for_sprinkler_(ha)': 'sprinkler_rabi_area_proposed_for_sprinkler_ha',
            'sprinkler_summer_crop_category': 'sprinkler_summer_crop_category',
            'sprinkler_summer_crop_type': 'sprinkler_summer_crop_type',
            'sprinkler_summer_crop_name': 'sprinkler_summer_crop_name',
            'sprinkler_summer_area_under_conventional_irrigation_(ha)': 'sprinkler_summer_area_under_conventional_irrigation_ha',
            'sprinkler_summer_net_water_requirement_(mm)': 'sprinkler_summer_net_water_requirement_mm',
            'sprinkler_summer_area_proposed_for_sprinkler_(ha)': 'sprinkler_summer_area_proposed_for_sprinkler_ha',
            'sprinkler_funding_total_area_under_conventional_irrigation_(ha)': 'sprinkler_funding_total_area_under_conventional_irrigation_ha',
            'sprinkler_funding_total_area_proposed_for_sprinkler_(ha)': 'sprinkler_funding_total_area_proposed_for_sprinkler_ha',
            'sprinkler_funding_area_proposed_for_sprinkler_(ha)': 'sprinkler_funding_area_proposed_for_sprinkler_ha',
            'sprinkler_funding_financial_year': 'sprinkler_funding_financial_year',
            'sprinkler_funding_department_name': 'sprinkler_funding_department_name',
            'sprinkler_funding_scheme_name': 'sprinkler_funding_scheme_name',
            'sprinkler_funding_approximate_estimated_cost_(in_lakh)': 'sprinkler_funding_approximate_estimated_cost_in_lakh',

            # Drip
            'drip_kharif_crop_category': 'drip_kharif_crop_category',
            'drip_kharif_crop_type': 'drip_kharif_crop_type',
            'drip_kharif_crop_name': 'drip_kharif_crop_name',
            'drip_kharif_area_under_conventional_irrigation_(ha)': 'drip_kharif_area_under_conventional_irrigation_ha',
            'drip_kharif_net_water_requirement_(mm)': 'drip_kharif_net_water_requirement_mm',
            'drip_kharif_area_proposed_for_drip_(ha)': 'drip_kharif_area_proposed_for_drip_ha',
            'drip_rabi_crop_category': 'drip_rabi_crop_category',
            'drip_rabi_crop_type': 'drip_rabi_crop_type',
            'drip_rabi_crop_name': 'drip_rabi_crop_name',
            'drip_rabi_area_under_conventional_irrigation_(ha)': 'drip_rabi_area_under_conventional_irrigation_ha',
            'drip_rabi_net_water_requirement_(mm)': 'drip_rabi_net_water_requirement_mm',
            'drip_rabi_area_proposed_for_drip_(ha)': 'drip_rabi_area_proposed_for_drip_ha',
            'drip_summer_crop_category': 'drip_summer_crop_category',
            'drip_summer_crop_type': 'drip_summer_crop_type',
            'drip_summer_crop_name': 'drip_summer_crop_name',
            'drip_summer_area_under_conventional_irrigation_(ha)': 'drip_summer_area_under_conventional_irrigation_ha',
            'drip_summer_net_water_requirement_(mm)': 'drip_summer_net_water_requirement_mm',
            'drip_summer_area_proposed_for_drip_(ha)': 'drip_summer_area_proposed_for_drip_ha',
            'drip_funding_total_area_under_conventional_irrigation_(ha)': 'drip_funding_total_area_under_conventional_irrigation_ha',
            'drip_funding_total_area_proposed_for_drip_(ha)': 'drip_funding_total_area_proposed_for_drip_ha',
            'drip_funding_area_proposed_for_drip_(ha)': 'drip_funding_area_proposed_for_drip_ha',
            'drip_funding_financial_year': 'drip_funding_financial_year',
            'drip_funding_department_name': 'drip_funding_department_name',
            'drip_funding_scheme_name': 'drip_funding_scheme_name',
            'drip_funding_approximate_estimated_cost_(in_lakh)': 'drip_funding_approximate_estimated_cost_in_lakh',

            # Pipeline
            'pipeline_kharif_crop_category': 'pipeline_kharif_crop_category',
            'pipeline_kharif_crop_type': 'pipeline_kharif_crop_type',
            'pipeline_kharif_crop_name': 'pipeline_kharif_crop_name',
            'pipeline_kharif_area_under_conventional_irrigation_(ha)': 'pipeline_kharif_area_under_conventional_irrigation_ha',
            'pipeline_kharif_net_water_requirement_(mm)': 'pipeline_kharif_net_water_requirement_mm',
            'pipeline_kharif_area_proposed_for_pipelines_(ha)': 'pipeline_kharif_area_proposed_for_pipelines_ha',
            'pipeline_rabi_crop_category': 'pipeline_rabi_crop_category',
            'pipeline_rabi_crop_type': 'pipeline_rabi_crop_type',
            'pipeline_rabi_crop_name': 'pipeline_rabi_crop_name',
            'pipeline_rabi_area_under_conventional_irrigation_(ha)': 'pipeline_rabi_area_under_conventional_irrigation_ha',
            'pipeline_rabi_net_water_requirement_(mm)': 'pipeline_rabi_net_water_requirement_mm',
            'pipeline_rabi_area_proposed_for_pipelines_(ha)': 'pipeline_rabi_area_proposed_for_pipelines_ha',
            'pipeline_summer_crop_category': 'pipeline_summer_crop_category',
            'pipeline_summer_crop_type': 'pipeline_summer_crop_type',
            'pipeline_summer_crop_name': 'pipeline_summer_crop_name',
            'pipeline_summer_area_under_conventional_irrigation_(ha)': 'pipeline_summer_area_under_conventional_irrigation_ha',
            'pipeline_summer_net_water_requirement_(mm)': 'pipeline_summer_net_water_requirement_mm',
            'pipeline_summer_area_proposed_for_pipelines_(ha)': 'pipeline_summer_area_proposed_for_pipelines_ha',
            'pipeline_funding_total_area_under_conventional_irrigation_(ha)': 'pipeline_funding_total_area_under_conventional_irrigation_ha',
            'pipeline_funding_total_area_proposed_for_pipelines_(ha)': 'pipeline_funding_total_area_proposed_for_pipelines_ha',
            'pipeline_funding_area_proposed_for_pipelines_(ha)': 'pipeline_funding_area_proposed_for_pipelines_ha',
            'pipeline_funding_financial_year': 'pipeline_funding_financial_year',
            'pipeline_funding_department_name': 'pipeline_funding_department_name',
            'pipeline_funding_scheme_name': 'pipeline_funding_scheme_name',
            'pipeline_funding_approximate_estimated_cost_(in_lakh)': 'pipeline_funding_approximate_estimated_cost_in_lakh',

            # Div
            'div_kharif_original_crop_category': 'div_kharif_original_crop_category',
            'div_kharif_original_crop_type': 'div_kharif_original_crop_type',
            'div_kharif_original_crop_name': 'div_kharif_original_crop_name',
            'div_kharif_original_water_req_(mm)': 'div_kharif_original_water_req_mm',
            'div_kharif_original_area_(ha)': 'div_kharif_original_area_ha',
            'div_kharif_changed_crop_category': 'div_kharif_changed_crop_category',
            'div_kharif_changed_crop_type': 'div_kharif_changed_crop_type',
            'div_kharif_changed_crop_name': 'div_kharif_changed_crop_name',
            'div_kharif_changed_water_req_(mm)': 'div_kharif_changed_water_req_mm',
            'div_kharif_changed_area_(ha)': 'div_kharif_changed_area_ha',
            'div_rabi_original_crop_category': 'div_rabi_original_crop_category',
            'div_rabi_original_crop_type': 'div_rabi_original_crop_type',
            'div_rabi_original_crop_name': 'div_rabi_original_crop_name',
            'div_rabi_original_water_req_(mm)': 'div_rabi_original_water_req_mm',
            'div_rabi_original_area_(ha)': 'div_rabi_original_area_ha',
            'div_rabi_changed_crop_category': 'div_rabi_changed_crop_category',
            'div_rabi_changed_crop_type': 'div_rabi_changed_crop_type',
            'div_rabi_changed_crop_name': 'div_rabi_changed_crop_name',
            'div_rabi_changed_water_req_(mm)': 'div_rabi_changed_water_req_mm',
            'div_rabi_changed_area_(ha)': 'div_rabi_changed_area_ha',
            'div_summer_original_crop_category': 'div_summer_original_crop_category',
            'div_summer_original_crop_type': 'div_summer_original_crop_type',
            'div_summer_original_crop_name': 'div_summer_original_crop_name',
            'div_summer_original_water_req_(mm)': 'div_summer_original_water_req_mm',
            'div_summer_original_area_(ha)': 'div_summer_original_area_ha',
            'div_summer_changed_crop_category': 'div_summer_changed_crop_category',
            'div_summer_changed_crop_type': 'div_summer_changed_crop_type',
            'div_summer_changed_crop_name': 'div_summer_changed_crop_name',
            'div_summer_changed_water_req_(mm)': 'div_summer_changed_water_req_mm',
            'div_summer_changed_area_(ha)': 'div_summer_changed_area_ha',
            'div_funding_total_area_shifted_(ha)': 'div_funding_total_area_shifted_ha',
            'div_funding_area_proposed_(ha)': 'div_funding_area_proposed_ha',
            'div_funding_financial_year': 'div_funding_financial_year',
            'div_funding_department_name': 'div_funding_department_name',
            'div_funding_scheme_name': 'div_funding_scheme_name',
            'div_funding_estimated_cost_(in_lakh)': 'div_funding_estimated_cost_in_lakh',

            # Innovation
            'inn_kharif_measure': 'inn_kharif_measure',
            'inn_kharif_crop_category': 'inn_kharif_crop_category',
            'inn_kharif_crop_type': 'inn_kharif_crop_type',
            'inn_kharif_crop_name': 'inn_kharif_crop_name',
            'inn_kharif_water_req_(mm)': 'inn_kharif_water_req_mm',
            'inn_kharif_water_saving_(%)': 'inn_kharif_water_saving_percent',
            'inn_kharif_area_proposed_(ha)': 'inn_kharif_area_proposed_ha',
            'inn_rabi_measure': 'inn_rabi_measure',
            'inn_rabi_crop_category': 'inn_rabi_crop_category',
            'inn_rabi_crop_type': 'inn_rabi_crop_type',
            'inn_rabi_crop_name': 'inn_rabi_crop_name',
            'inn_rabi_water_req_(mm)': 'inn_rabi_water_req_mm',
            'inn_rabi_water_saving_(%)': 'inn_rabi_water_saving_percent',
            'inn_rabi_area_proposed_(ha)': 'inn_rabi_area_proposed_ha',
            'inn_summer_measure': 'inn_summer_measure',
            'inn_summer_crop_category': 'inn_summer_crop_category',
            'inn_summer_crop_type': 'inn_summer_crop_type',
            'inn_summer_crop_name': 'inn_summer_crop_name',
            'inn_summer_water_req_(mm)': 'inn_summer_water_req_mm',
            'inn_summer_water_saving_(%)': 'inn_summer_water_saving_percent',
            'inn_summer_area_proposed_(ha)': 'inn_summer_area_proposed_ha',
            'inn_funding_total_area_proposed_(ha)': 'inn_funding_total_area_proposed_ha',
            'inn_funding_selected_measure': 'inn_funding_selected_measure',
            'inn_funding_total_area_selected_measure_(ha)': 'inn_funding_total_area_selected_measure_ha',
            'inn_funding_area_proposed_(ha)': 'inn_funding_area_proposed_ha',
            'inn_funding_financial_year': 'inn_funding_financial_year',
            'inn_funding_department_name': 'inn_funding_department_name',
            'inn_funding_scheme_name': 'inn_funding_scheme_name',
            'inn_funding_estimated_cost_(in_lakh)': 'inn_funding_estimated_cost_in_lakh',

            # ARS
            'ars_village_name': 'ars_village_name',
            'ars_location_details': 'ars_location_details',
            'ars_type_of_artificial_recharge_structure': 'ars_type_of_artificial_recharge_structure',
            'ars_latitude': 'ars_latitude',
            'ars_longitude': 'ars_longitude',
            'ars_work_proposed': 'ars_work_proposed',
            'ars_storage_capacity_(ha_m)': 'ars_storage_capacity_ha_m',
            'ars_annual_no._of_fillings': 'ars_annual_no_of_fillings',
            'ars_recharge_(%)': 'ars_recharge_percent',
            'ars_annual_gw_recharge_(ha_m)': 'ars_annual_gw_recharge_ha_m',
            'ars_financial_year': 'ars_financial_year',
            'ars_department_name': 'ars_department_name',
            'ars_scheme_name': 'ars_scheme_name',
            'ars_estimated_cost_(in_lakh)': 'ars_estimated_cost_in_lakh',

            # WCS
            'wcs_village_name': 'wcs_village_name',
            'wcs_location_details': 'wcs_location_details',
            'wcs_type_of_water_conservation_structure': 'wcs_type_of_water_conservation_structure',
            'wcs_latitude': 'wcs_latitude',
            'wcs_longitude': 'wcs_longitude',
            'wcs_work_proposed': 'wcs_work_proposed',
            'wcs_storage_capacity_(ha_m)': 'wcs_storage_capacity_ha_m',
            'wcs_annual_no._of_fillings': 'wcs_annual_no_of_fillings',
            'wcs_effective_storage_available_(ha_m)': 'wcs_effective_storage_available_ha_m',
            'wcs_financial_year': 'wcs_financial_year',
            'wcs_department_name': 'wcs_department_name',
            'wcs_scheme_name': 'wcs_scheme_name',
            'wcs_estimated_cost_(in_lakh)': 'wcs_estimated_cost_in_lakh',
        }

        self.stdout.write('Deleting existing records from api_exceldata...')
        try:
             ExcelData.objects.all().delete()
        except Exception as e:
             self.stdout.write(self.style.ERROR(f"DB Error: {e}. Did you run migrations?"))
             return
        
        objects_to_create = []
        
        self.stdout.write('Processing rows...')
        try:
            for index, row in df.iterrows():
                data = {}
                for excel_col, model_field in column_mapping.items():
                    if excel_col in df.columns:
                        val = row[excel_col]
                        if pd.isna(val):
                            val = None
                        data[model_field] = val
                    else:
                        # Log missing columns for first row only to avoid noise
                        if index == 0:
                            # self.stdout.write(self.style.WARNING(f"Mapping key '{excel_col}' not found in Excel columns"))
                            pass
                
                objects_to_create.append(ExcelData(**data))
                
                if len(objects_to_create) >= 1000:
                    ExcelData.objects.bulk_create(objects_to_create)
                    objects_to_create = []
                    self.stdout.write(f'Processed {index + 1} rows...')

            if objects_to_create:
                ExcelData.objects.bulk_create(objects_to_create)
                
            self.stdout.write(self.style.SUCCESS(f'Successfully loaded {len(df)} records into api_exceldata.'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error processing data: {e}'))
