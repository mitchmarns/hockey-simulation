console.log("Hockey Simulation Loaded!");

// Sync with teamManagement.js
function loadTeamsFromLocalStorage() {
    const savedTeams = localStorage.getItem("teams");
    if (savedTeams) {
        const teams = JSON.parse(savedTeams);
        console.log("Teams loaded from localStorage:", teams);
        return teams;
    } else {
        console.log("No teams data found in localStorage.");
        return [];
    }
}

// Sync with players.js
function loadPlayersFromLocalStorage() {
    const savedPlayers = localStorage.getItem("players");
    if (savedPlayers) {
        const players = JSON.parse(savedPlayers);
        console.log("Players loaded from localStorage:", players);
        return players;
    } else {
        console.log("No players data found in localStorage.");
        return [];
    }
}

// Call the function on load
window.onload = function() {
    const teams = loadTeamsFromLocalStorage();
    const players = loadPlayersFromLocalStorage();

    // Now, initialize both teams and players
    initializeTeams(teams);
    initializePlayers(players); // New function to initialize players
};

// Example function to test team data
function initializeTeams(teams) {
    if (teams.length === 0) {
        teams = ["Rangers", "Devils", "Islanders", "Sabres"];
    }
    console.log("Teams:", teams);
}

// Example function to test player data (added)
function initializePlayers(players) {
    if (players.length === 0) {
        console.log("No players found, would normally load players here.");
    } else {
        console.log("Players:", players);
    }
}
