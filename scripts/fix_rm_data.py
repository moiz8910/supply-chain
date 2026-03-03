import sqlite3
import pandas as pd
import random
import os

db_path = os.path.join('C:', os.sep, 'Github Repo', 'Supply_chain', 'data', 'supply_chain.db')
engine = sqlite3.connect(db_path)

# Verify original counts
print(f"Start OLI count: {pd.read_sql('SELECT COUNT(*) FROM order_line_items', engine).iloc[0,0]}")

po_df = pd.read_sql("SELECT order_id FROM orders WHERE order_type LIKE '%Transfer Order%'", engine)
purchase_orders = po_df['order_id'].tolist()
print(f'Found {len(purchase_orders)} Transfer Orders')

rm_df = pd.read_sql("SELECT sku_code FROM purchase_sku", engine)
rm_skus = rm_df['sku_code'].tolist()

max_oli_id_raw = pd.read_sql("SELECT MAX(CAST(SUBSTR(order_line_item, 5) AS INTEGER)) FROM order_line_items WHERE order_line_item LIKE 'OLI-%'", engine).iloc[0,0]
max_oli_id = int(max_oli_id_raw) if pd.notna(max_oli_id_raw) else 0

random.seed(42)
cursor = engine.cursor()
inserted = 0
errors = 0

for po_id in purchase_orders:
    num_items = random.randint(1, 4)
    selected_skus = random.sample(rm_skus, min(num_items, len(rm_skus)))
    for sku in selected_skus:
        max_oli_id += 1
        qty = random.randint(100, 5000)
        value = qty * random.uniform(2.5, 15.0)
        oli_id = f'OLI-{max_oli_id:05d}'
        price = value / qty
        
        try:
            # Table has: order_line_item, order_id, sla_profile_id, delivery_by_date, requirement_status, fulfilled_by_wh_id, sku_id, quantity, value, forecast_id
            cursor.execute('''
                INSERT INTO order_line_items 
                (order_line_item, order_id, sla_profile_id, delivery_by_date, requirement_status, fulfilled_by_wh_id, sku_id, quantity, value, forecast_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (oli_id, po_id, 'SLA-01', '2025-12-31', 'Open', 'WH-01', sku, qty, value, None))
            inserted += 1
        except Exception as e:
            if errors == 0: print(f"First error: {e}")
            errors += 1

print(f'> Inserted {inserted} items.')
print(f'> Encountered {errors} errors.')

engine.commit()

# Verify
cursor.execute("SELECT COUNT(*) FROM order_line_items WHERE order_line_item LIKE 'OLI-%'")
final_count = cursor.fetchone()[0]
print(f'Final OLI- prefixed count: {final_count}')

engine.close()
