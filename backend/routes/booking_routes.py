from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, time
from db.database import get_db
from schemas.schemas import (
    BookingCreate, BookingResponse, BookingDetailResponse, TableResponse,
    BookingConfirmationResponse, BookingUpdate, CancelResponse,
    BookingHistoryResponse, AdminBookingResponse,
    WaitlistCreate, WaitlistResponse, AlternateSlotResponse,
)
from services.booking_service import BookingService
from services.waitlist_service import WaitlistService
from services.availability_service import AvailabilityService

router = APIRouter()

# ─────────────────────────────────────────────────────────────────
# Week 1 — Existing Routes (unchanged)
# ─────────────────────────────────────────────────────────────────

@router.get("/availability", response_model=List[TableResponse])
def check_availability(
    booking_date: date = Query(..., description="Date of the booking"),
    booking_time: time = Query(..., description="Time of the booking"),
    guest_count: int = Query(..., gt=0, description="Number of guests"),
    db: Session = Depends(get_db)
):
    return BookingService.check_availability(db, booking_date, booking_time, guest_count)

@router.post("/bookings", response_model=BookingConfirmationResponse)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    return BookingService.create_booking(db, booking)

@router.get("/bookings", response_model=List[BookingResponse])
def get_bookings(db: Session = Depends(get_db)):
    return BookingService.get_all_bookings(db)

@router.get("/bookings/{booking_id}", response_model=BookingDetailResponse)
def get_booking_details(booking_id: str, db: Session = Depends(get_db)):
    return BookingService.get_booking(db, booking_id)


# ─────────────────────────────────────────────────────────────────
# Week 2 — New Routes
# ─────────────────────────────────────────────────────────────────

@router.put("/bookings/{booking_id}", response_model=BookingConfirmationResponse)
def update_booking(booking_id: str, update_data: BookingUpdate, db: Session = Depends(get_db)):
    """Update booking date, time, guest count, or table."""
    return BookingService.update_booking(db, booking_id, update_data)


@router.patch("/bookings/{booking_id}/cancel", response_model=CancelResponse)
def cancel_booking(booking_id: str, db: Session = Depends(get_db)):
    """Soft-cancel a booking. The table becomes available again."""
    return BookingService.cancel_booking(db, booking_id)


@router.get("/users/{user_id}/bookings", response_model=List[BookingHistoryResponse])
def get_user_bookings(user_id: str, db: Session = Depends(get_db)):
    """Get all bookings for a user, sorted newest first."""
    return BookingService.get_user_bookings(db, user_id)


@router.post("/waitlist", response_model=WaitlistResponse)
def join_waitlist(data: WaitlistCreate, db: Session = Depends(get_db)):
    """Add user to waitlist when no tables are available."""
    return WaitlistService.create_waitlist_entry(db, data)


@router.get("/availability/alternatives", response_model=AlternateSlotResponse)
def suggest_alternate_slots(
    booking_date: date = Query(..., description="Date of the booking"),
    booking_time: time = Query(..., description="Requested time"),
    guest_count: int = Query(..., gt=0, description="Number of guests"),
    db: Session = Depends(get_db)
):
    """Suggest nearby available time slots when requested time is unavailable."""
    alternatives = AvailabilityService.suggest_alternate_slots(
        db, booking_date, booking_time, guest_count
    )
    return {"available_alternatives": alternatives}


@router.get("/admin/bookings", response_model=List[AdminBookingResponse])
def admin_view_bookings(
    filter_date: Optional[date] = Query(None, description="Filter by date"),
    filter_status: Optional[str] = Query(None, description="Filter by status (confirmed/cancelled)"),
    db: Session = Depends(get_db)
):
    """Admin: view all bookings with optional date/status filters."""
    return BookingService.get_all_bookings_admin(db, filter_date, filter_status)

