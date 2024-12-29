import { checkPenalties } from './penalties.js';
import { checkInjuries } from './injuries.js';
import { updatePlayByPlay } from './play_by_play.js';

function simulateGame() {
  // Initialize game state
  let period = 1;
  let gameOver = false;

  while (!gameOver) {
    // Simulate period
    simulatePeriod(period);

    // Check penalties
    checkPenalties();

    // Check injuries
    checkInjuries();

    // Update play-by-play
    updatePlayByPlay(period);

    // Check if game is over
    if (period >= 3) {
      gameOver = true;
    } else {
      period++;
    }
  }
}
