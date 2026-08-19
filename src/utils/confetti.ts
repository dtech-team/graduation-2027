import confetti from "canvas-confetti";

export function fireGrandCelebration() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ["#ff3af2", "#00f2d1", "#fde400", "#ffabee", "#26fedc", "#ffffff"],
    zIndex: 99999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // 1. Initial explosive pop
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });

  // 2. Left & Right side Cannons at +350ms
  setTimeout(() => {
    confetti({
      particleCount: 90,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.8 },
      colors: ["#ff3af2", "#00f2d1", "#fde400", "#ffffff"],
      zIndex: 99999,
    });
    confetti({
      particleCount: 90,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.8 },
      colors: ["#ff3af2", "#00f2d1", "#fde400", "#ffffff"],
      zIndex: 99999,
    });
  }, 350);

  // 3. Falling Golden Stars shower at +900ms
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 360,
      ticks: 120,
      gravity: 0.7,
      decay: 0.94,
      startVelocity: 35,
      shapes: ["star"],
      colors: ["#FFE400", "#FFBD00", "#FF3AF2", "#26FEDC", "#FFFFFF"],
      origin: { x: 0.5, y: 0.35 },
      zIndex: 99999,
    });
  }, 900);

  // 4. Grand Finale Dual Blast at +1600ms
  setTimeout(() => {
    confetti({
      particleCount: 120,
      angle: 50,
      spread: 80,
      origin: { x: 0.05, y: 0.75 },
      colors: ["#ff3af2", "#00f2d1", "#fde400", "#ffffff"],
      zIndex: 99999,
    });
    confetti({
      particleCount: 120,
      angle: 130,
      spread: 80,
      origin: { x: 0.95, y: 0.75 },
      colors: ["#ff3af2", "#00f2d1", "#fde400", "#ffffff"],
      zIndex: 99999,
    });
  }, 1600);
}
