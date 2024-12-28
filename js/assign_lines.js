// Function to populate lines for a given team
function populateLines(team) {
  const teamName = team.name.toLowerCase();
  let assignedPlayers = new Set(); // Track assigned players for this team

  // Forward Lines
  const forwardLinesContainer = document.getElementById(`${teamName}-forward-lines`);
  team.lines.forwardLines.forEach((line, index) => {
    const lineElement = document.createElement('div');
    lineElement.classList.add('line');

    // Assign players to the line, ensuring no duplicate assignments
    const LW = team.players.find(player => player.position === 'LW' && player.team === team.name && !assignedPlayers.has(player.name));
    const C = team.players.find(player => player.position === 'C' && player.team === team.name && !assignedPlayers.has(player.name));
    const RW = team.players.find(player => player.position === 'RW' && player.team === team.name && !assignedPlayers.has(player.name));

    // Assign players to the line if available, otherwise use 'N/A'
    lineElement.innerHTML = `
      <strong>Line ${index + 1}:</strong> 
      LW: ${LW ? LW.name : 'N/A'} | 
      C: ${C ? C.name : 'N/A'} | 
      RW: ${RW ? RW.name : 'N/A'}
    `;
    
    // Mark players as assigned
    if (LW) assignedPlayers.add(LW.name);
    if (C) assignedPlayers.add(C.name);
    if (RW) assignedPlayers.add(RW.name);

    forwardLinesContainer.appendChild(lineElement);
  });

  // Defense Lines
  const defenseLinesContainer = document.getElementById(`${teamName}-defense-lines`);
  team.lines.defenseLines.forEach((line, index) => {
    const lineElement = document.createElement('div');
    lineElement.classList.add('line');

    // Assign players to the defense line, ensuring no duplicate assignments
    const LD = team.players.find(player => player.position === 'LD' && player.team === team.name && !assignedPlayers.has(player.name));
    const RD = team.players.find(player => player.position === 'RD' && player.team === team.name && !assignedPlayers.has(player.name));

    // Assign players to the line if available, otherwise use 'N/A'
    lineElement.innerHTML = `
      <strong>Line ${index + 1}:</strong> 
      LD: ${LD ? LD.name : 'N/A'} | 
      RD: ${RD ? RD.name : 'N/A'}
    `;
    
    // Mark players as assigned
    if (LD) assignedPlayers.add(LD.name);
    if (RD) assignedPlayers.add(RD.name);

    defenseLinesContainer.appendChild(lineElement);
  });

  // Goalies
  const goalieContainer = document.getElementById(`${teamName}-goalie`);
  const starter = team.players.find(player => player.position === 'starter' && player.team === team.name && !assignedPlayers.has(player.name));
  const backup = team.players.find(player => player.position === 'backup' && player.team === team.name && !assignedPlayers.has(player.name));

  const goalieElement = document.createElement('div');
  goalieElement.classList.add('line');
  goalieElement.innerHTML = `
    Starter: ${starter ? starter.name : 'N/A'} | 
    Backup: ${backup ? backup.name : 'N/A'}
  `;
  
  // Mark goalies as assigned
  if (starter) assignedPlayers.add(starter.name);
  if (backup) assignedPlayers.add(backup.name);

  goalieContainer.appendChild(goalieElement);
}

// Ensure the teams are loaded from localStorage
const teams = JSON.parse(localStorage.getItem("teams"));

// Populate lines for each team
teams.forEach(team => populateLines(team));
