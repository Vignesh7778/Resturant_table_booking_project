from pydantic import BaseModel, EmailStr, Field
from datetime import date, time, datetime
from typing import Optional, List
from uuid import UUID

class TableBase(BaseModel):
    table_name: str
    capacity: int

class TableResponse(TableBase):
    id: UUID
    is_active: bool

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str

class BookingCreate(BaseModel):
    user: UserBase
    booking_date: date
    booking_time: time
    guest_count: int = Field(gt=0, description="Guest count must be greater than 0")
    table_id: Optional[UUID] = None

class BookingConfirmationResponse(BaseModel):
    booking_id: UUID
    table_name: str
    guest_count: int
    message: str

class BookingResponse(BaseModel):
    id: UUID
    booking_date: date
    booking_time: time
    guest_count: int
    status: str
    table_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class BookingDetailResponse(BookingResponse):
    user: UserBase
    table: TableResponse


# ─────────────────────────────────────────────────────────────────
# Week 2 — New Schemas
# ─────────────────────────────────────────────────────────────────

class BookingUpdate(BaseModel):
    """PUT /bookings/{id} — all fields optional for partial update."""
    booking_date: Optional[date] = None
    booking_time: Optional[time] = None
    guest_count: Optional[int] = Field(None, gt=0, description="Guest count must be greater than 0")
    table_id: Optional[UUID] = None


class CancelResponse(BaseModel):
    message: str


class BookingHistoryResponse(BaseModel):
    """GET /users/{id}/bookings — enriched with table_name."""
    booking_id: UUID
    table_name: str
    booking_date: date
    booking_time: time
    guest_count: int
    booking_status: str

    class Config:
        from_attributes = True


class AdminBookingResponse(BaseModel):
    """GET /admin/bookings — flattened view for admin."""
    booking_id: UUID
    customer_name: str
    table_name: str
    booking_date: date
    booking_time: time
    status: str

    class Config:
        from_attributes = True


class WaitlistCreate(BaseModel):
    """POST /waitlist"""
    name: str
    email: EmailStr
    guest_count: int = Field(gt=0, description="Guest count must be greater than 0")
    booking_date: date
    booking_time: time


class WaitlistResponse(BaseModel):
    id: UUID
    name: str
    email: str
    guest_count: int
    booking_date: date
    booking_time: time
    created_at: datetime

    class Config:
        from_attributes = True


class AlternateSlotResponse(BaseModel):
    """GET /availability/alternatives"""
    available_alternatives: List[str]
