function simulatePenalty(team) {
    // Pick a random player from the team
    let penalizedPlayer = getRandomPlayer(team);
    if (!penalizedPlayer) return; // Handle edge cases where no players are available

    // Calculate the penalty likelihood based on player skills
    let penaltyChance = (
        penalizedPlayer.skills.aggression * 0.4 - // Aggression increases penalty chance
        penalizedPlayer.skills.poise * 0.3 +     // Poise decreases penalty chance
        penalizedPlayer.skills.stickChecking * 0.2 // Stick checking reduces minor penalties
    ) * Math.random(); // Add randomness to the calculation

    // Adjust the threshold for penalties (calibrated for your skill ranges)
    if (penaltyChance > 0.5) { // Threshold adjusted to a value between 0 and 1
        // Generate a random penalty type from a predefined set
        const penaltyTypes = [
            "Hooking", "Tripping", "Slashing", "Interference", "High-sticking",
            "Cross-checking", "Holding", "Boarding", "Roughing"
        ];
        const penalty = penaltyTypes[Math.floor(Math.random() * penaltyTypes.length)];

        // Log penalty event
        const penaltyMessage = `${penalizedPlayer.name} from ${team.name} is penalized for ${penalty}.`;

        // Add the penalty to the play-by-play (you can modify this according to your simulation)
        playByPlay.push(penaltyMessage);
        return penaltyMessage;
    }

    return null; // No penalty occurred
}

// Helper function to get a random player from a team
function getRandomPlayer(team) {
    if (!team.players || team.players.length === 0) return null;
    return team.players[Math.floor(Math.random() * team.players.length)];
}

// Export the functions to be used in other files
export { simulatePenalty };
