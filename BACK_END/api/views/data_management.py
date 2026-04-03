from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import pandas as pd
from django.db import transaction
from django.db.models import F
from django.core.management import call_command
from django.forms.models import model_to_dict

from ..models import ExcelData
from .utils import get_excel_records_for_gp
from .spatial_utils import get_gec_norms_for_gp

class ExcelDataLoadView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        file_path = r'D:\MIS_RSGWA\gdf_gp_full_dummy.xlsx'
        try:
            df = pd.read_excel(file_path)
            # Standardize column names (strip whitespace and handle multiple tabs/spaces)
            df.columns = [str(col).strip() for col in df.columns]
            
            column_mapping = {
                'S.No.': 's_no',
                'GP_FINAL': 'gp_final',
                'gp_unique_': 'gp_unique',
                'new_dist': 'new_dist',
                'district_u': 'district_u',
                'uni_block': 'uni_block',
                'BLOCK_2020': 'block_2020',
                'SW_Discharge_cumec': 'sw_discharge_cumec',
                'SW_Hrs': 'sw_hrs',
                'SW_Days': 'sw_days',
                'SW_Irrigation_MCM': 'sw_irrigation_mcm',
                'Canal_Days': 'canal_days',
                'Canal_MCM': 'canal_mcm',
                'TP_Days': 'tp_days',
                'TP_MCM': 'tp_mcm',
                'Total_Human_Population': 'total_human_population',
                'Kharif Crop Category': 'kharif_crop_category',
                'Kharif Crop Type': 'kharif_crop_type',
                'Kharif Crop Name': 'kharif_crop_name',
                'Kharif Area (ha)': 'kharif_area_ha',
                'Kharif NIR (mm)': 'kharif_nir_mm',
                'Kharif Action': 'kharif_action',
                'Rabi Crop Category': 'rabi_crop_category',
                'Rabi Crop Type': 'rabi_crop_type',
                'Rabi Crop Name': 'rabi_crop_name',
                'Rabi Area (ha)': 'rabi_area_ha',
                'Rabi NIR (mm)': 'rabi_nir_mm',
                'Rabi Action': 'rabi_action',
                'Zaid Crop Category': 'zaid_crop_category',
                'Zaid Crop Type': 'zaid_crop_type',
                'Zaid Crop Name': 'zaid_crop_name',
                'Zaid Area (ha)': 'zaid_area_ha',
                'Zaid NIR (mm)': 'zaid_nir_mm',
                'Zaid Action': 'zaid_action',
                'Industry Name': 'industry_name',
                'Industry Daily Water Requirement (l/day)': 'industry_daily_water_req_l_day',
                'Industry No. of Days in Use': 'industry_no_of_days_in_use',
                'Other Type of Use': 'other_type_of_use',
                'Other Daily Water Requirement (l/day)': 'other_daily_water_req_l_day',
                'Other No. of Days in Use': 'other_no_of_days_in_use',
                'Bottom of Unconfined Aquifer': 'bottom_of_unconfined_aquifer',
                'Confined Aquifer Area': 'confined_aquifer_area',
                'Pre Monsoon Piezometric Heads': 'pre_monsoon_piezometric_heads',
                'Post Monsoon Piezometric Heads': 'post_monsoon_piezometric_heads',
                'Bottom of Confining Layer': 'bottom_of_confining_layer',
                'Monsoon Rainfall (mm)': 'monsoon_rainfall_mm',
                'Recharge (ham)': 'recharge_ham'
            }
            
            # Map columns to model fields
            df.rename(columns=column_mapping, inplace=True)
            
            # Clear existing data
            ExcelData.objects.all().delete()
            
            instances = []
            valid_fields = set(column_mapping.values())
            
            for _, row in df.iterrows():
                row_dict = row.to_dict()
                # Clean data: Replace NaN with None, keep only valid fields
                cleaned_data = {}
                for field in valid_fields:
                    val = row_dict.get(field)
                    if pd.isna(val):
                        cleaned_data[field] = None
                    else:
                        cleaned_data[field] = val
                
                instances.append(ExcelData(**cleaned_data))
            
            ExcelData.objects.bulk_create(instances)
            
            # Automatically calculate yearly recharge after loading data
            try:
                call_command('load_yearly_recharge')
            except Exception as e:
                print(f"Error running load_yearly_recharge: {e}")
                
            return Response({"message": f"Successfully loaded {len(instances)} rows into Postgres and updated yearly recharge data."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ExcelDataListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        # Basic pagination/limiting for performance
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))
        
        data = ExcelData.objects.all()[offset:offset+limit]
        
        # Efficient serialization using .values()
        results = list(data.values(
            "s_no", "gp_final", "gp_unique", "new_dist", "district_u", 
            "sw_discharge_cumec", "total_human_population", 
            block=F("block_2020"), 
            kharif_crop=F("kharif_crop_name"), 
            rabi_crop=F("rabi_crop_name")
        ))
            
        return Response({
            "count": ExcelData.objects.count(),
            "results": results
        }, status=status.HTTP_200_OK)

class GPExcelDataView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        gp_id = request.query_params.get('gp_id')
        if not gp_id:
            return Response({'error': 'gp_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            records = get_excel_records_for_gp(gp_id)
            
            if not records.exists():
                 return Response({'error': 'Data not found for this GP'}, status=status.HTTP_404_NOT_FOUND)

            # Serialize manually
            data_list = [model_to_dict(r) for r in records]
            
            # Fetch recommended RIF/SY norms based on spatial aquifer
            norms = get_gec_norms_for_gp(gp_id)
            
            return Response({
                "excel_records": data_list,
                "recommended_norms": norms
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
