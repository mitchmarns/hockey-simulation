let teams = JSON.parse(localStorage.getItem("teams")) || [];


document.addEventListener("DOMContentLoaded", () => {
  const teamSelect = document.getElementById("teamSelect");
  const saveLinesBtn = document.getElementById("saveLinesBtn");
  const autoAssignBtn = document.getElementById("autoAssignBtn");

  // Load teams from localStorage (or initialize if empty)
  loadTeamsFromLocalStorage();

  // Fetch the players based on the selected team from the local teams data
  teamSelect.addEventListener("change", () => {
    const selectedTeam = teamSelect.value;
    const team = teams.find(t => t.name === selectedTeam); // Get the team data
    if (team) {
      const players = team.players; // Reference players from the team
      populatePlayerOptions(players, selectedTeam);
      loadLineAssignments(team); // Load previously saved line assignments
    }
  });

  // Handle saving line assignments
  saveLinesBtn.addEventListener("click", () => {
    const team = teamSelect.value;
    const lineAssignments = {
      team: team,
      forwardLines: {
        line1: {
          LW: document.getElementById("line1LW").value,
          C: document.getElementById("line1C").value,
          RW: document.getElementById("line1RW").value
        },
        line2: {
          LW: document.getElementById("line2LW").value,
          C: document.getElementById("line2C").value,
          RW: document.getElementById("line2RW").value
        },
        line3: {
          LW: document.getElementById("line3LW").value,
          C: document.getElementById("line3C").value,
          RW: document.getElementById("line3RW").value
        },
        line4: {
          LW: document.getElementById("line4LW").value,
          C: document.getElementById("line4C").value,
          RW: document.getElementById("line4RW").value
        }
      },
      defenseLines: {
        defLine1: {
          LD: document.getElementById("defLine1LD").value,
          RD: document.getElementById("defLine1RD").value
        },
        defLine2: {
          LD: document.getElementById("defLine2LD").value,
          RD: document.getElementById("defLine2RD").value
        },
        defLine3: {
          LD: document.getElementById("defLine3LD").value,
          RD: document.getElementById("defLine3RD").value
        }
      },
      goalies: {
        starter: document.getElementById("starter").value,
        backup: document.getElementById("backup").value
      }
    };

    // Save line assignments to localStorage
    const updatedTeams = teams.map(t => t.name === team ? { ...t, lineAssignments } : t);
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    
    console.log("Line Assignments Saved:", lineAssignments);
  });

  // Handle Auto-Assign button click
autoAssignBtn.addEventListener("click", () => {
  const selectedTeam = teamSelect.value;
  const team = teams.find(t => t.name === selectedTeam); // Get the team data

  if (team) {
    const players = team.players.filter(player => player.team === selectedTeam || player.team === null);
    const usedPlayers = new Set(); // Track used players

    // Get available positions
    const positions = {
      forwardLines: ["line1LW", "line1C", "line1RW", "line2LW", "line2C", "line2RW", "line3LW", "line3C", "line3RW", "line4LW", "line4C", "line4RW"],
      defenseLines: ["defLine1LD", "defLine1RD", "defLine2LD", "defLine2RD", "defLine3LD", "defLine3RD"],
      goalies: ["starter", "backup"]
    };

    // Rank all players for each position
    const rankedForwards = rankPlayersForPosition(players, "LW").concat(rankPlayersForPosition(players, "C")).concat(rankPlayersForPosition(players, "RW"));
    const rankedDefense = rankPlayersForPosition(players, "LD").concat(rankPlayersForPosition(players, "RD"));
    const rankedGoalies = rankPlayersForPosition(players, "Starter").concat(rankPlayersForPosition(players, "Backup"));
    const allRankedPlayers = [...rankedForwards, ...rankedDefense, ...rankedGoalies];

    // Assign players to the lines sequentially
    let lineIndex = 0;
    allRankedPlayers.forEach(player => {
      if (usedPlayers.has(player.id)) return; // Skip if already assigned
    
      // Assign the player to the next available slot
      if (lineIndex < positions.forwardLines.length) {
        document.getElementById(positions.forwardLines[lineIndex]).value = player.id;
      } else if (lineIndex < positions.forwardLines.length + positions.defenseLines.length) {
        document.getElementById(positions.defenseLines[lineIndex - positions.forwardLines.length]).value = player.id;
      } else {
        document.getElementById(positions.goalies[lineIndex - positions.forwardLines.length - positions.defenseLines.length]).value = player.id;
      }
    
      usedPlayers.add(player.id); // Mark the player as used
      lineIndex++; // Move to the next line position
    });

    console.log("Auto-assigned players for", selectedTeam);
  }
});

  // Function to get position based on line index
  function getPositionForLine(idx) {
    if (idx % 3 === 0) return "LW";
    if (idx % 3 === 1) return "C";
    if (idx % 3 === 2) return "RW";
  }

  // Function to populate player options based on team
function populatePlayerOptions(players, team) {
  const positions = {
    "LW": ["line1LW", "line2LW", "line3LW", "line4LW"],
    "C": ["line1C", "line2C", "line3C", "line4C"],
    "RW": ["line1RW", "line2RW", "line3RW", "line4RW"],
    "LD": ["defLine1LD", "defLine2LD", "defLine3LD"],
    "RD": ["defLine1RD", "defLine2RD", "defLine3RD"],
    "Starter": ["starter"],
    "Backup": ["backup"]
  };

  // Clear all select options first
  Object.values(positions).flat().forEach(selector => {
    const selectElement = document.getElementById(selector);
    selectElement.innerHTML = ""; // Clear existing options

    // Always add the "None" option
    const noneOption = document.createElement("option");
    noneOption.value = ""; // Use empty string for "None"
    noneOption.text = "None";
    selectElement.appendChild(noneOption);
  });

  // Filter players by team and position
  const playersByPosition = {};
  Object.keys(positions).forEach(position => {
    playersByPosition[position] = players.filter(
      player => player.position === position && (player.team === team || player.team === null)
    );
  });

  // Populate the dropdowns for each position
  Object.keys(positions).forEach(position => {
    positions[position].forEach(selector => {
      const selectElement = document.getElementById(selector);

      // Add players to the dropdown for each position
      playersByPosition[position].forEach(player => {
        const option = document.createElement("option");
        option.value = player.id;
        option.text = player.name;
        selectElement.appendChild(option);
      });
    });
  });
}

  // Function to load the line assignments into the dropdowns
  function loadLineAssignments(team) {
    const lineAssignments = team.lineAssignments || {};
    if (lineAssignments.forwardLines) {
      Object.keys(lineAssignments.forwardLines).forEach(line => {
        const lineData = lineAssignments.forwardLines[line];
        if (lineData.LW) document.getElementById(`${line}LW`).value = lineData.LW;
        if (lineData.C) document.getElementById(`${line}C`).value = lineData.C;
        if (lineData.RW) document.getElementById(`${line}RW`).value = lineData.RW;
      });
    }
    if (lineAssignments.defenseLines) {
      Object.keys(lineAssignments.defenseLines).forEach(line => {
        const lineData = lineAssignments.defenseLines[line];
        if (lineData.LD) document.getElementById(`${line}LD`).value = lineData.LD;
        if (lineData.RD) document.getElementById(`${line}RD`).value = lineData.RD;
      });
    }
    if (lineAssignments.goalies) {
      if (lineAssignments.goalies.starter) document.getElementById("starter").value = lineAssignments.goalies.starter;
      if (lineAssignments.goalies.backup) document.getElementById("backup").value = lineAssignments.goalies.backup;
    }
  }

  function rankPlayersForPosition(players, position) {
  return players
    .filter(player => !player.lineAssigned) // Exclude already assigned players
    .map(player => {
      const { skills } = player;
      let score = 0;

      if (position === "LW" || position === "RW") {
        score = skills.speed * 0.4 + skills.shooting * 0.4 + skills.awareness * 0.2;
      } else if (position === "C") {
        score = skills.faceoffs * 0.5 + skills.passing * 0.3 + skills.awareness * 0.2;
      } else if (position === "LD" || position === "RD") {
        score = skills.defense * 0.5 + skills.strength * 0.3 + skills.shotBlocking * 0.2;
      } else if (position === "Starter" || position === "Backup") {
        score = skills.glove * 0.4 + skills.stick * 0.4 + skills.reactions * 0.2;
      }

      return { ...player, score };
    })
    .sort((a, b) => b.score - a.score); // Higher scores first
}

  // Function to load teams from localStorage
  function loadTeamsFromLocalStorage() {
    if (teams.length > 0) {
      // Process the teams data
      console.log("Teams loaded:", teams);
      // Continue with any other logic you need
    } else {
      console.log("No teams found in localStorage.");
    }
  }
});
