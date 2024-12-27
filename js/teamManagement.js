let players = [];
let teams = [];

// Fetch player and team data
fetch('../data/players.json')
    .then(response => response.json())
    .then(data => {
        players = data;
        console.log("Players Loaded:", players);
    })
    .catch(error => console.error("Error loading players:", error));

fetch('../data/teams.json')
    .then(response => response.json())
    .then(data => {
        teams = data;
        console.log("Teams Loaded:", teams);
    })
    .catch(error => console.error("Error loading teams:", error));

// Function to assign a player to a team
function assignPlayerToTeam(playerId, teamName) {
    const player = players.find(p => p.id === playerId);
    const team = teams.find(t => t.name === teamName);

    if (player && team && player.team === null) {
        team.players.push(player);  // Add player to the team
        player.team = teamName;     // Set the player's team
        console.log(`${player.name} assigned to the ${teamName}`);
    } else {
        console.log("Player already assigned or team doesn't exist");
    }
}

// Function to assign player to forward line
function assignPlayerToForwardLine(playerId, teamName, lineIndex, position) {
    const player = players.find(p => p.id === playerId);
    const team = teams.find(t => t.name === teamName);

    if (player && team) {
        const line = team.lines.forwardLines[lineIndex];
        if (line[position] === null) {
            line[position] = player;  // Assign player to position
            player.lineAssigned = `Forward Line ${lineIndex + 1} - ${position}`;
            console.log(`${player.name} assigned to Forward Line ${lineIndex + 1} as ${position}`);
        } else {
            console.log(`Position ${position} is already taken on Line ${lineIndex + 1}`);
        }
    }
}

// Function to assign player to defense line
function assignPlayerToDefenseLine(playerId, teamName, lineIndex, position) {
    const player = players.find(p => p.id === playerId);
    const team = teams.find(t => t.name === teamName);

    if (player && team) {
        const line = team.lines.defenseLines[lineIndex];
        if (line[position] === null) {
            line[position] = player;  // Assign player to position
            player.lineAssigned = `Defense Line ${lineIndex + 1} - ${position}`;
            console.log(`${player.name} assigned to Defense Line ${lineIndex + 1} as ${position}`);
        } else {
            console.log(`Position ${position} is already taken on Line ${lineIndex + 1}`);
        }
    }
}

// Function to assign player to goalie line
function assignPlayerToGoalieLine(playerId, teamName, position) {
    const player = players.find(p => p.id === playerId);
    const team = teams.find(t => t.name === teamName);

    if (player && team) {
        if (team.lines.goalies[position] === null) {
            team.lines.goalies[position] = player;  // Assign player to goalie position
            player.lineAssigned = `Goalie - ${position}`;
            console.log(`${player.name} assigned to Goalies as ${position}`);
        } else {
            console.log(`Position ${position} is already taken for Goalies`);
        }
    }
}
