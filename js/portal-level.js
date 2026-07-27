// ============================================================
// PORTAL LEVEL — Orbital Time-Rift Bonus Zone
// Space-themed floating-platform level using the main engine.
// Player enters from Level 1 portal, fights through space,
// collects items, and exits back to Level 1.
// ============================================================
(function () {
  const VW = 960, VH = 540;
  const W = 4800;
  const GROUND = 580;

  function imageReady(img) { return img && img.naturalWidth > 0 && img.complete !== false; }

  const starsImage = new Image(); starsImage.decoding = 'async'; starsImage.src = 'assets/intro/slide2_stars.png';
  const asteroidsImage = new Image(); asteroidsImage.decoding = 'async'; asteroidsImage.src = 'assets/intro/slide2_asteroids.png';
  const platformImage = new Image(); platformImage.decoding = 'async'; platformImage.src = 'assets/platforms/floating_platform.png';
  const portalArt = new Image(); portalArt.decoding = 'async'; portalArt.src = 'assets/props/deco_portal02.png';
  const shipArt01 = new Image(); shipArt01.decoding = 'async'; shipArt01.src = 'assets/space/ships/enemies_ship01.png';
  const shipArt02 = new Image(); shipArt02.decoding = 'async'; shipArt02.src = 'assets/space/ships/enemies_ship02.png';

  const platforms = [];
  const platformDefs = [
    { x: 200,  y: 380, w: 155 },
    { x: 430,  y: 340, w: 140 },
    { x: 650,  y: 290, w: 160 },
    { x: 870,  y: 350, w: 130 },
    { x: 1080, y: 300, w: 150 },
    { x: 1300, y: 250, w: 140 },
    { x: 1520, y: 310, w: 160 },
    { x: 1730, y: 260, w: 130 },
    { x: 1950, y: 330, w: 155 },
    { x: 2170, y: 280, w: 140 },
    { x: 2390, y: 230, w: 160 },
    { x: 2610, y: 300, w: 145 },
    { x: 2830, y: 250, w: 135 },
    { x: 3050, y: 310, w: 155 },
    { x: 3270, y: 260, w: 140 },
    { x: 3490, y: 320, w: 160 },
    { x: 3710, y: 270, w: 130 },
    { x: 3930, y: 340, w: 155 },
    { x: 4150, y: 290, w: 140 },
    { x: 4370, y: 380, w: 180 },
  ];
  for (const pd of platformDefs) {
    platforms.push({ x: pd.x, baseY: pd.y, y: pd.y, w: pd.w, amp: 0, speed: 0, phase: 0, fragile: false, invisible: false });
  }

  const PORTAL_EXIT_X = 4500;

  const spawns = [
    { x: 500,  type: 'space_fighter', y: 150 },
    { x: 900,  type: 'soldier', y: 288 },
    { x: 1200, type: 'space_fighter', y: 130 },
    { x: 1600, type: 'soldier', y: 308 },
    { x: 1850, type: 'observer', y: 220 },
    { x: 2100, type: 'space_fighter', y: 160 },
    { x: 2400, type: 'soldier', y: 228 },
    { x: 2650, type: 'space_fighter', y: 140 },
    { x: 2900, type: 'observer', y: 210 },
    { x: 3100, type: 'space_fighter', y: 150 },
    { x: 3320, type: 'soldier', y: 258 },
    { x: 3550, type: 'space_fighter', y: 170 },
    { x: 3800, type: 'observer', y: 230 },
    { x: 4000, type: 'space_fighter', y: 140 },
    { x: 4200, type: 'soldier', y: 378 },
    { x: 4400, type: 'space_fighter', y: 160 },
  ];

  const highPickups = [
    { x: 280,  y: 340, type: 'grenades' },
    { x: 500,  y: 300, type: 'mg' },
    { x: 720,  y: 250, type: 'grenades' },
    { x: 960,  y: 310, type: 'homing' },
    { x: 1150, y: 260, type: 'grenades' },
    { x: 1370, y: 210, type: 'spread' },
    { x: 1580, y: 270, type: 'grenades' },
    { x: 1790, y: 220, type: 'homing' },
    { x: 2010, y: 290, type: 'rocket' },
    { x: 2240, y: 240, type: 'grenades' },
    { x: 2450, y: 190, type: 'flame' },
    { x: 2680, y: 260, type: 'homing' },
    { x: 2890, y: 210, type: 'grenades' },
    { x: 3120, y: 270, type: 'homing' },
    { x: 3340, y: 220, type: 'mg' },
    { x: 3560, y: 280, type: 'grenades' },
    { x: 3780, y: 230, type: 'spread' },
    { x: 4000, y: 300, type: 'homing' },
    { x: 4200, y: 250, type: 'rocket' },
    { x: 4430, y: 340, type: 'grenades' },
  ];

  function resetPlatforms() {
    for (const p of platforms) { p.dead = false; p.triggered = false; p.breakT = 0; p.y = p.baseY; }
  }

  function updatePlatforms(dt, player) {
    // Respawn safety: if player just respawned above screen, snap to nearest platform
    if (player && !player.dead && player.y < 0) {
      let bestPlat = null, bestDist = Infinity;
      for (const pl of platforms) {
        if (pl.dead) continue;
        const dist = Math.abs(player.x - (pl.x + pl.w / 2));
        if (dist < bestDist) { bestDist = dist; bestPlat = pl; }
      }
      if (bestPlat) {
        player.x = bestPlat.x + bestPlat.w / 2;
        player.y = bestPlat.y - 60;
      }
    }
    for (const p of platforms) {
      if (p.dead) continue;
      if (p.fragile && !p.triggered) {
        const riding = player && !player.dead && player.jetpackT <= 0 &&
          Math.abs(player.y - p.y) < 8 && player.x > p.x && player.x < p.x + p.w && player.vy >= 0;
        if (riding) { player.y = p.y; player.onGround = true; if (!p.triggered) { p.triggered = true; p.breakT = 1.45; } }
      } else if (!p.fragile) {
        const riding = player && !player.dead && player.jetpackT <= 0 &&
          Math.abs(player.y - p.y) < 8 && player.x > p.x && player.x < p.x + p.w && player.vy >= 0;
        if (riding) { player.y = p.y; player.onGround = true; }
      }
      if (p.triggered) { p.breakT -= dt; if (p.breakT <= 0) p.dead = true; }
    }
  }

  function updateHazards(dt) {}

  const farShips = [
    { x: 180, y: 95,  d: 0.035, s: 0.65 },
    { x: 760, y: 145, d: 0.055, s: 0.9 },
    { x: 480, y: 70,  d: 0.025, s: 0.5 },
  ];

  function drawBackground(g, camX, time, VW, VH) {
    time = time || (window.G && G.time) || 0;

    // Deep space gradient
    const grad = g.createLinearGradient(0, 0, 0, VH);
    grad.addColorStop(0, '#020613'); grad.addColorStop(0.4, '#04090f'); grad.addColorStop(1, '#010308');
    g.fillStyle = grad; g.fillRect(0, 0, VW, VH);

    // Nebula glow
    g.save(); g.translate(VW / 2, VH / 2);
    g.rotate(Math.sin(time * 0.12 + camX * 0.0004) * 0.012);
    g.scale(1.035, 1.035); g.translate(-VW / 2, -VH / 2);
    const neb = g.createRadialGradient(690 - Math.sin(time * 0.08) * 120, 250, 20, 560, 270, 480);
    neb.addColorStop(0, 'rgba(90,40,150,.30)'); neb.addColorStop(0.45, 'rgba(15,70,135,.16)'); neb.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = neb; g.fillRect(0, 0, VW, VH);
    g.restore();

    // Star layers
    if (imageReady(starsImage)) {
      g.save(); g.globalAlpha = 0.42;
      for (let x = -((camX * 0.018) % 1020) - 1020; x < VW; x += 1020) g.drawImage(starsImage, x, 0, 1020, 540);
      g.globalAlpha = 0.7;
      for (let x = -((camX * 0.065) % 1020) - 1020; x < VW; x += 1020) g.drawImage(starsImage, x, -35, 1020, 540);
      g.restore();
    }

    // Asteroid layers
    if (imageReady(asteroidsImage)) {
      g.save(); g.globalAlpha = 0.16;
      for (let x = -((camX * 0.11) % 1200) - 1200; x < VW; x += 1200) g.drawImage(asteroidsImage, x, -55, 1200, 540);
      g.globalAlpha = 0.38;
      for (let x = -((camX * 0.28) % 1200) - 1200; x < VW; x += 1200) g.drawImage(asteroidsImage, x, 45, 1200, 540);
      g.restore();
    }

    // Background ships
    for (let si = 0; si < farShips.length; si++) {
      const sh = farShips[si], img = si % 2 ? shipArt02 : shipArt01;
      let x = ((sh.x - camX * sh.d + time * 9 * sh.s) % (VW + 300) + VW + 300) % (VW + 300) - 150;
      let y = sh.y + Math.sin(time * 0.7 + sh.x) * 8;
      if (imageReady(img)) {
        const sw = (si % 2 ? 150 : 175) * sh.s, shh = (si % 2 ? 72 : 61) * sh.s;
        g.save(); g.globalAlpha = 0.42 + sh.s * 0.2; g.shadowColor = '#52eaff'; g.shadowBlur = 8;
        g.drawImage(img, x - sw / 2, y - shh / 2, sw, shh); g.restore();
      }
    }
  }

  function drawGround(g, camX, VW, VH) {
    const time = (window.G && G.time) || 0;
    // Draw floating platforms
    if (imageReady(platformImage)) {
      g.save(); g.imageSmoothingEnabled = false;
      for (const pl of platforms) {
        if (pl.dead) continue;
        const px = Math.round(pl.x - camX);
        if (px + pl.w < -20 || px > VW + 20) continue;
        g.drawImage(platformImage, px, Math.round(pl.y), pl.w, 11);
        // Subtle glow under platform
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.25; g.fillStyle = '#52dfff';
        g.fillRect(px + 16, Math.round(pl.y) + 11, pl.w - 32, 2); g.restore();
      }
      g.restore();
    } else {
      // Fallback: solid rectangles
      g.fillStyle = '#785a4a';
      for (const pl of platforms) {
        if (pl.dead) continue;
        const px = Math.round(pl.x - camX);
        if (px + pl.w < -20 || px > VW + 20) continue;
        g.fillRect(px, Math.round(pl.y), pl.w, 10);
      }
    }

    // Exit portal beacon
    const ex = PORTAL_EXIT_X - camX;
    if (ex > -80 && ex < VW + 80) {
      const base = 380;
      const pulse = Math.sin(time * 2.2) * 0.2 + 0.8;
      g.save(); g.globalCompositeOperation = 'lighter';
      let grad = g.createRadialGradient(ex, base - 39, 4, ex, base - 39, 160);
      grad.addColorStop(0, '#fff8cc'); grad.addColorStop(0.2, '#68efff'); grad.addColorStop(0.45, '#2a9aff'); grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = 0.85 * pulse; g.fillStyle = grad; g.beginPath(); g.arc(ex, base - 39, 160, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ex, base - 39, 4 + Math.sin(time * 6) * 1.2, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.55; g.strokeStyle = '#a0f0ff'; g.lineWidth = 2;
      g.beginPath(); g.arc(ex, base - 39, 18 + Math.sin(time * 3) * 2, time * 1.2, time * 1.2 + Math.PI * 1.6); g.stroke();
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      if (imageReady(portalArt)) {
        g.shadowColor = '#68efff'; g.shadowBlur = 8 + pulse * 4;
        g.drawImage(portalArt, ex - 40, base - 80, 80, 80); g.shadowBlur = 0;
      }
      g.restore();
    }

    // God mode platform overlay
    if (window.G && G.godMode) {
      g.save(); g.globalAlpha = 0.26;
      for (const pl of platforms) {
        if (pl.dead) continue;
        const px = pl.x - camX;
        if (px + pl.w < -40 || px > VW + 40) continue;
        g.fillStyle = pl.fragile ? '#ff4d45' : '#3aff7a';
        g.fillRect(Math.round(px), Math.round(pl.y), pl.w, 2);
        g.fillRect(Math.round(px), Math.round(pl.y), 4, 4);
      }
      g.restore();
    }
  }

  function drawExtremeForeground(g, camX, VW, VH) {}

  function nightAmount() { return 1.0; }
  function isLavaGap() { return true; }
  function playerTouchesLaser() { return false; }

  window.PortalLevel = {
    W: W, GROUND: GROUND, VIEW_W: VW, VIEW_H: VH,
    platforms: platforms, spawns: spawns, props: [], highPickups: highPickups,
    slugSpawns: [], SURFBOARD_X: 999999, PORTAL_EXIT_X: PORTAL_EXIT_X,
    BOSS_TRIGGER_X: 999999, BOSS_X: 999999, PORTAL_X: 999999,
    nightAmount: nightAmount, isLavaGap: isLavaGap, updateHazards: updateHazards,
    playerTouchesLaser: playerTouchesLaser, resetPlatforms: resetPlatforms,
    updatePlatforms: updatePlatforms, drawBackground: drawBackground,
    drawGround: drawGround, drawExtremeForeground: drawExtremeForeground,
    duneSpec: null, mountainSpec: null, skySpec: null,
  };
})();
