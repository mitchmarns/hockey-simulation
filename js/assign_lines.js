let teams = JSON.parse(localStorage.getItem("teams"));

// Function to populate lines for a given team
function populateLines(team) {
  const teamName = team.name.toLowerCase();
  let assignedPlayers = new Set(); // Track assigned players for this team

  // Forward Lines
  const forwardLinesContainer = document.getElementById(`${teamName}-forward-lines`);
  team.lines.forwardLines.forEach((line, index) => {
    const lineElement = document.createElement('div');
    lineElement.classList.add('line');
    lineElement.setAttribute('draggable', true);
    lineElement.setAttribute('data-line-index', index);  // Store the line index in the element
    lineElement.addEventListener('dragstart', handleDragStart);  // Add dragstart event listener

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
    
    // Update the team's lines data in memory
    if (LW) {
      assignedPlayers.add(LW.name);
      team.lines.forwardLines[index].LW = LW.name; // Save the player name in the line data
    }
    if (C) {
      assignedPlayers.add(C.name);
      team.lines.forwardLines[index].C = C.name; // Save the player name in the line data
    }
    if (RW) {
      assignedPlayers.add(RW.name);
      team.lines.forwardLines[index].RW = RW.name; // Save the player name in the line data
    }

    forwardLinesContainer.appendChild(lineElement);
  });

  // Defense Lines
  const defenseLinesContainer = document.getElementById(`${teamName}-defense-lines`);
  team.lines.defenseLines.forEach((line, index) => {
    const lineElement = document.createElement('div');
    lineElement.classList.add('line');
    lineElement.setAttribute('draggable', true);
    lineElement.setAttribute('data-line-index', index);  // Store the line index in the element
    lineElement.addEventListener('dragstart', handleDragStart);  // Add dragstart event listener

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
    if (LD) {
      assignedPlayers.add(LD.name);
      team.lines.defenseLines[index].LD = LD.name; // Save the player name in the line data
    }
    if (RD) {
      assignedPlayers.add(RD.name);
      team.lines.defenseLines[index].RD = RD.name; // Save the player name in the line data
    }

    defenseLinesContainer.appendChild(lineElement);
  });

  // Goalies
  const goalieContainer = document.getElementById(`${teamName}-goalie`);
  const starter = team.players.find(player => player.position === 'starter' && player.team === team.name && !assignedPlayers.has(player.name));
  const backup = team.players.find(player => player.position === 'backup' && player.team === team.name && !assignedPlayers.has(player.name));

  const goalieElement = document.createElement('div');
  goalieElement.classList.add('line');
  goalieElement.setAttribute('draggable', true);
  goalieElement.addEventListener('dragstart', handleDragStart); // Add dragstart event listener
  goalieElement.innerHTML = `
    Starter: ${starter ? starter.name : 'N/A'} | 
    Backup: ${backup ? backup.name : 'N/A'}
  `;
  
  // Mark goalies as assigned
  if (starter) {
    assignedPlayers.add(starter.name);
    team.lines.goalies.starter = starter.name; // Save the starter player name in the team data
  }
  if (backup) {
    assignedPlayers.add(backup.name);
    team.lines.goalies.backup = backup.name; // Save the backup player name in the team data
  }

  goalieContainer.appendChild(goalieElement);

  // Save the updated team lineup to localStorage
  saveTeamsToLocalStorage();
}

// Handle dragstart event
function handleDragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.getAttribute('data-line-index'));
}

// Handle drop event (on a target element)
function handleDrop(event, teamName, lineIndex, position) {
  const lineIndexToUpdate = event.dataTransfer.getData('text/plain');
  const targetLine = document.querySelector(`#${teamName}-line-${lineIndex}`);

  // Your logic for updating the lines goes here (e.g., swapping players or assigning them)

  saveTeamsToLocalStorage();  // Save updated team after handling drop
}

// Function to save the teams data back to localStorage
function saveTeamsToLocalStorage() {
  localStorage.setItem("teams", JSON.stringify(teams));  // Save directly from the in-memory 'teams' variable
}

// Populate lines for each team
teams.forEach(team => populateLines(team));

// Event listener for the Save button
document.getElementById("saveLinesBtn").addEventListener("click", saveTeamLines);
