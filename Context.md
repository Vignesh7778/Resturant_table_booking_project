# Restaurant Table Booking Copilot (PRJ-010)

## ✅ Project Summary

This project is a backend-focused restaurant booking system built using FastAPI, Supabase (PostgreSQL), and React. It allows users to check availability, select a table, and create bookings while preventing conflicts.

---

## 🧠 What We Have Already Completed (Week 1 Core)

### Backend

* FastAPI project setup
* SQLAlchemy models (users, tables, bookings)
* Supabase PostgreSQL integration (no SQLite)
* APIs:

  * GET /availability
  * POST /bookings
  * GET /bookings
  * GET /bookings/{id}

### Core Logic

* Exact seat matching (capacity == guest_count)
* Availability filtering (exclude already booked tables)
* Table selection logic (user selects table_id)
* Conflict prevention (same table + same time → blocked)
* Proper DB commit:

  * db.add()
  * db.commit()
  * db.refresh()

### Frontend

* React booking page
* Input form (name, email, phone, date, time, guests)
* Display available tables
* Table selection UI
* Booking confirmation display

### Booking Flow (Implemented)

1. User enters guest count, date, time
2. Backend filters tables (exact match + not booked)
3. Frontend displays available tables
4. User selects one table
5. Booking request sent with table_id
6. Backend validates conflict
7. Booking saved in Supabase
8. Response shows:

   * booking_id
   * table_name
   * guest_count

---

## ⚙️ Key Backend Logic

### Availability

* Only show tables where:

  * capacity == guest_count
  * NOT already booked for same date/time

### Booking Validation

* Reject if:

  * table already booked
* Return:
  "Already Occupied"

### Booking Creation

* Only use selected table_id
* No auto-assignment

---

## 📦 Architecture

* routes/ → API endpoints
* schemas/ → Pydantic validation
* models/ → SQLAlchemy models
* services/ → business logic
* db/ → connection setup
* frontend/ → React UI

---

## 🗓️ Week 2 Plan (Next)

### Features to Add

* Update booking
* Cancel booking
* Waitlist system
* Smart helper feature (suggest alternate slots)

### Improvements

* Stronger conflict handling
* Better filtering logic
* Edge case validation

---

## 🗓️ Week 3 Plan

### Final Features

* Admin dashboard
* Booking history
* Reports/export
* Role-based access

### Final Steps

* UI polish
* Documentation
* Demo preparation

---

## 🚀 MASTER PROMPT (FULL PROJECT CONTROL)

You are a senior full-stack engineer building a production-quality Restaurant Table Booking Copilot.

Follow these strict rules:

* Use FastAPI + Supabase + React
* Do NOT use SQLite
* Keep logic in service layer
* Do NOT break existing functionality
* Work week-by-week

CORE RULES:

* Exact seat matching only
* Only available tables shown
* Selected table must be used
* Prevent double booking
* Return "Already Occupied" if conflict
* Always commit DB transactions

FLOW:

1. Get availability
2. Select table
3. Validate
4. Create booking
5. Return booking details

WEEK STRUCTURE:

* Week 1: Foundation (completed)
* Week 2: Core logic + enhancements
* Week 3: UI polish + admin + demo

OUTPUT STYLE:

* Step-by-step
* Do not dump everything
* Keep code clean and modular

Start by continuing Week 2 implementation.
