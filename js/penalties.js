import { simulateGoal, playByPlay } from './game_simulation.js';

// Function to simulate a penalty for a given team
export function simulatePenalty(team, homeTeam, awayTeam, opponent) {
    // Pick a random player from the team
    let penalizedPlayer = getRandomPlayer(team);
    if (!penalizedPlayer) return null; // Handle edge cases where no players are available

    // Calculate the penalty likelihood based on player skills (same as before)
    let penaltyChance = (
        penalizedPlayer.skills.aggression * 0.4 - // Aggression increases penalty chance
        penalizedPlayer.skills.poise * 0.3 +     // Poise decreases penalty chance
        penalizedPlayer.skills.stickChecking * 0.2 // Stick checking reduces minor penalties
    ) * Math.random(); // Add randomness to the calculation

    // Adjust the threshold for penalties (calibrated for your skill ranges)
    if (penaltyChance > 0.5) { // Threshold adjusted to a value between 0 and 1
        // Generate a random penalty type from a predefined set
        const penaltyTypes = {
            "Hooking": 2, "Tripping": 2, "Slashing": 2, "Interference": 2,
            "High-sticking": 2, "Cross-checking": 2, "Holding": 2, "Boarding": 2,
            "Roughing": 2, "Fighting": 5, "Misconduct": 10, "Game Misconduct": 20
        };

        const penaltyWeights = {
            minor: 0.8, // 80% chance of minor penalties
            major: 0.18, // 18% chance of major penalties
            misconduct: 0.02 // 2% chance of misconduct or game misconduct
        };

        let penaltyCategory = decidePenaltyCategory(penaltyWeights);
        
        const penaltyKeys = Object.keys(penaltyTypes).filter(penalty => {
            if (penaltyCategory === "minor") return penaltyTypes[penalty] <= 2;
            if (penaltyCategory === "major") return penaltyTypes[penalty] === 5;
            if (penaltyCategory === "misconduct") return penaltyTypes[penalty] >= 10;
        });
        
        const penalty = penaltyKeys[Math.floor(Math.random() * penaltyKeys.length)];
        const penaltyDuration = penaltyTypes[penalty];

        // Add player to the penalty box
        if (!team.penaltyBox) team.penaltyBox = []; // Initialize if undefined
        team.penaltyBox.push({ player: penalizedPlayer, duration: penaltyDuration, timestamp: Date.now() });

        // delayed penalty
        if (penaltyCategory === "minor" && Math.random() < 0.2) { // 20% chance of delayed penalty
            const delayedMessage = `${team.name} has a delayed penalty! Opponent gets a chance to score.`;
            playByPlay.push(delayedMessage);
            simulateDelayedPenalty(team, opponent);
        }
        
        // Add player to the penalty box
        if (!team.penaltyBox) team.penaltyBox = [];
        team.penaltyBox.push({ player: penalizedPlayer, duration: penaltyDuration, timestamp: Date.now() });

        // Special handling for game misconduct
        if (penalty === "Game Misconduct") {
            penalizedPlayer.ejected = true; // Mark the player as ejected
            playByPlay.push(`${penalizedPlayer.name} from ${team.name} has been ejected for a game misconduct.`);
        }

        const penaltyMessage = `${penalizedPlayer.name} from ${team.name} is penalized for ${penalty}. ${opponent.name} gets a power play!`;
        playByPlay.push(penaltyMessage);
        return penaltyMessage;
    }

    return null;
}

// Decide penalty category based on weighted probabilities
function decidePenaltyCategory(weights) {
    const rand = Math.random();
    if (rand < weights.minor) return "minor";
    if (rand < weights.minor + weights.major) return "major";
    return "misconduct";
}

// Helper function to get a random player from a team
function getRandomPlayer(team) {
    return team.players[Math.floor(Math.random() * team.players.length)];
}

// Simulate delayed penalty scenario
function simulateDelayedPenalty(team, opponent) {
    if (Math.random() < 0.3) { // 30% chance of scoring during a delayed penalty
        simulateGoal(opponent);
        playByPlay.push(`${opponent.name} scores on the delayed penalty!`);
    }
}

// Function to decrement penalty time for a team
export function decrementPenaltyTime(team, opponent) {
    if (!team.penaltyBox) return;
    team.penaltyBox = team.penaltyBox.filter(penalty => {
        penalty.duration -= 1;
        if (penalty.duration <= 0) {
            playByPlay.push(`${penalty.player.name} is out of the penalty box for ${team.name}.`);
        }
        return penalty.duration > 0;
    });
}

// Function to simulate a power play (team with advantage)
export function simulatePowerPlay(team, opponent) {
    let goalChance = 0;
    let penaltyKillResistance = 0;

    team.lines.powerplayUnits.forEach(unit => {
        Object.values(unit).forEach(player => {
            if (player && player.skills) {
                goalChance += player.skills.powerPlaySkill * 0.4;
            }
        });
    });

    opponent.lines.penaltyKillUnits.forEach(unit => {
        Object.values(unit).forEach(player => {
            if (player && player.skills) {
                penaltyKillResistance += player.skills.penaltyKilling * 0.3;
            }
        });
    });

    // Calculate adjusted goal chance
    const adjustedChance = goalChance - penaltyKillResistance;
    if (Math.random() < adjustedChance / 100) {
        simulateGoal(team);
        playByPlay.push(`${team.name} scores on the power play!`);
    }
}

// Function to simulate penalty kill (team with disadvantage)
export function simulatePenaltyKill(team, opponent) {
    let saveChance = 0;
    let shortHandedChance = 0;
    
    team.lines.penaltyKillUnits.forEach(unit => {
        Object.values(unit).forEach(player => {
            if (player && player.skills) {
                saveChance += player.skills.stickChecking * 0.3;
                shortHandedChance += player.skills.speed * 0.2; // Speed for breakaways
            }
        });
    });

    // Simulate save or goal
    if (Math.random() > saveChance / 100) {
        playByPlay.push(`${opponent.name} scores on the power play!`);
    } else if (Math.random() < shortHandedChance / 200) {
        playByPlay.push(`${team.name} scores short-handed!`);
    }
}

// Check if penalty box has active penalties and update power play/penalty kill state
export function updatePenaltyBox(team, opponent) {
    const initialPenaltyCount = team.penaltyBox?.length || 0;
    decrementPenaltyTime(team);

    if (initialPenaltyCount > 0 && (team.penaltyBox?.length || 0) === 0) {
        playByPlay.push(`${team.name} is back to full strength!`);
        console.log(`${team.name} is back to full strength!`);
    }
}
