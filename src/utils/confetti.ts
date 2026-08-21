import confetti from "canvas-confetti";

export function fireGrandCelebration() {
  const count = 350;
  const colors = [
    "#ff3af2", // Neon Magenta
    "#00f2d1", // Neon Cyan
    "#fde400", // Gold Yellow
    "#ff0055", // Hot Pink
    "#a3e635", // Lime Neon
    "#ffffff", // Diamond White
    "#ff9900", // Vivid Orange
  ];

  const baseDefaults = {
    colors,
    zIndex: 999999,
    disableForReducedMotion: false,
  };

  // Helper function to fire burst
  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...baseDefaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // --- WAVE 1: MEGA CENTER SHOCKWAVE EXPLOSION ---
  fire(0.3, {
    spread: 40,
    startVelocity: 65,
    origin: { x: 0.5, y: 0.8 },
  });
  fire(0.25, {
    spread: 80,
    startVelocity: 50,
    origin: { x: 0.5, y: 0.8 },
  });
  fire(0.2, {
    spread: 120,
    decay: 0.91,
    scalar: 1.1,
    origin: { x: 0.5, y: 0.8 },
  });
  fire(0.15, {
    spread: 160,
    startVelocity: 35,
    decay: 0.92,
    scalar: 1.4,
    origin: { x: 0.5, y: 0.8 },
  });

  // --- WAVE 2: RAPID-FIRE CROSS CANNONS (Left & Right alternating) ---
  const cannonIntervals = [200, 400, 600, 800];
  cannonIntervals.forEach((delay, idx) => {
    setTimeout(() => {
      // Left Cannon
      confetti({
        ...baseDefaults,
        particleCount: 80,
        angle: 55 + (idx % 2 === 0 ? 10 : -5),
        spread: 65,
        startVelocity: 55,
        origin: { x: 0, y: 0.85 },
      });
      // Right Cannon
      confetti({
        ...baseDefaults,
        particleCount: 80,
        angle: 125 + (idx % 2 === 0 ? -10 : 5),
        spread: 65,
        startVelocity: 55,
        origin: { x: 1, y: 0.85 },
      });
    }, delay);
  });

  // --- WAVE 3: CELESTIAL GOLDEN STARS & GLITTER DRIFT ---
  setTimeout(() => {
    confetti({
      ...baseDefaults,
      particleCount: 90,
      spread: 360,
      ticks: 160,
      gravity: 0.6,
      decay: 0.94,
      startVelocity: 38,
      shapes: ["star"],
      colors: ["#FFE400", "#FFBD00", "#FFD700", "#FFF8DC", "#FF3AF2", "#00F2D1"],
      origin: { x: 0.5, y: 0.3 },
    });
  }, 1000);

  // --- WAVE 4: GRAND FINALE QUADRUPLE MEGA-BLAST ---
  setTimeout(() => {
    // Left Lower Blast
    confetti({
      ...baseDefaults,
      particleCount: 160,
      angle: 60,
      spread: 85,
      startVelocity: 68,
      origin: { x: 0.05, y: 0.75 },
    });
    // Right Lower Blast
    confetti({
      ...baseDefaults,
      particleCount: 160,
      angle: 120,
      spread: 85,
      startVelocity: 68,
      origin: { x: 0.95, y: 0.75 },
    });
    // Center Sky Burst
    confetti({
      ...baseDefaults,
      particleCount: 200,
      spread: 150,
      startVelocity: 72,
      origin: { x: 0.5, y: 0.65 },
    });
  }, 1600);
}
