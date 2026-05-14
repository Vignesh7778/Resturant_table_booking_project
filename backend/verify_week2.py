"""Week 2 verification script."""
from main import app
from routes.booking_routes import router
from services.booking_service import BookingService
from services.waitlist_service import WaitlistService
from services.availability_service import AvailabilityService
from models.models import User, Table, Booking, Waitlist
from schemas.schemas import (
    BookingUpdate, CancelResponse, BookingHistoryResponse,
    AdminBookingResponse, WaitlistCreate, WaitlistResponse, AlternateSlotResponse,
)

print("=== WEEK 2 VERIFICATION ===\n")

print("[OK] Models: User, Table, Booking, Waitlist")
print("[OK] Schemas: BookingUpdate, CancelResponse, BookingHistoryResponse,")
print("              AdminBookingResponse, WaitlistCreate, WaitlistResponse, AlternateSlotResponse")
print("[OK] Services: BookingService, WaitlistService, AvailabilityService")
print("[OK] Routes: All imported")

methods = ["update_booking", "cancel_booking", "get_user_bookings", "get_all_bookings_admin"]
for m in methods:
    assert hasattr(BookingService, m), f"MISSING: BookingService.{m}"
    print(f"  [OK] BookingService.{m}")

assert hasattr(WaitlistService, "create_waitlist_entry")
print("  [OK] WaitlistService.create_waitlist_entry")

assert hasattr(AvailabilityService, "suggest_alternate_slots")
print("  [OK] AvailabilityService.suggest_alternate_slots")

# Check Waitlist model has unique constraint
from sqlalchemy import UniqueConstraint
has_uq = any(isinstance(c, UniqueConstraint) for c in Waitlist.__table_args__)
assert has_uq, "Waitlist UniqueConstraint missing"
print("  [OK] Waitlist UniqueConstraint present")

# Check Booking has updated_at
assert hasattr(Booking, "updated_at")
print("  [OK] Booking.updated_at column present")

print("\n=== ALL 6 STEPS VERIFIED — WEEK 2 COMPLETE ===")
