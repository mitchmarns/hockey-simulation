let teams = [];
let players = [];

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

function loadDataFromJSON() {
    fetch('../data/players.json')
        .then(response => response.json())
        .then(data => {
            players = data.players;
            localStorage.setItem("players", JSON.stringify(players));
            renderTeamLines();
        })
        .catch(error => console.error("Error fetching players:", error));

    fetch('../data/teams.json')
        .then(response => response.json())
        .then(data => {
            teams = data;
            saveTeamsToLocalStorage(); // Save teams to localStorage
        })
        .catch(error => console.error("Error loading teams:", error));
}

function saveTeamsToLocalStorage() {
    localStorage.setItem("teams", JSON.stringify(teams));
}

function renderTeamLines() {
    const teamLinesContainer = document.getElementById("team-lines");
    teamLinesContainer.innerHTML = ""; // Clear existing content

    // Loop through all teams
    teams.forEach(team => {
        const teamSection = document.createElement("div");
        teamSection.classList.add("team-section");

        const teamName = document.createElement("h2");
        teamName.textContent = `${team.name} Line Assignment`;
        teamSection.appendChild(teamName);

        // Forward Lines
        if (team.lines && team.lines.forwardLines && Array.isArray(team.lines.forwardLines)) {
            teamSection.appendChild(createLineSection("Forward Lines", team.lines.forwardLines, team));
        }

        // Defense Lines
        if (team.lines && team.lines.defenseLines && Array.isArray(team.lines.defenseLines)) {
            teamSection.appendChild(createLineSection("Defense Lines", team.lines.defenseLines, team));
        }

        // Goalies
        if (team.lines && team.lines.goalies && team.lines.goalies.starter) {
            teamSection.appendChild(createLineSection("Goalies", [team.lines.goalies], team)); // Goalies is an object
        }

        teamLinesContainer.appendChild(teamSection);
    });
}

function createLineSection(title, lines, team) {
    const section = document.createElement("div");
    section.classList.add("line-section");

    const sectionTitle = document.createElement("h3");
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);

    // Check if lines are an array and not empty
    if (lines && lines.length > 0) {
        lines.forEach((line, index) => {
            const lineContainer = document.createElement("div");
            lineContainer.classList.add("line-placeholder");

            // Iterate through each position in the line (LW, C, RW, etc.)
            Object.keys(line).forEach((position) => {
                const player = line[position];  // This will be null initially

                const playerElement = document.createElement("div");
                playerElement.classList.add("player-draggable");

                // If player is null, show a placeholder
                playerElement.textContent = player ? player.name : `Drag a ${position} here`;
                playerElement.setAttribute("draggable", true);
                playerElement.addEventListener("dragstart", (e) => onDragStart(e, team.name, index, position));

                lineContainer.appendChild(playerElement);
            });

            section.appendChild(lineContainer);
        });
    } else {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No lines assigned yet.";
        section.appendChild(emptyMessage);
    }

    return section;
}

function onDragStart(event, teamName, lineIndex, playerIndex) {
    const player = players.find(p => p.name === event.target.textContent);
    event.dataTransfer.setData("player", JSON.stringify(player));
    event.dataTransfer.setData("teamName", teamName);
    event.dataTransfer.setData("lineIndex", lineIndex);
    event.dataTransfer.setData("playerIndex", playerIndex);
}

// Function to handle drop logic
function onDrop(event) {
    event.preventDefault();

    const playerData = JSON.parse(event.dataTransfer.getData("player"));
    const teamName = event.dataTransfer.getData("teamName");
    const lineIndex = event.dataTransfer.getData("lineIndex");
    const playerIndex = event.dataTransfer.getData("playerIndex");

    const team = teams.find(t => t.name === teamName);
    if (team) {
        team.forwardLines[lineIndex][playerIndex] = playerData;

        // Update teams in localStorage
        saveTeamsToLocalStorage();
        renderTeamLines(); // Re-render the team lines
    }
}

function onDragOver(event) {
    event.preventDefault();
}

window.onload = function () {
    loadFromLocalStorage();
};
