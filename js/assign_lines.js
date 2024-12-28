let teams = [];
let allPlayers = [];

// Utility function to get data from localStorage
function getFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Utility function to save data to localStorage
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Load data from localStorage
function loadData() {
    teams = getFromLocalStorage("teams");
    allPlayers = getFromLocalStorage("players");
    renderAll();
}

// Save updated teams to localStorage and re-render
function updateTeams() {
    saveToLocalStorage("teams", teams);
    renderAll();
}

// Render all dynamic content
function renderAll() {
    renderUnassignedPlayers();
    renderTeamLines();
}

// Get players assigned to lines
function getPlayersAssignedToLines() {
    return teams.flatMap(team =>
        [
            ...team.lines.forwardLines.flatMap(line => Object.values(line).filter(Boolean)),
            ...team.lines.defenseLines.flatMap(line => Object.values(line).filter(Boolean)),
            team.lines.goalies.starter,
            team.lines.goalies.backup,
        ].filter(Boolean)
    );
}

// Get players assigned to teams but not yet to a line
function getUnassignedLinePlayers() {
    const assignedToLines = getPlayersAssignedToLines();
    return teams.flatMap(team =>
        team.players.filter(player => player.assigned && !assignedToLines.includes(player.name))
    ).map(player => player.name);
}

// Render unassigned players
function renderUnassignedPlayers() {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = ""; // Clear list

    const unassigned = getUnassignedLinePlayers();

    if (unassigned.length > 0) {
        unassigned.forEach(playerName => {
            const li = createElement("li", { textContent: playerName, draggable: true });
            li.addEventListener("dragstart", e => onPlayerDragStart(e, playerName));
            playersList.appendChild(li);
        });
    } else {
        playersList.textContent = "All players are assigned to lines.";
    }
}

// Handle drag start
function onPlayerDragStart(event, playerName) {
    event.dataTransfer.setData("playerName", playerName);
}

// Handle dropping a player onto a line
function onLineDrop(event, teamName, lineIndex, position) {
    event.preventDefault();

    const playerName = event.dataTransfer.getData("playerName");
    const team = teams.find(t => t.name === teamName);

    if (!team) {
        console.log(`Team ${teamName} not found.`);
        return;
    }

    let line;
    // Check which line (forward, defense, goalie) is being targeted
    if (position.includes('F')) {
        // Forward Lines
        line = team.lines.forwardLines[lineIndex];
    } else if (position.includes('D')) {
        // Defense Lines
        line = team.lines.defenseLines[lineIndex];
    } else if (position === 'starter' || position === 'backup') {
        // Goalies
        line = team.lines.goalies;
    }

    // If position is already filled, do nothing
    if (line[position]) {
        console.log(`${position} on ${teamName} is already occupied.`);
        return;
    }

    // Assign the player to the correct position
    line[position] = playerName;

    // Update teams data and re-render
    updateTeams();
}


// Allow drop
function allowDrop(event) {
    event.preventDefault();
}

// Render team lines
function renderTeamLines() {
    const container = document.getElementById("team-lines");
    container.innerHTML = ""; // Clear container

    teams.forEach(team => {
        const section = createElement("div", { className: "team-section" });
        section.appendChild(createElement("h2", { textContent: `${team.name} Line Assignment` }));

        section.appendChild(renderLineSection("Forward Lines", team.lines.forwardLines, team, "forward"));
        section.appendChild(renderLineSection("Defense Lines", team.lines.defenseLines, team, "defense"));
        section.appendChild(renderLineSection("Goalies", [team.lines.goalies], team, "goalie"));

        container.appendChild(section);
    });
}

// Render a line section (Forward, Defense, Goalies)
function renderLineSection(title, lines, team, type) {
    const section = createElement("div", { className: "line-section" });
    section.appendChild(createElement("h3", { textContent: title }));

    lines.forEach((line, index) => {
        const lineContainer = createElement("div", { className: "line-container" });

        Object.keys(line).forEach(position => {
            const player = line[position];
            const dropZone = createElement("div", {
                className: "player-drop-zone",
                textContent: player || `Drag ${position} here`,
            });

            dropZone.ondrop = e => onLineDrop(e, team.name, index, position);
            dropZone.ondragover = allowDrop;

            lineContainer.appendChild(dropZone);
        });

        section.appendChild(lineContainer);
    });

    return section;
}

// Helper to create elements with attributes
function createElement(tag, attributes) {
    const element = document.createElement(tag);
    Object.assign(element, attributes);
    return element;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", loadData);
