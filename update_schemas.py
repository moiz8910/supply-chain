import sqlite3
import json
import os

db_path = 'data/supply_chain.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def get_columns(table_name):
    try:
        cursor.execute(f"PRAGMA table_info({table_name})")
        return [row[1] for row in cursor.fetchall()]
    except Exception:
        return []

# Read current tables to know which file they belong to
schema_file = 'schema.json'
full_schema_file = 'full_schema.json'

with open(schema_file, 'r') as f:
    schema1 = json.load(f)

with open(full_schema_file, 'r') as f:
    schema2 = json.load(f)

for table in list(schema1.keys()):
    cols = get_columns(table)
    if cols:
        schema1[table] = cols

for table in list(schema2.keys()):
    cols = get_columns(table)
    if cols:
        schema2[table] = cols

with open(schema_file, 'w') as f:
    json.dump(schema1, f, indent=4)

with open(full_schema_file, 'w') as f:
    json.dump(schema2, f, indent=4)

print("Schemas updated successfully.")
