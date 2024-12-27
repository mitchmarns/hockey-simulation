let teams = [];
let players = [];

// Load data from localStorage or fetch from JSON files
function loadFromLocalStorage() {
    const savedTeams = localStorage.getItem("teams");
    const savedPlayers = localStorage.getItem("players");

    if (savedTeams && savedPlayers) {
        teams = JSON.parse(savedTeams);
        players = JSON.parse(savedPlayers);
        console.log("Loaded teams and players from localStorage.");
        renderTeamLines(); // Render lines after data is loaded
    } else {
        console.log("No data in localStorage, will load from JSON files.");
        loadDataFromJSON(); // Load data from JSON if localStorage is empty
    }
}

// Fetch players and teams data from JSON files
function loadDataFromJSON() {
    fetch('../data/players.json')
        .then(response => response.json())
        .then(data => {
            players = data.players;
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
    playersList.innerHTML = ''; // Clear existing list

    players.forEach(player => {
        const playerItem = document.createElement("li");
        playerItem.textContent = player.name;

        playerItem.setAttribute("draggable", "true");
        playerItem.addEventListener("dragstart", (e) => onPlayerDragStart(e, player));

        playersList.appendChild(playerItem);
    });
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

    // Assign player to the correct position in the team lines
    const line = team.lines.forwardLines[lineIndex];  // For forward lines
    line[position] = playerData.name;  // Assign player by name

    saveTeamsToLocalStorage(); // Save updated teams to localStorage
    renderTeamLines();  // Re-render lines to reflect the changes
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

