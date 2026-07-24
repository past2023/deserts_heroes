// Ambient desert sand and occasional short sandstorm gusts.
(function () {
  let gustTimer = 7;
  let gustTime = 0;
  let gustStrength = 0;

  function random(a, b) { return a + Math.random() * (b - a); }

  function spawnSand(strength) {
    const fromLeft = true;
    const x = G.camX + (fromLeft ? -20 : 980);
    const y = random(105, Level.GROUND - 8);
    const speed = random(150, 260) * (0.75 + strength * 1.15);
    G.particles.push({
      kind: 'sand', x: x, y: y,
      vx: fromLeft ? speed : -speed, vy: random(-24, 16),
      t: 0, life: random(1.4, 2.8),
      color: Math.random() < 0.35 ? '#ffe0a0' : '#c99a57',
      size: random(1, 2.5), length: random(7, 18) * (1 + strength),
      grav: random(3, 12), drag: 0.02,
    });
  }

  function update(dt) {
    gustTimer -= dt;
    if (gustTimer <= 0 && gustTime <= 0) {
      gustTime = random(2.8, 5.2);
      gustStrength = random(0.55, 1);
      gustTimer = random(15, 28);
    }
    if (gustTime > 0) gustTime = Math.max(0, gustTime - dt);

    const storm = gustTime > 0 ? gustStrength * Math.min(1, gustTime * 1.5) : 0;
    const rate = 5 + storm * 42;
    let count = Math.floor(rate * dt);
    if (Math.random() < rate * dt - count) count++;
    for (let i = 0; i < count; i++) spawnSand(storm);
  }

  function intensity() { return gustTime > 0 ? gustStrength : 0; }

  window.DesertWeather = Object.freeze({ update: update, intensity: intensity });
})();
