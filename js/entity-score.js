// Floating score and score-popup system.
// Kept independent from combat entities so scoring can evolve without coupling
// enemy, player, and projectile simulation.
(function () {
  function add(pts, x, y) {
    G.score += pts;
    G.scorePops.push({ x: x, y: y, pts: pts, t: 0 });
  }

  function update(dt) {
    let write = 0;
    for (let read = 0; read < G.scorePops.length; read++) {
      const popup = G.scorePops[read];
      popup.t += dt;
      popup.y -= 40 * dt;
      if (popup.t < 1.3) G.scorePops[write++] = popup;
    }
    G.scorePops.length = write;
  }

  function draw(g, camX) {
    for (const popup of G.scorePops) {
      g.save();
      g.globalAlpha = Math.max(0, 1 - popup.t / 1.3);
      const label = popup.labelKey ? I18n.t(popup.labelKey, popup.labelVars) : popup.label;
      g.fillStyle = label ? '#7ad0ff' : '#ffe28a';
      g.textAlign = 'center';
      if (popup.big) {
        const s = Math.min(1.4, 0.6 + popup.t * 4);
        g.font = `bold ${Math.round(14 * s)}px "Press Start 2P", "Courier New", monospace`;
        g.fillStyle = popup.color || '#ff0';
        g.shadowColor = popup.color || '#ff0';
        g.shadowBlur = 4;
      } else {
        g.font = 'bold 9px "Press Start 2P", "Courier New", monospace';
      }
      g.fillText(label || ('+' + popup.pts), popup.x - camX, popup.y);
      g.restore();
    }
  }

  window.EntityScore = Object.freeze({ add: add, update: update, draw: draw });
})();
