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

// Call the function on load
window.onload = function() {
    const teams = loadTeamsFromLocalStorage();
    initializeTeams(teams); // Initialize teams using the loaded data or an empty array
};

// Example function to test team data
function initializeTeams(teams) {
    if (teams.length === 0) {
        teams = ["Rangers", "Devils", "Islanders", "Sabres"];
    }
    console.log("Teams:", teams);
}
