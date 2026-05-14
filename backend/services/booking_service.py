from sqlalchemy.orm import Session
from datetime import date, time
from models.models import User, Table, Booking
from schemas.schemas import BookingCreate, BookingUpdate
from fastapi import HTTPException
from uuid import UUID

class BookingService:
    @staticmethod
    def check_availability(db: Session, booking_date: date, booking_time: time, guest_count: int):
        # 1. Find tables that can accommodate the guests and are active
        capable_tables = db.query(Table).filter(
            Table.capacity == guest_count,
            Table.is_active == True
        ).all()
        
        if not capable_tables:
            return []

        capable_table_ids = [t.id for t in capable_tables]

        # 2. Find conflicting bookings (same date, time, and table)
        conflicting_bookings = db.query(Booking).filter(
            Booking.booking_date == booking_date,
            Booking.booking_time == booking_time,
            Booking.table_id.in_(capable_table_ids),
            Booking.status == 'confirmed'
        ).all()

        booked_table_ids = [b.table_id for b in conflicting_bookings]

        # 3. Available tables
        available_tables = [t for t in capable_tables if t.id not in booked_table_ids]
        
        # Sort by capacity to optimize seating (smallest fit logic for Step 2 readiness)
        available_tables.sort(key=lambda x: x.capacity)
        
        return available_tables

    @staticmethod
    def create_booking(db: Session, booking_data: BookingCreate):
        if booking_data.booking_date < date.today():
            raise HTTPException(status_code=400, detail="Cannot book in the past")

        # Get or create user
        user = db.query(User).filter(User.email == booking_data.user.email).first()
        if not user:
            user = User(
                name=booking_data.user.name,
                email=booking_data.user.email,
                phone=booking_data.user.phone
            )
            db.add(user)
            db.flush() # Flush to get user.id

        if booking_data.table_id:
            # User selected a specific table
            requested_table = db.query(Table).filter(Table.id == booking_data.table_id).first()
            if not requested_table:
                raise HTTPException(status_code=404, detail="Table not found")
            if requested_table.capacity < booking_data.guest_count:
                raise HTTPException(status_code=400, detail="Table capacity is less than guest count")
            if not requested_table.is_active:
                raise HTTPException(status_code=400, detail="Table is not active")

            conflicting_booking = db.query(Booking).filter(
                Booking.booking_date == booking_data.booking_date,
                Booking.booking_time == booking_data.booking_time,
                Booking.table_id == booking_data.table_id,
                Booking.status == 'confirmed'
            ).first()

            if conflicting_booking:
                raise HTTPException(status_code=400, detail="Already Occupied")
            
            allocated_table = requested_table
        else:
            # Check availability (fallback to auto-allocate)
            available_tables = BookingService.check_availability(
                db, booking_data.booking_date, booking_data.booking_time, booking_data.guest_count
            )

            if not available_tables:
                raise HTTPException(status_code=400, detail="No tables available for the selected date, time, and guest count")

            # Allocate smallest fitting table
            allocated_table = available_tables[0]

        # Create booking
        new_booking = Booking(
            user_id=user.id,
            table_id=allocated_table.id,
            booking_date=booking_data.booking_date,
            booking_time=booking_data.booking_time,
            guest_count=booking_data.guest_count
        )
        
        print(f"DEBUG: Booking insert started for user {user.email}")
        try:
            db.add(new_booking)
            db.commit()
            db.refresh(new_booking)
            print("DEBUG: Booking committed successfully to database")
            return {
                "booking_id": new_booking.id,
                "table_name": allocated_table.table_name,
                "guest_count": new_booking.guest_count,
                "message": "Booking Confirmed"
            }
        except Exception as e:
            db.rollback()
            print(f"DEBUG: Booking insert failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to save booking to database")

    @staticmethod
    def get_all_bookings(db: Session):
        return db.query(Booking).all()

    @staticmethod
    def get_booking(db: Session, booking_id: str):
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        return booking

    # ─────────────────────────────────────────────────────────────────
    # Week 2 — New Service Methods
    # ─────────────────────────────────────────────────────────────────

    @staticmethod
    def update_booking(db: Session, booking_id: UUID, update_data: BookingUpdate):
        """Update an existing booking with conflict and validation checks."""
        # 1. Fetch booking
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        if booking.status == "cancelled":
            raise HTTPException(status_code=400, detail="Cannot update a cancelled booking")

        # 2. Determine final values (use new if provided, else keep existing)
        new_date = update_data.booking_date or booking.booking_date
        new_time = update_data.booking_time or booking.booking_time
        new_guest_count = update_data.guest_count or booking.guest_count
        new_table_id = update_data.table_id or booking.table_id

        # 3. Validate: no past dates
        if new_date < date.today():
            raise HTTPException(status_code=400, detail="Cannot book in the past")

        # 4. Validate: table must exist and match seat count rule
        target_table = db.query(Table).filter(Table.id == new_table_id).first()
        if not target_table:
            raise HTTPException(status_code=404, detail="Table not found")
        if not target_table.is_active:
            raise HTTPException(status_code=400, detail="Table is not active")
        if target_table.capacity < new_guest_count:
            raise HTTPException(status_code=400, detail="Table capacity is less than guest count")

        # 5. Conflict check — exclude current booking from conflict search
        conflicting = db.query(Booking).filter(
            Booking.booking_date == new_date,
            Booking.booking_time == new_time,
            Booking.table_id == new_table_id,
            Booking.status == "confirmed",
            Booking.id != booking_id
        ).first()

        if conflicting:
            raise HTTPException(status_code=400, detail="Already Occupied")

        # 6. Apply updates
        booking.booking_date = new_date
        booking.booking_time = new_time
        booking.guest_count = new_guest_count
        booking.table_id = new_table_id

        try:
            db.commit()
            db.refresh(booking)
            return {
                "booking_id": booking.id,
                "table_name": target_table.table_name,
                "guest_count": booking.guest_count,
                "message": "Booking Updated"
            }
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to update booking")

    @staticmethod
    def cancel_booking(db: Session, booking_id: UUID):
        """Soft-cancel a booking — sets status to 'cancelled', table becomes available."""
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        if booking.status == "cancelled":
            raise HTTPException(status_code=400, detail="Booking is already cancelled")

        booking.status = "cancelled"
        try:
            db.commit()
            db.refresh(booking)
            return {"message": "Booking Cancelled"}
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to cancel booking")

    @staticmethod
    def get_user_bookings(db: Session, user_id: UUID):
        """Return all bookings for a user, newest first, with table_name."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        bookings = (
            db.query(Booking)
            .filter(Booking.user_id == user_id)
            .order_by(Booking.created_at.desc())
            .all()
        )

        result = []
        for b in bookings:
            table = db.query(Table).filter(Table.id == b.table_id).first()
            result.append({
                "booking_id": b.id,
                "table_name": table.table_name if table else "Unknown",
                "booking_date": b.booking_date,
                "booking_time": b.booking_time,
                "guest_count": b.guest_count,
                "booking_status": b.status,
            })

        return result

    @staticmethod
    def get_all_bookings_admin(db: Session, filter_date: date = None, filter_status: str = None):
        """Admin view: all bookings with optional date/status filters, sorted newest first."""
        query = db.query(Booking).order_by(Booking.created_at.desc())

        if filter_date:
            query = query.filter(Booking.booking_date == filter_date)
        if filter_status:
            query = query.filter(Booking.status == filter_status)

        bookings = query.all()

        result = []
        for b in bookings:
            user = db.query(User).filter(User.id == b.user_id).first()
            table = db.query(Table).filter(Table.id == b.table_id).first()
            result.append({
                "booking_id": b.id,
                "customer_name": user.name if user else "Unknown",
                "table_name": table.table_name if table else "Unknown",
                "booking_date": b.booking_date,
                "booking_time": b.booking_time,
                "status": b.status,
            })

        return result

