-- ============================================
-- Restaurant Booking System — Database Schema
-- Week 3 — Clean schema with migration safety
-- ============================================

-- Drop legacy Week 1-2 tables (UUID-based, incompatible schema)
-- These were created by the Python backend and have different column names/types
DROP TABLE IF EXISTS waitlist CASCADE;
DROP TABLE IF EXISTS tables CASCADE;

-- Drop and recreate Week 3 tables to ensure correct schema
-- (fixes column mismatches like missing 'password' in users, 'status' vs 'booking_status' in bookings)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS restaurant_tables CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (Week 3: SERIAL id, with password + role)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Restaurant tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'maintenance')),
  UNIQUE(restaurant_id, table_number)
);

-- Bookings table (Week 3: uses 'booking_status' not 'status')
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  table_id INTEGER REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  booking_status VARCHAR(20) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Prevent double-booking (same table, same date, same time, active booking)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_booking
  ON bookings (table_id, booking_date, booking_time)
  WHERE booking_status IN ('pending', 'approved');

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
