import os, sys
import traceback
sys.path.append(os.path.join(os.getcwd(), 'backend'))
try:
    from routers.kpi_router import get_dashboard_details
except Exception as e:
    print("Import error:", e)
    sys.exit(1)

kpis = ['supplier_otifq', 'rm_cost_per_unit', 'inbound_transport_cost', 'avg_transit_time_rm', 'production_cost', 'production_plan_compliance', None]

from io import StringIO
import contextlib

with open("api_trace_failures.txt", "w", encoding="utf-8") as out:
    for k in kpis:
        f = StringIO()
        with contextlib.redirect_stdout(f), contextlib.redirect_stderr(f):
            res = get_dashboard_details(k, db=None)
        
        output = f.getvalue()
        if 'Chart err for KPI' in output or 'Data Err' in str(res.get('main_chart', [])):
            out.write(f"--- FAILED KPI: {k} ---\n")
            out.write(output.strip() + "\n\n")
        else:
            out.write(f"--- SUCCESS KPI: {k} ---\n\n")
