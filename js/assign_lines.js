document.addEventListener("DOMContentLoaded", async () => {
  const playersContainer = document.getElementById("players");
  const slots = document.querySelectorAll(".line-slot");
  const teamName = document.getElementById("team").textContent;

  // Load saved assignments from localStorage
  const assignments = JSON.parse(localStorage.getItem("lineAssignments")) || {};

  // Load players from localStorage
  const loadPlayers = () => {
    const playersData = JSON.parse(localStorage.getItem("playersData"));
    if (playersData && playersData.players) {
      return playersData.players;
    }
    return [];
  };

  // Apply the assignment to the player and update the stored players data
  const updatePlayerAssignment = (playerId, slotPosition) => {
    const playersData = JSON.parse(localStorage.getItem("playersData"));
    const teamsData = JSON.parse(localStorage.getItem("teams"));

    if (!playersData || !playersData.players) return;

    playersData.players.forEach((player) => {
      if (player.id === parseInt(playerId)) {
        player.lineAssigned = slotPosition;
      }
    });

    const [teamName, lineType, lineNumber, position] = slotPosition.split("-");
    const team = teamsData.find((t) => t.name === teamName);

    if (team && team.lines[lineType]) {
      const lineIndex = parseInt(lineNumber) - 1;
      const line = team.lines[lineType][lineIndex];

      if (line) {
        line[position] = parseInt(playerId);
      }
    }

    localStorage.setItem("playersData", JSON.stringify(playersData));
    localStorage.setItem("teams", JSON.stringify(teamsData));
  };

  // Get players from localStorage
  const players = loadPlayers();

  // Populate the "Available Players" section with unassigned players
  const populateAvailablePlayers = (players) => {
    playersContainer.innerHTML = "";
    const unassignedPlayers = players.filter((player) => !player.lineAssigned);

    unassignedPlayers.forEach((player) => {
      const playerDiv = document.createElement("div");
      playerDiv.className = "player";
      playerDiv.draggable = true;
      playerDiv.dataset.id = player.id;
      playerDiv.dataset.team = player.team;
      playerDiv.dataset.position = player.position;

      if (player.injured) {
        playerDiv.classList.add("injured");
        playerDiv.draggable = false;
      } else if (player.healthyScratch) {
        playerDiv.classList.add("healthy-scratch");
        playerDiv.draggable = false;
      }

      const playerImg = document.createElement("img");
      playerImg.src = player.image;
      playerImg.alt = player.name;
      playerImg.className = "player-image";

      const playerName = document.createElement("span");
      playerName.textContent = `${player.name} #${player.id} ${player.team || "Unassigned"} ${player.position}`;

      playerDiv.appendChild(playerImg);
      playerDiv.appendChild(playerName);

      playersContainer.appendChild(playerDiv);

      playerDiv.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("playerId", player.id);
      });
    });
  };

  // Apply assignments to slots
  const applyAssignmentsToSlots = (players) => {
    Object.entries(assignments).forEach(([slotId, playerId]) => {
      const slot = document.querySelector(`[data-position="${slotId}"]`);
      const player = players.find((p) => p.id === parseInt(playerId));

      if (slot && player) {
        const existingPlayerImg = slot.querySelector("img");
        if (existingPlayerImg) existingPlayerImg.remove();

        const playerImg = document.createElement("img");
        playerImg.src = player.image;
        playerImg.alt = player.name;
        playerImg.className = "player-image";

        const playerName = document.createElement("span");
        playerName.textContent = `${player.name} (#${player.id})`;

        slot.classList.add('slot-content');
        slot.appendChild(playerImg);
        slot.appendChild(playerName);

        slot.dataset.assignedPlayer = playerId;
      }
    });
  };

  // Handle drop events on slots
  const addDropEventsToSlots = () => {
    slots.forEach((slot) => {
      slot.addEventListener("dragover", (e) => e.preventDefault());

      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        const playerId = e.dataTransfer.getData("playerId");
        const playerDiv = document.querySelector(`[data-id="${playerId}"]`);
        const player = players.find((p) => p.id == playerId);

        if (!player) {
          alert("Error: Player data not found.");
          return;
        }

        if (player.injured || player.healthyScratch) {
          alert(`${player.name} cannot be assigned to a line because they are either injured or a healthy scratch.`);
          return;
        }

        const slotPosition = slot.dataset.position;
        const [slotTeam, slotLineType, slotLineNumber, slotPositionType] = slotPosition.split("-");

        if (player.team === slotTeam && (player.position === slotPosition || (slotLineType === 'goalies' && (player.position === 'Starter' || player.position === 'Backup')))) {
          const playerImg = document.createElement("img");
          playerImg.src = player.image;
          playerImg.alt = player.name;
          playerImg.className = "player-image";

          const playerName = document.createElement("span");
          playerName.textContent = `${player.name} (#${player.id})`;

          slot.classList.add('slot-content');
          slot.textContent = ''; 
          slot.appendChild(playerImg);
          slot.appendChild(playerName);

          slot.dataset.assignedPlayer = playerId;

          assignments[slot.dataset.position] = playerId;
          localStorage.setItem("lineAssignments", JSON.stringify(assignments));
          updatePlayerAssignment(playerId, slotPosition);
          populateAvailablePlayers(players);
        } else {
          alert("The player cannot be assigned to this slot because either the position or team does not match.");
        }
      });
    });
  };

  // Initialize the page
  const init = () => {
    populateAvailablePlayers(players);
    applyAssignmentsToSlots(players);
    addDropEventsToSlots();
  };

  init();
});
