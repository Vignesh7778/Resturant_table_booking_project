# 🍽️ Restaurant Table Booking Copilot — Week 1 Demo Guide

> **Status:** ✅ Backend + Database + Frontend fully connected and working.

---

## Step 1: Backend API Verification

> Backend runs at: `http://127.0.0.1:8000`  
> Interactive docs: `http://127.0.0.1:8000/docs`

### API 1 — `GET /availability`

**Request:**
```
GET http://127.0.0.1:8000/availability?booking_date=2026-05-20&booking_time=19:00&guest_count=4
```

**✅ Success Response (200):**
```json
[
  { "id": "abc123...", "table_name": "Center Table C1", "capacity": 4, "is_active": true },
  { "id": "def456...", "table_name": "Family Booth D1", "capacity": 4, "is_active": true },
  { "id": "ghi789...", "table_name": "Grand Booth E1",  "capacity": 6, "is_active": true }
]
```

**❌ No Availability Response (200 with empty array):**
```json
[]
```

---

### API 2 — `POST /bookings`

**Request Body:**
```json
{
  "user": {
    "name": "Prasanth Kumar",
    "email": "prasanth@example.com",
    "phone": "9874563201"
  },
  "booking_date": "2026-05-20",
  "booking_time": "19:00:00",
  "guest_count": 4
}
```

**✅ Success Response (200):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "booking_date": "2026-05-20",
  "booking_time": "19:00:00",
  "guest_count": 4,
  "status": "confirmed",
  "table_id": "abc123...",
  "user_id": "xyz789...",
  "created_at": "2026-05-03T15:00:00Z"
}
```

**❌ Error — No tables available (400):**
```json
{ "detail": "No tables available for the selected date, time, and guest count" }
```

**❌ Error — Past date (400):**
```json
{ "detail": "Cannot book in the past" }
```

---

### API 3 — `GET /bookings`

**Request:** `GET http://127.0.0.1:8000/bookings`

**✅ Success Response (200):** Returns array of all bookings (same structure as POST response).

---

### API 4 — `GET /bookings/{id}`

**Request:** `GET http://127.0.0.1:8000/bookings/3fa85f64-5717-4562-b3fc-2c963f66afa6`

**✅ Success Response (200):** Full booking object with nested `user` and `table` details.

**❌ Error (404):**
```json
{ "detail": "Booking not found" }
```

---

## Step 2: CRUD Verification

### CREATE — POST /bookings
Send the request above. Check Supabase to confirm the row appeared in the `bookings` table.

### READ ALL — GET /bookings
```
GET http://127.0.0.1:8000/bookings
```
Should return all 12 seeded bookings + any new ones you created.

### READ ONE — GET /bookings/{id}
Copy an `id` from the GET /bookings response and hit:
```
GET http://127.0.0.1:8000/bookings/<paste-id-here>
```

---

## Step 3: Supabase Database Verification

### Go to:
> Supabase Dashboard → SQL Editor → Run these queries:

```sql
-- Check all bookings with user and table info
SELECT 
  b.id,
  u.name AS guest_name,
  u.email,
  t.table_name,
  t.capacity,
  b.booking_date,
  b.booking_time,
  b.guest_count,
  b.status,
  b.created_at
FROM bookings b
JOIN users u ON u.id = b.user_id
JOIN tables t ON t.id = b.table_id
ORDER BY b.created_at DESC;

-- Summary count
SELECT 'Tables' AS entity, COUNT(*) AS total FROM tables
UNION ALL
SELECT 'Users',    COUNT(*) FROM users
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings;
```

**Expected Result:**
| entity | total |
|--------|-------|
| Tables | 12 |
| Users | 8+ |
| Bookings | 12+ |

---

## Step 4: Validation Rules

| Rule | Frontend Check | Backend Check | Error Message |
|---|---|---|---|
| All fields required | ✅ HTML `required` | ✅ Pydantic | Field missing error |
| Valid email | ✅ `type="email"` | ✅ `EmailStr` | Invalid email format |
| Guest count > 0 | ✅ `min="1"` | ✅ `Field(gt=0)` | Guest count must be > 0 |
| No past date | ✅ JS date check | ✅ `date < date.today()` | Cannot book in the past |
| No double booking | ❌ (backend only) | ✅ Conflict query | No tables available |

### Example Invalid Inputs:

**Invalid Email:**
```json
{ "user": { "email": "not-an-email" } }
```
→ `422 Unprocessable Entity`

**Guest count = 0:**
```json
{ "guest_count": 0 }
```
→ `422: Input should be greater than 0`

**Past date:**
```json
{ "booking_date": "2024-01-01" }
```
→ `400: Cannot book in the past`

---

## Step 5: Frontend UX Checklist

| Element | Status |
|---|---|
| Clean dark luxury theme | ✅ |
| Gold accent colors | ✅ |
| Section labels (Guest Info / Reservation Details) | ✅ |
| Input focus glow effect | ✅ |
| Available table badges shown after check | ✅ |
| Confirm button only appears after availability check | ✅ |
| Success message with booking ID | ✅ |
| Error message in red box | ✅ |
| Form clears after successful booking | ✅ |
| Responsive layout | ✅ |

---

## Step 6: End-to-End Manual Test Cases

### Test 1 ✅ — Valid Booking (PASS)
- **Input:** Future date, valid email, 4 guests
- **Check Availability →** Shows 3+ tables
- **Confirm →** Success message with Booking ID
- **Supabase →** New row appears in `bookings`

---

### Test 2 ❌ — Duplicate Booking (FAIL expected)
- **Input:** Same date, time, guest count as an existing booking
- **For this test:** Re-use `2026-05-10` at `18:00` (already booked for "Window Table A2")
- **Expected:** Window Table A2 is NOT shown in available tables (conflict prevented!)

---

### Test 3 ❌ — Invalid Email (FAIL expected)
- **Input:** Name="Test", Email="notvalid", Phone="123"
- **Expected:** Browser blocks submission (HTML validation) or 422 from backend

---

### Test 4 ❌ — Guest Count Too High (FAIL expected)
- **Input:** Guest count = `9`
- **Available tables:** Only "Private Dining F1" (capacity 8) → returns empty
- **Expected message:** "No tables available for this date, time, and guest count"

---

### Test 5 ❌ — Past Date (FAIL expected)
- **Input:** Date = `2024-01-01`
- **Frontend:** "Cannot book a table in the past" (blocked before API call)
- **Backend:** Even if called directly → `400: Cannot book in the past`

---

## Step 7: Demo Script (For Management)

> Present this flow live:

**Step 1 — Open the app**
> "This is our Restaurant Table Booking Copilot. The UI connects to a real FastAPI backend and Supabase PostgreSQL database."

**Step 2 — Fill in guest details**
> Enter: Name, Email, Phone, a future date, a time, and 4 guests.

**Step 3 — Check Availability**
> Click "Check Availability".
> "The system queries the database, filters tables by capacity, checks for conflicts, and returns only truly available tables."

**Step 4 — Show available table badges**
> "You can see the available tables with their names and seating capacity, sorted smallest-fit first."

**Step 5 — Confirm Booking**
> Click "Confirm Reservation".
> "The booking is now saved to Supabase with a unique ID."

**Step 6 — Verify in Supabase**
> Open Supabase Dashboard → Table Editor → bookings.
> "You can see the new record here in real-time."

**Step 7 — Try a duplicate**
> Use the same date/time/guest count.
> "The system prevents double booking — this slot is now taken."

---

## Step 8: Debug Checklist

If something is not working, check these in order:

| # | Check | How to verify |
|---|---|---|
| 1 | Backend running | Terminal shows `Application startup complete` |
| 2 | Supabase connected | No `OperationalError` in backend logs |
| 3 | API accessible | Visit `http://127.0.0.1:8000/docs` in browser |
| 4 | Frontend connected | Network tab in DevTools shows requests to `127.0.0.1:8000` |
| 5 | Data in Supabase | Run `SELECT COUNT(*) FROM bookings` in SQL Editor |
| 6 | CORS working | No `CORS error` in browser console |
| 7 | .env loaded | `DATABASE_URL` is not `None` (check config.py `print(settings.DATABASE_URL)`) |
| 8 | venv active | Terminal shows `(venv)` prefix |

---

## ✅ Week 1 Completion Status

| Area | Status |
|---|---|
| FastAPI Backend | ✅ Complete |
| 4 REST APIs | ✅ Complete |
| Supabase Integration | ✅ Complete |
| Validation (backend + frontend) | ✅ Complete |
| Conflict Prevention | ✅ Complete |
| Smallest-Fit Table Allocation | ✅ Complete |
| Premium React UI | ✅ Complete |
| Sample Data (12 tables, 8 users, 12 bookings) | ✅ Complete |
| End-to-End Flow | ✅ Verified |

> 🚀 **Week 1 is DONE. Ready for management demo. Ready for Week 2.**
