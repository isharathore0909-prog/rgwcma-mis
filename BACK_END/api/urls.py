from django.urls import path, include
from .views import MyTokenObtainPairView, GECCalculationView, WaterUtilizationCalculationView, ExcelDataLoadView, ExcelDataListView, RainfallInfiltrationFactorListView, SpecificYieldListView, GPAquiferDataView, WaterQualityDataView, AquiferWaterLevelDataView, GPExcelDataView, ContourMapView, AquiferTrendView, GeomorphologyMapView, AquiferMapView, LULCMapView, DEMMapView, LocationCompositionView, DrainageMapView, DEMContourMapView, WaterbodiesInfoView, InfrastructureInfoView
from rest_framework_simplejwt.views import TokenRefreshView
from .rainfall.views import GPRainfallView, NormalMonsoonRainfallView, YearlyRechargeView

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('calculate/gec/', GECCalculationView.as_view(), name='calculate_gec'),
    path('calculate/utilization/', WaterUtilizationCalculationView.as_view(), name='calculate_utilization'),
    path('load-excel/', ExcelDataLoadView.as_view(), name='load_excel'),
    path('get-excel/', ExcelDataListView.as_view(), name='get_excel'),
    path('gp-excel-data/', GPExcelDataView.as_view(), name='gp_excel_data'),
    path('rainfall-infiltration-factor/', RainfallInfiltrationFactorListView.as_view(), name='rainfall_infiltration_factor'),
    path('specific-yield/', SpecificYieldListView.as_view(), name='specific_yield'),
    path('aquifer/gp-data/', GPAquiferDataView.as_view(), name='gp_aquifer_data'),
    path('water-quality/', WaterQualityDataView.as_view(), name='water_quality_data'),
    path('aquifer-water-level/', AquiferWaterLevelDataView.as_view(), name='aquifer_water_level_data'),
    path('rainfall/average/', GPRainfallView.as_view(), name='gp_average_rainfall'),
    path('rainfall/normal-monsoon/', NormalMonsoonRainfallView.as_view(), name='normal_monsoon_rainfall'),
    path('rainfall/yearly-recharge/', YearlyRechargeView.as_view(), name='yearly_recharge'),
    path('aquifer/trend/', AquiferTrendView.as_view(), name='aquifer_trend'),
    path('contour-map/', ContourMapView.as_view(), name='contour_map'),
    path('geomorphology-map/', GeomorphologyMapView.as_view(), name='geomorphology_map'),
    path('aquifer-map/', AquiferMapView.as_view(), name='aquifer_map'),
    path('lulc-map/', LULCMapView.as_view(), name='lulc_map'),
    path('dem-map/', DEMMapView.as_view(), name='dem_map'),
    path('drainage-map/', DrainageMapView.as_view(), name='drainage_map'),
    path('dem-contour-map/', DEMContourMapView.as_view(), name='dem_contour_map'),
    path('location-composition/', LocationCompositionView.as_view(), name='location_composition'),
    path('waterbodies-info/', WaterbodiesInfoView.as_view(), name='waterbodies_info'),
    path('infrastructure-info/', InfrastructureInfoView.as_view(), name='infrastructure_info'),
    path('locations/', include('api.locations.urls')),
    path('account/', include('account_app.urls')),
]
