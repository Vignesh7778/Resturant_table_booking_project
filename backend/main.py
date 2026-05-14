import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from routes import booking_routes
from db.database import test_connection, Base, engine, SessionLocal
from models.models import Table, Waitlist  # noqa: F401 — needed for Base.metadata

# Vercel route prefix support
root_path = os.environ.get("VERCEL_ROUTE_PREFIX", "")

app = FastAPI(
    title="Restaurant Table Booking Copilot",
    description="Week 2 — Booking Updates, Cancellation, Waitlist, Smart Suggestions & Admin View",
    version="2.0.0",
    root_path=root_path
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(booking_routes.router, tags=["Bookings"])


@app.on_event("startup")
def on_startup():
    """
    Serverless startup event.
    Heavy migrations and seeding have been removed to optimize Vercel cold starts.
    Please run any schema changes directly in your Supabase SQL Editor.
    """
    test_connection()
    # Create schema (idempotent — creates new tables, skips existing)
    # This is relatively fast but ideally should also be managed externally.
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Restaurant Booking API is running."}
