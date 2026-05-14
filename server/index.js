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
const apiRouter = express.Router();
apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/restaurants', require('./routes/restaurants'));
apiRouter.use('/bookings', require('./routes/bookings'));
apiRouter.use('/staff', require('./routes/staff'));
apiRouter.use('/admin', require('./routes/admin'));

// Vercel experimentalServices strips the "/api" prefix. 
// Locally we need "/api", but on Vercel we mount at "/"
const prefix = process.env.VERCEL ? '/' : '/api';
app.use(prefix, apiRouter);

// ── Health check ──
app.get(process.env.VERCEL ? '/' : '/api', (req, res) => {
  res.json({ message: 'Restaurant Booking API is running', version: '3.0.0' });
});

// ── Error handler ──
app.use(errorHandler);

// ── Initialize DB schema + start server (Only for local dev) ──
async function startServer() {
  // Skip migrations and app.listen in Vercel serverless environment
  if (process.env.VERCEL) return;

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

// Required for Vercel deployment
module.exports = app;
