let teams = [];
let players = [];

// Load data from localStorage or fetch from JSON files
function loadFromLocalStorage() {
    const savedTeams = localStorage.getItem("teams");
    const savedPlayers = localStorage.getItem("players");

    if (savedTeams) {
        teams = JSON.parse(savedTeams);
        console.log("Loaded teams from localStorage.");
    } else {
        console.log("No teams data found in localStorage.");
    }

    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
        console.log("Loaded players from localStorage.");
    } else {
        console.log("No players data found in localStorage.");
    }

    renderAssignedPlayers();
    renderTeamLines(); // Render lines after data is loaded
}

// Fetch players and teams data from JSON files
function loadDataFromJSON() {
    fetch('../data/players.json')
        .then(response => response.json())
        .then(data => {
            players = data;
            localStorage.setItem("players", JSON.stringify(players));
            renderAssignedPlayers(); // Render players in list
            renderTeamLines();
        })
        .catch(error => console.error("Error fetching players:", error));

    fetch('../data/teams.json')
        .then(response => response.json())
        .then(data => {
            teams = data;
            saveTeamsToLocalStorage(); // Save teams to localStorage
            renderTeamLines();
        })
        .catch(error => console.error("Error loading teams:", error));
}

// Save teams data to localStorage
function saveTeamsToLocalStorage() {
    localStorage.setItem("teams", JSON.stringify(teams));
}

// Render players list on the page
function renderAssignedPlayers() {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = '';  // Clear existing list

    // Log the players to check if the team and lineAssigned properties are correctly set
    console.log("Teams in localStorage: ", teams);

    // Filter players who are assigned to a team but not yet assigned to a line
    const unassignedPlayers = [];
    teams.forEach(team => {
        team.players.forEach(player => {
            if (player.lineAssigned === null) {  // No line assigned
                unassignedPlayers.push(player);
            }
        });
    });

    // Log the filtered players
    console.log("Unassigned Players: ", unassignedPlayers);

    // Check if there are any unassigned players
    if (unassignedPlayers.length > 0) {
        unassignedPlayers.forEach(player => {
            const playerItem = document.createElement("li");
            playerItem.textContent = player.name;

            playerItem.setAttribute("draggable", "true");
            playerItem.addEventListener("dragstart", (e) => onPlayerDragStart(e, player));

            playersList.appendChild(playerItem);
        });
    } else {
        const noPlayersMessage = document.createElement("p");
        noPlayersMessage.textContent = "No players available to assign to lines.";
        playersList.appendChild(noPlayersMessage);
    }
}

// Handle drag start event for a player
function onPlayerDragStart(event, player) {
    event.dataTransfer.setData("player", JSON.stringify(player));
    event.target.style.opacity = 0.5;
}

// Handle dropping a player onto a line
function onLineDrop(event, teamName, lineIndex, position) {
    const playerData = JSON.parse(event.dataTransfer.getData("player"));
    event.preventDefault();
    
    const team = teams.find(t => t.name === teamName);

    if (!team) {
        console.log(`Team ${teamName} not found.`);
        return;
    }

    // Ensure the player is assigned to the team
    if (playerData.team !== teamName) {
        console.log(`${playerData.name} is not assigned to ${teamName}.`);
        return; // Player is not on the correct team, do not assign
    }

    // Check if the position is available on the line
    const line = team.lines.forwardLines[lineIndex];  // For forward lines
    if (line[position]) {
        console.log(`${position} on ${teamName} Line ${lineIndex + 1} is already occupied.`);
        return; // Position is already filled, don't allow assignment
    }

    // Assign player to the correct position
    line[position] = playerData.name;  // Assign player by name

    saveTeamsToLocalStorage(); // Save updated teams to localStorage
    renderAssignedPlayers(); // Re-render the players list
    renderTeamLines(); // Re-render lines to reflect the changes
}

// Allow dropping a player on a line position
function allowDrop(event) {
    event.preventDefault();
}

// Render team lines dynamically
function renderTeamLines() {
    const teamLinesContainer = document.getElementById("team-lines");
    teamLinesContainer.innerHTML = ""; // Clear existing content

    // Loop through all teams and create sections for each
    teams.forEach(team => {
        const teamSection = document.createElement("div");
        teamSection.classList.add("team-section");

        const teamName = document.createElement("h2");
        teamName.textContent = `${team.name} Line Assignment`;
        teamSection.appendChild(teamName);

        // Render Forward Lines
        if (team.lines && team.lines.forwardLines && Array.isArray(team.lines.forwardLines)) {
            teamSection.appendChild(createLineSection("Forward Lines", team.lines.forwardLines, team));
        }

        // Render Defense Lines
        if (team.lines && team.lines.defenseLines && Array.isArray(team.lines.defenseLines)) {
            teamSection.appendChild(createLineSection("Defense Lines", team.lines.defenseLines, team));
        }

        // Render Goalies
        if (team.lines && team.lines.goalies && team.lines.goalies.starter) {
            teamSection.appendChild(createLineSection("Goalies", [team.lines.goalies], team)); // Goalies is an object
        }

        teamLinesContainer.appendChild(teamSection);
    });
}

// Create the line sections (Forward, Defense, Goalies)
function createLineSection(title, lines, team) {
    const section = document.createElement("div");
    section.classList.add("line-section");

    const sectionTitle = document.createElement("h3");
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);

    lines.forEach((line, index) => {
        const lineContainer = document.createElement("div");
        lineContainer.classList.add("line-container");

        // For each position in the line (LW, C, RW, etc.)
        Object.keys(line).forEach(position => {
            const player = line[position];
            const playerElement = document.createElement("div");

            playerElement.classList.add("player-drop-zone");
            playerElement.setAttribute("ondrop", `onLineDrop(event, '${team.name}', ${index}, '${position}')`);
            playerElement.setAttribute("ondragover", "allowDrop(event)");

            // If a player is assigned to this position, display their name
            if (player) {
                playerElement.textContent = player;
            } else {
                playerElement.textContent = `Drag ${position} here`;  // If no player assigned, show a message
            }

            lineContainer.appendChild(playerElement);
        });

        section.appendChild(lineContainer);
    });

    return section;
}

document.addEventListener("DOMContentLoaded", loadFromLocalStorage);

