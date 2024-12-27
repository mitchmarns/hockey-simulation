let players = [];
let teams = [];

// Function to load data from localStorage
function loadFromLocalStorage() {
    const savedTeams = localStorage.getItem("teams");
    const savedPlayers = localStorage.getItem("players");

    if (savedTeams && savedPlayers) {
        teams = JSON.parse(savedTeams);
        players = JSON.parse(savedPlayers);
        console.log("Loaded teams and players from localStorage.");

        // After loading from localStorage, refresh the UI
        displayPlayers();
        teams.forEach(team => {
            if (team.players && team.players.length > 0) {
                displayTeamRoster(team.name);
            }
        });
    } else {
        console.log("No data in localStorage, will load from JSON files.");
        loadDataFromJSON(); // Load data from JSON if localStorage is empty
    }
}


// Fetch player and team data if localStorage is empty
function loadDataFromJSON() {
    fetch('../data/players.json')
    .then(response => {
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error(`Failed to fetch players.json: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Fetched players data:", data);
        players = data.players; // Ensure the structure matches the JSON file
        localStorage.setItem("players", JSON.stringify(players));
        displayPlayers();
    })
    .catch(error => {
        console.error("Error fetching players.json:", error);
    });

    fetch('../data/teams.json') // Same for teams.json
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load teams.json");
            }
            return response.json();
        })
        .then(data => {
            teams = data; // Access the "teams" array
            console.log("Teams Loaded:", teams);
            saveTeamsToLocalStorage(); // Save teams to localStorage
        })
        .catch(error => {
            console.error("Error loading teams:", error);
        });
}

// Function to save teams to localStorage
function saveTeamsToLocalStorage() {
    localStorage.setItem("teams", JSON.stringify(teams));
}

// Function to save players to localStorage
function savePlayersToLocalStorage() {
    localStorage.setItem("players", JSON.stringify(players));
}

// Display all players on the page
function displayPlayers() {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = ""; // Clear the list before re-rendering

    const unassignedPlayers = players.filter(player => !player.assigned);

    unassignedPlayers.forEach(player => {
        const li = document.createElement("li");

        const img = document.createElement("img");
        img.src = player.image;
        img.alt = player.name;

        const playerInfo = document.createElement("div");

        const playerName = document.createElement("span");
        playerName.textContent = player.name;

        const playerPosition = document.createElement("span");
        playerPosition.textContent = ` (${player.position})`; // Add position next to the name

        playerInfo.appendChild(playerName);
        playerInfo.appendChild(playerPosition);

        const assignButton = document.createElement("button");
        assignButton.textContent = "Assign";

        // Only show the Assign button if the player isn't already assigned
        if (player.assigned) {
            assignButton.disabled = true;
            assignButton.textContent = "Assigned";
        } else {
            assignButton.onclick = function () {
                assignPlayerToTeam(player);
            };
        }

        li.appendChild(img);
        li.appendChild(playerInfo); // Append player info (name + position)
        li.appendChild(assignButton);

        playersList.appendChild(li);
    });
}


// Function to assign a player to a team
function assignPlayerToTeam(player) {
    const selectedTeam = document.getElementById("team-select").value;

    if (selectedTeam === "") {
        alert("Please select a team first.");
        return;
    }

    // Find the selected team
    const team = teams.find(team => team.name === selectedTeam);
    if (team) {
        if (team.players.length < team.maxPlayers) {
            team.players.push(player);
            player.team = selectedTeam;
            player.assigned = true;

            // Save the updated teams and players to localStorage
            saveTeamsToLocalStorage();
            savePlayersToLocalStorage();

            // Update the UI
            alert(`${player.name} has been assigned to the ${selectedTeam}.`);
            displayPlayers(); // Re-render the available players list
            displayTeamRoster(selectedTeam); // Update the selected team's roster
        } else {
            alert(`The ${selectedTeam} team is already full.`);
        }
    }
}

// Function to display the roster for a specific team
function displayTeamRoster(teamName) {
    const teamRosterContainer = document.getElementById("team-roster");
    const team = teams.find(t => t.name === teamName);

    if (!team) {
        return;
    }

    // Clear any existing roster
    teamRosterContainer.innerHTML = "";

    const rosterTitle = document.createElement("h2");
    rosterTitle.textContent = `${teamName} Roster`;
    teamRosterContainer.appendChild(rosterTitle);

    const rosterList = document.createElement("ul");

    team.players.forEach(player => {
        const li = document.createElement("li");

        const playerInfo = document.createElement("span");
        playerInfo.textContent = player.name;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.onclick = function () {
            removePlayerFromTeam(player, teamName);
        };

        li.appendChild(playerInfo);
        li.appendChild(removeButton);
        rosterList.appendChild(li);
    });

    teamRosterContainer.appendChild(rosterList);
}

function removePlayerFromTeam(player, teamName) {
    const team = teams.find(t => t.name === teamName);
    if (team) {
        // Remove player from the team's player list
        team.players = team.players.filter(p => p.id !== player.id);

        // Reset player properties
        player.team = null;
        player.assigned = false;

        // Save updated data to localStorage
        saveTeamsToLocalStorage();
        savePlayersToLocalStorage();

        // Update the UI
        alert(`${player.name} has been removed from the ${teamName}.`);
        displayPlayers(); // Re-render available players list
        displayTeamRoster(teamName); // Update the roster display
    }
}

// Function to load all the players and their team assignments on page load
function loadInitialAssignments() {
    loadFromLocalStorage(); // This will load teams and players from localStorage

    // If data exists, display players and rosters
    if (teams.length === 0 || players.length === 0) {
        loadDataFromJSON(); // Load from JSON if no data in localStorage
    } else {
        // Display the players and team rosters
        displayPlayers();
        teams.forEach(team => {
            if (team.players && team.players.length > 0) {
                displayTeamRoster(team.name);
            }
        });
    }
}

// Call the loadInitialAssignments function when the page loads
window.onload = function() {
    loadInitialAssignments();
};

