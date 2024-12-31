// injuries.js

export function simulateInjury(team) {
    if (Math.random() < 0.02) { // 2% chance per tick
        const eligiblePlayers = team.players.filter(player => !player.injured);
        const injuredPlayer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];

        if (injuredPlayer) {
            injuredPlayer.injured = true;
            injuredPlayer.lineAssigned = null; // Remove them from their line
            return injuredPlayer;
        }
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

