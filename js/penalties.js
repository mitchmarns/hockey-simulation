export function checkPenalties() {
  // Logic to check if a penalty happens
  const penaltyOccurred = Math.random() < 0.1; // 10% chance of penalty

  if (penaltyOccurred) {
    console.log("Penalty Occurred!");
    // Handle the penalty (e.g., power play, penalty kill)
  }
}
