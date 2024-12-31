// injuries.js

export function simulateInjury(team) {
    // Random chance for an injury per game tick
    const injuryChance = 0.01; // Adjust the value for likelihood of injuries
    if (Math.random() < injuryChance) {
        const eligiblePlayers = team.players.filter(player =>
            !player.injured && // Player must not already be injured
            !team.penaltyBox.some(penalty => penalty.player.id === player.id) // Player not in the penalty box
        );

        if (eligiblePlayers.length === 0) return null; // No eligible players

        // Select a random player to be injured
        const injuredPlayer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
        injuredPlayer.injured = true;
        return injuredPlayer;
    }
    return null;
}

export function updateInjuryStatus(team) {
    // Optional: Add logic to heal players over time
    team.players.forEach(player => {
        if (player.injured && Math.random() < 0.05) {
            player.injured = false; // Random chance to recover
        }
    });
}

