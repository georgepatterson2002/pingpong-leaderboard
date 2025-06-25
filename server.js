const express = require('express');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 3000;

const pool = new Pool();

app.use(express.static(__dirname));
app.use(express.json());

// Fetch matches and players
app.get('/matches', async (req, res) => {
  try {
    const players = await pool.query('SELECT name FROM players ORDER BY name');
    const matches = await pool.query(`
      SELECT
        p1.name AS player1,
        p2.name AS player2,
        w.name AS winner,
        match_date AS date
      FROM matches
      JOIN players p1 ON matches.player1_id = p1.id
      JOIN players p2 ON matches.player2_id = p2.id
      JOIN players w ON matches.winner_id = w.id
      ORDER BY match_date ASC
    `);

    res.json({
      players: players.rows.map(r => r.name),
      matches: matches.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Add one or many matches
app.post('/add-match', async (req, res) => {
  const client = await pool.connect();
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body];
    for (const match of data) {
      const { player1, player2, winner, date } = match;

      const p1 = await client.query('SELECT id FROM players WHERE name = $1', [player1]);
      const p2 = await client.query('SELECT id FROM players WHERE name = $1', [player2]);
      const win = await client.query('SELECT id FROM players WHERE name = $1', [winner]);

      await client.query(`
        INSERT INTO matches (player1_id, player2_id, winner_id, match_date)
        VALUES ($1, $2, $3, $4)
      `, [
        p1.rows[0].id,
        p2.rows[0].id,
        win.rows[0].id,
        date
      ]);
    }

    // Return updated match data
    const players = await pool.query('SELECT name FROM players ORDER BY name');
    const matches = await pool.query(`
      SELECT
        p1.name AS player1,
        p2.name AS player2,
        w.name AS winner,
        match_date AS date
      FROM matches
      JOIN players p1 ON matches.player1_id = p1.id
      JOIN players p2 ON matches.player2_id = p2.id
      JOIN players w ON matches.winner_id = w.id
      ORDER BY match_date ASC
    `);

    res.json({
      players: players.rows.map(r => r.name),
      matches: matches.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to save match");
  } finally {
    client.release();
  }
});

// Detect LAN IP
const os = require('os');
const interfaces = os.networkInterfaces();
let localIP = 'localhost';

for (const name in interfaces) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      localIP = iface.address;
    }
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://${localIP}:${PORT}`);
});
