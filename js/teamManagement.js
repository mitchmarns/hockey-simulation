let players = [];
let teams = [];

// Fetch player and team data
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

// Display all players on the page
function displayPlayers() {
    const playersList = document.getElementById("players-list");

    players.forEach(player => {
        const li = document.createElement("li");

        const img = document.createElement("img");
        img.src = player.image;
        img.alt = player.name;

        const playerName = document.createElement("span");
        playerName.textContent = player.name;

        const assignButton = document.createElement("button");
        assignButton.textContent = "Assign";
        assignButton.onclick = function() {
            assignPlayerToTeam(player);
        };

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

    // Assign the player to the selected team
    const team = teams.find(team => team.name === selectedTeam);
    if (team && team.players.length < team.maxPlayers) {
        team.players.push(player);
        player.team = selectedTeam;
        player.assigned = true;

        // Update the UI
        alert(`${player.name} has been assigned to the ${selectedTeam}.`);
        displayPlayers(); // Re-render the list to reflect changes
    } else {
        alert(`The ${selectedTeam} team is already full.`);
    }
}

// Toggle selection of a player
document.getElementById('players').addEventListener('click', (e) => {
    if (e.target && e.target.nodeName === 'LI') {
        e.target.classList.toggle('selected');  // Toggle selected state on click
    }
});
