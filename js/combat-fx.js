// ============================================================
// COMBAT FX — internal Canvas weapon flashes and projectile rendering
// ============================================================
// No image assets are used here. Shapes, gradients, glow layers and motion
// trails are produced at runtime and remain independent from gameplay logic.
(function () {
  const MUZZLES = {
    pistol:       { color: '#ffd45a', hot: '#ffffff', edge: '#ff7138', length: 27, width: 11, rays: 3 },
    mg:           { color: '#fff18a', hot: '#ffffff', edge: '#ff9a42', length: 32, width: 8, rays: 2 },
    spread:       { color: '#a9efff', hot: '#ffffff', edge: '#4dbfff', length: 42, width: 20, rays: 5 },
    rocket:       { color: '#ffb347', hot: '#fff5cf', edge: '#ff4e2f', length: 34, width: 18, rays: 4 },
    flame:        { color: '#ff8a32', hot: '#fff2a0', edge: '#e93424', length: 31, width: 15, rays: 4 },
    tankLaser:    { color: '#72f4ff', hot: '#ffffff', edge: '#3477ff', length: 37, width: 12, rays: 4 },
    grenade:      { color: '#ffbd66', hot: '#ffffff', edge: '#ff633a', length: 29, width: 15, rays: 4 },
    guided:       { color: '#67efff', hot: '#ffffff', edge: '#547dff', length: 38, width: 17, rays: 4 },
    enemyRifle:   { color: '#ff6a3d', hot: '#fff0c2', edge: '#c82038', length: 25, width: 10, rays: 3 },
    enemyTurret:  { color: '#ff55c8', hot: '#ffffff', edge: '#8c36ff', length: 32, width: 11, rays: 3 },
    enemyHeli:    { color: '#9dff5e', hot: '#efffc9', edge: '#23bfa1', length: 30, width: 13, rays: 4 },
    enemyGunship: { color: '#58dcff', hot: '#ffffff', edge: '#3d64ff', length: 38, width: 16, rays: 5 },
    enemyBoss:    { color: '#bd70ff', hot: '#ffffff', edge: '#ef3d8f', length: 39, width: 15, rays: 5 },
    cannon:       { color: '#ffb34f', hot: '#ffffff', edge: '#e63c27', length: 47, width: 22, rays: 5 }
  };

  const ENEMY_BOLTS = {
    enemyRifle:   { color: '#ff5f38', hot: '#fff1b8', tail: '#8e1028', length: 18, radius: 3 },
    enemyTurret:  { color: '#ff55d5', hot: '#ffffff', tail: '#6d36ff', length: 28, radius: 3.5 },
    enemyHeli:    { color: '#9cff57', hot: '#f2ffd2', tail: '#17aa9b', length: 22, radius: 4 },
    enemyGunship: { color: '#50ddff', hot: '#ffffff', tail: '#315dff', length: 14, radius: 6 },
    enemyBoss:    { color: '#c16dff', hot: '#ffffff', tail: '#e72f88', length: 31, radius: 5 }
  };

  const IMPACTS = {
    pistol:       { color: '#ffd45a', edge: '#ff5a32', rays: 8 },
    mg:           { color: '#fff08a', edge: '#ff8a32', rays: 7 },
    spread:       { color: '#79e9ff', edge: '#3976ff', rays: 12 },
    flame:        { color: '#ff9a38', edge: '#e72d20', rays: 9 },
    tankLaser:    { color: '#72f4ff', edge: '#315dff', rays: 10 },
    enemyRifle:   { color: '#ff6540', edge: '#a9102f', rays: 8 },
    enemyTurret:  { color: '#ff55d5', edge: '#7138ff', rays: 10 },
    enemyHeli:    { color: '#a1ff61', edge: '#18aa98', rays: 10 },
    enemyGunship: { color: '#58dfff', edge: '#365cff', rays: 12 },
    enemyBoss:    { color: '#c477ff', edge: '#ee398c', rays: 14 },
    explosion:    { color: '#ffcf5a', edge: '#ee3f25', rays: 16 }
  };

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function spawnMuzzle(store, x, y, dirX, dirY, style, power) {
    const cfg = MUZZLES[style] || MUZZLES.pistol;
    const length = Math.hypot(dirX, dirY) || 1;
    store.push({
      kind: 'weaponMuzzle', x: x, y: y,
      dirX: dirX / length, dirY: dirY / length,
      style: style, power: power || 1,
      seed: Math.random() * 1000,
      t: 0, life: style === 'cannon' ? 0.15 : style === 'spread' ? 0.115 : 0.085,
      r: cfg.length
    });
  }

  function spawnImpact(store, x, y, style, power) {
    const cfg = IMPACTS[style] || IMPACTS.pistol;
    store.push({
      kind: 'impactBurst', x: x, y: y,
      style: style, power: power || 1,
      seed: Math.random() * 1000,
      t: 0,
      life: style === 'explosion' ? 0.3 : 0.16,
      r: 20 * (power || 1),
      color: cfg.color,
    });
  }

  function drawMuzzleFlash(g, flash, camX) {
    if (flash.kind !== 'weaponMuzzle') return false;
    const cfg = MUZZLES[flash.style] || MUZZLES.pistol;
    const k = clamp01(flash.t / flash.life);
    const alpha = (1 - k) * (1 - k);
    const pulse = 0.84 + Math.sin((flash.seed + k * 10) * 4.7) * 0.1;
    const length = cfg.length * flash.power * (0.72 + k * 0.7) * pulse;
    const width = cfg.width * flash.power * (1 - k * 0.32);
    const angle = Math.atan2(flash.dirY, flash.dirX);

    g.save();
    g.translate(flash.x - camX, flash.y);
    g.rotate(angle);
    g.globalCompositeOperation = 'lighter';

    // Soft bloom at the muzzle, deliberately separate from the directional cone.
    const bloomRadius = width * (1.3 + k);
    const bloom = g.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, bloomRadius));
    bloom.addColorStop(0, cfg.hot);
    bloom.addColorStop(0.28, cfg.color);
    bloom.addColorStop(1, 'rgba(255,90,30,0)');
    g.globalAlpha = alpha * 0.72;
    g.fillStyle = bloom;
    g.beginPath();
    g.arc(0, 0, bloomRadius, 0, Math.PI * 2);
    g.fill();

    // Main plasma/flame cone with transparent trailing edge.
    const cone = g.createLinearGradient(-4, 0, length, 0);
    cone.addColorStop(0, cfg.hot);
    cone.addColorStop(0.24, cfg.color);
    cone.addColorStop(0.72, cfg.edge);
    cone.addColorStop(1, 'rgba(255,80,20,0)');
    g.globalAlpha = alpha;
    g.fillStyle = cone;
    g.beginPath();
    g.moveTo(-3, 0);
    g.lineTo(length * 0.24, -width * 0.56);
    g.lineTo(length * 0.58, -width * 0.22);
    g.lineTo(length, 0);
    g.lineTo(length * 0.58, width * 0.22);
    g.lineTo(length * 0.24, width * 0.56);
    g.closePath();
    g.fill();

    // Weapon-specific split rays. Spread and heavy weapons have more branches.
    g.strokeStyle = cfg.hot;
    g.lineCap = 'round';
    for (let i = 0; i < cfg.rays; i++) {
      const centered = i - (cfg.rays - 1) / 2;
      const rayAngle = centered * (cfg.rays >= 5 ? 0.13 : 0.1);
      const rayLen = length * (0.62 + ((i * 37 + Math.floor(flash.seed)) % 31) / 100);
      g.save();
      g.rotate(rayAngle);
      g.globalAlpha = alpha * (i === Math.floor(cfg.rays / 2) ? 0.95 : 0.58);
      g.lineWidth = i === Math.floor(cfg.rays / 2) ? 2.4 : 1.2;
      g.beginPath();
      g.moveTo(1, 0);
      g.lineTo(rayLen, 0);
      g.stroke();
      g.restore();
    }

    // Pressure crescent expands away from the barrel.
    g.globalAlpha = alpha * 0.42;
    g.strokeStyle = cfg.color;
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(length * 0.17, 0, width * (0.7 + k * 0.9), -1.0, 1.0);
    g.stroke();
    g.restore();
    return true;
  }

  function drawImpactBurst(g, flash, camX) {
    if (flash.kind !== 'impactBurst') return false;
    const cfg = IMPACTS[flash.style] || IMPACTS.pistol;
    const k = clamp01(flash.t / flash.life);
    const alpha = (1 - k) * (1 - k);
    const power = flash.power || 1;
    const radius = (8 + k * 27) * power;
    const sx = flash.x - camX;

    g.save();
    g.translate(sx, flash.y);
    g.globalCompositeOperation = 'lighter';

    // Saturated bloom under a hard white arcade core.
    const bloom = g.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, radius));
    bloom.addColorStop(0, '#ffffff');
    bloom.addColorStop(0.16, cfg.color);
    bloom.addColorStop(0.58, cfg.edge);
    bloom.addColorStop(1, 'rgba(255,40,20,0)');
    g.globalAlpha = alpha * 0.75;
    g.fillStyle = bloom;
    g.beginPath(); g.arc(0, 0, radius, 0, Math.PI * 2); g.fill();

    // Concentric hit-confirmation circles make contact readable through smoke.
    g.globalAlpha = alpha * 0.9;
    g.strokeStyle = '#ffffff';
    g.lineWidth = Math.max(1, (1 - k) * 3.5 * power);
    g.beginPath(); g.arc(0, 0, radius * 0.52, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = alpha * 0.55;
    g.strokeStyle = cfg.color;
    g.lineWidth = Math.max(1, (1 - k) * 2.2 * power);
    g.beginPath(); g.arc(0, 0, radius * 0.92, 0, Math.PI * 2); g.stroke();

    // Long high-contrast rays echo premium arcade hit bursts without using assets.
    for (let i = 0; i < cfg.rays; i++) {
      const hash = Math.sin(flash.seed * 12.9898 + i * 78.233) * 43758.5453;
      const random = hash - Math.floor(hash);
      const angle = i / cfg.rays * Math.PI * 2 + flash.seed * 0.01;
      const inner = radius * (0.18 + random * 0.2);
      const outer = radius * (1.2 + random * 1.5);
      g.globalAlpha = alpha * (0.35 + random * 0.65);
      g.strokeStyle = i % 3 === 0 ? '#ffffff' : cfg.color;
      g.lineWidth = Math.max(1, (1 - k) * (1 + random * 2.2) * power);
      g.beginPath();
      g.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      g.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      g.stroke();
    }

    // Four-point white core gives the first impact frame a crisp silhouette.
    g.globalAlpha = alpha;
    g.fillStyle = '#ffffff';
    const core = Math.max(1, (1 - k) * 9 * power);
    g.beginPath();
    g.moveTo(0, -core * 1.9); g.lineTo(core * 0.45, -core * 0.45);
    g.lineTo(core * 1.9, 0); g.lineTo(core * 0.45, core * 0.45);
    g.lineTo(0, core * 1.9); g.lineTo(-core * 0.45, core * 0.45);
    g.lineTo(-core * 1.9, 0); g.lineTo(-core * 0.45, -core * 0.45);
    g.closePath(); g.fill();
    g.restore();
    return true;
  }

  function drawFlash(g, flash, camX) {
    if (flash.kind === 'weaponMuzzle') return drawMuzzleFlash(g, flash, camX);
    if (flash.kind === 'impactBurst') return drawImpactBurst(g, flash, camX);
    return false;
  }

  function drawTracer(g, b, camX, time) {
    const angle = Math.atan2(b.vy, b.vx);
    const style = b.type || 'pistol';
    const cfg = style === 'spread' ?
      { color: '#84eaff', hot: '#ffffff', tail: '#2879ff', len: 17, width: 3.2 } :
      style === 'tankLaser' ?
      { color: '#72f4ff', hot: '#ffffff', tail: '#315dff', len: 30, width: 3.6 } :
      style === 'mg' ?
      { color: '#ffe86d', hot: '#ffffff', tail: '#ff7a2f', len: 25, width: 2.4 } :
      { color: '#ffd35c', hot: '#ffffff', tail: '#ff5d32', len: 20, width: 2.8 };
    const sx = b.x - camX;

    g.save();
    g.translate(sx, b.y);
    g.rotate(angle);
    g.globalCompositeOperation = 'lighter';
    const trail = g.createLinearGradient(-cfg.len, 0, cfg.len * 0.35, 0);
    trail.addColorStop(0, 'rgba(255,80,20,0)');
    trail.addColorStop(0.46, cfg.tail);
    trail.addColorStop(0.82, cfg.color);
    trail.addColorStop(1, cfg.hot);
    g.globalAlpha = 0.5;
    g.fillStyle = trail;
    g.fillRect(-cfg.len, -cfg.width * 1.8, cfg.len * 1.35, cfg.width * 3.6);
    g.globalAlpha = 1;
    g.fillStyle = cfg.hot;
    g.fillRect(-cfg.len * 0.42, -0.8, cfg.len * 0.92, 1.6);
    g.fillStyle = cfg.color;
    g.beginPath();
    g.moveTo(cfg.len * 0.62, 0);
    g.lineTo(cfg.len * 0.28, -cfg.width);
    g.lineTo(cfg.len * 0.28, cfg.width);
    g.closePath();
    g.fill();
    if (style === 'spread') {
      g.globalAlpha = 0.55 + Math.sin(time * 30 + b.x * 0.02) * 0.18;
      g.strokeStyle = '#baf5ff';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(-cfg.len * 0.25, -4);
      g.lineTo(cfg.len * 0.25, -2);
      g.moveTo(-cfg.len * 0.25, 4);
      g.lineTo(cfg.len * 0.25, 2);
      g.stroke();
    } else if (style === 'tankLaser') {
      g.globalAlpha = 0.7 + Math.sin(time * 42 + b.x * 0.025) * 0.16;
      g.strokeStyle = '#a9faff';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(-cfg.len * 0.5, -5); g.lineTo(cfg.len * 0.05, -2.5);
      g.moveTo(-cfg.len * 0.5, 5); g.lineTo(cfg.len * 0.05, 2.5);
      g.stroke();
      g.globalAlpha = 0.9;
      g.strokeStyle = '#ffffff';
      g.beginPath();
      g.arc(cfg.len * 0.38, 0, 3.5, 0, Math.PI * 2);
      g.stroke();
    }
    g.restore();
  }

  function drawRocket(g, b, camX, time) {
    const sx = b.x - camX;
    const angle = Math.atan2(b.vy, b.vx);
    g.save();
    g.translate(sx, b.y);
    g.rotate(angle);
    g.globalCompositeOperation = 'lighter';
    const exhaust = g.createLinearGradient(-26, 0, -7, 0);
    exhaust.addColorStop(0, 'rgba(255,40,20,0)');
    exhaust.addColorStop(0.48, '#ff5a2d');
    exhaust.addColorStop(0.78, '#ffd05c');
    exhaust.addColorStop(1, '#ffffff');
    g.globalAlpha = 0.85;
    g.fillStyle = exhaust;
    g.beginPath();
    g.moveTo(-27 - Math.sin(time * 45) * 3, 0);
    g.lineTo(-8, -5);
    g.lineTo(-8, 5);
    g.closePath();
    g.fill();
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    const body = g.createLinearGradient(-10, -5, -10, 5);
    body.addColorStop(0, '#edf4f6');
    body.addColorStop(0.48, '#8997a2');
    body.addColorStop(1, '#46515b');
    g.fillStyle = body;
    g.fillRect(-10, -4, 18, 8);
    g.fillStyle = '#e3423b';
    g.beginPath();
    g.moveTo(13, 0); g.lineTo(7, -4); g.lineTo(7, 4); g.closePath(); g.fill();
    g.fillStyle = '#81909a';
    g.beginPath();
    g.moveTo(-7, -4); g.lineTo(-2, -9); g.lineTo(2, -4); g.closePath(); g.fill();
    g.beginPath();
    g.moveTo(-7, 4); g.lineTo(-2, 9); g.lineTo(2, 4); g.closePath(); g.fill();
    g.fillStyle = '#f4d35e';
    g.fillRect(1, -2, 3, 4);
    g.restore();
  }

  function drawFlame(g, b, camX, time) {
    const sx = b.x - camX;
    const angle = Math.atan2(b.vy, b.vx);
    const k = clamp01(b.t / 0.4);
    const length = 15 + k * 23;
    const width = 7 + k * 17;
    g.save();
    g.translate(sx, b.y);
    g.rotate(angle);
    g.globalCompositeOperation = 'lighter';
    const grad = g.createRadialGradient(0, 0, 1, 0, 0, width);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#fff08a');
    grad.addColorStop(0.55, '#ff8b2f');
    grad.addColorStop(0.82, '#e72d20');
    grad.addColorStop(1, 'rgba(140,20,10,0)');
    g.globalAlpha = Math.max(0.18, 0.92 - k * 0.6);
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(-length * 0.15, 0, length, width * (0.82 + Math.sin(time * 35 + b.x) * 0.08), 0, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha *= 0.8;
    g.fillStyle = '#fff7c2';
    g.beginPath();
    g.ellipse(length * 0.12, 0, length * 0.38, width * 0.28, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  function drawPlayerProjectile(g, b, camX, time) {
    if (b.type === 'rocket') drawRocket(g, b, camX, time);
    else if (b.type === 'flame') drawFlame(g, b, camX, time);
    else drawTracer(g, b, camX, time);
    return true;
  }

  function drawMeleeSlash(g, x, y, facing, progress) {
    const k = clamp01(progress);
    const alpha = Math.sin(k * Math.PI);
    const sweep = -1.35 + k * 1.15;
    g.save();
    g.translate(x, y);
    if (facing < 0) g.scale(-1, 1);
    g.rotate(sweep * 0.22);
    g.globalCompositeOperation = 'lighter';

    const slash = g.createLinearGradient(3, -25, 48, 18);
    slash.addColorStop(0, 'rgba(90,220,255,0)');
    slash.addColorStop(0.45, '#72e7ff');
    slash.addColorStop(0.78, '#fff3a1');
    slash.addColorStop(1, '#ffffff');
    g.strokeStyle = slash;
    g.globalAlpha = alpha * 0.72;
    g.lineCap = 'round';
    g.lineWidth = 10 * (1 - k * 0.35);
    g.beginPath();
    g.arc(4, 0, 31 + k * 8, -1.25, 1.15);
    g.stroke();

    g.globalAlpha = alpha;
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2.2;
    g.beginPath();
    g.arc(4, 0, 34 + k * 7, -1.2, 1.08);
    g.stroke();

    // Three short blade glints at the leading edge.
    const ex = 4 + Math.cos(1.08) * (34 + k * 7);
    const ey = Math.sin(1.08) * (34 + k * 7);
    g.strokeStyle = '#fff7c7';
    g.lineWidth = 1.2;
    for (let i = -1; i <= 1; i++) {
      g.globalAlpha = alpha * (0.55 + (i === 0 ? 0.35 : 0));
      g.beginPath();
      g.moveTo(ex, ey);
      g.lineTo(ex + 11 + Math.abs(i) * 4, ey + i * 7);
      g.stroke();
    }
    g.restore();
  }

  function drawEnemyProjectile(g, b, camX, time) {
    const cfg = ENEMY_BOLTS[b.style] || ENEMY_BOLTS.enemyRifle;
    const sx = b.x - camX;
    const angle = Math.atan2(b.vy, b.vx);
    const pulse = 0.82 + Math.sin(time * 22 + (b.phase || 0)) * 0.18;
    g.save();
    g.translate(sx, b.y);
    g.rotate(angle);
    g.globalCompositeOperation = 'lighter';

    if (b.style === 'enemyGunship') {
      const glow = g.createRadialGradient(0, 0, 0, 0, 0, cfg.radius * 2.1);
      glow.addColorStop(0, cfg.hot);
      glow.addColorStop(0.34, cfg.color);
      glow.addColorStop(1, 'rgba(40,80,255,0)');
      g.globalAlpha = 0.8;
      g.fillStyle = glow;
      g.beginPath(); g.arc(0, 0, cfg.radius * 2.1, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.75;
      g.strokeStyle = cfg.hot;
      g.lineWidth = 1;
      g.rotate(time * 5 + (b.phase || 0));
      g.beginPath(); g.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.ellipse(0, 0, 10, 4, Math.PI / 2, 0, Math.PI * 2); g.stroke();
    } else {
      const tail = g.createLinearGradient(-cfg.length, 0, cfg.radius, 0);
      tail.addColorStop(0, 'rgba(120,10,40,0)');
      tail.addColorStop(0.48, cfg.tail);
      tail.addColorStop(0.83, cfg.color);
      tail.addColorStop(1, cfg.hot);
      g.globalAlpha = 0.58;
      g.fillStyle = tail;
      g.fillRect(-cfg.length, -cfg.radius * 1.8, cfg.length + cfg.radius * 2, cfg.radius * 3.6);
      g.globalAlpha = 1;
      g.fillStyle = cfg.hot;
      g.beginPath();
      g.moveTo(cfg.radius * 2.1, 0);
      g.lineTo(-cfg.radius * 0.4, -cfg.radius * pulse);
      g.lineTo(-cfg.radius * 0.4, cfg.radius * pulse);
      g.closePath();
      g.fill();
      if (b.style === 'enemyTurret' || b.style === 'enemyBoss') {
        g.globalAlpha = 0.72;
        g.strokeStyle = cfg.color;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(-cfg.length * 0.65, -cfg.radius * 2.2); g.lineTo(2, -cfg.radius * 1.25);
        g.moveTo(-cfg.length * 0.65, cfg.radius * 2.2); g.lineTo(2, cfg.radius * 1.25);
        g.stroke();
      }
    }
    g.restore();
    return true;
  }

  window.CombatFX = {
    spawnMuzzle: spawnMuzzle,
    spawnImpact: spawnImpact,
    drawFlash: drawFlash,
    drawPlayerProjectile: drawPlayerProjectile,
    drawMeleeSlash: drawMeleeSlash,
    drawEnemyProjectile: drawEnemyProjectile
  };
})();
