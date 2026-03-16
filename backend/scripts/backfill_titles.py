import sqlite3
import json
import os
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy import create_engine, text

engine = create_engine("sqlite:///../data/supply_chain.db")

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise Exception("Missing GEMINI_API_KEY environment variable")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=api_key,
    temperature=0.0
)

def backfill_titles():
    with engine.connect() as conn:
        res = conn.execute(text("SELECT exception_id, exception_type, severity_level, impacted_kpis, root_cause_hypotheses FROM exceptions"))
        rows = res.fetchall()
        
    for r in rows:
        eid = r._mapping['exception_id']
        context = f"Type: {r._mapping['exception_type']}\nSeverity: {r._mapping['severity_level']}\nRC: {r._mapping['root_cause_hypotheses']}"
        prompt = f"Given this supply chain exception context:\n{context}\n\nWrite a 3-5 word concise, punchy title for this supply chain issue (no quotes, no periods, just the title)."
        
        print(f"Generating title for {eid}...")
        ai_msg = llm.invoke([("system", "You output only the 3-5 word title string directly without extra markdown or quotes."), ("human", prompt)])
        
        if isinstance(ai_msg.content, list):
            title = "".join([block.get("text", "") for block in ai_msg.content if "text" in block]).strip()
        else:
            title = str(ai_msg.content).strip()
            
        title = title.replace('"', '').replace("'", "").strip()
        
        with engine.begin() as conn:
            conn.execute(text("UPDATE exceptions SET title = :t WHERE exception_id = :eid"), {"t": title, "eid": eid})
            
    print("Done backfilling titles.")

if __name__ == "__main__":
    backfill_titles()
