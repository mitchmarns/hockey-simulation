// assign_lines.js

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem('teamsData') === null) {
        // Sample data structure if teams data doesn't exist in localStorage
        const teamsData = {
            "Rangers": [
                { id: 1, name: "Player 1", position: "LW" },
                { id: 2, name: "Player 2", position: "C" },
                { id: 3, name: "Player 3", position: "RW" }
            ],
            "Devils": [
                { id: 4, name: "Player 4", position: "LW" },
                { id: 5, name: "Player 5", position: "C" },
                { id: 6, name: "Player 6", position: "RW" }
            ],
            "Islanders": [
                { id: 7, name: "Player 7", position: "LW" },
                { id: 8, name: "Player 8", position: "C" },
                { id: 9, name: "Player 9", position: "RW" }
            ],
            "Sabres": [
                { id: 10, name: "Player 10", position: "LW" },
                { id: 11, name: "Player 11", position: "C" },
                { id: 12, name: "Player 12", position: "RW" }
            ]
        };
        localStorage.setItem('teamsData', JSON.stringify(teamsData));
    }
});

function loadPlayers() {
    const teamSelect = document.getElementById('teamSelect');
    const selectedTeam = teamSelect.value;
    const teamsData = JSON.parse(localStorage.getItem('teamsData'));

    if (selectedTeam) {
        const players = teamsData[selectedTeam];

        // Clear previous player list
        const playerList = document.getElementById('playerList');
        playerList.innerHTML = '';

        // Create a list of players for assignment
        players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.classList.add('player-card');
            playerCard.innerHTML = `
                <p>${player.name} - ${player.position}</p>
                <button onclick="assignPlayer('${selectedTeam}', ${player.id})">Assign to Line</button>
            `;
            playerList.appendChild(playerCard);
        });

        loadLineAssignments(selectedTeam, players);
    }
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
        const forwardLine = forwards.slice(i * 3, (i + 1) * 3);
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
        const defenseLine = defensemen.slice(i * 2, (i + 1) * 2);
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
    const teamsData = JSON.parse(localStorage.getItem('teamsData'));
    const player = teamsData[team].find(p => p.id === playerId);

    // Store the player's line assignment here
    console.log(`Assigned ${player.name} to a line for ${team}`);
}

function assignToLine(team, lineType, lineIndex) {
    const lineSelect = document.getElementById(`${lineType}Line${lineIndex}`);
    const playerId = lineSelect.value;

    if (playerId) {
        const teamsData = JSON.parse(localStorage.getItem('teamsData'));
        const player = teamsData[team].find(p => p.id === playerId);
        console.log(`Assigned ${player.name} to ${lineType} Line ${lineIndex + 1}`);
        // You can also store this information back into localStorage or update the UI accordingly
    }
}
