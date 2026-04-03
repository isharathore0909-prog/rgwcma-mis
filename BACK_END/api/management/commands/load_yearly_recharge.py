from django.core.management.base import BaseCommand
from api.models import ExcelData, RainfallStation, StationRainfall
from django.db.models import Avg, Sum
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Load dummy recharge data (2015-2024) GP-wise by analyzing rainfall data and using block-level linear regression'

    def handle(self, *args, **options):
        print("Starting yearly recharge data load...")
        # 1. Pre-calculate district-wise yearly rainfall averages to optimize performance
        self.stdout.write("Pre-calculating district-wise yearly rainfall averages...")
        
        # Get unique district names from ExcelData (new_dist is more reliable)
        excel_districts = ExcelData.objects.values_list('new_dist', flat=True).distinct()
        district_yearly_rainfall = {}

        # Get all station districts for matching
        station_districts = list(RainfallStation.objects.values_list('district', flat=True).distinct())

        def find_station_district(excel_dist):
            if not excel_dist: return None
            # Exact match (case insensitive)
            for sd in station_districts:
                if sd and excel_dist.lower() == sd.lower():
                    return sd
            # Partial match for cases like "Sawaimadhopur STATE :" vs "SAWAI MADHOPUR"
            clean_excel = excel_dist.replace(" ", "").lower()
            for sd in station_districts:
                if sd:
                    clean_sd = sd.replace(" ", "").lower()
                    if clean_excel in clean_sd or clean_sd in clean_excel:
                        return sd
            return None

        for excel_dist in excel_districts:
            if not excel_dist: continue
            
            target_station_dist = find_station_district(excel_dist)
            if not target_station_dist:
                self.stdout.write(self.style.WARNING(f"Could not find station data for district: {excel_dist}"))
                continue

            district_yearly_rainfall[excel_dist] = {}
            stations = RainfallStation.objects.filter(district=target_station_dist)
            
            for year in range(2015, 2025):
                station_sums = StationRainfall.objects.filter(
                    station__in=stations,
                    date__year=year,
                    date__month__in=[6, 7, 8, 9]
                ).values('station').annotate(total_rainfall=Sum('rainfall_mm'))
                
                if station_sums:
                    avg_monsoon_rainfall = sum(s['total_rainfall'] for s in station_sums) / len(station_sums)
                    district_yearly_rainfall[excel_dist][year] = avg_monsoon_rainfall
                else:
                    district_yearly_rainfall[excel_dist][year] = None

        # 2. Get unique blocks
        blocks = ExcelData.objects.values('uni_block', 'new_dist').distinct()
        self.stdout.write(f"Processing {len(blocks)} blocks...")

        for block_info in blocks:
            slug_block = block_info['uni_block']
            district_name = block_info['new_dist']
            
            if not slug_block or not district_name:
                continue

            # 3. Calculate linear regression coefficients (a, b) for this block
            qs = ExcelData.objects.filter(uni_block=slug_block).values('monsoon_rainfall_mm', 'recharge_ham')
            data_points = []
            for item in qs:
                r = item['monsoon_rainfall_mm']
                R = item['recharge_ham']
                if r is not None and R is not None:
                    data_points.append((float(r), float(R)))
            
            N = len(data_points)
            a, b = 0.0, 0.0
            
            if N >= 2:
                S1 = sum(r for r, R in data_points)
                S2 = sum(R for r, R in data_points)
                S3 = sum(r * r for r, R in data_points)
                S4 = sum(r * R for r, R in data_points)
                denom = (N * S3) - (S1 ** 2)
                if denom != 0:
                    a = ((N * S4) - (S1 * S2)) / denom
                    b = (S2 - (a * S1)) / N
                else:
                    avg_r = S1 / N
                    avg_R = S2 / N
                    if avg_r != 0:
                        a = avg_R / avg_r
                        b = 0
            elif N == 1:
                r1, R1 = data_points[0]
                if r1 != 0:
                    a = R1 / r1
                    b = 0
            else:
                continue

            # 4. Update GPs with pre-calculated rainfall
            yearly_recharge_updates = {}
            for year in range(2015, 2025):
                rainfall = district_yearly_rainfall.get(district_name, {}).get(year)
                if rainfall is not None:
                    estimated_recharge = (a * rainfall) + b
                    yearly_recharge_updates[f"recharge_{year}"] = max(0, estimated_recharge)

            if yearly_recharge_updates:
                ExcelData.objects.filter(uni_block=slug_block).update(**yearly_recharge_updates)
                # self.stdout.write(f"Updated block '{slug_block}'")

        self.stdout.write(self.style.SUCCESS("Yearly recharge data loading completed."))
