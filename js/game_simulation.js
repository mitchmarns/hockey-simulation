import { checkPenalties } from './penalties.js';
import { checkInjuries } from './injuries.js';
import { updatePlayByPlay } from './play_by_play.js';

// Retrieve teams from localStorage (assuming they are stored there)
const teams = JSON.parse(localStorage.getItem('teams')) || []; // Default to an empty array if no teams are found

// Function to get a random player from a team's forward or defense lines
function getRandomPlayerFromLine(team, lineType) {
  const line = team.lines[lineType]; // forwardLines, defenseLines, etc.
  const allPlayers = [];

  line.forEach(position => {
    Object.values(position).forEach(player => {
      if (player) allPlayers.push(player);
    });
  });

  return allPlayers[Math.floor(Math.random() * allPlayers.length)];
}

// Function to simulate a goal chance based on shooter and goalie skills
function attemptGoal(shooter, goalie) {
  // Calculate a chance of scoring based on shooter and goalie skills
  const shooterSkill = shooter.skills.stick + shooter.skills.speed;
  const goalieSkill = goalie.skills.glove + goalie.skills.legs;
  
  const chanceToScore = shooterSkill - goalieSkill;
  const randomChance = Math.random() * 100;

  return randomChance < chanceToScore; // If random chance is lower than the scoring chance, it's a goal
}

// Function to simulate a period of the game
function simulatePeriod(period) {
  const homeTeam = document.getElementById('teamSelect1').value;
  const awayTeam = document.getElementById('teamSelect2').value;

  const homeTeamData = teams.find(team => team.name === homeTeam);
  const awayTeamData = teams.find(team => team.name === awayTeam);

  // Select random players for a scoring opportunity
  const homeForward = getRandomPlayerFromLine(homeTeamData, 'forwardLines');
  const awayGoalie = awayTeamData.lines.goalies.starter;

  // Simulate a goal attempt
  const goalScored = attemptGoal(homeForward, awayGoalie);

  const homeScore = goalScored ? 1 : 0;
  const awayScore = Math.floor(Math.random() * 5); // Random away team score for simplicity

  // Update the score display
  document.getElementById('score').textContent = `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`;

  // Update play-by-play
  updatePlayByPlay(period, goalScored, homeForward, awayGoalie);
}

// Function to simulate the entire game
function simulateGame() {
  let period = 1;
  let gameOver = false;

  while (!gameOver) {
    simulatePeriod(period);

    // Check penalties
    checkPenalties();

    // Check injuries
    checkInjuries();

    // Update play-by-play
    updatePlayByPlay(period);

    if (period >= 3) {
      gameOver = true;
    } else {
      period++;
    }
  }
}

// Function to populate the team dropdowns
function populateTeamDropdowns() {
  const teamSelect1 = document.getElementById('teamSelect1');
  const teamSelect2 = document.getElementById('teamSelect2');

  teamSelect1.innerHTML = '<option value="" disabled selected>Select a team</option>';
  teamSelect2.innerHTML = '<option value="" disabled selected>Select a team</option>';

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

// Call to populate the team dropdowns when the page loads
populateTeamDropdowns();
