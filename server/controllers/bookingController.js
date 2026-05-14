const pool = require('../config/db');

// GET /api/bookings/available-tables
const getAvailableTables = async (req, res, next) => {
  try {
    const { restaurant_id, booking_date, booking_time, guests } = req.query;
    if (!restaurant_id || !booking_date || !booking_time || !guests) {
      return res.status(400).json({ success: false, message: 'restaurant_id, booking_date, booking_time, and guests are required.' });
    }

    const guestCount = parseInt(guests);

    // Fetch ALL tables for this restaurant with their booking status for this slot
    const allTablesResult = await pool.query(
      `SELECT rt.*,
        CASE WHEN EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.table_id = rt.id
            AND b.booking_date = $2
            AND b.booking_time = $3
            AND b.booking_status IN ('pending', 'approved')
        ) THEN true ELSE false END AS is_booked
       FROM restaurant_tables rt
       WHERE rt.restaurant_id = $1
         AND rt.status = 'available'
       ORDER BY rt.capacity ASC, rt.table_number ASC`,
      [restaurant_id, booking_date, booking_time]
    );

    const allTables = allTablesResult.rows;
    const freeTables = allTables.filter(t => !t.is_booked);

    // Step 1: Try exact capacity match
    let suitableTables = freeTables.filter(t => t.capacity === guestCount);
    let matchType = 'exact';

    // Step 2: If no exact match, find nearest larger capacity
    if (suitableTables.length === 0) {
      const largerTables = freeTables.filter(t => t.capacity > guestCount);
      if (largerTables.length > 0) {
        // Get the smallest capacity that's still larger than guest count
        const nearestCapacity = Math.min(...largerTables.map(t => t.capacity));
        suitableTables = largerTables.filter(t => t.capacity === nearestCapacity);
        matchType = 'nearest';
      }
    }

    const tables = suitableTables.map(t => ({
      id: t.id,
      table_number: t.table_number,
      capacity: t.capacity,
      status: t.status,
      is_best_match: true,
      capacity_diff: t.capacity - guestCount,
    }));

    // Summary
    const totalTablesInRestaurant = allTables.length;
    const bookedCount = allTables.filter(t => t.is_booked).length;

    res.json({
      success: true,
      tables,
      meta: {
        guest_count: guestCount,
        match_type: matchType,
        total_tables: totalTablesInRestaurant,
        booked: bookedCount,
        available: tables.length,
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { table_id, booking_date, booking_time, guests } = req.body;
    const user_id = req.user.id;

    if (!table_id || !booking_date || !booking_time || !guests) {
      return res.status(400).json({ success: false, message: 'All booking fields are required.' });
    }

    // Validate not past date
    if (new Date(booking_date) < new Date(new Date().toDateString())) {
      return res.status(400).json({ success: false, message: 'Cannot book in the past.' });
    }

    // Check table exists and has enough capacity
    const table = await pool.query('SELECT * FROM restaurant_tables WHERE id = $1', [table_id]);
    if (table.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Table not found.' });
    }
    if (table.rows[0].capacity < guests) {
      return res.status(400).json({ success: false, message: 'Table capacity insufficient for your party size.' });
    }

    // Check for conflict
    const conflict = await pool.query(
      `SELECT id FROM bookings
       WHERE table_id = $1 AND booking_date = $2 AND booking_time = $3
       AND booking_status IN ('pending', 'approved')`,
      [table_id, booking_date, booking_time]
    );
    if (conflict.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Table already booked for this slot.' });
    }

    const result = await pool.query(
      'INSERT INTO bookings (user_id, table_id, booking_date, booking_time, guests) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, table_id, booking_date, booking_time, guests]
    );

    res.status(201).json({ success: true, message: 'Booking created!', booking: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.*, rt.table_number, rt.capacity, r.name as restaurant_name, r.location
       FROM bookings b
       JOIN restaurant_tables rt ON b.table_id = rt.id
       JOIN restaurants r ON rt.restaurant_id = r.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, bookings: result.rows });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE bookings SET booking_status = 'cancelled' WHERE id = $1 AND user_id = $2 AND booking_status IN ('pending', 'approved') RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or already cancelled.' });
    }

    res.json({ success: true, message: 'Booking cancelled.', booking: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAvailableTables, createBooking, getMyBookings, cancelBooking };
