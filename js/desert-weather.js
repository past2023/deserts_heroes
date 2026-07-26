// Ambient desert sand and occasional short sandstorm gusts.
// Survival mode gets denser, more frequent gusts for arena atmosphere.
(function () {
  let gustTimer = 7;
  let gustTime = 0;
  let gustStrength = 0;

  function random(a, b) { return a + Math.random() * (b - a); }

  function spawnSand(strength, isSurvival) {
    const fromLeft = Math.random() < 0.65;
    const x = G.camX + (fromLeft ? -20 : 980);
    const y = random(isSurvival ? 130 : 105, Level.GROUND - 8);
    const speed = random(isSurvival ? 180 : 150, isSurvival ? 320 : 260) * (0.75 + strength * 1.15);
    G.particles.push({
      kind: 'sand', x: x, y: y,
      vx: fromLeft ? speed : -speed, vy: random(-24, 16),
      t: 0, life: random(1.4, isSurvival ? 3.5 : 2.8),
      color: Math.random() < 0.35 ? '#ffe0a0' : '#c99a57',
      size: random(1, 2.5), length: random(7, isSurvival ? 26 : 18) * (1 + strength),
      grav: random(3, 12), drag: 0.02,
    });
  }

  function update(dt) {
    const isSurv = window.G && G.mode === 'survival';
    gustTimer -= dt;
    if (gustTimer <= 0 && gustTime <= 0) {
      gustTime = random(isSurv ? 3.5 : 2.8, isSurv ? 7.0 : 5.2);
      gustStrength = random(0.55, isSurv ? 1.2 : 1);
      gustTimer = random(isSurv ? 8 : 15, isSurv ? 18 : 28);
    }
    if (gustTime > 0) gustTime = Math.max(0, gustTime - dt);

    const storm = gustTime > 0 ? gustStrength * Math.min(1, gustTime * 1.5) : 0;
    const rate = (isSurv ? 10 : 5) + storm * (isSurv ? 56 : 42);
    let count = Math.floor(rate * dt);
    if (Math.random() < rate * dt - count) count++;
    for (let i = 0; i < count; i++) spawnSand(storm, isSurv);
  }

  function intensity() { return gustTime > 0 ? gustStrength : 0; }

  window.DesertWeather = Object.freeze({ update: update, intensity: intensity });
})();
