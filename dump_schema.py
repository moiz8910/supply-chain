import sqlite3
import json

c = sqlite3.connect('data/supply_chain.db').cursor()
tables = ['order_line_items', 'shipments', 'purchase_sku', 'orders', 'movements', 'production_runs', 'sales_sku', 'on_hand_inventory', 'production_plan']

schema = {}
for t in tables:
    try:
        schema[t] = [x[1] for x in c.execute(f"PRAGMA table_info({t})").fetchall()]
    except:
        pass

with open('schema_out.json', 'w') as f:
    json.dump(schema, f, indent=2)
