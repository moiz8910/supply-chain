from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import os
import sqlite3
from dotenv import load_dotenv

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from typing import List, Dict, Optional

router = APIRouter(prefix="/api/ai", tags=["ai"])

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None

def get_db_schema():
    try:
        # Avoid hardcoding paths by using the engine from database.py
        from database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            res = conn.execute(text("SELECT sql FROM sqlite_master WHERE type='table';"))
            tables = res.fetchall()
        return "\n\n".join([t[0] for t in tables if t[0]])
    except Exception as e:
        print("Schema fetch error:", e)
        return ""

def execute_sql(query: str):
    try:
        from database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            res = conn.execute(text(query))
            rows = res.fetchall()
        # Convert rows (tuples) to list of dicts or just string format
        return str([dict(row._mapping) for row in rows])
    except Exception as e:
        return f"Error executing query: {e}"

@router.post("/chat")
async def chat_with_database(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing GEMINI_API_KEY environment variable")

    try:
        # Initialize the Gemini LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash", # Using 1.5 Flash as requested (or 2.0 if needed, but 1.5 is stable)
            google_api_key=api_key,
            temperature=0.7,
        )
        
        # Step 1: Ask the LLM to write the SQL query based on the user's question and schema
        schema = get_db_schema()
        
        sql_prompt = []
        if request.history:
            for msg in request.history:
                role = "user" if msg.get("role") == "human" else "model"
                sql_prompt.append((role, msg.get("content", "")))
                
        sql_prompt.extend([
            ("system", f"You are an expert SQLite data analyst. Write a valid SQLite query to answer the user's question based on this schema:\n{schema}\n\nOnly output the raw SQL query, nothing else (no backticks, no markdown, no explanation). Always use SELECT, never modify data. If the user asks a follow-up, use the chat history to understand the context."),
            ("human", request.message)
        ])
        
        ai_sql_msg = llm.invoke(sql_prompt)
        sql_query = ai_sql_msg.content.strip()
        
        # Strip backticks if the LLM adds them despite instructions
        if sql_query.startswith("```sql"): sql_query = sql_query[6:]
        if sql_query.startswith("```"): sql_query = sql_query[3:]
        if sql_query.endswith("```"): sql_query = sql_query[:-3]
        sql_query = sql_query.strip()
        
        print("Generated SQL:", sql_query)
        
        # Step 2: Execute the query against the database
        db_result = execute_sql(sql_query)
        print("DB Result:", db_result)
        
        # Step 3: Pass the result back to the LLM to format a friendly human answer
        answer_prompt = []
        if request.history:
            for msg in request.history:
                role = "user" if msg.get("role") == "human" else "model"
                answer_prompt.append((role, msg.get("content", "")))
                
        answer_prompt.extend([
            ("system", "You are an expert supply chain assistant. The user asked a question, and an SQL query was run against the database to find the answer. Answer the user in a friendly, concise sentence based on the query result."),
            ("human", f"User Question: {request.message}\n\nSQL Query run: {sql_query}\n\nRaw Database Result: {db_result}")
        ])
        
        final_msg = llm.invoke(answer_prompt)
        final_text = final_msg.content.strip()
            
        return {"response": final_text}
        
    except Exception as e:
        print(f"AI Agent Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI encountered an error: {str(e)}")
