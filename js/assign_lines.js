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
      const players = team.players; // Reference players from the team
      autoAssignPlayers(players, selectedTeam); // Auto-assign players to lines
    }
  });

  // Function to auto-assign players to lines
  function autoAssignPlayers(players, team) {
    const forwardLines = ["line1", "line2", "line3", "line4"];
    const defenseLines = ["defLine1", "defLine2", "defLine3"];
    const goalies = ["starter", "backup"];

    let forwards = players.filter(player => player.position === "LW" || player.position === "C" || player.position === "RW");
    let defense = players.filter(player => player.position === "LD" || player.position === "RD");
    let goaliesList = players.filter(player => player.position === "Starter" || player.position === "Backup");

    // Shuffle players for randomness (Fisher-Yates shuffle)
    shuffle(forwards);
    shuffle(defense);
    shuffle(goaliesList);

    // Assign players to lines
    forwardLines.forEach((line, i) => {
      document.getElementById(`${line}LW`).value = forwards[i * 3]?.id || null;
      document.getElementById(`${line}C`).value = forwards[i * 3 + 1]?.id || null;
      document.getElementById(`${line}RW`).value = forwards[i * 3 + 2]?.id || null;
    });

    defenseLines.forEach((line, i) => {
      document.getElementById(`${line}LD`).value = defense[i * 2]?.id || null;
      document.getElementById(`${line}RD`).value = defense[i * 2 + 1]?.id || null;
    });

    // Assign goalies
    document.getElementById("starter").value = goaliesList[0]?.id || null;
    document.getElementById("backup").value = goaliesList[1]?.id || null;
  }

  // Fisher-Yates Shuffle for randomness
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
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
      selectElement.innerHTML = "";  // Clear options
    });

    // Filter players by team and position
  const playersByPosition = {};
  Object.keys(positions).forEach(position => {
    playersByPosition[position] = players.filter(player => player.position === position && (player.team === team || player.team === null));
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

      // Add "None" option if no players for that position
      if (selectElement.options.length === 0) {
        const noneOption = document.createElement("option");
        noneOption.value = null;
        noneOption.text = "None";
        selectElement.appendChild(noneOption);
      }
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
