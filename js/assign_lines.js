let teams = [];
let allPlayers = [];

// Load data from localStorage and initialize
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
        allPlayers = JSON.parse(savedPlayers);
        console.log("Loaded players from localStorage.");
    } else {
        console.log("No players data found in localStorage.");
    }

    renderUnassignedPlayers(); // Render unassigned players
    renderTeamLines();         // Render team lines
}

// Save teams data to localStorage
function saveTeamsToLocalStorage() {
    localStorage.setItem("teams", JSON.stringify(teams));
}

// Parse the teams array from localStorage
const teams = JSON.parse(localStorage.getItem("teams")) || [];

// Extract players assigned to lines
function getPlayersAssignedToLines() {
    const assignedToLines = [];

    teams.forEach(team => {
        // Check forward lines
        team.lines.forwardLines.forEach(line => {
            Object.values(line).forEach(player => {
                if (player) assignedToLines.push(player);
            });
        });

        // Check defense lines
        team.lines.defenseLines.forEach(line => {
            Object.values(line).forEach(player => {
                if (player) assignedToLines.push(player);
            });
        });

        // Check goalies
        if (team.lines.goalies) {
            const { starter, backup } = team.lines.goalies;
            if (starter) assignedToLines.push(starter);
            if (backup) assignedToLines.push(backup);
        }
    });

    return assignedToLines.map(player => player.name); // Return player names
}

// Get players assigned to a team but not yet to a line
function getUnassignedLinePlayers() {
    const playersAssignedToLines = getPlayersAssignedToLines();
    const playersAssignedToTeams = teams.flatMap(team =>
        team.players.filter(player => player.assigned).map(player => player.name)
    );

    // Players in a team but not yet in a line
    return playersAssignedToTeams.filter(playerName => !playersAssignedToLines.includes(playerName));
}

// Render players assigned to a team but not yet to a line
function renderUnassignedPlayers() {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = ""; // Clear the existing list

    const unassignedLinePlayers = getUnassignedLinePlayers();

    if (unassignedLinePlayers.length > 0) {
        unassignedLinePlayers.forEach(playerName => {
            const playerItem = document.createElement("li");
            playerItem.textContent = playerName;

            playerItem.setAttribute("draggable", "true");
            playerItem.addEventListener("dragstart", (e) => onPlayerDragStart(e, { name: playerName }));

            playersList.appendChild(playerItem);
        });
    } else {
        const noPlayersMessage = document.createElement("p");
        noPlayersMessage.textContent = "All players are assigned to lines.";
        playersList.appendChild(noPlayersMessage);
    }
}

// Handle drag start event for a player
function onPlayerDragStart(event, player) {
    event.dataTransfer.setData("player", JSON.stringify(player));
    event.target.style.opacity = 0.5;

    event.target.addEventListener("dragend", () => {
        event.target.style.opacity = 1;
    });
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

    // Check if the position is already filled in the line
    const line = lineIndex >= 0 ? team.lines.forwardLines[lineIndex] : team.lines.goalies;

    if (line[position]) {
        console.log(`${position} on ${teamName} Line ${lineIndex + 1} is already occupied.`);
        return;
    }

    // Assign player to the correct position
    line[position] = playerData.name;

    // Update teams data
    saveTeamsToLocalStorage();
    renderUnassignedPlayers(); // Re-render the unassigned players list
    renderTeamLines();         // Re-render lines to reflect the changes
}

// Allow dropping a player on a line position
function allowDrop(event) {
    event.preventDefault();
}

// Render team lines dynamically
function renderTeamLines() {
    const teamLinesContainer = document.getElementById("team-lines");
    teamLinesContainer.innerHTML = ""; // Clear existing content

    teams.forEach(team => {
        const teamSection = document.createElement("div");
        teamSection.classList.add("team-section");

        const teamName = document.createElement("h2");
        teamName.textContent = `${team.name} Line Assignment`;
        teamSection.appendChild(teamName);

        // Render Forward Lines
        if (team.lines && team.lines.forwardLines) {
            teamSection.appendChild(createLineSection("Forward Lines", team.lines.forwardLines, team, "forward"));
        }

        // Render Defense Lines
        if (team.lines && team.lines.defenseLines) {
            teamSection.appendChild(createLineSection("Defense Lines", team.lines.defenseLines, team, "defense"));
        }

        // Render Goalies
        if (team.lines && team.lines.goalies) {
            teamSection.appendChild(createLineSection("Goalies", [team.lines.goalies], team, "goalie"));
        }

        teamLinesContainer.appendChild(teamSection);
    });
}

// Create the line sections (Forward, Defense, Goalies)
function createLineSection(title, lines, team, type) {
    const section = document.createElement("div");
    section.classList.add("line-section");

    const sectionTitle = document.createElement("h3");
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);

    lines.forEach((line, index) => {
        const lineContainer = document.createElement("div");
        lineContainer.classList.add("line-container");

        Object.keys(line).forEach(position => {
            const player = line[position];
            const playerElement = document.createElement("div");

            playerElement.classList.add("player-drop-zone");
            playerElement.setAttribute("ondrop", `onLineDrop(event, '${team.name}', ${index}, '${position}')`);
            playerElement.setAttribute("ondragover", "allowDrop(event)");

            playerElement.textContent = player || `Drag ${position} here`;

            lineContainer.appendChild(playerElement);
        });

        section.appendChild(lineContainer);
    });

    return section;
}

document.addEventListener("DOMContentLoaded", loadFromLocalStorage);
