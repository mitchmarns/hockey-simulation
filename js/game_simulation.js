import { simulatePenalty, simulatePowerPlay, simulatePenaltyKill, decrementPenaltyTime, updatePenaltyBox } from './penalties.js';

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
export let playByPlay = [];
let overtime = false;
let periodDuration = 30 * 1000;
let gameTickDuration = 1000;
let gameTickInterval = null;
let periodStartTime = Date.now();

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

    if (!homeTeam || !awayTeam) {
        console.error("Home or away team could not be found.");
        return;
    }

    homeTeamName.textContent = homeTeam.name;
    awayTeamName.textContent = awayTeam.name;

    // Reset game state
    period = 1;
    overtime = false;
    homeScore = 0;
    awayScore = 0;
    playByPlay = [];
    homeTeam.penaltyBox = [];
    awayTeam.penaltyBox = [];
    simulatePeriodBtn.disabled = false; 
    teamSelect1.disabled = true; 
    teamSelect2.disabled = true; 

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

    if (gameTickInterval) clearInterval(gameTickInterval);

    gameTickInterval = setInterval(() => {
        simulateGameTick();
    }, gameTickDuration);
});

function simulateGameTick() {
    let periodElapsed = Date.now() - periodStartTime;
    
    if (period <= 3 && periodElapsed < periodDuration) {
        simulatePeriodTick();

        // Period is over, move to the next period
        if (periodElapsed >= periodDuration) {
            period++; // Increment period
            periodStartTime = Date.now(); // Reset period timer
            periodElement.textContent = `Period ${period}`;
        }

        // Continue the game flow (penalties, goals, etc.)
    } else if (period > 3 && !overtime) {
        // Handle overtime after period 3 ends
        simulateOvertime();
    } else if (period > 3 && overtime) {
        simulateOvertime();
    }
}

// Function to simulate a period of the game
function simulatePeriodTick() {
    decrementPenaltyTime(homeTeam);
    decrementPenaltyTime(awayTeam);
    
    simulatePenalty(homeTeam, awayTeam, homeTeam, awayTeam);
    simulatePenalty(awayTeam, homeTeam, awayTeam, homeTeam);

    simulatePowerPlay(homeTeam, awayTeam);
    simulatePowerPlay(awayTeam, homeTeam);

    simulateGoal(homeTeam, awayTeam); 
    simulateGoal(awayTeam, homeTeam);

    // Update the score display
    scoreElement.textContent = `${homeScore} - ${awayScore}`;
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
        let linePlayerIds = Object.values(scorerLine).filter(id => id !== scorer.id);
        possibleAssisters = team.players.filter(player => linePlayerIds.includes(player.id));
    }

    if (possibleAssisters.length === 0) {
        possibleAssisters = team.players.filter(player => player.id !== scorer.id);
    }

    // Randomly select an assister
    let assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
    let assistChance = (
        assister.skills.passing * 0.5 +
        assister.skills.vision * 0.3 +
        assister.skills.creativity * 0.2
    );

    return Math.random() * 50 < assistChance ? assister : null;
}

export function simulateGoal(team, opponent) {
    let scorer = getRandomPlayer(team);

    let goalChance = (
    scorer.skills.wristShotAccuracy * 0.4 +
    scorer.skills.wristShotPower * 0.3 +
    scorer.skills.puckControl * 0.2 +
    scorer.skills.creativity * 0.1
    ) * ((opponent && opponent.penaltyBox && opponent.penaltyBox.length > 0) ? 1.5 : 1);

    // Adjust the threshold for a goal
    if (goalChance > 50) {
        if (team === homeTeam) homeScore++;
        else awayScore++;
    }

    if (Math.random() * 100 < goalChance) {
        if (team === homeTeam) homeScore++;
        else awayScore++;

        let assister = simulateAssist(team, scorer);
        let assistMessage = assister ? `Assist by ${assister.name}` : "Unassisted";
        playByPlay.push(`${scorer.name} scores for ${team.name}! ${assistMessage}`);
        updatePlayByPlay();
    }
}


// Helper function to get a random player
function getRandomPlayer(team) {
    return team.players[Math.floor(Math.random() * team.players.length)];
}

// Update the play-by-play list
export function updatePlayByPlay() {
    playByPlayList.innerHTML = '';
    playByPlay.forEach(event => {
        let li = document.createElement('li');
        li.textContent = event;
        playByPlayList.appendChild(li);
    });
}

function endGame() {
    clearInterval(gameTickInterval);
    simulatePeriodBtn.disabled = true;
    alert(`Game Over! Final Score: ${homeScore} - ${awayScore}`);
}

// Function to simulate an overtime period
function simulateOvertime() {
    if (overtime && !simulatePeriodBtn.disabled) {
        simulateGoal(homeTeam, awayTeam);
        if (homeScore > awayScore) {
            playByPlay.push(`${homeTeam.name} wins in overtime!`);
            scoreElement.textContent = `${homeScore} - ${awayScore}`;
            updatePlayByPlay();
            simulatePeriodBtn.disabled = true; // End the game
            return;
        }

        simulateGoal(awayTeam, homeTeam);
        if (awayScore > homeScore) {
            playByPlay.push(`${awayTeam.name} wins in overtime!`);
            scoreElement.textContent = `${homeScore} - ${awayScore}`;
            updatePlayByPlay();
            simulatePeriodBtn.disabled = true; // End the game
            return;
        }
    }
}
