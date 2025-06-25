const form = document.getElementById('matchForm');
const winnerSelect = document.getElementById('winner');
const loserSelect = document.getElementById('loser');
const leaderboardBody = document.querySelector('#leaderboard tbody');
const matchHistory = document.getElementById('matchHistory');
const toggleEmoji = document.getElementById("crazyToggle");
const ball = document.querySelector(".pingpong-ball");

// Data state
let matches = [];
let players = [];
let usedMemeNames = new Set();

document.addEventListener('DOMContentLoaded', () => {
  
  function dropConfetti() {
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.textContent = ['🏓','🤣','🤪','🌀','✨'][Math.floor(Math.random() * 5)];
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-50px';
    confetti.style.fontSize = '24px';
    confetti.style.animation = 'fall 3s ease-out forwards';
    confetti.style.zIndex = 9999;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

  toggleEmoji.addEventListener("click", () => {
    document.body.classList.toggle("crazy-mode");
    if (document.body.classList.contains("crazy-mode")) {
      ball.style.display = "block";
      dropConfetti();
    } else {
      ball.style.display = "none";
    }

    if (document.body.classList.contains("crazy-mode")) {
      const memePool = ['🧠 Pongus', 'Mr. Smash', 'Spinny Guy', 'PingDing', 'Table Titan'];
      const shuffledMemePool = memePool.slice().sort(() => Math.random() - 0.5);

      let i = 0;

      document.querySelectorAll('#leaderboard td:first-child').forEach(cell => {
        if (!cell.dataset.original) {
          cell.dataset.original = cell.textContent;
        }

        // Reset used names if we exhausted all
        if (usedMemeNames.size === memePool.length) {
          usedMemeNames.clear();
        }

        // Pick next available unique name
        while (i < shuffledMemePool.length) {
          const name = shuffledMemePool[i++];
          if (!usedMemeNames.has(name)) {
            cell.textContent = name;
            usedMemeNames.add(name);
            break;
          }
        }
      });

    } else {
      document.querySelectorAll('#leaderboard td:first-child').forEach(cell => {
        if (cell.dataset.original) {
          cell.textContent = cell.dataset.original;
        }
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const winner = winnerSelect.value;
    const loser = loserSelect.value;
    const winnerCount = parseInt(document.getElementById('winnerCount').value, 10);
    const loserCount = parseInt(document.getElementById('loserCount').value, 10);

    if (winner === loser) {
      alert("Winner and loser must be different.");
      return;
    }

    if (isNaN(winnerCount) || isNaN(loserCount) || (winnerCount + loserCount) === 0) {
      alert("Please enter at least one game.");
      return;
    }

    const matchesToSend = [];

    for (let i = 0; i < winnerCount; i++) {
      matchesToSend.push({
        player1: winner,
        player2: loser,
        winner,
        date: new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })).toISOString()
      });
    }

    for (let i = 0; i < loserCount; i++) {
      matchesToSend.push({
        player1: loser,
        player2: winner,
        winner: loser,
        date: new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })).toISOString()
      });
    }

    fetch('/add-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchesToSend)
    })
      .then(res => res.json())
      .then(data => {
        matches = data.matches;
        updateDisplay();
        form.reset();
        populateDropdowns(players);
      });
  });

  winnerSelect.addEventListener('change', preventDuplicateSelection);
  loserSelect.addEventListener('change', preventDuplicateSelection);
});

fetch('/matches')
  .then(res => res.json())
  .then(data => {
    matches = data.matches;
    players = data.players;
    populateDropdowns(players);
    preventDuplicateSelection();
    updateDisplay();
  })
  .catch(err => {
    alert("Failed to load data from server.");
    console.error("Fetch error:", err);
  });

function populateDropdowns(playerList) {
  [winnerSelect, loserSelect].forEach(select => {
    select.innerHTML = '';
    playerList.forEach(player => {
      const opt = document.createElement('option');
      opt.value = player;
      opt.textContent = player;
      select.appendChild(opt);
    });
  });

  if (playerList.length >= 2) {
    winnerSelect.value = playerList[0];
    loserSelect.value = playerList[1];
  } else if (playerList.length === 1) {
    winnerSelect.value = playerList[0];
    loserSelect.value = '';
  }

  preventDuplicateSelection();
}

function preventDuplicateSelection() {
  const winner = winnerSelect.value;
  const loser = loserSelect.value;

  [...winnerSelect.options].forEach(opt => {
    opt.disabled = opt.value === loser;
  });

  [...loserSelect.options].forEach(opt => {
    opt.disabled = opt.value === winner;
  });
}

function updateDisplay() {
  matchHistory.innerHTML = '';
  matches.slice().reverse().forEach(match => {
    const li = document.createElement('li');
    li.textContent = `${match.player1} vs ${match.player2} - Winner: ${match.winner}`;
    matchHistory.appendChild(li);
  });

  const stats = {};
  players.forEach(p => stats[p] = { wins: 0, losses: 0 });

  matches.forEach(match => {
    stats[match.winner].wins += 1;
    const loser = match.winner === match.player1 ? match.player2 : match.player1;
    stats[loser].losses += 1;
  });

  leaderboardBody.innerHTML = '';
  Object.entries(stats)
    .sort((a, b) => b[1].wins - a[1].wins)
    .forEach(([player, record]) => {
      const total = record.wins + record.losses;
      const winPct = total ? ((record.wins / total) * 100).toFixed(1) : '0.0';
      leaderboardBody.innerHTML += `<tr>
        <td>${player}</td>
        <td>${record.wins}</td>
        <td>${record.losses}</td>
        <td>${total}</td>
        <td>${winPct}%</td>
      </tr>`;
    });
}
