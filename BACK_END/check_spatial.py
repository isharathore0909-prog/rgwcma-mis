import os
import django
import sys
# Adjust path to find the settings
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def check_spatial_data():
    with connection.cursor() as cursor:
        cursor.execute('SELECT COUNT(*) FROM "locationApi_grampanchayat" WHERE geometry IS NOT NULL')
        gp_count = cursor.fetchone()[0]
        print(f"GPs with geometry: {gp_count}")
        
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'layersApi_spatiallayer'")
        cols = [row[0] for row in cursor.fetchall()]
        print(f"Columns in layersApi_spatiallayer: {cols}")
        
        # Try a generic search if layer_name is missing
        filter_col = "layer_type" if "layer_type" in cols else "name" if "name" in cols else None
        if filter_col:
            cursor.execute(f"SELECT DISTINCT {filter_col} FROM \"layersApi_spatiallayer\"")
            types = [row[0] for row in cursor.fetchall()]
            print(f"Available {filter_col} values: {types}")
            
            cursor.execute(f"SELECT COUNT(*) FROM \"layersApi_spatiallayer\" WHERE {filter_col} ILIKE '%waterbody%' OR {filter_col} ILIKE '%canal%'")
            canal_count = cursor.fetchone()[0]
            print(f"Canal/Waterbody features using {filter_col}: {canal_count}")
        else:
            print("Could not find a string column for filtering.")
            
        cursor.execute("SELECT id, name, layer_type, ST_AsText(geometry), ST_SRID(geometry) FROM \"layersApi_spatiallayer\" WHERE layer_type = 'canal' LIMIT 1")
        row = cursor.fetchone()
        if row:
             print(f"Canal ID: {row[0]}, Name: {row[1]}, Type: {row[2]}, SRID: {row[4]}, GeoStart: {row[3][:100]}")
        
if __name__ == '__main__':
    check_spatial_data()
