import { checkPenalties } from './penalties.js';
import { checkInjuries } from './injuries.js';
import { updatePlayByPlay } from './play_by_play.js';

// Retrieve teams from localStorage (assuming they are stored there)
const teams = JSON.parse(localStorage.getItem('teams')) || []; // Default to an empty array if no teams are found

// Retrieve players from localStorage or a default empty array
const players = JSON.parse(localStorage.getItem('players')) || []; // You should have players data stored here

// Function to get a player by their ID
function getPlayerById(playerId) {
  return players.find(player => player.id === playerId);
}

// Function to get a random player from a team's line (using lineAssignments)
function getRandomSkaterFromLine(team) {
  const skaters = [];

  // Add all forwards (LW, C, RW) to the skaters array
  Object.values(team.lineAssignments.forwardLines).forEach(line => {
    if (line.LW) {
      const player = getPlayerById(line.LW);
      if (player) skaters.push(player);
    }
    if (line.C) {
      const player = getPlayerById(line.C);
      if (player) skaters.push(player);
    }
    if (line.RW) {
      const player = getPlayerById(line.RW);
      if (player) skaters.push(player);
    }
  });

  // Add all defensemen (LD, RD) to the skaters array
  Object.values(team.lineAssignments.defenseLines).forEach(line => {
    if (line.LD) {
      const player = getPlayerById(line.LD);
      if (player) skaters.push(player);
    }
    if (line.RD) {
      const player = getPlayerById(line.RD);
      if (player) skaters.push(player);
    }
  });

  // Exclude the goalie (Starter or Backup)
  const homeGoalieIds = [
    team.lineAssignments.goalies.Starter,
    team.lineAssignments.goalies.Backup
  ];

  // Filter out goalies from the skaters array
  const skatersWithoutGoalie = skaters.filter(player => !homeGoalieIds.includes(player.id));

  // Return a random skater from the filtered list
  if (skatersWithoutGoalie.length === 0) {
    console.error("No skaters found (excluding goalie).");
    return null;
  }

  return skatersWithoutGoalie[Math.floor(Math.random() * skatersWithoutGoalie.length)];
}

// Function to simulate a goal chance based on shooter and goalie skills
function attemptGoal(shooter, goalie) {
  if (!shooter || !goalie) {
    console.error("Shooter or Goalie is undefined");
    return false; // Return false if either the shooter or goalie is undefined
  }

  // Calculate a chance of scoring based on shooter and goalie skills
  const shooterSkill = shooter.skills.stick + shooter.skills.speed;
  const goalieSkill = goalie.skills.glove + goalie.skills.legs;
  
  const chanceToScore = shooterSkill - goalieSkill;
  const randomChance = Math.random() * 100;

  return randomChance < chanceToScore; // If random chance is lower than the scoring chance, it's a goal
}

// Function to simulate a period of the game
function simulatePeriod(period) {
  const homeTeamName = document.getElementById('teamSelect1').value;
  const awayTeamName = document.getElementById('teamSelect2').value;

  const homeTeam = teams.find(team => team.name === homeTeamName);
  const awayTeam = teams.find(team => team.name === awayTeamName);

  // Log teams and players for debugging
  console.log('Home Team:', homeTeam);
  console.log('Away Team:', awayTeam);

  // Select random skater for home team (excluding goalie)
  const homeForward = getRandomSkaterFromLine(homeTeam); // Get a random skater (not the goalie) for the home team
  const awayGoalie = getRandomPlayerFromLine(awayTeam, 'Starter'); // Starter goalie for away team

  console.log("Home Forward:", homeForward); // Log to check if forward is selected correctly
  console.log("Away Goalie:", awayGoalie); // Log to check if goalie is selected correctly

  // Check if either homeForward or awayGoalie is missing
  if (!homeForward || !awayGoalie) {
    console.error("Invalid player data. Cannot simulate goal.");
    return; // Exit early if invalid player data
  }

  // Simulate a goal attempt
  const goalScored = attemptGoal(homeForward, awayGoalie);

  const homeScore = goalScored ? 1 : 0;
  const awayScore = Math.floor(Math.random() * 5); // Random away team score for simplicity

  // Update the score display
  document.getElementById('score').textContent = `${homeTeamName} ${homeScore} - ${awayScore} ${awayTeamName}`;

  // Update play-by-play
  updatePlayByPlay(period, goalScored, homeForward, awayGoalie);
}


  // Simulate a goal attempt
  const goalScored = attemptGoal(homeForward, awayGoalie);

  const homeScore = goalScored ? 1 : 0;
  const awayScore = Math.floor(Math.random() * 5); // Random away team score for simplicity

  // Update the score display
  document.getElementById('score').textContent = `${homeTeamName} ${homeScore} - ${awayScore} ${awayTeamName}`;

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
