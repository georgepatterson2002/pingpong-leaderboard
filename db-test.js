require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool();

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("❌ Connection FAILED:", err.message);
  } else {
    console.log("✅ Connected! Server time is:", res.rows[0].now);
  }
  pool.end();
});
