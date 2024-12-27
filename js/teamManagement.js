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
    } else {
        console.log("No data in localStorage, will load from JSON files.");
        loadDataFromJSON(); // Load data from JSON if localStorage is empty
    }
}

// Fetch player and team data if localStorage is empty
function loadDataFromJSON() {
    fetch('../data/players.json') // Go up one level and then access the data folder
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load players.json");
            }
            return response.json();
        })
        .then(data => {
            players = data.players; // Access the "players" array
            console.log("Players Loaded:", players);
            displayPlayers();
        })
        .catch(error => {
            console.error("Error loading players:", error);
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
        })
        .catch(error => {
            console.error("Error loading teams:", error);
        });
}

// Display all players on the page
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

            // Save the updated teams and players to localStorage
            localStorage.setItem("teams", JSON.stringify(teams));
            localStorage.setItem("players", JSON.stringify(players));

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
        li.textContent = player.name;
        rosterList.appendChild(li);
    });

    teamRosterContainer.appendChild(rosterList);
}

// Function to load all the players and their team assignments on page load
function loadInitialAssignments() {
    loadFromLocalStorage();
    if (teams.length === 0 || players.length === 0) {
        loadDataFromJSON();
    } else {
        // If data exists in localStorage, display players and rosters
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
