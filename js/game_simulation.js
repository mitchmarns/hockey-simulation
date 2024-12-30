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
    // Ensure penaltyBox is initialized for both teams
    if (!homeTeam.penaltyBox) homeTeam.penaltyBox = [];
    if (!awayTeam.penaltyBox) awayTeam.penaltyBox = [];

     // Decrement penalty times if necessary (should be called regularly in the game loop)
    homeTeam.penaltyBox.forEach(player => decrementPenaltyTime(player));
    awayTeam.penaltyBox.forEach(player => decrementPenaltyTime(player));
    
    // Update penalties
    updatePenaltyBox(homeTeam);
    updatePenaltyBox(awayTeam);

    // Simulate penalties
    simulatePenalty(homeTeam, homeTeam, awayTeam, awayTeam);  
    simulatePenalty(awayTeam, homeTeam, awayTeam, homeTeam);

    // Handle power play and penalty kill scenarios
    if (homeTeam.penaltyBox.length > 0) {
        simulatePowerPlay(awayTeam, homeTeam);
        simulatePenaltyKill(homeTeam, awayTeam);
    }
    if (awayTeam.penaltyBox.length > 0) {
        simulatePowerPlay(homeTeam, awayTeam);
        simulatePenaltyKill(awayTeam, homeTeam);
    }

    // Simulate regular gameplay
    simulateGoal(homeTeam, awayTeam);
    simulateGoal(awayTeam, homeTeam);

    // Update scoreboard and play-by-play
    scoreElement.textContent = `${homeScore} - ${awayScore}`;
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

export function simulateGoal(team, opponent) {
    // Ensure both team and opponent are properly passed
    if (!team || !opponent) {
        console.error("Team or opponent is undefined.");
        return;
    }

    // Ensure opponent has a penaltyBox
    if (!opponent.penaltyBox) {
        console.error("Opponent does not have a penaltyBox.");
        return;
    }
    
    let scorer = getRandomPlayer(team);

    // Scoring probability is influenced by shooting and puck control skills
    let goalChance = (
        scorer.skills.wristShotAccuracy * 0.4 +
        scorer.skills.wristShotPower * 0.3 +
        scorer.skills.puckControl * 0.2 +
        scorer.skills.creativity * 0.1
        ) * (opponent.penaltyBox.length > 0 ? 1.5 : 1);

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

// Helper function to get a random player
function getRandomPlayer(team) {
    return team.players[Math.floor(Math.random() * team.players.length)];
}

// Update the play-by-play list
function updatePlayByPlay() {
    playByPlayList.innerHTML = '';
    playByPlay.forEach(event => {
        let li = document.createElement('li');
        li.textContent = event;
        playByPlayList.appendChild(li);
    });
}

// Function to simulate an overtime period
function simulateOvertime() {
    // Overtime is sudden death, so only one goal will decide the winner
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
