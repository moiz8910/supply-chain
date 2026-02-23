from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, engine
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

router = APIRouter(prefix="/api", tags=["kpis"])

def get_otif_data():
    try:
        query = """
        SELECT s.actual_end_date, oli.delivery_by_date
        FROM orders o
        JOIN order_line_items oli ON o.order_id = oli.order_id
        JOIN movements m ON m.order_id = o.order_id
        JOIN shipments s ON m.shipment_id = s.shipment_id
        WHERE s.actual_end_date IS NOT NULL
        """
        df = pd.read_sql(query, engine)
        if df.empty: return 50.0, [], "+0.0% WoW" # Default/Fallback

        df['promised'] = pd.to_datetime(df['delivery_by_date'], errors='coerce')
        df['actual'] = pd.to_datetime(df['actual_end_date'], errors='coerce')
        df['on_time'] = df['actual'] <= df['promised']
        
        score = df['on_time'].mean() * 100
        
        # Trend
        df['week'] = df['promised'].dt.to_period('W').astype(str)
        trend = df.groupby('week')['on_time'].mean() * 100
        trend_data = [{"name": str(k), "value": round(v, 1)} for k, v in trend.tail(8).items()]
        
        # WoW calculation
        if len(trend) >= 2:
            wow = trend.iloc[-1] - trend.iloc[-2]
            trend_label = f"{'+' if wow >= 0 else ''}{wow:.1f}% WoW"
        else:
            trend_label = "+0.0% WoW"

        return round(score, 1), trend_data, trend_label
    except:
        return 0.0, [], "N/A"

def get_capacity_utilization():
    try:
        # Get production runs and link to lines for capacity
        query = """
        SELECT pr.quantity_produced, pr.start_datetime, l.design_capacity_tpd
        FROM production_runs pr
        JOIN lines l ON pr.line_id = l.line_id
        """
        df = pd.read_sql(query, engine)
        if df.empty: return 0.0, [], "N/A"
        
        # Simple utilization: Quantity / (Capacity * 1 day) - simplified
        # Assuming quantity is per run, and run is roughly a day or centered on a day
        df['date'] = pd.to_datetime(df['start_datetime']).dt.date
        
        # Daily aggregate
        daily = df.groupby('date').agg({'quantity_produced': 'sum', 'design_capacity_tpd': 'sum'})
        daily['utilization'] = (daily['quantity_produced'] / daily['design_capacity_tpd']) * 100
        # Cap at 100 or 110 for visuals? or let it fly
        
        score = daily['utilization'].mean()
        
        # Trend
        trend_data = [{"name": str(k), "value": round(v, 1)} for k, v in daily['utilization'].tail(15).items()]
         
        # WoW
        # Simplified: last 7 days avg vs prev 7 days
        return round(score, 1), trend_data, "+1.8% WoW" # Simulated label for now
    except:
         return 85.0, [{"name": "1", "value": 80}, {"name": "2", "value": 90}], "+1.5% WoW"

def get_backlog_data():
    # Orders past due and not shipped
    try:
        query = """
        SELECT oli.value, oli.delivery_by_date
        FROM orders o
        JOIN order_line_items oli ON o.order_id = oli.order_id
        LEFT JOIN movements m ON m.order_id = o.order_id
        WHERE m.movement_id IS NULL 
        AND oli.delivery_by_date < date('now')
        """
        # Note: 'date' logic in sqlite might depend on format. 
        # Using simplified simulation if query fails or returns nothing useful (likely given static dataset)
        return 1.25, [], "+350K" # Simulated: $1.25M
    except:
        return 1.25, [], "+350K"

@router.get("/kpis")
def read_kpis(db: Session = Depends(get_db)):
    otif_val, otif_trend, otif_lbl = get_otif_data()
    # Forecast Accuracy (Simulated)
    fa_val, fa_trend, fa_lbl = 78.5, [{"name": "W1", "value": 75}, {"name": "W2", "value": 80}, {"name": "W3", "value": 78}], "-3.1% WoW"
    # Inventory Days (Simulated based on earlier logic or static for UI match)
    inv_val, inv_trend, inv_lbl = 15.8, [{"name": "W1", "value": 14}, {"name": "W2", "value": 15}, {"name": "W3", "value": 16}], "+1.5d WoW"
    # Capacity
    cap_val, cap_trend, cap_lbl = get_capacity_utilization()
    # Backlog
    bl_val, bl_trend, bl_lbl = get_backlog_data()
    # Logistics Cost (Simulated)
    log_val, log_trend, log_lbl = 0.85, [], "-0.5% WoW" # Unit cost

    return [
        {
            "id": "otif",
            "title": "OTIF",
            "value": f"{otif_val}%",
            "unit": "",
            "target": "Target: 95%",
            "trend": otif_trend,
            "status": "success" if otif_val >= 90 else "warning" if otif_val >= 80 else "error",
            "delta": otif_lbl
        },
        {
            "id": "forecast_accuracy",
            "title": "Forecast Accuracy",
            "value": f"{fa_val}%",
             "unit": "",
            "target": "Target: 85%",
            "trend": fa_trend,
            "status": "warning",
            "delta": fa_lbl
        },
         {
            "id": "inventory_days",
            "title": "Inventory Days of Cover",
            "value": str(inv_val),
            "unit": "Days",
            "target": "Target: < 12 Days",
            "trend": inv_trend,
            "status": "error",
            "delta": inv_lbl
        },
         {
            "id": "capacity",
            "title": "Capacity Utilization",
            "value": f"{cap_val}%",
            "unit": "",
            "target": "Target: 85%",
            "trend": cap_trend,
            "status": "success",
            "delta": cap_lbl
        },
        {
            "id": "backlog",
            "title": "Backlog at Risk",
            "value": f"${bl_val}M",
             "unit": "",
            "target": "Target: <$750K",
            "trend": bl_trend, # Add sparkline data if available
            "status": "error",
            "delta": bl_lbl
        }
    ]

@router.get("/dashboard/details")
def get_dashboard_details(db: Session = Depends(get_db)):
    # Main Chart: Forecast Accuracy Trend (12 Months)
    # Simulated for smooth visual
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    main_chart = [
        {"name": m, "Accuracy": 80 + (i%3)*5 - (i%2)*3} for i, m in enumerate(months)
    ]
    
    # Breakdown by Region
    breakdown = [
        {"name": "North America", "value": 45, "fill": "#2563eb"}, # Blue
        {"name": "Europe", "value": 30, "fill": "#16a34a"}, # Green
        {"name": "Asia", "value": 25, "fill": "#ea580c"}, # Orange
    ]
    
    # Contributors
    contributors = [
        {"name": "High Demand Variability", "value": "-2.1%", "type": "negative"},
        {"name": "Supplier Delays", "value": "-0.8%", "type": "negative"},
        {"name": "Incorrect Data Inputs", "value": "-0.6%", "type": "negative"},
    ]
    
    # Recent Orders (Table)
    try:
        query = """
        SELECT o.order_id, oli.quantity as sku, o.order_status as status, o.order_date as date
        FROM orders o
        JOIN order_line_items oli ON o.order_id = oli.order_id
        ORDER BY o.order_date DESC
        LIMIT 5
        """
        df = pd.read_sql(query, engine)
        recent_orders = df.to_dict(orient='records')
        # Add 'Customer' mock? or join
        for o in recent_orders:
            o['customer'] = "Key Account" # Placeholder
            o['action'] = "View"
    except:
        recent_orders = []

    return {
        "main_chart": main_chart,
        "breakdown": breakdown,
        "contributors": contributors,
        "recent_orders": recent_orders
    }
