export function checkInjuries() {
  const injuryChance = Math.random();

  if (injuryChance < 0.05) {
    // 5% chance for an injury during a period
    console.log("Injury Occurred!");
    // Handle removing injured player from the game
  }
}
