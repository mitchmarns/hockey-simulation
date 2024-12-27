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

    teams.forEach(team => {
        const teamSection = document.createElement("div");
        teamSection.classList.add("team-section");

        const teamName = document.createElement("h2");
        teamName.textContent = `${team.name} Line Assignment`;
        teamSection.appendChild(teamName);

        // Forward Lines
        teamSection.appendChild(createLineSection("Forward Lines", team.forwardLines, team));

        // Defense Lines
        teamSection.appendChild(createLineSection("Defense Lines", team.defenseLines, team));

        // Goalies
        teamSection.appendChild(createLineSection("Goalies", team.goalies, team));

        teamLinesContainer.appendChild(teamSection);
    });
}

function createLineSection(title, lines, team) {
    const section = document.createElement("div");
    section.classList.add("line-section");

    const sectionTitle = document.createElement("h3");
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);

    lines.forEach((line, index) => {
        const lineContainer = document.createElement("div");
        lineContainer.classList.add("line-placeholder");

        line.forEach((player, playerIndex) => {
            const playerElement = document.createElement("div");
            playerElement.classList.add("player-draggable");
            playerElement.textContent = player ? player.name : "Drag a player here";
            playerElement.setAttribute("draggable", true);
            playerElement.addEventListener("dragstart", (e) => onDragStart(e, team.name, index, playerIndex));

            lineContainer.appendChild(playerElement);
        });

        section.appendChild(lineContainer);
    });

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
