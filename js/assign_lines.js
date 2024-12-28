document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem('teamsData') === null) {
        // Sample data structure if teams data doesn't exist in localStorage
        const teamsData = {
            "Rangers": [
                { id: 1, name: "Player 1", position: "LW" },
                { id: 2, name: "Player 2", position: "C" },
                { id: 3, name: "Player 3", position: "RW" },
                // ...other players
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

        players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.classList.add('player-card');
            playerCard.innerHTML = `
                <img src="${player.image || 'default_image.png'}" alt="${player.name}" />
                <p>${player.name}</p>
                <p>${player.position}</p>
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

    const lines = ['Forward', 'Defense', 'Goalie'];
    lines.forEach(lineType => {
        const lineDiv = document.createElement('div');
        lineDiv.classList.add('line');
        lineDiv.innerHTML = `
            <label for="${lineType}Line">${lineType} Line</label>
            <select id="${lineType}Line" onchange="assignToLine('${team}', '${lineType}')">
                <option value="">Select ${lineType} Line</option>
                ${players.map(player => `<option value="${player.id}">${player.name}</option>`).join('')}
            </select>
        `;
        lineAssignmentDiv.appendChild(lineDiv);
    });
}

function assignPlayer(team, playerId) {
    const teamsData = JSON.parse(localStorage.getItem('teamsData'));
    const player = teamsData[team].find(p => p.id === playerId);

    // You can now store this player’s line assignment here
    console.log(`Assign ${player.name} to a line for ${team}`);
}

function assignToLine(team, lineType) {
    const lineSelect = document.getElementById(`${lineType}Line`);
    const playerId = lineSelect.value;

    if (playerId) {
        const teamsData = JSON.parse(localStorage.getItem('teamsData'));
        const player = teamsData[team].find(p => p.id === playerId);
        console.log(`Assigned ${player.name} to ${lineType} Line`);
        // You can also store this information back into localStorage or update the UI accordingly
    }
}
