const pool = require('../config/db');

// GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Prevent deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const restaurants = await pool.query('SELECT COUNT(*) FROM restaurants');
    const totalBookings = await pool.query('SELECT COUNT(*) FROM bookings');
    const pending = await pool.query("SELECT COUNT(*) FROM bookings WHERE booking_status = 'pending'");
    const approved = await pool.query("SELECT COUNT(*) FROM bookings WHERE booking_status = 'approved'");

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(users.rows[0].count),
        totalRestaurants: parseInt(restaurants.rows[0].count),
        totalBookings: parseInt(totalBookings.rows[0].count),
        pendingBookings: parseInt(pending.rows[0].count),
        approvedBookings: parseInt(approved.rows[0].count),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, deleteUser, getDashboardStats };
