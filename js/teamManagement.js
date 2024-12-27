// Initialize teams and players arrays
let teams = [];
let players = [];

// Check if there's saved data in localStorage
function loadFromLocalStorage() {
    const savedTeams = localStorage.getItem("teams");
    const savedPlayers = localStorage.getItem("players");

    if (savedTeams && savedPlayers) {
        teams = JSON.parse(savedTeams);
        players = JSON.parse(savedPlayers);
    } else {
        // If no saved data, use an empty structure or fallback (won't be used if players.json loads properly)
        teams = [
            { "name": "Rangers", "players": [], "maxPlayers": 23, "lines": { "forwardLines": [], "defenseLines": [], "goalies": {} } },
            { "name": "Devils", "players": [], "maxPlayers": 23, "lines": { "forwardLines": [], "defenseLines": [], "goalies": {} } },
            { "name": "Islanders", "players": [], "maxPlayers": 23, "lines": { "forwardLines": [], "defenseLines": [], "goalies": {} } },
            { "name": "Sabres", "players": [], "maxPlayers": 23, "lines": { "forwardLines": [], "defenseLines": [], "goalies": {} } }
        ];
    }
}

// Function to fetch players from players.json and load them into the players array
function loadPlayersFromJSON() {
    fetch('../data/players.json')
        .then(response => response.json())
        .then(data => {
            players = data.players; // Assuming the players are in a "players" array in players.json
            loadInitialAssignments(); // Call the function to load initial assignments and display players
        })
        .catch(error => {
            console.error("Error loading players.json:", error);
            alert("Failed to load player data.");
        });
}

// Function to save the current state of teams and players to localStorage
function saveToLocalStorage() {
    localStorage.setItem("teams", JSON.stringify(teams));
    localStorage.setItem("players", JSON.stringify(players));
}

// Function to display players and their assignments
function displayPlayers() {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = ""; // Clear the list before re-rendering

    players.forEach(player => {
        const li = document.createElement("li");

        const img = document.createElement("img");
        img.src = player.image;
        img.alt = player.name;

        const playerName = document.createElement("span");
        playerName.textContent = player.name;

        const assignButton = document.createElement("button");
        assignButton.textContent = "Assign";
        
        // Only show the Assign button if the player isn't already assigned
        if (player.assigned) {
            assignButton.disabled = true;
            assignButton.textContent = "Assigned";
        } else {
            assignButton.onclick = function() {
                assignPlayerToTeam(player);
            };
        }

        li.appendChild(img);
        li.appendChild(playerName);
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

            // Update the UI
            alert(`${player.name} has been assigned to the ${selectedTeam}.`);
            displayPlayers(); // Re-render the available players list
            displayTeamRoster(selectedTeam); // Update the selected team's roster

            // Save to localStorage
            saveToLocalStorage();
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
        li.textContent = player.name;
        rosterList.appendChild(li);
    });

    teamRosterContainer.appendChild(rosterList);
}

// Function to load all the players and their team assignments on page load
function loadInitialAssignments() {
    // Display players that are already assigned to a team
    teams.forEach(team => {
        team.players.forEach(player => {
            displayTeamRoster(team.name); // Re-render roster for each team with assigned players
        });
    });

    // Display all players available for assignment
    displayPlayers();
}

// Call the loadFromLocalStorage function to initialize the teams and players from localStorage
window.onload = function() {
    loadFromLocalStorage();
    loadPlayersFromJSON(); // Fetch players from players.json and then load assignments
};
