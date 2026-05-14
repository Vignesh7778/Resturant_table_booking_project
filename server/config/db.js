const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test connection on import
pool.query('SELECT NOW()')
  .then(() => console.log('[OK] PostgreSQL connected'))
  .catch((err) => console.error('[FAIL] PostgreSQL connection error:', err.message));

module.exports = pool;
