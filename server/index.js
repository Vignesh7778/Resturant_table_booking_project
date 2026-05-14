const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const pool = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/admin', require('./routes/admin'));

// ── Health check ──
app.get('/', (req, res) => {
  res.json({ message: 'Restaurant Booking API is running', version: '3.0.0' });
});

// ── Error handler ──
app.use(errorHandler);

// ── Initialize DB schema + start server ──
async function startServer() {
  try {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schema);
    console.log('[OK] Database schema initialized');

    const seedPath = path.join(__dirname, 'database', 'seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf-8');
    await pool.query(seed);
    console.log('[OK] Seed data loaded');
  } catch (err) {
    console.error('[WARN] DB init:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`[OK] Server running on http://localhost:${PORT}`);
  });
}

startServer();
