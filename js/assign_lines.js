document.addEventListener("DOMContentLoaded", function () {
    // Check if the teams data exists in localStorage
    if (localStorage.getItem('teams') === null) {
        console.log("No teams data found in localStorage.");
        return;
    }

    // Load the teams data from localStorage
    const teams = JSON.parse(localStorage.getItem('teams'));

    const teamSelect = document.getElementById('teamSelect');

    // Populate the team select dropdown with team names
    Object.keys(teams).forEach(teamName => {
        const option = document.createElement('option');
        option.value = teamName;
        option.textContent = teamName;
        teamSelect.appendChild(option);
    });

    // Load the players when a team is selected
    teamSelect.addEventListener('change', function () {
        loadPlayers(teams);
    });
});

function loadPlayers(teams) {
    const teamSelect = document.getElementById('teamSelect');
    const selectedTeam = teamSelect.value;
    const players = teams[selectedTeam];

    const playerList = document.getElementById('playerList');
    playerList.innerHTML = ''; // Clear the previous list of players

    // Display players for the selected team
    players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.classList.add('player-card');
        playerCard.innerHTML = `
            <p>${player.name} - ${player.position}</p>
            <button onclick="assignPlayer('${selectedTeam}', ${player.id})">Assign to Line</button>
        `;
        playerList.appendChild(playerCard);
    });

    loadLineAssignments(selectedTeam, players); // Call to load the lines
}

function loadLineAssignments(team, players) {
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
            <select id="forwardLine${i}" onchange="assignToLine('${team}', 'Forward', ${i})">
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
            <select id="defenseLine${i}" onchange="assignToLine('${team}', 'Defense', ${i})">
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
        <select id="goalieLine" onchange="assignToLine('${team}', 'Goalie')">
            <option value="">Select Goalie</option>
            ${goalies.map(player => `<option value="${player.id}">${player.name} (${player.position})</option>`).join('')}
        </select>
    `;
    lineAssignmentDiv.appendChild(goalieLineDiv);
}

function assignPlayer(team, playerId) {
    const teams = JSON.parse(localStorage.getItem('teams'));  // Use teams, not teamsData
    const player = teams[team].find(p => p.id === playerId);

    // Store the player's line assignment here
    console.log(`Assigned ${player.name} to a line for ${team}`);
}

function assignToLine(team, lineType, lineIndex) {
    const lineSelect = document.getElementById(`${lineType}Line${lineIndex}`);
    const playerId = lineSelect.value;

    if (playerId) {
        const teams = JSON.parse(localStorage.getItem('teams'));  // Use teams, not teamsData
        const player = teams[team].find(p => p.id === playerId);
        console.log(`Assigned ${player.name} to ${lineType} Line ${lineIndex + 1}`);
        // You can also store this information back into localStorage or update the UI accordingly
    }
}
