import { checkPenalties } from './penalties.js';
import { checkInjuries } from './injuries.js';
import { updatePlayByPlay } from './play_by_play.js';

// Retrieve teams from localStorage (assuming they are stored there)
const teams = JSON.parse(localStorage.getItem('teams')) || []; // Default to an empty array if no teams are found

// Populate team dropdowns in the HTML
function populateTeamDropdowns() {
  const teamSelect1 = document.getElementById('teamSelect1');
  const teamSelect2 = document.getElementById('teamSelect2');

  // Clear existing options
  teamSelect1.innerHTML = '<option value="" disabled selected>Select a team</option>';
  teamSelect2.innerHTML = '<option value="" disabled selected>Select a team</option>';

  // Populate options with teams from localStorage
  teams.forEach(team => {
    const option1 = document.createElement('option');
    option1.value = team.name;
    option1.textContent = team.name;
    teamSelect1.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = team.name;
    option2.textContent = team.name;
    teamSelect2.appendChild(option2);
  });
}

// Simulate the game for a single period
function simulatePeriod(period) {
  // Get the home and away teams from the dropdowns
  const homeTeam = document.getElementById('teamSelect1').value;
  const awayTeam = document.getElementById('teamSelect2').value;

  // Generate random events for the period (e.g., scoring, penalties)
  const homeScore = Math.floor(Math.random() * 5); // Random home team score (0-4)
  const awayScore = Math.floor(Math.random() * 5); // Random away team score (0-4)

  // Update the score on the page
  document.getElementById('score').textContent = `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`;

  // Update play-by-play
  updatePlayByPlay(period);

  // more logic here
}

// Simulate the game
function simulateGame() {
  // Initialize game state
  let period = 1;
  let gameOver = false;

  while (!gameOver) {
    // Simulate period
    simulatePeriod(period);

    // Check penalties
    checkPenalties();

    // Check injuries
    checkInjuries();

    // Update play-by-play
    updatePlayByPlay(period);

    // Check if game is over
    if (period >= 3) {
      gameOver = true;
    } else {
      period++;
    }
  }
}

// Event listener to start the game simulation
document.getElementById('startGameBtn').addEventListener('click', () => {
  const homeTeam = document.getElementById('teamSelect1').value;
  const awayTeam = document.getElementById('teamSelect2').value;

  if (!homeTeam || !awayTeam) {
    alert('Please select both home and away teams!');
  } else {
    document.getElementById('homeTeamName').textContent = homeTeam;
    document.getElementById('awayTeamName').textContent = awayTeam;

    simulateGame();
  }
});

// Call this function on page load to populate the team dropdowns
populateTeamDropdowns();
