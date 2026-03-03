import sqlite3
import pandas as pd
import os

db_path = os.path.join('C:', os.sep, 'Github Repo', 'Supply_chain', 'data', 'supply_chain.db')
engine = sqlite3.connect(db_path)

print('--- Invisible Character Hunt ---')
oli = pd.read_sql('SELECT sku_id FROM order_line_items WHERE order_line_item LIKE "OLI-%" LIMIT 1', engine).iloc[0,0]
rm = pd.read_sql('SELECT sku_code FROM purchase_sku LIMIT 1', engine).iloc[0,0]

print(f"OLI SKU: '{oli}' (Length: {len(oli)})")
print(f"List of OLI chars: {[ord(c) for c in oli]}")

print(f"RM SKU: '{rm}' (Length: {len(rm)})")
print(f"List of RM chars: {[ord(c) for c in rm]}")

print(f"Strict equality: {oli == rm}")
