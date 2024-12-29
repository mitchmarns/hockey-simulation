// Simulate a penalty for a given team
function simulatePenalty(team) {
    const penalizedPlayer = getRandomPlayer(team);
    if (!penalizedPlayer) return; // Handle edge cases where no players are available

    // Generate a random penalty type
    const penaltyTypes = [
        "Hooking",
        "Tripping",
        "Slashing",
        "Interference",
        "High-sticking",
        "Cross-checking",
        "Holding",
        "Boarding",
        "Roughing"
    ];
    const penalty = penaltyTypes[Math.floor(Math.random() * penaltyTypes.length)];

    // Log penalty event
    const penaltyEvent = `${penalizedPlayer.name} from ${team.name} is penalized for ${penalty}.`;
    return penaltyEvent;
}

// Helper function to get a random player from a team
function getRandomPlayer(team) {
    if (!team.players || team.players.length === 0) return null;
    return team.players[Math.floor(Math.random() * team.players.length)];
}

// Export the functions to be used in other files
export { simulatePenalty };
