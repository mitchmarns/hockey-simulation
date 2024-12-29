import { simulatePenalty } from './penalties.js';

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
    
    // Simulate a penalty and add the result to playByPlay if it's not null
    const homePenaltyMessage = simulatePenalty(homeTeam);
    if (homePenaltyMessage) {
        playByPlay.push(homePenaltyMessage);
    }

    const awayPenaltyMessage = simulatePenalty(awayTeam);
    if (awayPenaltyMessage) {
        playByPlay.push(awayPenaltyMessage);
    }

    // Handle power play and penalty kill units
    if (homeTeam.penaltyBox.length > 0) {
        playByPlay.push("Power play for " + awayTeam.name);
        // Simulate power play events for the away team
        simulatePowerPlay(awayTeam);
        simulatePenaltyKill(homeTeam);
    }
    if (awayTeam.penaltyBox.length > 0) {
        playByPlay.push("Power play for " + homeTeam.name);
        // Simulate power play events for the home team
        simulatePowerPlay(homeTeam);
        simulatePenaltyKill(awayTeam);
    }

    // Update score
    scoreElement.textContent = `${homeScore} - ${awayScore}`;

    // Update play-by-play
    updatePlayByPlay();
}

function simulateAssist(team, scorer) {
    // Find the scorer's line
    let scorerLine = team.lines.forwardLines.find(line => 
        line.LW === scorer.id || line.C === scorer.id || line.RW === scorer.id
    ) || 
    team.lines.defenseLines.find(line => 
        line.LD === scorer.id || line.RD === scorer.id
    );

    let possibleAssisters = [];
    
    if (scorerLine) {
        // Get players on the same line, excluding the scorer
        let linePlayerIds = Object.values(scorerLine).filter(id => id !== scorer.id);
        possibleAssisters = team.players.filter(player => linePlayerIds.includes(player.id));
    }

    // If no players are found on the same line, consider the rest of the team (excluding the scorer)
    if (possibleAssisters.length === 0) {
        possibleAssisters = team.players.filter(player => player.id !== scorer.id);
    }

    // Randomly select an assister
    let assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];

    // Assisting probability based on passing, vision, and creativity
    let assistChance = (
        assister.skills.passing * 0.5 +
        assister.skills.vision * 0.3 +
        assister.skills.creativity * 0.2
    );

    // Return the assister if the assist chance meets the threshold
    return Math.random() * 50 < assistChance ? assister : null;
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

    // Adjust the threshold for a goal
    if (goalChance > 50) {
        if (team === homeTeam) homeScore++;
        else awayScore++;

        // Attempt to simulate an assist, prioritizing players on the same line
        let assister = simulateAssist(team, scorer);

        // Create play-by-play message with or without assist
        let assistMessage = assister ? `Assist by ${assister.name}` : "Unassisted";
        let goalMessage = `${scorer.name} scores for ${team.name}! ${assistMessage}`;
        playByPlay.push(goalMessage);
    }
}

// Function to simulate a penalty
function simulatePenalty(team) {
    const penalizedPlayer = getRandomPlayer(team); // Pick a random player to be penalized
    team.penaltyBox.push(penalizedPlayer); // Add the player to the penalty box

    // Log the penalty in play-by-play
    playByPlay.push(`${penalizedPlayer.name} from ${team.name} is penalized!`);

    // Determine the power play/penalty kill units
    if (team === homeTeam) {
        // Away team gets power play, home team gets penalty kill
        playByPlay.push(`${awayTeam.name} goes on a power play!`);
        // Activate the penalty kill units for home team
        updatePenaltyKillUnits(homeTeam);
    } else {
        // Home team gets power play, away team gets penalty kill
        playByPlay.push(`${homeTeam.name} goes on a power play!`);
        // Activate the penalty kill units for away team
        updatePenaltyKillUnits(awayTeam);
    }
    
    updatePlayByPlay();
}

// Helper function to update penalty kill units based on the current penalty box
function updatePenaltyKillUnits(team) {
    const penaltyKillUnit = team.lines.penaltyKillUnits[0]; // Get the first penalty kill unit

    // Check if any player in the penalty box is part of the penalty kill unit
    let penaltyKillPlayers = [];
    penaltyKillUnit.F1 = team.players.find(player => player.id === penaltyKillUnit.F1);
    penaltyKillUnit.F2 = team.players.find(player => player.id === penaltyKillUnit.F2);
    penaltyKillUnit.D1 = team.players.find(player => player.id === penaltyKillUnit.D1);
    penaltyKillUnit.D2 = team.players.find(player => player.id === penaltyKillUnit.D2);

    // If no players available for penalty kill, randomly assign others to penalty kill unit
    if (!penaltyKillUnit.F1 || !penaltyKillUnit.F2 || !penaltyKillUnit.D1 || !penaltyKillUnit.D2) {
        // Example of handling fallback if no players are assigned
        console.log("Penalty kill unit is incomplete, assigning remaining players.");
    }
}

// Update the play-by-play list
function updatePlayByPlay() {
    playByPlayList.innerHTML = '';
    playByPlay.forEach(event => {
        let li = document.createElement('li');
        li.textContent = event;
        playByPlayList.appendChild(li);
    });

    // Display penalty box information
    homeTeam.penaltyBox.forEach(player => {
        playByPlay.push(`${player.name} is in the penalty box for ${homeTeam.name}`);
    });
    awayTeam.penaltyBox.forEach(player => {
        playByPlay.push(`${player.name} is in the penalty box for ${awayTeam.name}`);
    });
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
