import os, sys
import traceback
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from routers.kpi_router import get_dashboard_details
except Exception as e:
    print("Import error:", getattr(e, 'msg', str(e)))
    sys.exit(1)

kpis = ['supplier_otifq', 'rm_cost_per_unit', 'inbound_transport_cost', 'avg_transit_time_rm', 'production_cost', 'production_plan_compliance', None]

print("Starting API Trace Test...")
from io import StringIO
import contextlib

for k in kpis:
    print(f"\n--- KPI: {k} ---")
    f = StringIO()
    with contextlib.redirect_stdout(f), contextlib.redirect_stderr(f):
        res = get_dashboard_details(k, db=None)
    
    output = f.getvalue()
    if 'Chart err for KPI' in output or 'Data Err' in str(res.get('main_chart', [])):
        print("FAILED! Traceback:")
        print(output.strip())
    else:
        print("SUCCESS! Data:")
        print(res.get('main_chart', [])[:2])
