# 🏓 Ping Pong Leaderboard

A simple local web app to track ping pong matches, wins/losses, and leaderboard rankings — built with Express, PostgreSQL, and vanilla JS.

## 📋 Features

- Add matches between two players with win counts
- Automatically updates leaderboard with win/loss stats and win percentage
- Match history list with winner, players, and timestamp (in LA time)
- Fully LAN-accessible for local network multiplayer setups
- Saves all data in PostgreSQL

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL
- **Other**: dotenv, pg

## 🚀 How to Run

1. Clone the repo:
   ```bash
   git clone https://github.com/georgepatterson2002/pingpong-leaderboard.git
   cd pingpong-leaderboard
   ```

2. Create a `.env` file (not included):
   ```env
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=ping
   PGUSER=postgres
   PGPASSWORD=your_password_here
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open in your browser:
   ```
   http://localhost:3000
   ```

## 🗄️ Database Schema

```sql
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  player1_id INT REFERENCES players(id),
  player2_id INT REFERENCES players(id),
  winner_id INT REFERENCES players(id),
  match_date TIMESTAMP NOT NULL
);
```

> Make sure to pre-insert players before starting.

---

## 📦 Status

✅ Project is complete and running locally  
🛠️ Future ideas: reset button, stats page, export to CSV
