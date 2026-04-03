import math
from django.core.management.base import BaseCommand
from api.models import ExcelData
from django.db.models import Avg

class Command(BaseCommand):
    help = 'Calculates Normal Monsoon Recharge using linear regression on rainfall data per Block'

    def handle(self, *args, **options):
        # Group by Block
        blocks = ExcelData.objects.values_list('uni_block', flat=True).distinct()
        
        self.stdout.write(f"Found {len(blocks)} unique blocks to process.")
        
        results = []
        
        for block_name in blocks:
            if not block_name:
                continue
                
            # Get data for the block
            qs = ExcelData.objects.filter(uni_block=block_name).values('monsoon_rainfall_mm', 'recharge_ham')
            
            # Identify valid data points
            data_points = []
            for item in qs:
                r = item['monsoon_rainfall_mm']
                R = item['recharge_ham']
                if r is not None and R is not None:
                    data_points.append((float(r), float(R)))
            
            N = len(data_points)
            if N < 2:
                self.stdout.write(self.style.WARNING(f"Block '{block_name}': Not enough data points (N={N}). Skipping."))
                continue
            
            # Calculate Sums
            S1 = sum(r for r, R in data_points)        # Sum of r
            S2 = sum(R for r, R in data_points)        # Sum of R
            S3 = sum(r * r for r, R in data_points)    # Sum of r^2
            S4 = sum(r * R for r, R in data_points)    # Sum of r*R
            
            denom = (N * S3) - (S1 ** 2)
            
            if denom == 0:
                self.stdout.write(self.style.WARNING(f"Block '{block_name}': Denominator is zero (all rainfall values identical?). Skipping."))
                continue

            # Calculate coefficients 'a' and 'b'
            a = ((N * S4) - (S1 * S2)) / denom
            b = (S2 - (a * S1)) / N
            
            # Calculate Normal Monsoon Rainfall (Average of current dataset as proxy if 'normal' is unknown)
            # In a real scenario, this 'normal' should come from long-term averages.
            # Here we demonstrate the calculation with the dataset average.
            normal_rainfall = S1 / N
            
            # Calculate Normal Monsoon Recharge
            normal_recharge = (a * normal_rainfall) + b
            
            results.append({
                'Block': block_name,
                'N': N,
                'a': round(a, 6),
                'b': round(b, 6),
                'Normal_Rainfall_mm': round(normal_rainfall, 2),
                'Normal_Recharge_ham': round(normal_recharge, 4)
            })
            
        # Display Results
        self.stdout.write(self.style.SUCCESS(f"\nCalculated Normal Monsoon Recharge for {len(results)} blocks:\n"))
        
        headers = ["Block", "N", "a", "b", "Normal Rain(mm)", "Normal Recharge(ham)"]
        row_format = "{:<25} {:<5} {:<10} {:<10} {:<15} {:<20}"
        self.stdout.write(row_format.format(*headers))
        self.stdout.write("-" * 90)
        
        for res in results:
            self.stdout.write(row_format.format(
                str(res['Block'])[:25],
                res['N'],
                str(res['a']),
                str(res['b']),
                str(res['Normal_Rainfall_mm']),
                str(res['Normal_Recharge_ham'])
            ))
            
