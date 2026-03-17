# from sqlalchemy import create_engine, text
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# import os

# # Use a relative path so it works both locally and on Render.
# # On Render, the working directory is the backend folder.
# SQLALCHEMY_DATABASE_URL = "sqlite:///./supply_chain.db"

# engine = create_engine(
#     SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
# )
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# def test_db_connection():
#     """Returns True if DB connection is healthy."""
#     try:
#         with engine.connect() as conn:
#             conn.execute(text("SELECT 1"))
#         return True
#     except Exception as e:
#         print(f"DB connection test failed: {e}")
#         return False

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# ── Get absolute base directory ────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── Correct database path ─────────────────────────────────────────────────────
DB_PATH = os.path.join(BASE_DIR, "data", "supply_chain_new.db")

# Debug log (will show in Render logs)
print("Using database at:", DB_PATH)

# ── SQLAlchemy setup ──────────────────────────────────────────────────────────
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# ── Dependency for DB session ─────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── DB connection test (used in /db-test endpoint) ────────────────────────────
def test_db_connection():
    """Returns True if DB connection is healthy."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database connection successful ✅")
        return True
    except Exception as e:
        print(f"DB connection test failed ❌: {e}")
        return False