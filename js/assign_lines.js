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

// Load data from localStorage or JSON
function loadData() {
    const storedTeams = getFromLocalStorage("teams");
    const storedPlayers = getFromLocalStorage("players");

    if (storedTeams.length > 0 && storedPlayers.length > 0) {
        teams = storedTeams;
        allPlayers = storedPlayers;
        
        // Link players to their teams (if necessary)
        teams.forEach(team => {
            team.players.forEach(playerName => {
                const player = allPlayers.find(p => p.name === playerName);
                if (player) {
                    player.team = team.name;
                    player.assigned = true; // Ensure player is marked as assigned
                }
            });
        });

        console.log("Loaded data from localStorage.");
        renderAll();
    } else {
        console.log("No data in localStorage, loading from JSON...");
        loadDataFromJSON();
    }
}

// Fetch player and team data from JSON
function loadDataFromJSON() {
    fetch('/data/players.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load players.json");
            }
            return response.json();
        })
        .then(data => {
            allPlayers = data;
            saveToLocalStorage("players", allPlayers);
            console.log("Players loaded from JSON:", allPlayers);
            renderAll();
        })
        .catch(error => console.error("Error loading players:", error));

    fetch('/data/teams.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load teams.json");
            }
            return response.json();
        })
        .then(data => {
            teams = data;
            saveToLocalStorage("teams", teams);
            console.log("Teams loaded from JSON:", teams);
            renderAll();
        })
        .catch(error => console.error("Error loading teams:", error));
}

// Save updated teams to localStorage
function updateTeams() {
    saveToLocalStorage("teams", teams);
    renderAll();
}

// Render all dynamic content
function renderAll() {
    renderAssignedPlayers();
    teams.forEach(team => renderTeamLines(team));
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

// Render unassigned players
function renderAssignedPlayers() {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = ""; // Clear list

    // Get teams data from localStorage
    const teams = getFromLocalStorage("teams");

    // Flatten the list of players from all teams and filter those who are assigned
    const assigned = teams.flatMap(team =>
        team.players.filter(player => player.assigned && player.team)
    );

    if (assigned.length > 0) {
        assigned.forEach(player => {
            const li = createElement("li", { textContent: player.name, draggable: true });
            li.addEventListener("dragstart", e => onPlayerDragStart(e, player.name));
            playersList.appendChild(li);
        });
    } else {
        playersList.textContent = "No players are assigned to teams yet.";
    }
}

function onPlayerDragStart(event, playerName) {
    event.dataTransfer.setData("playerName", playerName);
    event.target.style.opacity = "0.5"; 
}

// Handle drag start
function onLineDrop(event, teamName, lineIndex, position) {
    event.preventDefault();

    const playerName = event.dataTransfer.getData("playerName");

    // Debugging: Log the teamName and playerName
    console.log("Dropped player:", playerName);
    console.log("Team Name:", teamName);

    // Find the team in the teams array
    const team = teams.find(t => t.name === teamName);
    // Find the player in the allPlayers array
    const player = allPlayers.find(p => p.name === playerName);

    // Debugging: Log whether the team and player were found
    if (!team) {
        console.log("Team not found:", teamName);
    }
    if (!player) {
        console.log("Player not found:", playerName);
    }

    // If either team or player is not found, return
    if (!team || !player) {
        console.log("Team or player not found.");
        return;
    }

    let line;
    let lineContainer;

    // Determine line type (forward, defense, goalie)
    if (position.includes('F')) {
        line = team.lines.forwardLines[lineIndex];
        lineContainer = document.getElementById(`${teamName}-forward-line-${lineIndex}-${position}`);
    } else if (position.includes('D')) {
        line = team.lines.defenseLines[lineIndex];
        lineContainer = document.getElementById(`${teamName}-defense-line-${lineIndex}-${position}`);
    } else if (position === 'starter' || position === 'backup') {
        line = team.lines.goalies;
        lineContainer = document.getElementById(`${teamName}-goalie-${position}`);
    }

    // If the position is already occupied, return
    if (line[position]) {
        console.log(`${position} on ${teamName} is already occupied.`);
        return;
    }

    // Assign player to the line
    line[position] = playerName;
    updateTeams();

    // Create player card and update the line container
    const playerCard = createPlayerCard(playerName, player.image, position);
    lineContainer.innerHTML = '';
    lineContainer.appendChild(playerCard);
}

// Create player card
function createPlayerCard(playerName, imageSrc, position) {
    const playerCard = createElement("div", { className: "player-card" });
    const img = createElement("img", { src: imageSrc || 'https://via.placeholder.com/50', alt: `${playerName}'s Image`, className: "player-image" });
    const playerPosition = createElement("p", { textContent: position });
    const playerNameElement = createElement("p", { textContent: playerName });

    playerCard.appendChild(img);
    playerCard.appendChild(playerNameElement);
    playerCard.appendChild(playerPosition);

    return playerCard;
}

// Allow drop
function allowDrop(event) {
    event.preventDefault();
}

// Render team lines
function renderTeamLines(team) {
    const container = document.getElementById("teams-container");
    const teamContainer = createElement("div", { className: "team-container" });

    teamContainer.appendChild(createElement("h3", { textContent: team.name }));

    teamContainer.appendChild(renderLineSection("Forward Lines", team.lines.forwardLines, team, "forward"));
    teamContainer.appendChild(renderLineSection("Defense Lines", team.lines.defenseLines, team, "defense"));
    teamContainer.appendChild(renderLineSection("Goalies", [team.lines.goalies], team, "goalie"));

    container.appendChild(teamContainer);
}

// Render a line section
function renderLineSection(title, lines, team, type) {
    const section = createElement("div", { className: "line-section" });
    section.appendChild(createElement("h3", { textContent: title }));

    lines.forEach((line, index) => {
        const lineContainer = createElement("div", { className: "line-container" });

        Object.keys(line).forEach(position => {
            const playerName = line[position];
            const dropZone = createElement("div", {
                className: "player-drop-zone",
                id: `${team.name}-${type}-line-${index}-${position}`,
                textContent: playerName || `Drag ${position} here`,
            });

            dropZone.ondrop = e => onLineDrop(e, team.name, index, position);
            dropZone.ondragover = allowDrop;

            if (playerName) {
                const player = allPlayers.find(p => p.name === playerName);
            
                if (player) {
                    dropZone.innerHTML = '';
                    dropZone.appendChild(createPlayerCard(playerName, player.image, position));
                } else {
                    console.warn(`Player not found in allPlayers: ${playerName}`);
                    dropZone.textContent = `Player not found: ${playerName}`;
                }
            }

            lineContainer.appendChild(dropZone);
        });

        section.appendChild(lineContainer);
    });

    return section;
}

// Helper to create elements
function createElement(tag, attributes) {
    const element = document.createElement(tag);
    Object.assign(element, attributes);
    return element;
}

// Initialize
document.addEventListener("DOMContentLoaded", loadData);
