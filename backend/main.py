import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import Base, engine, test_db_connection
from routers import kpi_router
from routers import anomaly_router
from routers import ai_router
from routers import task_router
from routers import calendar_router
from routers import map_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all DB tables on startup (no-op if tables already exist)
    Base.metadata.create_all(bind=engine)
    print("Database tables ensured.")
    yield


app = FastAPI(title="Supply Chain Control Tower", lifespan=lifespan)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Include both local dev origins and the deployed Render frontend.
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "https://supply-chain-1-id8q.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(kpi_router.router)
app.include_router(anomaly_router.router)
app.include_router(ai_router.router)
app.include_router(task_router.router)
app.include_router(calendar_router.router)
app.include_router(map_router.router)


# ── Core endpoints ────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Supply Chain Control Tower API is running"}


@app.get("/health")
def health_check():
    """Lightweight liveness probe used by Render and monitoring tools."""
    return {"status": "ok"}


@app.get("/db-test")
def db_test():
    """Verifies the SQLite database is reachable and returns basic table info."""
    ok = test_db_connection()
    if ok:
        return {"status": "ok", "message": "Database connection successful"}
    return {"status": "error", "message": "Database connection failed"}


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
