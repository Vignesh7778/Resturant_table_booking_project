const pool = require('../config/db');

// GET /api/restaurants
const getAllRestaurants = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM restaurants ORDER BY created_at DESC';
    let params = [];

    if (search) {
      query = 'SELECT * FROM restaurants WHERE name ILIKE $1 OR location ILIKE $1 ORDER BY created_at DESC';
      params = [`%${search}%`];
    }

    const result = await pool.query(query, params);
    res.json({ success: true, restaurants: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/restaurants/:id
const getRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant = await pool.query('SELECT * FROM restaurants WHERE id = $1', [id]);
    if (restaurant.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }

    const tables = await pool.query(
      'SELECT * FROM restaurant_tables WHERE restaurant_id = $1 ORDER BY table_number',
      [id]
    );

    res.json({
      success: true,
      restaurant: restaurant.rows[0],
      tables: tables.rows,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/restaurants (admin)
const createRestaurant = async (req, res, next) => {
  try {
    const { name, location, description, image_url } = req.body;
    if (!name || !location) {
      return res.status(400).json({ success: false, message: 'Name and location are required.' });
    }

    const result = await pool.query(
      'INSERT INTO restaurants (name, location, description, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, location, description || '', image_url || '']
    );

    res.status(201).json({ success: true, restaurant: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/restaurants/:id (admin)
const updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, description, image_url } = req.body;

    const result = await pool.query(
      'UPDATE restaurants SET name = COALESCE($1, name), location = COALESCE($2, location), description = COALESCE($3, description), image_url = COALESCE($4, image_url) WHERE id = $5 RETURNING *',
      [name, location, description, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }

    res.json({ success: true, restaurant: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/restaurants/:id (admin)
const deleteRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM restaurants WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }

    res.json({ success: true, message: 'Restaurant deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllRestaurants, getRestaurant, createRestaurant, updateRestaurant, deleteRestaurant };
