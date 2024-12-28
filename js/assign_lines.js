let teams = JSON.parse(localStorage.getItem("teams")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const teamSelect = document.getElementById("teamSelect");
  const saveLinesBtn = document.getElementById("saveLinesBtn");

  // Get teams from localStorage (or initialize if empty)
  let teams = JSON.parse(localStorage.getItem("teams")) || [];

  // Fetch the players based on the selected team from the local teams data
  teamSelect.addEventListener("change", () => {
    const selectedTeam = teamSelect.value;
    const team = teams.find(t => t.name === selectedTeam); // Get the team data
    if (team) {
      const players = team.players; // Reference players from the team
      populatePlayerOptions(players, selectedTeam);
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

  // Function to populate player options based on team
  function populatePlayerOptions(players, team) {
    const forwardPositions = ["LW", "C", "RW"];
    const defensePositions = ["LD", "RD"];
    
    const lineSelectors = [
      "line1LW", "line1C", "line1RW", 
      "line2LW", "line2C", "line2RW", 
      "line3LW", "line3C", "line3RW", 
      "line4LW", "line4C", "line4RW", 
      "defLine1LD", "defLine1RD", 
      "defLine2LD", "defLine2RD", 
      "defLine3LD", "defLine3RD", 
      "starter", "backup"
    ];

    // Clear all select options first
    lineSelectors.forEach(selector => {
      const selectElement = document.getElementById(selector);
      selectElement.innerHTML = "";  // Clear options
    });

    players.forEach(player => {
      forwardPositions.forEach(position => {
        if (player.position === position) {
          const option = document.createElement("option");
          option.value = player.id;
          option.text = player.name;
          document.getElementById(`line1${position}`).appendChild(option);
          document.getElementById(`line2${position}`).appendChild(option.cloneNode(true));
          document.getElementById(`line3${position}`).appendChild(option.cloneNode(true));
          document.getElementById(`line4${position}`).appendChild(option.cloneNode(true));
        }
      });

      defensePositions.forEach(position => {
        if (player.position === position) {
          const option = document.createElement("option");
          option.value = player.id;
          option.text = player.name;
          document.getElementById(`defLine1${position}`).appendChild(option);
          document.getElementById(`defLine2${position}`).appendChild(option.cloneNode(true));
          document.getElementById(`defLine3${position}`).appendChild(option.cloneNode(true));
        }
      });

      // Goalies
      if (player.position === "Starter" || player.position === "Backup") {
        const option = document.createElement("option");
        option.value = player.id;
        option.text = player.name;
        document.getElementById("starter").appendChild(option);
        document.getElementById("backup").appendChild(option.cloneNode(true));
      }
    });
  }

  // Ensure the team data is loaded and player options are populated
  if (teams.length > 0) {
    const defaultTeam = teams[0]; // Default to the first team if available
    teamSelect.value = defaultTeam.name; // Set the default selection
    populatePlayerOptions(defaultTeam.players, defaultTeam.name); // Populate player options for the first team
  }
});

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

// Call the function to load teams
loadTeamsFromLocalStorage();
