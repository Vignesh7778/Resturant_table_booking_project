from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import date
from models.models import Waitlist
from schemas.schemas import WaitlistCreate
from fastapi import HTTPException


class WaitlistService:
    @staticmethod
    def create_waitlist_entry(db: Session, data: WaitlistCreate):
        """Add user to waitlist. Rejects duplicates (same email + date + time)."""
        # Validate: no past dates
        if data.booking_date < date.today():
            raise HTTPException(status_code=400, detail="Cannot join waitlist for a past date")

        entry = Waitlist(
            name=data.name,
            email=data.email,
            guest_count=data.guest_count,
            booking_date=data.booking_date,
            booking_time=data.booking_time,
        )

        try:
            db.add(entry)
            db.commit()
            db.refresh(entry)
            return entry
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail="You are already on the waitlist for this date and time"
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to join waitlist")
