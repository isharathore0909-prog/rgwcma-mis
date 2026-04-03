
import os
import json
from django.core.management.base import BaseCommand
from django.db import connection
import logging

class Command(BaseCommand):
    help = 'Import waterbodies from GeoJSON into spatial_waterbody table'

    def add_arguments(self, parser):
        parser.add_argument('--path', type=str, default='data/Waterbodies_Rajasthan.geojson', help='Path to GeoJSON file')

    def handle(self, *args, **options):
        path = options['path']
        if not os.path.isabs(path):
            path = os.path.join(os.getcwd(), path)

        if not os.path.exists(path):
            self.stderr.write(f"File not found: {path}")
            return

        self.stdout.write(f"Reading {path}...")
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            self.stderr.write(f"Error reading GeoJSON: {e}")
            return

        with connection.cursor() as cursor:
            self.stdout.write("Ensuring table spatial_waterbody exists...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS spatial_waterbody (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(500),
                    river VARCHAR(500),
                    type_code VARCHAR(50),
                    geometry GEOMETRY(GEOMETRY, 4326)
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS spatial_waterbody_geom_idx ON spatial_waterbody USING GIST (geometry);")
            
            self.stdout.write("Clearing existing data...")
            cursor.execute("DELETE FROM spatial_waterbody;")

            self.stdout.write("Importing features...")
            count = 0
            batch_data = []
            
            def swap_coords(coords):
                if isinstance(coords[0], (int, float)):
                    return [coords[1], coords[0]]
                return [swap_coords(c) for c in coords]

            for feature in data['features']:
                try:
                    props = feature.get('properties', {})
                    geom = feature.get('geometry', {})
                    if not geom: continue

                    def swap_coords(coords):
                        if isinstance(coords[0], (int, float)):
                            return [coords[1], coords[0]]
                        return [swap_coords(c) for c in coords]

                    name = props.get('village', '') or props.get('nearest_se', '')
                    river = props.get('river', '').strip()
                    type_code = str(props.get('waterbod_1', ''))
                    
                    if 'coordinates' in geom:
                        geom['coordinates'] = swap_coords(geom['coordinates'])
                    
                    geom_json = json.dumps(geom)
                    batch_data.append([name, river, type_code, geom_json])
                    count += 1

                    if len(batch_data) >= 100:
                        self.insert_batch(cursor, batch_data)
                        batch_data = []
                        if count % 1000 == 0:
                            self.stdout.write(f"  Inserted {count} features...")
                            
                except Exception as e:
                    self.stderr.write(f"Error at feature {count}: {e}")

            if batch_data:
                self.insert_batch(cursor, batch_data)

        self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} waterbodies."))

    def insert_batch(self, cursor, batch_data):
        placeholders = []
        params = []
        for row in batch_data:
            placeholders.append("(%s, %s, %s, ST_GeomFromGeoJSON(%s))")
            params.extend(row)
        
        sql = f"INSERT INTO spatial_waterbody (name, river, type_code, geometry) VALUES {', '.join(placeholders)}"
        cursor.execute(sql, params)
