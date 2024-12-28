// Function to populate lines for a given team
function populateLines(team) {
  const teamName = team.name.toLowerCase();

  // Forward Lines
  const forwardLinesContainer = document.getElementById(`${teamName}-forward-lines`);
  team.lines.forwardLines.forEach((line, index) => {
    const lineElement = document.createElement('div');
    lineElement.classList.add('line');

    // Retrieve player names from the team’s players array for the positions
    const LW = team.players.find(player => player.name === line.LW);
    const C = team.players.find(player => player.name === line.C);
    const RW = team.players.find(player => player.name === line.RW);

    lineElement.innerHTML = `<strong>Line ${index + 1}:</strong> LW: ${LW ? LW.name : 'N/A'} | C: ${C ? C.name : 'N/A'} | RW: ${RW ? RW.name : 'N/A'}`;
    forwardLinesContainer.appendChild(lineElement);
  });

  // Defense Lines
  const defenseLinesContainer = document.getElementById(`${teamName}-defense-lines`);
  team.lines.defenseLines.forEach((line, index) => {
    const lineElement = document.createElement('div');
    lineElement.classList.add('line');
    
    // Retrieve player names for defense positions
    const LD = team.players.find(player => player.name === line.LD);
    const RD = team.players.find(player => player.name === line.RD);

    lineElement.innerHTML = `<strong>Line ${index + 1}:</strong> LD: ${LD ? LD.name : 'N/A'} | RD: ${RD ? RD.name : 'N/A'}`;
    defenseLinesContainer.appendChild(lineElement);
  });

  // Goalies
  const goalieContainer = document.getElementById(`${teamName}-goalie`);
  const starter = team.players.find(player => player.name === team.lines.goalies.starter);
  const backup = team.players.find(player => player.name === team.lines.goalies.backup);
  
  const goalieElement = document.createElement('div');
  goalieElement.classList.add('line');
  goalieElement.innerHTML = `Starter: ${starter ? starter.name : 'N/A'} | Backup: ${backup ? backup.name : 'N/A'}`;
  goalieContainer.appendChild(goalieElement);
}

// Ensure the teams are loaded from localStorage
const teams = JSON.parse(localStorage.getItem("teams"));

// Populate lines for each team
teams.forEach(team => populateLines(team));
