
import random
from django.core.management.base import BaseCommand
from api.models import ExcelData

class Command(BaseCommand):
    help = 'Populate ExcelData table with dummy yearly recharge data (2015-2024)'

    def handle(self, *args, **options):
        self.stdout.write('Populating dummy recharge data...')
        
        objects = ExcelData.objects.all()
        count = objects.count()
        
        if count == 0:
            self.stdout.write(self.style.WARNING('No records found in ExcelData. Please run load_excel_data_full first.'))
            return

        updated_objects = []
        for obj in objects:
            # Generate random recharge values between 50.0 and 500.0 (reasonable range for mm/ham)
            # Adjust range as needed. Assuming units are similar to monsoon_rainfall_mm or recharge_ham.
            
            obj.recharge_2015 = round(random.uniform(50.0, 500.0), 2)
            obj.recharge_2016 = round(random.uniform(50.0, 500.0), 2)
            obj.recharge_2017 = round(random.uniform(50.0, 500.0), 2)
            obj.recharge_2018 = round(random.uniform(50.0, 500.0), 2)
            obj.recharge_2019 = round(random.uniform(50.0, 500.0), 2)
            obj.recharge_2020 = round(random.uniform(50.0, 500.0), 2)
            obj.recharge_2021 = round(random.uniform(50.0, 500.0), 2)
            obj.recharge_2022 = round(random.uniform(50.0, 500.0), 2)
            obj.recharge_2023 = round(random.uniform(50.0, 500.0), 2)
            obj.recharge_2024 = round(random.uniform(50.0, 500.0), 2)
            
            updated_objects.append(obj)
            
            if len(updated_objects) >= 1000:
                ExcelData.objects.bulk_update(updated_objects, [
                    'recharge_2015', 'recharge_2016', 'recharge_2017', 'recharge_2018', 'recharge_2019',
                    'recharge_2020', 'recharge_2021', 'recharge_2022', 'recharge_2023', 'recharge_2024'
                ])
                updated_objects = []
        
        if updated_objects:
            ExcelData.objects.bulk_update(updated_objects, [
                'recharge_2015', 'recharge_2016', 'recharge_2017', 'recharge_2018', 'recharge_2019',
                'recharge_2020', 'recharge_2021', 'recharge_2022', 'recharge_2023', 'recharge_2024'
            ])

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {count} records with dummy recharge data.'))
