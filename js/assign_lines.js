document.addEventListener("DOMContentLoaded", function () {
    const teamsData = localStorage.getItem('teams');
    if (!teamsData) {
        console.error("No teams data found in localStorage.");
        return;
    }

    // Parse the JSON string into an array of teams
    const teams = JSON.parse(teamsData);
    console.log("Parsed teams data:", teams); // Debugging log

    const teamSelect = document.getElementById('teamSelect');
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.name; // Use team name as the value
        option.textContent = team.name; // Display team name in dropdown
        teamSelect.appendChild(option);
    });

    teamSelect.addEventListener('change', function () {
        loadPlayers(teams);
    });
});

function loadPlayers(teams) {
    const teamSelect = document.getElementById('teamSelect');
    const selectedTeamName = teamSelect.value;

    // Find the selected team by name
    const selectedTeam = teams.find(team => team.name === selectedTeamName);
    if (!selectedTeam) {
        console.error(`Team not found: ${selectedTeamName}`);
        return;
    }

    const players = selectedTeam.players;

    // Ensure players is an array
    if (!Array.isArray(players)) {
        console.error(`Players for ${selectedTeamName} is not an array`, players);
        return;
    }

    const playerList = document.getElementById('playerList');
    playerList.innerHTML = ''; // Clear the previous list of players

    // Display players for the selected team
    players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.classList.add('player-card');
        playerCard.innerHTML = `
            <p>${player.name} - ${player.position}</p>
            <button onclick="assignPlayer('${selectedTeamName}', ${player.id})">Assign to Line</button>
        `;
        playerList.appendChild(playerCard);
    });

    loadLineAssignments(selectedTeamName, players); // Call to load the lines
}

function loadLineAssignments(teamName, players) {
    const lineAssignmentDiv = document.getElementById('lineAssignment');
    lineAssignmentDiv.innerHTML = ''; // Clear previous line assignments

    // Group players by their positions
    const forwards = players.filter(p => p.position === 'LW' || p.position === 'C' || p.position === 'RW');
    const defensemen = players.filter(p => p.position === 'LD' || p.position === 'RD');
    const goalies = players.filter(p => p.position === 'G');

    // Generate forward lines
    for (let i = 0; i < 4; i++) {
        const forwardLine = forwards.slice(i * 3, (i + 1) * 3); // Each line should have 3 forwards
        const forwardLineDiv = document.createElement('div');
        forwardLineDiv.classList.add('line');
        forwardLineDiv.innerHTML = `
            <label for="forwardLine${i}">Forward Line ${i + 1}</label>
            <select id="forwardLine${i}" onchange="assignToLine('${teamName}', 'Forward', ${i})">
                <option value="">Select Forward Line ${i + 1}</option>
                ${forwardLine.map(player => `<option value="${player.id}">${player.name} (${player.position})</option>`).join('')}
            </select>
        `;
        lineAssignmentDiv.appendChild(forwardLineDiv);
    }

    // Generate defensive pairings (assuming you have enough defensemen)
    for (let i = 0; i < 3; i++) {
        const defenseLine = defensemen.slice(i * 2, (i + 1) * 2); // Each pair should have 2 defensemen
        const defenseLineDiv = document.createElement('div');
        defenseLineDiv.classList.add('line');
        defenseLineDiv.innerHTML = `
            <label for="defenseLine${i}">Defense Line ${i + 1}</label>
            <select id="defenseLine${i}" onchange="assignToLine('${teamName}', 'Defense', ${i})">
                <option value="">Select Defense Line ${i + 1}</option>
                ${defenseLine.map(player => `<option value="${player.id}">${player.name} (${player.position})</option>`).join('')}
            </select>
        `;
        lineAssignmentDiv.appendChild(defenseLineDiv);
    }

    // Generate goalie line (assuming you have goalies)
    const goalieLineDiv = document.createElement('div');
    goalieLineDiv.classList.add('line');
    goalieLineDiv.innerHTML = `
        <label for="goalieLine">Goalie Line</label>
        <select id="goalieLine" onchange="assignToLine('${teamName}', 'Goalie')">
            <option value="">Select Goalie</option>
            ${goalies.map(player => `<option value="${player.id}">${player.name} (${player.position})</option>`).join('')}
        </select>
    `;
    lineAssignmentDiv.appendChild(goalieLineDiv);
}

function assignPlayer(teamName, playerId, lineIndex = null) {
    const teams = JSON.parse(localStorage.getItem('teams'));
    const team = teams.find(t => t.name === teamName);
    
    if (!team) {
        console.error("Team not found!");
        return;
    }

    // Find the player by ID in the selected team's players array
    const player = team.players.find(p => p.id === playerId);
    if (!player) {
        console.error(`Player with ID ${playerId} not found in team ${teamName}`);
        return;
    }

    // Example logic for assigning to lines (ensure to define lineType and role clearly)
    if (lineIndex === null) {
        // Assign to a goalie line or another line type here based on your role and line type logic
    } else {
        // Assign to specific line (e.g., Forward, Defense)
    }

    player.lineAssigned = true;
    localStorage.setItem("teams", JSON.stringify(teams));
    updateUI();
}

function assignToLine(teamName, lineType, lineIndex) {
    const lineSelect = document.getElementById(`${lineType}Line${lineIndex}`);
    const playerId = lineSelect.value;

    if (playerId) {
        const teams = JSON.parse(localStorage.getItem('teams'));  // Parse teams data
        const team = teams.find(t => t.name === teamName);
        const player = team.players.find(p => p.id === parseInt(playerId));

        console.log(`Assigned ${player.name} to ${lineType} Line ${lineIndex + 1}`);

        // Store or update the line assignment as needed
        // You can also store this back into localStorage or update the UI accordingly
    }
}

function updateUI() {
    // Any necessary UI updates after line assignment or player assignment
}
