// Retrieve the teams from localStorage
let teams = JSON.parse(localStorage.getItem('teams'));

// Populate team dropdowns
const teamSelect1 = document.getElementById('teamSelect1');
const teamSelect2 = document.getElementById('teamSelect2');

teams.forEach(team => {
    let option1 = document.createElement('option');
    option1.value = team.name;
    option1.textContent = team.name;
    teamSelect1.appendChild(option1);

    let option2 = document.createElement('option');
    option2.value = team.name;
    option2.textContent = team.name;
    teamSelect2.appendChild(option2);
});

// Game state variables
let homeTeam = null;
let awayTeam = null;
let period = 1;
let homeScore = 0;
let awayScore = 0;
let playByPlay = [];

// DOM Elements
const startGameBtn = document.getElementById('startGameBtn');
const simulatePeriodBtn = document.getElementById('simulatePeriodBtn');
const homeTeamName = document.getElementById('homeTeamName');
const awayTeamName = document.getElementById('awayTeamName');
const periodElement = document.getElementById('period');
const scoreElement = document.getElementById('score');
const playByPlayList = document.getElementById('playByPlay');

// Event listener for starting the game
startGameBtn.addEventListener('click', () => {
    const homeTeamNameSelected = teamSelect1.value;
    const awayTeamNameSelected = teamSelect2.value;

    if (!homeTeamNameSelected || !awayTeamNameSelected) {
        alert('Please select both home and away teams.');
        return;
    }

    homeTeam = teams.find(team => team.name === homeTeamNameSelected);
    awayTeam = teams.find(team => team.name === awayTeamNameSelected);

    homeTeamName.textContent = homeTeam.name;
    awayTeamName.textContent = awayTeam.name;
    scoreElement.textContent = `${homeScore} - ${awayScore}`;
    playByPlay = [];
    updatePlayByPlay();

    // Disable the team select dropdowns once teams are selected
    teamSelect1.disabled = true;
    teamSelect2.disabled = true;
});

// Event listener for simulating a period
simulatePeriodBtn.addEventListener('click', () => {
    if (!homeTeam || !awayTeam) {
        alert('Please start a game first.');
        return;
    }

    simulatePeriod();
    period++;
    periodElement.textContent = period;
});

// Function to simulate a period of the game
function simulatePeriod() {
    // Simulate events like goals, assists, and penalties
    simulateGoal(homeTeam);
    simulateGoal(awayTeam);
    simulatePenalty(homeTeam);
    simulatePenalty(awayTeam);

    // Update score
    scoreElement.textContent = `${homeScore} - ${awayScore}`;

    // Update play-by-play
    updatePlayByPlay();
}

// Function to simulate a goal
function simulateGoal(team) {
    let scorer = getRandomPlayer(team);
    let assist = getRandomPlayer(team);

    // Calculate the chance of scoring based on player skills
    let goalChance = scorer.skills.glove * Math.random();
    if (goalChance > 75) {
        if (team === homeTeam) homeScore++;
        else awayScore++;

        let goalMessage = `${scorer.name} scores for ${team.name}! Assist by ${assist.name}`;
        playByPlay.push(goalMessage);
    }
}

// Function to simulate a penalty
function simulatePenalty(team) {
    let penalizedPlayer = getRandomPlayer(team);
    playByPlay.push(`${penalizedPlayer.name} from ${team.name} is penalized.`);
}

// Helper function to get a random player from a team
function getRandomPlayer(team) {
    return team.players[Math.floor(Math.random() * team.players.length)];
}

// Function to update the play-by-play list
function updatePlayByPlay() {
    playByPlayList.innerHTML = '';
    playByPlay.forEach(event => {
        let li = document.createElement('li');
        li.textContent = event;
        playByPlayList.appendChild(li);
    });
}
