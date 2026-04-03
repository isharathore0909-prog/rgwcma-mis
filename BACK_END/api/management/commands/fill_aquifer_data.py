from django.core.management.base import BaseCommand
from django.db import connection
import statistics

class Command(BaseCommand):
    help = 'Fill missing aquifer data by analyzing existing data (averages)'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # 1. Get all data from aquiferApi_aquiferdata
            cursor.execute('SELECT * FROM "aquiferApi_aquiferdata";')
            rows = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
            
            # Map column name to index
            col_map = {col: i for i, col in enumerate(colnames)}
            
            pre_cols = [f"pre_{y}" for y in range(2015, 2025)]
            pst_cols = [f"pst_{y}" for y in range(2015, 2025)]
            all_years_cols = pre_cols + pst_cols
            
            # 2. Calculate global/village/GP averages for backup
            # We'll do this well by well first.
            
            update_count = 0
            for row in rows:
                row_id = row[col_map['id']]
                updates = {}
                
                # Get available values for this well to calculate its own average
                well_pre_vals = [row[col_map[c]] for c in pre_cols if row[col_map[c]] is not None]
                well_pst_vals = [row[col_map[c]] for c in pst_cols if row[col_map[c]] is not None]
                
                well_pre_avg = statistics.mean(well_pre_vals) if well_pre_vals else None
                well_pst_avg = statistics.mean(well_pst_vals) if well_pst_vals else None
                
                # If well has NO data at all, we might need village/GP averages.
                # For simplicity, let's first fill using well's own average.
                
                for col in pre_cols:
                    if row[col_map[col]] is None and well_pre_avg is not None:
                        updates[col] = well_pre_avg
                
                for col in pst_cols:
                    if row[col_map[col]] is None and well_pst_avg is not None:
                        updates[col] = well_pst_avg
                
                if updates:
                    set_clause = ", ".join([f"{k} = %s" for k in updates.keys()])
                    values = list(updates.values()) + [row_id]
                    cursor.execute(f'UPDATE "aquiferApi_aquiferdata" SET {set_clause} WHERE id = %s', values)
                    update_count += 1

            self.stdout.write(self.style.SUCCESS(f"Finished filling missing data. Updated {update_count} rows based on well averages."))
            
            # 3. Second pass: Fill wells that have NO data using Village average
            # (To be implemented if needed, let's see how many were updated)
