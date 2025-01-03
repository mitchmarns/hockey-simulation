let teams = JSON.parse(localStorage.getItem("teams")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const teamSelect = document.getElementById("teamSelect");
  const saveUnitsBtn = document.getElementById("saveUnitsBtn");

  // Load teams from localStorage and populate the dropdown
  loadTeamsFromLocalStorage();

  // Populate the dropdowns when a team is selected
  teamSelect.addEventListener("change", () => {
    const selectedTeam = teamSelect.value;
    const team = teams.find(t => t.name === selectedTeam);
    if (team) {
      const players = team.players;
      populatePlayerOptions(players, selectedTeam);  // Populate players for PP and PK units
      loadSpecialTeamAssignments(team);
    }
  });

  // Save the assignments when the save button is clicked
  saveUnitsBtn.addEventListener("click", () => {
    const teamName = teamSelect.value;
    const team = teams.find(t => t.name === teamName);

    if (team) {
      const specialTeamAssignments = {
        team: team,
        powerplayUnits: [
          {
            LW: document.getElementById("pp1LW").value,
            C: document.getElementById("pp1C").value,
            RW: document.getElementById("pp1RW").value,
            LD: document.getElementById("pp1LD").value,
            RD: document.getElementById("pp1RD").value
          },
          {
            LW: document.getElementById("pp2LW").value,
            C: document.getElementById("pp2C").value,
            RW: document.getElementById("pp2RW").value,
            LD: document.getElementById("pp2LD").value,
            RD: document.getElementById("pp2RD").value
          }
        ],
        penaltyKillUnits: [
          {
            F1: document.getElementById("pk1F1").value,
            F2: document.getElementById("pk1F2").value,
            D1: document.getElementById("pk1D1").value,
            D2: document.getElementById("pk1D2").value
          },
          {
            F1: document.getElementById("pk2F1").value,
            F2: document.getElementById("pk2F2").value,
            D1: document.getElementById("pk2D1").value,
            D2: document.getElementById("pk2D2").value
          }
        ]
      };

      team.lines.powerplayUnits = specialTeamAssignments.powerplayUnits;
      team.lines.penaltyKillUnits = specialTeamAssignments.penaltyKillUnits;
      localStorage.setItem("teams", JSON.stringify(teams));

      console.log("Special Team Assignments Saved:", specialTeamAssignments);
    } else {
      console.log("Team not found");
    }
  });

  // Load teams from localStorage into the team select dropdown
  function loadTeamsFromLocalStorage() {
    if (teams.length > 0) {
      teams.forEach(team => {
        const option = document.createElement("option");
        option.value = team.name;
        option.text = team.name;
        teamSelect.appendChild(option);
      });
    } else {
      console.log("No teams found in localStorage.");
    }
  }

  // Populate dropdowns with player options for powerplay and penalty kill
  function populatePlayerOptions(players, teamName) {
    const positions = {
      "LW": ["pp1LW", "pp2LW"],
      "C": ["pp1C", "pp2C"],
      "RW": ["pp1RW", "pp2RW"],
      "LD": ["pp1LD", "pp2LD"],
      "RD": ["pp1RD", "pp2RD"],
      "F1": ["pk1F1", "pk2F1"],
      "F2": ["pk1F2", "pk2F2"],
      "D1": ["pk1D1", "pk2D1"],
      "D2": ["pk1D2", "pk2D2"]
    };

    // Clear all dropdowns
    Object.values(positions).flat().forEach(selector => {
      const dropdown = document.getElementById(selector);
      dropdown.innerHTML = "";
    });

    // Add players to the appropriate dropdowns
    players.forEach(player => {
      if (player.team === teamName || player.team === null) {
        const option = document.createElement("option");
        option.value = player.id;
        option.text = player.name;

        // Handle PP positions
        Object.entries(positions).forEach(([pos, selectors]) => {
          if (player.position === pos) {
            selectors.forEach(selector => {
              const dropdown = document.getElementById(selector);
              dropdown.appendChild(option.cloneNode(true));
            });
          }
        });
      }
    });

    // Handle penalty kill units (forwards and defensemen)
    const forwards = players.filter(player => player.position === "LW" || player.position === "C" || player.position === "RW");
    const defensemen = players.filter(player => player.position === "LD" || player.position === "RD");

    // Add forwards to pk dropdowns
    forwards.forEach(player => {
      const option = document.createElement("option");
      option.value = player.id;
      option.text = player.name;
      ["pk1F1", "pk1F2", "pk2F1", "pk2F2"].forEach(id => {
        const dropdown = document.getElementById(id);
        dropdown.appendChild(option.cloneNode(true));
      });
    });

    // Add defensemen to pk dropdowns
    defensemen.forEach(player => {
      const option = document.createElement("option");
      option.value = player.id;
      option.text = player.name;
      ["pk1D1", "pk1D2", "pk2D1", "pk2D2"].forEach(id => {
        const dropdown = document.getElementById(id);
        dropdown.appendChild(option.cloneNode(true));
      });
    });

    // Add "None" option to each dropdown
    Object.values(positions).flat().forEach(selector => {
      const dropdown = document.getElementById(selector);
      const noneOption = document.createElement("option");
      noneOption.value = "none";
      noneOption.text = "None";
      dropdown.appendChild(noneOption);
    });
  }

  // Load saved assignments into the dropdowns
  function loadSpecialTeamAssignments(team) {
    const { powerplayUnits, penaltyKillUnits } = team.lines;

    if (powerplayUnits) {
      powerplayUnits.forEach((unit, index) => {
        Object.entries(unit).forEach(([position, playerId]) => {
          const dropdown = document.getElementById(`pp${index + 1}${position}`);
          if (dropdown) dropdown.value = playerId || "none";
        });
      });
    }

    if (penaltyKillUnits) {
      penaltyKillUnits.forEach((unit, index) => {
        Object.entries(unit).forEach(([position, playerId]) => {
          const dropdown = document.getElementById(`pk${index + 1}${position}`);
          if (dropdown) dropdown.value = playerId || "none";
        });
      });
    }
  }
});
