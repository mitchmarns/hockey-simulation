let players = [];
let teams = [];

// Fetch player and team data
fetch('data/players.json')
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load players.json");
        }
        return response.json();
    })
    .then(data => {
        players = data.players;  // Access the "players" array
        console.log("Players Loaded:", players);
        displayPlayers();
    })
    .catch(error => {
        console.error("Error loading players:", error);
    });

fetch('data/teams.json')
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load teams.json");
        }
        return response.json();
    })
    .then(data => {
        teams = data;
        console.log("Teams Loaded:", teams);
    })
    .catch(error => {
        console.error("Error loading teams:", error);
    });

// Display all players on the page
function displayPlayers() {
    const playerList = document.getElementById('players');
    playerList.innerHTML = '';

    if (players.length === 0) {
        playerList.innerHTML = '<li>No players available</li>';
        return;
    }

    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name;  // Show player name
        li.dataset.playerId = player.id;  // Store player ID for later
        playerList.appendChild(li);
    });
}

// Function to assign a player to a team
function assignToTeam() {
    const selectedTeam = document.getElementById('team').value;

    // Find all selected players (those that have been clicked in the list)
    const selectedPlayers = document.querySelectorAll('#players li.selected');
    selectedPlayers.forEach(playerItem => {
        const playerId = parseInt(playerItem.dataset.playerId);
        const player = players.find(p => p.id === playerId);
        const team = teams.find(t => t.name === selectedTeam);

        if (player && team && player.team === null) {
            team.players.push(player);  // Add player to the team
            player.team = selectedTeam;  // Set the player's team
            console.log(`${player.name} assigned to the ${selectedTeam}`);
        } else {
            console.log("Player already assigned or team doesn't exist");
        }
    });
}

// Toggle selection of a player
document.getElementById('players').addEventListener('click', (e) => {
    if (e.target && e.target.nodeName === 'LI') {
        e.target.classList.toggle('selected');  // Toggle selected state on click
    }
});
