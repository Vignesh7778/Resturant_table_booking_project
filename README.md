# 🍽️ Restaurant Table Booking Copilot

A production-style restaurant table reservation system built with **FastAPI**, **Supabase (PostgreSQL)**, and **React**.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + SQLAlchemy |
| Database | Supabase (PostgreSQL) |
| Frontend | React + Vite |

---

## 📁 Project Structure

```
Resturant_project/
├── backend/
│   ├── core/           # Config & environment
│   ├── db/             # Database connection
│   ├── models/         # SQLAlchemy ORM models
│   ├── schemas/        # Pydantic request/response schemas
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   ├── main.py         # FastAPI entry point
│   ├── requirements.txt
│   └── .env            # Environment variables (DATABASE_URL)
│
└── frontend/
    ├── src/
    │   ├── utils/      # Supabase client
    │   ├── App.jsx     # Main booking page
    │   └── index.css   # Styling
    └── .env            # Vite environment variables
```

---

## ⚙️ Backend Setup & Running

### 1. Go to the backend folder
```cmd
cd backend
```

### 2. Create and activate virtual environment
```cmd
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies
```cmd
pip install -r requirements.txt
```

### 4. Set up environment variables
Create a `.env` file in the `backend/` folder:
```env
DATABASE_URL=postgresql://postgres:<your-password>@db.<your-ref>.supabase.co:5432/postgres
```

### 5. Run the backend server
```cmd
uvicorn main:app --reload
```

**✅ Backend runs at:** `http://127.0.0.1:8000`  
**📖 API Docs at:** `http://127.0.0.1:8000/docs`

---

## 🎨 Frontend Setup & Running

### 1. Go to the frontend folder
```cmd
cd frontend
```

### 2. Install dependencies
```cmd
npm install
```

### 3. Run the development server
```cmd
npm run dev
```

**✅ Frontend runs at:** `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/availability` | Check available tables |
| `POST` | `/bookings` | Create a new booking |
| `GET` | `/bookings` | List all bookings |
| `GET` | `/bookings/{id}` | Get booking details |

### Example: Check Availability
```
GET /availability?booking_date=2026-05-20&booking_time=19:00&guest_count=4
```

### Example: Create Booking
```json
POST /bookings
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "booking_date": "2026-05-20",
  "booking_time": "19:00:00",
  "guest_count": 4
}
```

---

## 🛡️ Validation Rules

- All fields are required
- Valid email format enforced
- Guest count must be greater than 0
- Cannot book a date/time in the past
- Double booking is automatically prevented

---

## 🗄️ Database Setup (Supabase)

Run this SQL once in your **Supabase SQL Editor**:

```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    table_id UUID REFERENCES tables(id),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    guest_count INTEGER NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample table data
INSERT INTO tables (table_name, capacity, is_active) VALUES
    ('Window Table A1', 2, TRUE), ('Window Table A2', 2, TRUE),
    ('Family Booth D1', 4, TRUE), ('Family Booth D2', 4, TRUE),
    ('Grand Booth E1',  6, TRUE), ('Private Dining F1', 8, TRUE)
ON CONFLICT DO NOTHING;
```

---

## 🚀 Running Both Servers

Open **two separate** terminal windows:

**Terminal 1 (Backend):**
```cmd
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

**Terminal 2 (Frontend):**
```cmd
cd frontend
npm run dev
```

Then open 👉 **http://localhost:5173**

---

## 📊 Week 1 Features

- ✅ Table availability checking
- ✅ Smart table allocation (smallest fit first)
- ✅ Double booking prevention
- ✅ Supabase PostgreSQL integration
- ✅ Premium dark luxury UI
- ✅ Input validation (frontend + backend)

---

*Week 2 will add: Smart allocation engine, waitlist, booking updates, and admin dashboard.*
