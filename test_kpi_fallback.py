import os, sys
import sqlite3
import pandas as pd
import traceback

sys.path.append(os.path.join(os.getcwd(), 'backend'))
from routers.kpi_router import get_dashboard_details
engine = sqlite3.connect('C:/Github Repo/Supply_chain/data/supply_chain.db')

for kpi in ['supplier_otifq', 'rm_cost_per_unit', 'inbound_transport_cost', 'production_cost']:
    print(f"\n--- Testing {kpi} ---")
    try:
        res = get_dashboard_details(kpi_id=kpi, dimension='Time (Monthly)', db=None)
        print(f"Result chart title: {res.get('chart_title')}")
        print(f"Data points: {res.get('main_chart', [])}")
    except Exception as e:
        print(f"Exception calling get_dashboard_details for {kpi}: {e}")
        
    print("Direct SQL Test:")
    try:
        if kpi == "supplier_otifq":
            q = """
            SELECT strftime('%Y-%m', s.actual_start_date) as name, AVG(95 - (julianday(s.actual_end_date) - julianday(s.actual_start_date))) as score
            FROM purchase_sku ps
            JOIN order_line_items oli ON ps.sku_code = oli.sku_id
            JOIN movements m ON oli.order_id = m.order_id
            JOIN shipments s ON m.shipment_id = s.shipment_id
            WHERE s.from_supplier_id IS NOT NULL AND s.actual_start_date IS NOT NULL AND strftime('%Y-%m', s.actual_start_date) IS NOT NULL
            GROUP BY name
            """
            df = pd.read_sql(q, engine)
            print(df)
            
    except Exception as e:
        print(f"Direct query error: {e}")
