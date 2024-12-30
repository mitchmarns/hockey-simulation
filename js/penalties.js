import { simulateGoal } from './game_simulation.js';

// Function to simulate a penalty for a given team
export function simulatePenalty(team, homeTeam, awayTeam) {
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
            "Roughing": 2, "Fighting": 5, "Misconduct": 10
        };
        const penaltyKeys = Object.keys(penaltyTypes);
        const penalty = penaltyKeys[Math.floor(Math.random() * penaltyKeys.length)];
        const penaltyDuration = penaltyTypes[penalty];

        // Add player to the penalty box
        if (!team.penaltyBox) team.penaltyBox = []; // Initialize if undefined
        team.penaltyBox.push({ player: penalizedPlayer, duration: penaltyDuration });
        
        // Determine the powerplay and penalty kill
        let opponent = team === homeTeam ? awayTeam : homeTeam;
        
        // Log penalty event
        return `${penalizedPlayer.name} from ${team.name} is penalized for ${penalty}. ${opponent.name} gets a power play!`;
    }

    return null; // No penalty occurred
}

// Helper function to get a random player from a team
function getRandomPlayer(team) {
    return team.players[Math.floor(Math.random() * team.players.length)];
}

// Function to decrement penalty time for a team
export function decrementPenaltyTime(team) {
    if (!team.penaltyBox) return;
    team.penaltyBox = team.penaltyBox.filter(penalty => {
        penalty.duration -= 1; // Decrement time
        return penalty.duration > 0; // Keep active penalties
    });
}

// Function to simulate a power play (team with advantage)
export function simulatePowerPlay(team, opponent) {
    // Power play teams have a higher chance of scoring
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
        console.log(`${team.name} scores on the power play!`);
    }
}

// Function to simulate penalty kill (team with disadvantage)
export function simulatePenaltyKill(team, opponent) {
    // Penalty kill teams have a reduced chance of letting a goal
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
        simulateGoal(opponent); // Power play team scores
    } else if (Math.random() < shortHandedChance / 200) {
        simulateGoal(team); // Short-handed goal!
        console.log(`${team.name} scores short-handed!`);
    }
}

// Additional helper: Log play-by-play for blocks during penalty kill
export function logPenaltyKillEvents(team) {
    team.lines.penaltyKillUnits.forEach(unit => {
        Object.values(unit).forEach(player => {
            if (player && player.skills) {
                if (Math.random() < player.skills.shotBlocking / 100) {
                    console.log(`${player.name} blocks the shot!`);
                }
            }
        });
    });
}
