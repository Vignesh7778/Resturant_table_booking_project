const pool = require('../config/db');

// GET /api/staff/bookings
const getAllBookings = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    let query = `SELECT b.*, u.name as customer_name, u.email as customer_email,
                        rt.table_number, rt.capacity, r.name as restaurant_name
                 FROM bookings b
                 JOIN users u ON b.user_id = u.id
                 JOIN restaurant_tables rt ON b.table_id = rt.id
                 JOIN restaurants r ON rt.restaurant_id = r.id`;
    const conditions = [];
    const params = [];

    if (status) { params.push(status); conditions.push(`b.booking_status = $${params.length}`); }
    if (date) { params.push(date); conditions.push(`b.booking_date = $${params.length}`); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY b.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, bookings: result.rows });
  } catch (err) {
    next(err);
  }
};

// PUT /api/staff/approve/:id
const approveBooking = async (req, res, next) => {
  try {
    const result = await pool.query(
      "UPDATE bookings SET booking_status = 'approved' WHERE id = $1 AND booking_status = 'pending' RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or not pending.' });
    }
    res.json({ success: true, message: 'Booking approved.', booking: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/staff/reject/:id
const rejectBooking = async (req, res, next) => {
  try {
    const result = await pool.query(
      "UPDATE bookings SET booking_status = 'rejected' WHERE id = $1 AND booking_status = 'pending' RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or not pending.' });
    }
    res.json({ success: true, message: 'Booking rejected.', booking: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBookings, approveBooking, rejectBooking };
