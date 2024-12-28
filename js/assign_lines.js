// Fetch teams data from localStorage
let teams = JSON.parse(localStorage.getItem("teams"));

// Function to assign players to lines based on position
function assignPlayersToLines() {
  // Iterate through each team
  teams.forEach(team => {
    // Separate players by position
    let forwards = team.players.filter(player => player.position === "C" || player.position === "LW" || player.position === "RW");
    let defensemen = team.players.filter(player => player.position === "LD" || player.position === "RD");
    let goalies = team.players.filter(player => player.position === "Starter" || player.position === "Backup");

    // Assign forwards to forward lines (Line 1 to 4)
    team.lines.forwardLines.forEach((line, index) => {
      if (index < forwards.length) {
        // Try to assign left wing (LW), center (C), and right wing (RW)
        if (!line.LW && forwards[index].position === "LW") {
          line.LW = forwards[index];
        } else if (!line.C && forwards[index].position === "C") {
          line.C = forwards[index];
        } else if (!line.RW && forwards[index].position === "RW") {
          line.RW = forwards[index];
        }
      }
    });

    // Assign defensemen to defense lines (Line 1 to 3)
    team.lines.defenseLines.forEach((line, index) => {
      if (index < defensemen.length) {
        // Try to assign left defense (LD) and right defense (RD)
        if (!line.LD && defensemen[index].position === "LD") {
          line.LD = defensemen[index];
        } else if (!line.RD && defensemen[index].position === "RD") {
          line.RD = defensemen[index];
        }
      }
    });

    // Assign goalies to the starter and backup positions
    team.lines.goalies.starter = goalies.find(g => g.position === "Starter") || null;
    team.lines.goalies.backup = goalies.find(g => g.position === "Backup") || null;
  });

  // Save the updated teams data back to localStorage
  localStorage.setItem("teams", JSON.stringify(teams));
}

// Call the function to assign players to lines
assignPlayersToLines();
