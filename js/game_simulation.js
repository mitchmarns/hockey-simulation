import { simulatePenalty, simulatePowerPlay, simulatePenaltyKill, decrementPenaltyTime, updatePenaltyBox } from './penalties.js';
import { simulateInjury, updateInjuryStatus } from './injuries.js';

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

    // Reset timer for the new period
    periodStartTime = Date.now();

    gameTickInterval = setInterval(() => {
        simulateGameTick();
    }, gameTickDuration);
});

function simulateGameTick() {
    let periodElapsed = Date.now() - periodStartTime;
    
    if (period <= 3 && periodElapsed < periodDuration) {
        simulatePeriodTick();

        if (Math.random() < 0.05) { // 5% chance of injury
            let injuredHomePlayer = simulateInjury(homeTeam);
            if (injuredHomePlayer) {
                playByPlay.push(`${injuredHomePlayer.name} from ${homeTeam.name} is injured and out of the game.`);
                updatePlayByPlay();
            }
        }

        if (Math.random() < 0.05) { // 5% chance of injury
            let injuredAwayPlayer = simulateInjury(awayTeam);
            if (injuredAwayPlayer) {
                playByPlay.push(`${injuredAwayPlayer.name} from ${awayTeam.name} is injured and out of the game.`);
                updatePlayByPlay();
            }
        }

        // Heal players over time
        updateInjuryStatus(homeTeam);
        updateInjuryStatus(awayTeam);

        // Period is over, move to the next period
        if (periodElapsed >= periodDuration) {
            period++;
            periodStartTime = Date.now();
            periodElement.textContent = `Period ${period}`;
        }
    } else if (period > 3 && !overtime) {
        simulateOvertime();
    }
}

// Function to simulate a period of the game
function simulatePeriodTick() {
    decrementPenaltyTime(homeTeam);
    decrementPenaltyTime(awayTeam);
    
     // Introduce randomness for penalties
    if (Math.random() < 0.1) { // 10% chance for a penalty to occur during the tick
        simulatePenalty(homeTeam, awayTeam, homeTeam, awayTeam);
    }

    if (Math.random() < 0.1) { // 10% chance for a penalty to occur during the tick
        simulatePenalty(awayTeam, homeTeam, awayTeam, homeTeam);
    }

    // Simulate power plays with randomness based on active penalties
    if (homeTeam.penaltyMinutes > 0) { // If the home team has a penalty
        if (Math.random() < 0.3) { // 30% chance for something to happen on power play
            simulatePowerPlay(homeTeam, awayTeam);
        }
    }

    if (awayTeam.penaltyMinutes > 0) { // If the away team has a penalty
        if (Math.random() < 0.3) { // 30% chance for something to happen on power play
            simulatePowerPlay(awayTeam, homeTeam);
        }
    }

    // Goal scoring simulation with randomness based on team skill
    if (Math.random() < 0.05) { // 5% chance for a goal to occur each tick
        simulateGoal(homeTeam, awayTeam); // Home team might score
    }

    if (Math.random() < 0.05) { // 5% chance for a goal to occur each tick
        simulateGoal(awayTeam, homeTeam); // Away team might score
    }

    // Simulate random events (breakaways, injuries, fights, etc.)
    if (Math.random() < 0.2) { // 20% chance for a random event to occur
        simulateRandomEvent(homeTeam, awayTeam);
    }

    if (Math.random() < 0.2) { // 20% chance for a random event to occur
        simulateRandomEvent(awayTeam, homeTeam);
    }

    // Update the score display
    scoreElement.textContent = `${homeScore} - ${awayScore}`;

    // Check if the period has ended
    let periodElapsed = Date.now() - periodStartTime;
    if (periodElapsed >= periodDuration) {
        endCurrentPeriod();
    }
}

function endCurrentPeriod() {
    clearInterval(gameTickInterval); // Stop the current period's simulation
    playByPlay.push(`End of Period ${period}.`);
    updatePlayByPlay();

    if (period < 3) {
        period++;
        periodStartTime = Date.now(); // Reset timer for the next period
        periodElement.textContent = `Period ${period}`;
        alert(`Starting Period ${period}`);
    } else {
        if (homeScore === awayScore) {
            overtime = true;
            playByPlay.push("Game is tied! Starting overtime.");
            updatePlayByPlay();
            simulateOvertime(); // Handle overtime
        } else {
            endGame(); // End the game
        }
    }
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
        possibleAssisters = team.players.filter(player =>
            linePlayerIds.includes(player.id) &&
            !team.penaltyBox.some(penalty => penalty.player.id === player.id)
        );
    }

    if (possibleAssisters.length === 0) {
        possibleAssisters = team.players.filter(player =>
            player.id !== scorer.id &&
            !team.penaltyBox.some(penalty => penalty.player.id === player.id)
        );
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
    const eligiblePlayers = team.players.filter(player =>
        !team.penaltyBox.some(penalty => penalty.player.id === player.id)
    );

    if (eligiblePlayers.length === 0) {
        playByPlay.push(`${team.name} cannot score as all eligible players are in the penalty box.`);
        updatePlayByPlay();
        return;
    }

    let scorer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];

    let goalChance = (
        scorer.skills.wristShotAccuracy * 0.35 +
        scorer.skills.wristShotPower * 0.25 +
        scorer.skills.creativity * 0.15 +
        scorer.skills.hockeyIQ * 0.15 +
        Math.random() * 20 // Add randomness
    );

    // Adjust for opponent's defense and goalie skills
    const defenseModifier = opponent.players.reduce((sum, player) => {
        return sum + (player.skills.defense || 0) * 0.05;
    }, 0);

    const goalieModifier = opponent.players
        .filter(player => player.position === 'Starter' || player.position === 'Backup')
        .reduce((sum, player) => sum + player.skills.glove + player.skills.legs + player.skills.stick, 0) / 3;

    goalChance -= defenseModifier + (goalieModifier * 0.5);

    if (Math.random() * 100 < goalChance) {
        if (team === homeTeam) homeScore++;
        else awayScore++;

        let assister = simulateAssist(team, scorer);
        let assistMessage = assister ? `Assist by ${assister.name}` : "Unassisted";
        playByPlay.push(`${scorer.name} scores for ${team.name}! ${assistMessage}`);
        updatePlayByPlay();
    }
}

function simulateRandomEvent(team, opponent) {
    const randomEventRoll = Math.random();

    if (randomEventRoll < 0.05) { // 5% chance of a lucky goal
        playByPlay.push(`A lucky bounce leads to a goal for ${team.name}!`);
        if (team === homeTeam) homeScore++;
        else awayScore++;
        updatePlayByPlay();
    } else if (randomEventRoll < 0.1) { // 5% chance of a breakaway
        let randomPlayer = getRandomPlayer(team);
        if (randomPlayer) {
            playByPlay.push(`${randomPlayer.name} from ${team.name} breaks away but is stopped!`);
            updatePlayByPlay();
        }
    }
}

// Helper function to get a random player
function getRandomPlayer(team) {
    const eligiblePlayers = team.players.filter(player =>
        !player.injured &&
        !team.penaltyBox.some(penalty => penalty.player.id === player.id)
    );

    if (eligiblePlayers.length === 0) return null; // No eligible players
    return eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
}

// Update the play-by-play list
export function updatePlayByPlay() {
    playByPlayList.innerHTML = '';
    playByPlay.forEach(event => {
        let li = document.createElement('li');
        li.textContent = event;
        playByPlayList.appendChild(li);
    });

    // Scroll to the most recent event
    playByPlayList.scrollTop = playByPlayList.scrollHeight;
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
