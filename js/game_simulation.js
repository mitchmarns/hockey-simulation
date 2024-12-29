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
let overtime = false; // Flag to check if the game is in overtime

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

    // Reset game state
    period = 1;
    overtime = false;
    homeScore = 0;
    awayScore = 0;
    playByPlay = [];
    simulatePeriodBtn.disabled = false; // Enable the simulate button for the new game
    teamSelect1.disabled = true; // Lock team selection
    teamSelect2.disabled = true; // Lock team selection

    // Update UI
    periodElement.textContent = period;
    scoreElement.textContent = `${homeScore} - ${awayScore}`;
    updatePlayByPlay();
});


// Event listener for simulating a period
simulatePeriodBtn.addEventListener('click', () => {
    if (!homeTeam || !awayTeam) {
        alert('Please start a game first.');
        return;
    }

    if (period <= 3) {
        simulatePeriod();
        period++;

        // Update the period display unless the game ends
        if (period > 3 && homeScore !== awayScore) {
            playByPlay.push("The game is over!");
            updatePlayByPlay();
            simulatePeriodBtn.disabled = true; // Disable further simulation
        } else if (period > 3 && homeScore === awayScore && !overtime) {
            // Check for overtime if the game is tied
            overtime = true;
            periodElement.textContent = "OT"; // Show overtime
            playByPlay.push("Overtime! Sudden death period begins.");
            updatePlayByPlay();
        } else {
            periodElement.textContent = period;
        }
    } else if (overtime) {
        simulateOvertime();
    }
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

function simulateAssist(team, scorer) {
    // Get a potential assister from the same team, excluding the scorer
    let possibleAssisters = team.players.filter(player => player.id !== scorer.id);
    if (possibleAssisters.length === 0) return null; // No other players available

    let assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];

    // Assisting probability based on passing, vision, and creativity
    let assistChance = (
        assister.skills.passing * 0.5 +
        assister.skills.vision * 0.3 +
        assister.skills.creativity * 0.2
    ) * Math.random();

    // Return assister if chance is above threshold, otherwise null
    return assistChance > 100 ? assister : null;
}

function simulateGoal(team) {
    let scorer = getRandomPlayer(team);

    // Scoring probability is influenced by shooting and puck control skills
    let goalChance = (
        scorer.skills.wristShotAccuracy * 0.4 +
        scorer.skills.wristShotPower * 0.3 +
        scorer.skills.puckControl * 0.2 +
        scorer.skills.creativity * 0.1
    ) * Math.random();

    // Adjust the threshold for a goal (calibrated based on max possible skill sum)
    if (goalChance > 50) {
        if (team === homeTeam) homeScore++;
        else awayScore++;

        let assister = simulateAssist(team, scorer);
        let assistMessage = assister ? `Assist by ${assister.name}` : "Unassisted";
        let goalMessage = `${scorer.name} scores for ${team.name}! ${assistMessage}`;
        playByPlay.push(goalMessage);
    }
}

// Function to simulate an overtime period
function simulateOvertime() {
    // Overtime is sudden death, so only one goal will decide the winner
    if (overtime && !simulatePeriodBtn.disabled) {
        simulateGoal(homeTeam);
        if (homeScore > awayScore) {
            playByPlay.push(`${homeTeam.name} wins in overtime!`);
            scoreElement.textContent = `${homeScore} - ${awayScore}`;
            updatePlayByPlay();
            simulatePeriodBtn.disabled = true; // End the game
            return;
        }

        simulateGoal(awayTeam);
        if (awayScore > homeScore) {
            playByPlay.push(`${awayTeam.name} wins in overtime!`);
            scoreElement.textContent = `${homeScore} - ${awayScore}`;
            updatePlayByPlay();
            simulatePeriodBtn.disabled = true; // End the game
            return;
        }
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
