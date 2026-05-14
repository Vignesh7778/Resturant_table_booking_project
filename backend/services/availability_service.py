from sqlalchemy.orm import Session
from datetime import date, time, timedelta, datetime
from models.models import Table, Booking


class AvailabilityService:
    @staticmethod
    def suggest_alternate_slots(
        db: Session,
        booking_date: date,
        booking_time: time,
        guest_count: int,
    ) -> list[str]:
        """
        Suggest nearby available time slots (±30m, ±60m, ±90m).
        Returns a list of time strings like ["19:30", "20:00"].
        """
        # Generate candidate offsets: ±30, ±60, ±90 minutes
        offsets_minutes = [-90, -60, -30, 30, 60, 90]
        base_dt = datetime.combine(booking_date, booking_time)

        candidates = []
        for offset in offsets_minutes:
            candidate_dt = base_dt + timedelta(minutes=offset)
            # Only suggest times within reasonable restaurant hours (11:00 - 23:00)
            if candidate_dt.date() == booking_date and 11 <= candidate_dt.hour <= 22:
                candidates.append(candidate_dt.time())

        if not candidates:
            return []

        # Find tables that match capacity
        capable_tables = db.query(Table).filter(
            Table.capacity == guest_count,
            Table.is_active == True
        ).all()

        if not capable_tables:
            return []

        capable_table_ids = [t.id for t in capable_tables]

        available_slots = []
        for candidate_time in candidates:
            # Check if ANY table is free at this candidate time
            booked_count = db.query(Booking).filter(
                Booking.booking_date == booking_date,
                Booking.booking_time == candidate_time,
                Booking.table_id.in_(capable_table_ids),
                Booking.status == "confirmed"
            ).count()

            if booked_count < len(capable_tables):
                # At least one table is free
                available_slots.append(candidate_time.strftime("%H:%M"))

        return available_slots
