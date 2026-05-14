from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from core.config import settings

# ─────────────────────────────────────────────────────────────────
# Engine — PostgreSQL via DATABASE_URL
# ─────────────────────────────────────────────────────────────────

# Remove any SQLite fallbacks
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,                      # Essential for Supabase to keep connection alive
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def test_connection():
    """Quick sanity check — called at startup to surface DB errors early."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[OK] Database connection OK (PostgreSQL / Supabase)")
    except Exception as e:
        print(f"[FAIL] Database connection FAILED: {e}")
        raise
