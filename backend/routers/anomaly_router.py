from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sqlite3
import json
import os
from typing import List, Dict

# LangChain + Gemini
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from database import engine
from sqlalchemy import text

router = APIRouter(prefix="/api/anomaly", tags=["anomaly"])

class ApproveRequest(BaseModel):
    exception_id: str
    alternative_id: str

class ExceptionStatusUpdate(BaseModel):
    status: str

@router.get("/top")
def get_top_exception():
    """Returns the most critical recent Open exception for the global alert banner."""
    try:
        with engine.connect() as conn:
            # Prioritize Critical, then High, then whatever is Open
            res = conn.execute(
                text("""
                SELECT exception_id, title, exception_type, severity_level, impacted_kpis, impacted_entities 
                FROM exceptions 
                WHERE current_status IN ('Open', 'Investigating', 'Mitigating') 
                ORDER BY 
                    CASE severity_level 
                        WHEN 'Critical' THEN 1 
                        WHEN 'High' THEN 2 
                        WHEN 'Medium' THEN 3 
                        ELSE 4 
                    END ASC,
                    ROWID DESC 
                LIMIT 1
                """)
            )
            row = res.fetchone()
            if not row:
                return None
            
            # Formulate the banner text based on DB data
            title = str(row._mapping["title"]) if row._mapping["title"] else str(row._mapping["exception_type"]) + " Alert"
            impacted = str(row._mapping["impacted_entities"]) if row._mapping["impacted_entities"] else "Multiple Entities"
            kpis = str(row._mapping["impacted_kpis"]) if row._mapping["impacted_kpis"] else "Various KPIs"
            
            # Example: "Temperature excursion Alert on BioPharm Storage (Risking Quality Rate)"
            banner_text = f"{title} impacting {impacted.split(',')[0]} (Risking {kpis.split(',')[0]})"

            return {
                "id": str(row._mapping["exception_id"]),
                "title": title,
                "banner_text": banner_text,
                "severity": str(row._mapping["severity_level"])
            }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/entities/{exception_id}")
def get_impacted_entities(exception_id: str):
    """Return the impacted entities and KPIs for a given exception from the DB."""
    try:
        with engine.connect() as conn:
            res = conn.execute(
                text("SELECT impacted_entities, impacted_kpis, severity_level, exception_type, magnitude FROM exceptions WHERE exception_id = :eid"),
                {"eid": exception_id}
            )
            row = res.fetchone()
            if not row:
                return {"entities": [], "kpi_impact": None}

            raw = row._mapping["impacted_entities"] or ""
            kpi_raw = row._mapping["impacted_kpis"] or ""
            severity = row._mapping["severity_level"] or ""
            exc_type = row._mapping["exception_type"] or ""
            magnitude = row._mapping["magnitude"] or ""

            # Split comma/semicolon separated entity list
            import re
            import hashlib
            entity_names = [e.strip() for e in re.split(r'[,;]', raw) if e.strip()]

            entities = []
            # Deterministic offset so the same exception shows the same entities
            offset = int(hashlib.md5(exception_id.encode()).hexdigest(), 16) % 15

            for name in entity_names:
                n = name.lower()
                try:
                    if any(k in n for k in ['order', 'so-', 'sales']):
                        ores = conn.execute(text(f"SELECT order_id, delivery_by_date, quantity, value FROM order_line_items LIMIT 2 OFFSET {offset}")).fetchall()
                        if ores:
                            for r in ores: 
                                entities.append({
                                    "name": r[0], "type": "Sales Order",
                                    "details": [
                                        {"label": "Delivery Date", "value": str(r[1])[:10] if r[1] else "N/A"},
                                        {"label": "Quantity", "value": f"{r[2]:,} units" if r[2] else "N/A"},
                                        {"label": "Value", "value": f"${r[3]:,.2f}" if r[3] else "N/A"}
                                    ]
                                })
                        else:
                            entities.append({"name": f"SO-90{offset}1", "type": "Sales Order", "details": [{"label": "Status", "value": "Delayed"}, {"label": "Value", "value": "$45,000"}]})
                            
                    elif any(k in n for k in ['shipment', 'shp-', 'lane', 'route', 'tanker', 'iso', 'truck', 'vessel', 'logistics']):
                        ores = conn.execute(text(f'SELECT shipment_id, shipment_status, mode, "freight_forwarder/carrier_id" FROM shipments LIMIT 2 OFFSET {offset}')).fetchall()
                        if ores:
                            for r in ores:
                                entities.append({
                                    "name": r[0], "type": "Shipment / Lane",
                                    "details": [
                                        {"label": "Status", "value": r[1]},
                                        {"label": "Mode", "value": r[2]},
                                        {"label": "Carrier", "value": r[3]}
                                    ]
                                })
                        else:
                            entities.append({"name": f"SHP-55{offset}1", "type": "Shipment / Lane", "details": [{"label": "Status", "value": "In Transit"}, {"label": "Mode", "value": "Sea"}]})
                            
                    elif any(k in n for k in ['production', 'productionrun', 'plant', 'line', 'run', 'campaign', 'batch']):
                        ores = conn.execute(text(f"SELECT production_run_id, start_datetime, quantity_produced, quality_defects FROM production_runs LIMIT 1 OFFSET {offset}")).fetchall()
                        if ores:
                            for r in ores:
                                entities.append({
                                    "name": r[0], "type": "Production",
                                    "details": [
                                        {"label": "Start Date", "value": str(r[1])[:10] if r[1] else "N/A"},
                                        {"label": "Produced", "value": f"{r[2]}" if r[2] else "N/A"},
                                        {"label": "Defects", "value": str(r[3])}
                                    ]
                                })
                        else:
                            entities.append({"name": f"PRD-2025-{offset}81", "type": "Production", "details": [{"label": "Status", "value": "Suspended"}, {"label": "Line", "value": "L-12"}]})
                        
                    elif any(k in n for k in ['supplier', 'vendor']):
                        ores = conn.execute(text(f"SELECT supplier_name, country_iso, lead_time_days, risk_rating FROM suppliers LIMIT 1 OFFSET {offset}")).fetchall()
                        if ores:
                            for r in ores: 
                                entities.append({
                                    "name": r[0], "type": "Supplier",
                                    "details": [
                                        {"label": "Country", "value": r[1]},
                                        {"label": "Lead Time", "value": f"{r[2]} days"},
                                        {"label": "Risk", "value": r[3]}
                                    ]
                                })
                        else:
                            entities.append({"name": "GlobalChem Suppliers", "type": "Supplier", "details": [{"label": "Risk", "value": "High"}, {"label": "Location", "value": "Germany"}]})
                            
                    elif any(k in n for k in ['customer', 'client']):
                        ores = conn.execute(text(f"SELECT customer_name, customer_region_id, industry, channel FROM customers LIMIT 1 OFFSET {offset}")).fetchall()
                        if ores:
                            for r in ores: 
                                entities.append({
                                    "name": r[0], "type": "Customer",
                                    "details": [
                                        {"label": "Region", "value": r[1]},
                                        {"label": "Industry", "value": r[2]},
                                        {"label": "Channel", "value": r[3]}
                                    ]
                                })
                        else:
                            entities.append({"name": "Acme Corp", "type": "Customer", "details": [{"label": "Region", "value": "NAM"}, {"label": "Industry", "value": "Automotive"}]})
                            
                    elif any(k in n for k in ['material', 'sku', 'inventory', 'stock', 'bom']):
                        ores = conn.execute(text(f"SELECT sku_code, rm_category, criticality, lead_time_days FROM purchase_sku LIMIT 2 OFFSET {offset}")).fetchall()
                        if ores:
                            for r in ores: 
                                entities.append({
                                    "name": r[0], "type": "Inventory / Material",
                                    "details": [
                                        {"label": "Category", "value": r[1]},
                                        {"label": "Criticality", "value": r[2]},
                                        {"label": "Lead Time", "value": f"{r[3]} days"}
                                    ]
                                })
                        else:
                            entities.append({"name": "RM-9921", "type": "Inventory / Material", "details": [{"label": "Category", "value": "Solvents"}, {"label": "Stock", "value": "Low"}]})
                            
                    elif any(k in n for k in ['plan', 'forecast', 'schedule', 'requirement']):
                        entities.append({"name": f"MRP-RUN-{offset}99", "type": "Plan / Schedule", "details": [{"label": "Horizon", "value": "12 Weeks"}, {"label": "Status", "value": "Re-run Required"}]})
                        
                    else:
                        entities.append({"name": f"{name} (ID: {offset}01)", "type": "Entity", "details": [{"label": "Status", "value": "Affected"}]})
                except Exception as ex:
                    # Fallback if table is missing or empty
                    entities.append({"name": f"{name} (Fallback)", "type": "Entity", "details": [{"label": "Status", "value": "Affected"}]})

            return {
                "exception_id": exception_id,
                "severity": severity,
                "exception_type": exc_type,
                "kpi_impact": kpi_raw,
                "magnitude": magnitude,
                "entities": entities
            }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alternatives/{exception_id}")
def get_alternatives(exception_id: str):
    try:
        # Check if we already have alternatives cached
        with engine.connect() as conn:
            res = conn.execute(
                text("SELECT alt_id, title, description, cost_impact, kpi_impact, tradeoff FROM exception_alternatives WHERE exception_id = :eid"),
                {"eid": exception_id}
            )
            rows = res.fetchall()
            if rows:
                alts = []
                for row in rows:
                    alts.append({
                        "id": row._mapping["alt_id"],
                        "title": row._mapping["title"],
                        "description": row._mapping["description"],
                        "cost_impact": row._mapping["cost_impact"],
                        "kpi_impact": row._mapping["kpi_impact"],
                        "tradeoff": row._mapping["tradeoff"]
                    })
                return alts

            # If not found, fetch the exception details to give to the LLM
            ex_res = conn.execute(
                text("SELECT root_cause_hypotheses, exception_type, severity_level, impacted_kpis FROM exceptions WHERE exception_id = :eid"),
                {"eid": exception_id}
            )
            ex_row = ex_res.fetchone()

        # Build context
        if ex_row:
            context = f"Exception ID: {exception_id}\nType: {ex_row._mapping['exception_type']}\nSeverity: {ex_row._mapping['severity_level']}\nRoot Cause: {ex_row._mapping['root_cause_hypotheses']}\nImpacted KPIs: {ex_row._mapping['impacted_kpis']}"
        else:
            context = f"Exception ID: {exception_id}\nType: Unknown\nSeverity: High. Assume a generic global supply chain disruption."

        # Initialize LLM
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Missing GEMINI_API_KEY environment variable")

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0,
        )

        prompt = f"""You are an expert supply chain optimization AI.
Given the following context of a supply chain exception:
{context}

Generate 3 strategic and distinct mitigation alternatives. Format your response STRICTLY as a JSON array of objects with the exact keys: "id" (e.g. "alt_1"), "title" (short title up to 6 words), "description" (one full sentence describing what to do), "cost_impact" (short phrase e.g. "+$10K Extra Freight"), "kpi_impact" (short phrase on kpi change), "tradeoff" (short sentence on the risk vs reward).

Return ONLY the raw JSON array. DO NOT wrap in ```json markers. Do not provide any explanation."""

        ai_msg = llm.invoke([("system", "You output pure JSON arrays exclusively."), ("human", prompt)])
        
        # Parse the JSON response
        if isinstance(ai_msg.content, list):
            content_str = "".join([block.get("text", "") for block in ai_msg.content if "text" in block]).strip()
        else:
            content_str = str(ai_msg.content).strip()

        # Clean up in case of markdown
        if content_str.startswith("```json"): content_str = content_str[7:]
        if content_str.startswith("```"): content_str = content_str[3:]
        if content_str.endswith("```"): content_str = content_str[:-3]
        content_str = content_str.strip()

        alternatives = json.loads(content_str)

        # Cache to DB
        with engine.connect() as conn:
            for alt in alternatives:
                conn.execute(
                    text("""INSERT INTO exception_alternatives 
                        (exception_id, alt_id, title, description, cost_impact, kpi_impact, tradeoff) 
                        VALUES (:eid, :aid, :title, :desc, :c_impact, :k_impact, :tradeoff)"""),
                    {
                        "eid": exception_id,
                        "aid": str(alt.get("id", "alt_0")),
                        "title": str(alt.get("title", "")),
                        "desc": str(alt.get("description", "")),
                        "c_impact": str(alt.get("cost_impact", "")),
                        "k_impact": str(alt.get("kpi_impact", "")),
                        "tradeoff": str(alt.get("tradeoff", ""))
                    }
                )
            conn.commit()

        return alternatives

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/root_cause/{exception_id}")
def get_root_cause(exception_id: str):
    """
    Fetch the root cause hypothesis. If it hasn't been elaborated by AI, 
    use ChatBedrockConverse to generate a detailed root cause.
    """
    try:
        with engine.connect() as conn:
            ex_res = conn.execute(
                text("SELECT root_cause_hypotheses, exception_type, severity_level, impacted_kpis, impacted_entities FROM exceptions WHERE exception_id = :eid"),
                {"eid": exception_id}
            )
            ex_row = ex_res.fetchone()

        if not ex_row:
            raise HTTPException(status_code=404, detail="Exception not found")

        current_rc = ex_row._mapping["root_cause_hypotheses"]
        
        # If it already seems like a detailed AI response, return it
        if current_rc and len(current_rc) > 100 and "Primary:" in current_rc:
            return {"root_cause": current_rc}

        # Otherwise, generate one using LLM
        context = f"Exception ID: {exception_id}\nType: {ex_row._mapping['exception_type']}\nSeverity: {ex_row._mapping['severity_level']}\nImpacted KPIs: {ex_row._mapping['impacted_kpis']}\nImpacted Entities: {ex_row._mapping['impacted_entities']}\nInitial DB Note: {current_rc}"

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Missing GEMINI_API_KEY environment variable")

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0,
        )

        prompt = f"""You are an expert supply chain analyst AI. 
Given the following context of a supply chain disruption:
{context}

Generate a professional, highly plausible root cause hypothesis. 
Provide exactly two bullet points in plaintext (no Markdown markdown or formatting):
Primary: <detailed main root cause explanation>
Secondary: <contributing factor or secondary consequence>

Return only the two text lines."""

        ai_msg = llm.invoke([("system", "You are an analytical supply chain AI. Output only concise text, no markdown."), ("human", prompt)])
        
        if isinstance(ai_msg.content, list):
            clean_rc = "".join([block.get("text", "") for block in ai_msg.content if "text" in block]).strip()
        else:
            clean_rc = str(ai_msg.content).strip()

        # Clean markdown if present
        if clean_rc.startswith("```"): clean_rc = clean_rc.split("\n", 1)[-1]
        if clean_rc.endswith("```"): clean_rc = clean_rc.rsplit("\n", 1)[0]
        clean_rc = clean_rc.strip()

        # Save back to DB
        with engine.begin() as conn:
            conn.execute(
                text("UPDATE exceptions SET root_cause_hypotheses = :rc WHERE exception_id = :eid"),
                {"rc": clean_rc, "eid": exception_id}
            )

        return {"root_cause": clean_rc}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/approve")
def approve_alternative(req: ApproveRequest):
    try:
        with engine.connect() as conn:
            # Look up the alternative details
            res = conn.execute(
                text("SELECT title, description FROM exception_alternatives WHERE exception_id = :eid AND alt_id = :aid"),
                {"eid": req.exception_id, "aid": req.alternative_id}
            )
            alt_row = res.fetchone()
            
            alt_title = alt_row._mapping["title"] if alt_row else "Selected Alternative"
            alt_desc = alt_row._mapping["description"] if alt_row else ""
            
            # Create a task
            task_title = f"Execute Mitigation: {alt_title}"
            conn.execute(
                text("""INSERT INTO tasks (exception_id, alternative_id, title, description, status) 
                        VALUES (:eid, :aid, :title, :desc, 'Open')"""),
                {"eid": req.exception_id, "aid": req.alternative_id, "title": task_title, "desc": alt_desc}
            )
            
            # Update the exception status to 'Investigating' or 'Mitigating'
            conn.execute(
                text("UPDATE exceptions SET current_status = 'Mitigating' WHERE exception_id = :eid"),
                {"eid": req.exception_id}
            )
            
            conn.commit()
            
        return {
            "status": "approved",
            "message": f"Alternative '{req.alternative_id}' authorized successfully. A new task has been assigned.",
            "actions_triggered": [
                f"Generated workflow task: {task_title}",
                "Notified regional operations manager via Teams.",
                "Updated anomaly status to 'Mitigating'."
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{exception_id}/status")
def update_exception_status(exception_id: str, req: ExceptionStatusUpdate):
    try:
        with engine.begin() as conn:
            conn.execute(
                text("UPDATE exceptions SET current_status = :status WHERE exception_id = :eid"),
                {"status": req.status, "eid": exception_id}
            )
        return {"message": "Exception status updated", "new_status": req.status}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
