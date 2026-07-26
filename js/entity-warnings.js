// Ground telegraphs for incoming mortar shells.
(function () {
  function update(dt) {
    let write = 0;
    for (let read = 0; read < G.warnings.length; read++) {
      const warning = G.warnings[read];
      warning.t -= dt;
      if (warning.t <= 0) {
        G.grenades.push({ kind: 'shell', x: warning.x, y: -30, vx: 0, vy: 420, t: 99 });
      } else {
        G.warnings[write++] = warning;
      }
    }
    G.warnings.length = write;
  }

  function draw(g, camX) {
    for (const warning of G.warnings) {
      Sprites.drawWarning(g, warning.x - camX, Level.GROUND, Math.min(warning.t, 0.7));
    }
  }

  window.EntityWarnings = Object.freeze({ update: update, draw: draw });
})();
