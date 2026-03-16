from fastapi import APIRouter
from database import engine
from sqlalchemy import text

router = APIRouter(prefix="/api/map", tags=["map"])

# Simple hardcoded geocoding for demonstration if precise lat/long is missing in DB
# In a real app, this would use an external Geocoding API or a proper local spatial DB.
REGION_COORDS = {
    # Approx Centers for Regions (Long, Lat) - react-simple-maps uses [long, lat]
    "North America": [-100.0, 40.0],
    "South America": [-60.0, -15.0],
    "Europe": [15.0, 50.0],
    "Asia": [100.0, 35.0],
    "India": [78.96, 20.59],
    "Middle East": [45.0, 25.0],
    "Africa": [20.0, 0.0],
    "Oceania": [135.0, -25.0]
}

def get_region_group(country, city=None, default="Asia"):
    """Heuristic clustering by region since full geocoding is unavailable."""
    country = str(country).lower() if country else ""
    if any(c in country for c in ["us", "usa", "canada", "mexico"]):
        return "North America"
    if any(c in country for c in ["br", "brazil", "argentina", "chile", "co"]):
        return "South America"
    if any(c in country for c in ["uk", "gb", "germany", "france", "it", "nl", "eu", "ru"]):
        return "Europe"
    if any(c in country for c in ["in", "india"]):
        return "India"
    if any(c in country for c in ["cn", "china", "jp", "japan", "sg", "th", "kr", "tw", "hk"]):
        return "Asia" 
    if any(c in country for c in ["ae", "saudi", "om", "qa"]):
        return "Middle East"
    if any(c in country for c in ["au", "australia", "nz"]):
        return "Oceania"
    return default

import math

def get_scattered_coords(center_lon, center_lat, index, radius_step=0.4, angle_step=1.0):
    """Generates deterministic scattered coordinates around a center point using a spiral pattern."""
    if index == 0:
        return [center_lon, center_lat]
    radius = radius_step * math.sqrt(index)
    angle = index * angle_step
    return [
        center_lon + radius * math.cos(angle),
        center_lat + radius * math.sin(angle)
    ]

@router.get("/nodes")
def get_map_nodes():
    regions = []
    entities = []
    
    with engine.connect() as conn:
        # 1. Plants (Have exact Lat/Long in DB, but need a Region macro-node for Level 0)
        plant_regions = {}
        result = conn.execute(text("""
            SELECT plant_code, plant_name, city, country, latitude, longitude, operating_status 
            FROM plants 
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        """))
        for row in result.mappings():
            status = "critical" if str(row["operating_status"]).lower() in ["maintenance", "down"] else "normal"
            region_name = get_region_group(row["country"], row["city"], "Asia")
            plant_dict = {
                "id": str(row["plant_code"]),
                "text": str(row["plant_name"]),
                "type": "plant",
                "status": status,
                "region": region_name,
                "coordinates": [float(row["longitude"]), float(row["latitude"])], # [Lon, Lat]
                "metrics": {
                    "Location": f"{row['city']}, {row['country']}",
                    "Status": row["operating_status"]
                }
            }
            entities.append(plant_dict)
            
            if region_name not in plant_regions:
                plant_regions[region_name] = {"count": 0, "high_risk": 0, "names": []}
            
            plant_regions[region_name]["count"] += 1
            plant_regions[region_name]["names"].append(row["plant_name"])
            if status == "critical":
                plant_regions[region_name]["high_risk"] += 1
                
        for region, data in plant_regions.items():
            reg_status = "critical" if data["high_risk"] > 0 else "normal"
            macro_coords = [REGION_COORDS[region][0] - 5, REGION_COORDS[region][1] + 5]
            regions.append({
                "id": f"plant_cluster_{region}",
                "text": f"{region} Plants",
                "type": "plant", 
                "status": reg_status,
                "coordinates": macro_coords,
                "metrics": {
                    "Total Plants": data["count"],
                    "Maintenance / Down": data["high_risk"],
                    "Facilities": ", ".join(data["names"][:3]) + ("..." if len(data["names"])>3 else "")
                }
            })
            
        # 2. Customers (Cluster by Region + Scatter Logic)
        result = conn.execute(text("SELECT customer_id, customer_name, country_iso, city, risk_rating FROM customers"))
        cust_regions = {}
        for row in result.mappings():
            region = get_region_group(row["country_iso"], row["city"], "Europe")
            if region not in cust_regions:
                cust_regions[region] = {"count": 0, "high_risk": 0, "names": [], "customers": []}
            
            cust_regions[region]["count"] += 1
            cust_regions[region]["names"].append(row["customer_name"])
            
            status = "critical" if str(row.get("risk_rating", "")).lower() == "high" else "normal"
            if status == "critical":
                 cust_regions[region]["high_risk"] += 1
                 
            # Add to entities list with pending coordinates
            cust_regions[region]["customers"].append({
                "id": str(row["customer_id"]),
                "text": str(row["customer_name"]),
                "type": "customer",
                "status": status,
                "region": region,
                "metrics": {
                    "Location": f"{row['city'] or 'N/A'}, {row['country_iso']}",
                    "Risk Rating": row["risk_rating"]
                }
            })
                 
        for region, data in cust_regions.items():
            reg_status = "critical" if data["high_risk"] > 0 else "normal"
            # Offset customer cluster slightly down/left from region center for the Region Macro Node
            macro_coords = [REGION_COORDS[region][0] - 5, REGION_COORDS[region][1] - 5]
            regions.append({
                "id": f"cust_cluster_{region}",
                "text": f"{region} Customers",
                "type": "warehouse", 
                "status": reg_status,
                "coordinates": macro_coords,
                "metrics": {
                    "Total Customers": data["count"],
                    "High Risk Profiles": data["high_risk"],
                    "Top Accounts": ", ".join(data["names"][:3]) + ("..." if len(data["names"])>3 else "")
                }
            })
            
            # Scatter individual customers around the macro_coords
            for idx, cust in enumerate(data["customers"]):
                cust["coordinates"] = get_scattered_coords(macro_coords[0], macro_coords[1], idx + 1, radius_step=0.4)
                entities.append(cust)
            
        # 3. Suppliers (Cluster by Region + Scatter Logic)
        result = conn.execute(text("SELECT supplier_id, supplier_name, country_iso, city, risk_rating FROM suppliers"))
        supp_regions = {}
        for row in result.mappings():
            region = get_region_group(row["country_iso"], row["city"], "Asia")
            if region not in supp_regions:
                supp_regions[region] = {"count": 0, "high_risk": 0, "names": [], "suppliers": []}
                
            supp_regions[region]["count"] += 1
            supp_regions[region]["names"].append(row["supplier_name"])
            
            status = "critical" if str(row.get("risk_rating", "")).lower() == "high" else "normal"
            if status == "critical":
                 supp_regions[region]["high_risk"] += 1
                 
            supp_regions[region]["suppliers"].append({
                "id": str(row["supplier_id"]),
                "text": str(row["supplier_name"]),
                "type": "supplier",
                "status": status,
                "region": region,
                "metrics": {
                    "Location": f"{row['city'] or 'N/A'}, {row['country_iso']}",
                    "Risk Rating": row["risk_rating"]
                }
            })
                 
        for region, data in supp_regions.items():
            reg_status = "critical" if data["high_risk"] > 0 else "warning" if data["count"] > 5 else "normal"
            # Offset supplier cluster slightly up/right from region center
            macro_coords = [REGION_COORDS[region][0] + 5, REGION_COORDS[region][1] + 5]
            regions.append({
                "id": f"supp_cluster_{region}",
                "text": f"{region} Suppliers",
                "type": "port", 
                "status": reg_status,
                "coordinates": macro_coords,
                "metrics": {
                    "Total Suppliers": data["count"],
                    "High Risk Profiles": data["high_risk"],
                    "Key Partners": ", ".join(data["names"][:3]) + ("..." if len(data["names"])>3 else "")
                }
            })
            
            # Scatter individual suppliers around the macro_coords
            for idx, supp in enumerate(data["suppliers"]):
                supp["coordinates"] = get_scattered_coords(macro_coords[0], macro_coords[1], idx + 1, radius_step=0.4)
                entities.append(supp)

    return {
        "regions": regions,
        "entities": entities
    }

@router.get("/lanes")
def get_map_lanes():
    lanes = []
    
    with engine.connect() as conn:
        # Fetch active shipments
        result = conn.execute(text("""
            SELECT s.shipment_id, s.shipment_status, s.mode, s.cost_of_shipment, 
                   s.from_supplier_id, s.to_plant_location,
                   s.from_plant_location, s.to_customer_id,
                   sup.country_iso as sup_country, cust.country_iso as cust_country
            FROM shipments s
            LEFT JOIN suppliers sup ON s.from_supplier_id = sup.supplier_id
            LEFT JOIN customers cust ON s.to_customer_id = cust.customer_id
            WHERE s.shipment_status NOT IN ('Delivered', 'Cancelled')
        """))
        
        for row in result.mappings():
            status = "normal"
            if str(row["shipment_status"]).lower() in ["delayed", "on hold"]:
                status = "warning"
            elif str(row["shipment_status"]).lower() in ["exception", "diverted", "critical"]:
                status = "critical"
                
            # Determine Source Node ID
            from_id = None
            if row["from_plant_location"]:
                from_id = str(row["from_plant_location"])
            elif row["from_supplier_id"]:
                from_id = str(row["from_supplier_id"])
                
            # Determine Dest Node ID
            to_id = None
            if row["to_plant_location"]:
                to_id = str(row["to_plant_location"])
            elif row["to_customer_id"]:
                to_id = str(row["to_customer_id"])
                
            if from_id and to_id and from_id != to_id:
                lanes.append({
                    "id": str(row["shipment_id"]),
                    "from": from_id,
                    "to": to_id,
                    "mode": str(row["mode"]).lower(),
                    "status": status,
                    "volume": "medium", # Approximation
                    "metrics": {
                        "Shipment ID": str(row["shipment_id"]),
                        "Status": str(row["shipment_status"]),
                        "Mode": str(row["mode"]),
                        "Cost": f"${row['cost_of_shipment'] or 0:,.2f}"
                    }
                })
                
    # Aggregate identical lanes
    aggregated = {}
    for lane in lanes:
        key = f"{lane['from']}_{lane['to']}"
        if key not in aggregated:
            aggregated[key] = {
                "id": f"lane_{key}",
                "from": lane['from'],
                "to": lane['to'],
                "mode": lane['mode'],
                "status": lane['status'],
                "volume": "low",
                "count": 1,
                "metrics": lane['metrics']
            }
        else:
            aggregated[key]["count"] += 1
            if lane['status'] == 'critical':
                aggregated[key]["status"] = 'critical'
            elif lane['status'] == 'warning' and aggregated[key]['status'] == 'normal':
                aggregated[key]["status"] = 'warning'
                
    final_lanes = []
    for lane in aggregated.values():
        cnt = lane["count"]
        if cnt > 5:
            lane["volume"] = "high"
        elif cnt > 2:
            lane["volume"] = "medium"
        lane["metrics"]["Active Shipments"] = cnt
        final_lanes.append(lane)
            
    return final_lanes

@router.get("/entity/{entity_id}/details")
def get_entity_details(entity_id: str, type: str):
    details = {"orders": [], "shipments": [], "metrics": {}}

    def process_shipments(res):
        shipments = []
        for row in res.mappings():
            from_id = None
            if row["from_plant_location"]:
                from_id = str(row["from_plant_location"])
            elif row["from_supplier_id"]:
                from_id = str(row["from_supplier_id"])
                
            to_id = None
            if row["to_plant_location"]:
                to_id = str(row["to_plant_location"])
            elif row["to_customer_id"]:
                to_id = str(row["to_customer_id"])
                
            shipments.append({
                "shipment_id": str(row["shipment_id"]),
                "shipment_status": str(row["shipment_status"]),
                "mode": str(row["mode"]).lower(),
                "cost_of_shipment": float(row["cost_of_shipment"] or 0),
                "actual_end_date": str(row["actual_end_date"]),
                "from_node": from_id,
                "to_node": to_id
            })
        return shipments
    
    with engine.connect() as conn:
        if type == "customer":
            res = conn.execute(text("""
                SELECT order_id, status as order_status, total_value, date_received 
                FROM orders WHERE customer_id = :id ORDER BY date_received DESC LIMIT 10
            """), {"id": entity_id})
            details["orders"] = [dict(r) for r in res.mappings()]
            
            res = conn.execute(text("""
                SELECT s.shipment_id, s.shipment_status, s.mode, s.cost_of_shipment, s.actual_end_date,
                       s.from_supplier_id, s.to_plant_location, s.from_plant_location, s.to_customer_id,
                       sup.country_iso as sup_country, cust.country_iso as cust_country
                FROM shipments s
                LEFT JOIN suppliers sup ON s.from_supplier_id = sup.supplier_id
                LEFT JOIN customers cust ON s.to_customer_id = cust.customer_id
                WHERE s.to_customer_id = :id AND s.shipment_status NOT IN ('Delivered', 'Cancelled')
            """), {"id": entity_id})
            details["shipments"] = process_shipments(res)
            
        elif type == "supplier":
            res = conn.execute(text("""
                SELECT s.shipment_id, s.shipment_status, s.mode, s.cost_of_shipment, s.actual_end_date,
                       s.from_supplier_id, s.to_plant_location, s.from_plant_location, s.to_customer_id,
                       sup.country_iso as sup_country, cust.country_iso as cust_country
                FROM shipments s
                LEFT JOIN suppliers sup ON s.from_supplier_id = sup.supplier_id
                LEFT JOIN customers cust ON s.to_customer_id = cust.customer_id
                WHERE s.from_supplier_id = :id AND s.shipment_status NOT IN ('Delivered', 'Cancelled')
            """), {"id": entity_id})
            details["shipments"] = process_shipments(res)
            
        elif type == "plant":
            res = conn.execute(text("""
                SELECT s.shipment_id, s.shipment_status, s.mode, s.cost_of_shipment, s.actual_end_date,
                       s.from_supplier_id, s.to_plant_location, s.from_plant_location, s.to_customer_id,
                       sup.country_iso as sup_country, cust.country_iso as cust_country
                FROM shipments s
                LEFT JOIN suppliers sup ON s.from_supplier_id = sup.supplier_id
                LEFT JOIN customers cust ON s.to_customer_id = cust.customer_id
                WHERE (s.from_plant_location = :id OR s.to_plant_location = :id) AND s.shipment_status NOT IN ('Delivered', 'Cancelled')
            """), {"id": entity_id})
            details["shipments"] = process_shipments(res)
            
    return details
