// Optional 1990s CRT/TV presentation filter. Rendering-only and persisted.
(function () {
  const STORAGE_KEY = 'dh_retro_filter';
  let enabled = false;
  try { enabled = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}

  function setEnabled(value) {
    enabled = !!value;
    try { localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0'); } catch (e) {}
  }

  function draw(g, width, height, time) {
    if (!enabled) return;
    g.save();

    // Fine horizontal scanlines at the logical pixel scale.
    g.globalAlpha = 0.18;
    g.fillStyle = '#05070d';
    for (let y = 1; y < height; y += 3) g.fillRect(0, y, width, 1);

    // Subtle RGB aperture grille—visible without obscuring bullets.
    g.globalAlpha = 0.035;
    for (let x = 0; x < width; x += 6) {
      g.fillStyle = '#ff3048'; g.fillRect(x, 0, 1, height);
      g.fillStyle = '#35e57a'; g.fillRect(x + 2, 0, 1, height);
      g.fillStyle = '#3f74ff'; g.fillRect(x + 4, 0, 1, height);
    }

    // Sparse analogue noise changes by frame but avoids full-screen allocations.
    g.globalAlpha = 0.08;
    const seed = Math.floor(time * 30) * 1103515245;
    for (let i = 0; i < 70; i++) {
      const value = Math.abs(Math.sin(seed + i * 91.73));
      const x = Math.floor((value * 43758.5453 % 1) * width);
      const y = Math.floor((Math.abs(Math.sin(seed * 0.01 + i * 17.1)) % 1) * height);
      g.fillStyle = i % 3 ? '#ffffff' : '#7ad0ff';
      g.fillRect(x, y, i % 7 === 0 ? 3 : 1, 1);
    }

    // Glass vignette and a restrained bright centre.
    g.globalAlpha = 1;
    const vignette = g.createRadialGradient(width / 2, height / 2, height * 0.28,
      width / 2, height / 2, height * 0.72);
    vignette.addColorStop(0, 'rgba(255,255,255,0.025)');
    vignette.addColorStop(0.66, 'rgba(6,8,14,0.03)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.42)');
    g.fillStyle = vignette;
    g.fillRect(0, 0, width, height);

    g.strokeStyle = 'rgba(8,12,18,0.72)';
    g.lineWidth = 7;
    g.strokeRect(3.5, 3.5, width - 7, height - 7);
    g.restore();
  }

  window.RetroFilter = Object.freeze({
    isEnabled: function () { return enabled; },
    setEnabled: setEnabled,
    draw: draw,
  });
})();
