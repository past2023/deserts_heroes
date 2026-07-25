// ============================================================
// DESERT'S HEROES — standalone two-slide cinematic intro
// ============================================================
(function () {
  const canvas = document.getElementById('intro');
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = false;
  const W = canvas.width, H = canvas.height;
  const creditPixels = document.createElement('canvas');
  creditPixels.width = 240; creditPixels.height = 135;
  const creditPixelG = creditPixels.getContext('2d');
  MusicTracks.play('overture');

  const SLIDE_TIME = 7.4;
  const STORY_TIME = 11.5;
  const TOTAL_TIME = SLIDE_TIME * 5 + STORY_TIME;
  const TARGET = 'level1.html';
  const introLanguage = (function () {
    try { return localStorage.getItem('dh_language') || 'en'; } catch (e) { return 'en'; }
  })();
  const skipLabels = {
    en: 'PRESS ANY KEY OR TAP TO SKIP',
    es: 'PULSA UNA TECLA O TOCA PARA OMITIR',
    fr: 'APPUYEZ SUR UNE TOUCHE OU TOUCHEZ POUR PASSER',
    ru: 'НАЖМИТЕ КЛАВИШУ ИЛИ КОСНИТЕСЬ, ЧТОБЫ ПРОПУСТИТЬ'
  };
  const audioLabels = {
    en: 'PRESS ANY KEY OR TAP TO ENABLE AUDIO',
    es: 'PULSA UNA TECLA O TOCA PARA ACTIVAR EL AUDIO',
    fr: 'APPUYEZ SUR UNE TOUCHE OU TOUCHEZ POUR ACTIVER LE SON',
    ru: 'НАЖМИТЕ КЛАВИШУ ИЛИ КОСНИТЕСЬ, ЧТОБЫ ВКЛЮЧИТЬ ЗВУК'
  };
  const storyText = {
    en: ['THE ATAVIST DOMINION BURNS ARCHIVES AND DARKENS WORLDS.','SCIENTIFIC SOLDIERS CROSS THE FRONTIER WITH TOOLS, MEMORY AND ARMS.','THEY EXPLORE FIRST. WHEN REASON FAILS, THEY DEFEND.'],
    es: ['EL DOMINIO ATAVISTA QUEMA ARCHIVOS Y OSCURECE MUNDOS.','SOLDADOS CIENTÍFICOS CRUZAN LA FRONTERA CON HERRAMIENTAS, MEMORIA Y ARMAS.','PRIMERO EXPLORAN. CUANDO FALLA LA RAZÓN, DEFIENDEN.'],
    fr: ['LE DOMINION ATAVISTE BRÛLE LES ARCHIVES ET PLONGE LES MONDES DANS L’OMBRE.','DES SOLDATS SCIENTIFIQUES FRANCHISSENT LA FRONTIÈRE AVEC OUTILS, MÉMOIRE ET ARMES.','ILS EXPLORENT D’ABORD. SI LA RAISON ÉCHOUE, ILS DÉFENDENT.'],
    ru: ['ДОМЕН АТАВИСТОВ СЖИГАЕТ АРХИВЫ И ПОГРУЖАЕТ МИРЫ ВО ТЬМУ.','СОЛДАТЫ-УЧЁНЫЕ НЕСУТ ЧЕРЕЗ ФРОНТИР ПРИБОРЫ, ПАМЯТЬ И ОРУЖИЕ.','СНАЧАЛА ИССЛЕДУЮТ. ЕСЛИ РАЗУМ НЕ ПОМОГАЕТ — ЗАЩИЩАЮТ.']
  };
  let finished = false;
  let audioGestureConsumed = MusicTracks.isPlaying();
  let startTime = performance.now();

  const specs = {
    desertSky:       { file: 'assets/intro/slide1_sky.png',       w: 1020, h: 540 },
    desertMountains: { file: 'assets/intro/slide1_mountains.png', w: 1080, h: 463 },
    desertDunes:     { file: 'assets/intro/slide1_dunes.png',     w: 1200, h: 540 },
    // Slide 2 deliberately mirrors the three Slide 1 canvas widths.
    spaceStars:      { file: 'assets/intro/slide2_stars.png',     w: 1020, h: 540 },
    spacePlanet:     { file: 'assets/intro/slide2_planet.png',    w: 1080, h: 463 },
    spaceAsteroids:  { file: 'assets/intro/slide2_asteroids.png', w: 1200, h: 540 },
    ship01:          { file: 'assets/intro/intro_ship01.png',     w: 325,  h: 120 },
    ship02:          { file: 'assets/intro/intro_ship02.png',     w: 269,  h: 120 },
    ship03:          { file: 'assets/intro/intro_ship03.png',     w: 259,  h: 120 },
    slide3Sky:       { file: 'assets/intro/slide3_sky.png',       w: 1020, h: 540 },
    slide3Mountains: { file: 'assets/intro/slide3_mountains.png', w: 1080, h: 463 },
    slide3Dunes:     { file: 'assets/intro/slide3_dunes.png',     w: 1200, h: 540 },
    slide4Sky:       { file: 'assets/intro/slide4_sky.png',       w: 1020, h: 540 },
    slide4Tank:      { file: 'assets/intro/slide1_tank.png',      w: 1080, h: 463 },
    slide4Foreground:{ file: 'assets/intro/slide4_foreground.png',w: 1200, h: 540 },
    logo:            { file: 'assets/ui/logodesertheroe.png',    w: 952,  h: 952 },
  };
  const images = {};

  for (const key of Object.keys(specs)) {
    const spec = specs[key];
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      if (img.naturalWidth !== spec.w || img.naturalHeight !== spec.h) {
        console.warn('[Intro art] ' + spec.file + ' is ' + img.naturalWidth + 'x' +
          img.naturalHeight + '; expected ' + spec.w + 'x' + spec.h + '.');
      }
    };
    img.src = spec.file;
    images[key] = img;
  }

  function shuffled(values) {
    const result = values.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i]; result[i] = result[j]; result[j] = temp;
    }
    return result;
  }
  const slideShips = shuffled(['ship01', 'ship02', 'ship03']);
  const slideFire = [Math.random() < 0.62, Math.random() < 0.62, Math.random() < 0.62];
  // Authored cannon sockets in image-local coordinates from each centered pivot.
  const SHIP_MUZZLES = {
    ship01: [[160, 14]],
    ship02: [[16, -46]],
    ship03: [[124, 6], [46, 32]],
  };
  const SHIP_MISSILE_SOCKETS = {
    ship01: [[-48, -44], [28, -44]],
  };

  function ready(img) { return img && img.naturalWidth > 0; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(v) { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); }

  function resize() {
    const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    canvas.style.width = Math.floor(W * scale) + 'px';
    canvas.style.height = Math.floor(H * scale) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  function navigate() {
    if (finished) return;
    finished = true;
    window.location.replace(TARGET);
  }

  function skip(e) {
    if (e && e.preventDefault) e.preventDefault();
    // Safari requires a gesture to start media. Reserve the first gesture for
    // audio activation; only a later gesture skips the cinematic.
    if (!audioGestureConsumed && !MusicTracks.isPlaying()) {
      audioGestureConsumed = true;
      MusicTracks.resume();
      startTime = performance.now(); // let the overture accompany the full film
      return;
    }
    navigate();
  }
  window.addEventListener('keydown', skip);
  window.addEventListener('pointerdown', skip);

  function drawLayer(key, travel, progress, fallback) {
    const img = images[key];
    const x = -Math.round(travel * progress);
    if (ready(img)) {
      // The delivered mountain and planet layers are 463 px high and are
      // vertically centered inside the 540 px cinematic canvas.
      const y = Math.round((H - img.naturalHeight) / 2);
      g.drawImage(img, x, y);
    } else fallback(x, progress);
  }

  // ---------- deterministic fallback art ----------
  function rng(seed) {
    let value = seed | 0;
    return function () {
      value = (value * 1664525 + 1013904223) | 0;
      return (value >>> 0) / 4294967296;
    };
  }
  const starData = [];
  {
    const r = rng(77);
    for (let i = 0; i < 150; i++) {
      starData.push({ x: r() * 1050, y: r() * 480, size: r() < 0.82 ? 1 : 2, phase: r() * 6.28 });
    }
  }
  const asteroidData = [];
  {
    const r = rng(812);
    for (let i = 0; i < 17; i++) {
      asteroidData.push({ x: r() * 1200, y: 55 + r() * 440, r: 7 + r() * 28, rot: r() * 6.28 });
    }
  }
  const sandWind = [];
  {
    const r = rng(414);
    for (let i = 0; i < 95; i++) {
      sandWind.push({
        x: r() * W, y: 285 + r() * 245,
        speed: 35 + r() * 135, length: 2 + r() * 12,
        size: r() < 0.82 ? 1 : 2, phase: r() * 1000,
      });
    }
  }
  const movingStars = [];
  {
    const r = rng(991);
    for (let i = 0; i < 85; i++) {
      movingStars.push({
        x: r() * W, y: r() * H,
        depth: 0.25 + r() * 0.75,
        size: r() < 0.82 ? 1 : 2,
        phase: r() * 6.28,
      });
    }
  }

  function fallbackDesertSky(x) {
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#14244a');
    grad.addColorStop(0.55, '#8a4b56');
    grad.addColorStop(1, '#ef9b4f');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#ffd987';
    g.beginPath(); g.arc(720 + x * 0.08, 174, 58, 0, Math.PI * 2); g.fill();
  }
  function fallbackDesertMountains(x) {
    g.fillStyle = '#43364c';
    for (let i = -1; i < 6; i++) {
      const px = x + i * 230;
      g.beginPath();
      g.moveTo(px, 420); g.lineTo(px + 108, 210 + (i % 3) * 35); g.lineTo(px + 245, 420); g.fill();
    }
  }
  function fallbackDesertDunes(x) {
    g.fillStyle = '#a95734';
    for (let i = -1; i < 5; i++) {
      const px = x + i * 330;
      g.beginPath();
      g.moveTo(px, H); g.quadraticCurveTo(px + 150, 330, px + 345, H); g.fill();
    }
    g.fillStyle = '#e58a42';
    for (let i = -1; i < 5; i++) {
      const px = x + i * 330;
      g.beginPath();
      g.moveTo(px + 60, H); g.quadraticCurveTo(px + 165, 370, px + 275, H); g.fill();
    }
  }
  function fallbackSpaceStars(x, progress) {
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#02040d'); grad.addColorStop(1, '#101b3d');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    for (const s of starData) {
      const twinkle = 0.45 + Math.sin(progress * 25 + s.phase) * 0.35;
      g.globalAlpha = twinkle;
      g.fillStyle = s.size > 1 ? '#bdeaff' : '#ffffff';
      g.fillRect(Math.round(s.x + x), Math.round(s.y), s.size, s.size);
    }
    g.globalAlpha = 1;
  }
  function fallbackSpacePlanet(x) {
    const cx = 690 + x, cy = 260, radius = 145;
    const glow = g.createRadialGradient(cx, cy, radius * 0.65, cx, cy, radius * 1.35);
    glow.addColorStop(0, 'rgba(75,180,255,0.35)'); glow.addColorStop(1, 'rgba(25,80,180,0)');
    g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, radius * 1.35, 0, Math.PI * 2); g.fill();
    const planet = g.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    planet.addColorStop(0, '#e6c46c'); planet.addColorStop(0.45, '#7e72b7'); planet.addColorStop(1, '#18264b');
    g.fillStyle = planet; g.beginPath(); g.arc(cx, cy, radius, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(180,220,255,0.45)'; g.lineWidth = 7;
    g.beginPath(); g.ellipse(cx, cy + 8, radius * 1.45, radius * 0.32, -0.18, 0, Math.PI * 2); g.stroke();
  }
  function fallbackAsteroids(x) {
    for (const a of asteroidData) {
      const px = a.x + x;
      g.save(); g.translate(px, a.y); g.rotate(a.rot);
      g.fillStyle = '#4c5063';
      g.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = i / 8 * Math.PI * 2;
        const rr = a.r * (i % 2 ? 0.72 : 1);
        const xx = Math.cos(angle) * rr, yy = Math.sin(angle) * rr;
        if (i === 0) g.moveTo(xx, yy); else g.lineTo(xx, yy);
      }
      g.closePath(); g.fill();
      g.fillStyle = '#777887'; g.fillRect(-a.r * 0.45, -a.r * 0.45, a.r * 0.38, a.r * 0.25);
      g.restore();
    }
  }

  function drawSandWind(now, alpha) {
    const time = now / 1000;
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const p of sandWind) {
      const span = W + 120;
      const x = ((p.x + time * p.speed + p.phase) % span) - 60;
      const y = p.y + Math.sin(time * 2.4 + p.phase) * 4;
      const fade = clamp((y - 280) / 130, 0.15, 1);
      g.globalAlpha = alpha * fade * 0.34;
      g.strokeStyle = p.size > 1 ? '#ffe2a1' : '#e9a34e';
      g.lineWidth = p.size;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - p.length, y + 1);
      g.stroke();
    }
    g.restore();
  }

  function drawMovingStars(now, alpha) {
    const time = now / 1000;
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const s of movingStars) {
      const span = W + 100;
      const x = ((s.x - time * (18 + s.depth * 85) + span * 20) % span) - 50;
      const y = s.y + Math.sin(time * 0.7 + s.phase) * (1 + s.depth * 2);
      const twinkle = 0.45 + Math.sin(time * 5 + s.phase) * 0.3;
      g.globalAlpha = alpha * twinkle * (0.35 + s.depth * 0.5);
      g.strokeStyle = s.depth > 0.72 ? '#bdeaff' : '#ffffff';
      g.lineWidth = s.size;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + s.depth * 7, y);
      g.stroke();
    }
    g.restore();
  }

  function drawFallbackShip(x, y, scale, time) {
    g.save();
    g.translate(x, y);
    g.scale(scale, scale);

    // Twin-engine additive exhaust with independent flame flutter.
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 2; i++) {
      const ey = i ? 17 : -17;
      const flutter = Math.sin(time * 39 + i * 2.1) * 6;
      const flame = 34 + flutter;
      const glow = g.createRadialGradient(-66, ey, 0, -66, ey, 18);
      glow.addColorStop(0, 'rgba(255,255,255,0.9)');
      glow.addColorStop(0.25, 'rgba(255,210,75,0.65)');
      glow.addColorStop(1, 'rgba(255,70,25,0)');
      g.fillStyle = glow;
      g.beginPath(); g.arc(-66, ey, 18, 0, Math.PI * 2); g.fill();
      const exhaust = g.createLinearGradient(-70 - flame, ey, -57, ey);
      exhaust.addColorStop(0, 'rgba(255,45,20,0)');
      exhaust.addColorStop(0.42, '#ff4b28');
      exhaust.addColorStop(0.72, '#ffc84f');
      exhaust.addColorStop(1, '#ffffff');
      g.fillStyle = exhaust;
      g.beginPath();
      g.moveTo(-58, ey - 7); g.lineTo(-72 - flame, ey);
      g.lineTo(-58, ey + 7); g.closePath(); g.fill();
      g.fillStyle = '#dff9ff';
      g.beginPath();
      g.moveTo(-58, ey - 2); g.lineTo(-76 - flame * 0.45, ey);
      g.lineTo(-58, ey + 2); g.closePath(); g.fill();
    }
    g.restore();

    // Rear engine pods and armored rings.
    for (const ey of [-17, 17]) {
      g.fillStyle = '#202a35'; g.fillRect(-72, ey - 10, 27, 20);
      g.fillStyle = '#71808d'; g.fillRect(-67, ey - 7, 18, 14);
      g.fillStyle = '#d64635'; g.fillRect(-75, ey - 7, 7, 14);
      g.fillStyle = '#0c121a'; g.fillRect(-71, ey - 5, 4, 10);
      g.fillStyle = '#d8f6ff'; g.fillRect(-54, ey - 5, 3, 3);
    }

    // Large swept wings behind the central fuselage.
    g.fillStyle = '#293847';
    g.beginPath();
    g.moveTo(-35, -19); g.lineTo(28, -19); g.lineTo(55, -45);
    g.lineTo(69, -41); g.lineTo(43, -5); g.lineTo(-26, -3); g.closePath(); g.fill();
    g.beginPath();
    g.moveTo(-35, 19); g.lineTo(28, 19); g.lineTo(55, 45);
    g.lineTo(69, 41); g.lineTo(43, 5); g.lineTo(-26, 3); g.closePath(); g.fill();
    g.fillStyle = '#e07b32';
    g.beginPath(); g.moveTo(18, -17); g.lineTo(54, -39); g.lineTo(39, -7); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(18, 17); g.lineTo(54, 39); g.lineTo(39, 7); g.closePath(); g.fill();

    // Main fuselage with a bright upper bevel and dark armored underside.
    const body = g.createLinearGradient(0, -28, 0, 28);
    body.addColorStop(0, '#fff0bd');
    body.addColorStop(0.25, '#e49a42');
    body.addColorStop(0.62, '#b84f2f');
    body.addColorStop(1, '#3a3033');
    g.fillStyle = body;
    g.beginPath();
    g.moveTo(-55, -27); g.lineTo(37, -27); g.lineTo(82, -8);
    g.lineTo(96, 0); g.lineTo(82, 8); g.lineTo(37, 27);
    g.lineTo(-55, 27); g.lineTo(-68, 15); g.lineTo(-68, -15); g.closePath();
    g.fill();
    g.strokeStyle = '#111923'; g.lineWidth = 4; g.stroke();

    // Cyan cockpit canopy and reflected sky streak.
    const canopy = g.createLinearGradient(-20, -19, 22, 12);
    canopy.addColorStop(0, '#dffcff'); canopy.addColorStop(0.28, '#62d9ee');
    canopy.addColorStop(0.72, '#1683a8'); canopy.addColorStop(1, '#0b354e');
    g.fillStyle = canopy;
    g.beginPath();
    g.moveTo(-22, -21); g.lineTo(24, -21); g.lineTo(43, -7);
    g.lineTo(17, 7); g.lineTo(-27, 5); g.closePath(); g.fill();
    g.strokeStyle = '#182633'; g.lineWidth = 3; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.72)';
    g.fillRect(-14, -16, 32, 3);

    // Nose armor, sensor, panel seams and navigation lights.
    g.fillStyle = '#e9eef1';
    g.beginPath(); g.moveTo(42, -18); g.lineTo(84, -7); g.lineTo(96, 0);
    g.lineTo(84, 7); g.lineTo(42, 18); g.lineTo(52, 0); g.closePath(); g.fill();
    g.strokeStyle = '#58636d'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#72f4ff'; g.fillRect(76, -3, 10, 6);
    g.fillStyle = '#ff4f4f'; g.fillRect(35, -30, 6, 4);
    g.fillStyle = '#70ff9a'; g.fillRect(35, 26, 6, 4);
    g.strokeStyle = '#4c382f'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-45, -7); g.lineTo(24, -7); g.moveTo(-45, 11); g.lineTo(31, 11); g.stroke();
    g.fillStyle = '#2c3540';
    for (let px = -43; px <= 25; px += 17) {
      g.fillRect(px, -23, 3, 3); g.fillRect(px, 20, 3, 3);
    }

    // Tail fin and expedition emblem.
    g.fillStyle = '#b83d35';
    g.beginPath(); g.moveTo(-49, -25); g.lineTo(-22, -25); g.lineTo(-42, -48); g.closePath(); g.fill();
    g.fillStyle = '#ffe176';
    g.beginPath(); g.arc(-37, 1, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7b3e2b';
    g.beginPath(); g.arc(-37, 1, 3, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  function drawShip(x, y, scale, time, shipKey, local, fireEnabled) {
    const key = shipKey || 'ship01';
    const img = images[key], spec = specs[key];
    if (ready(img) && spec) {
      g.save();
      g.translate(Math.round(x), Math.round(y));
      g.scale(scale, scale);
      // Multi-layer reactor cones, hot cores and ejected plasma particles.
      g.globalCompositeOperation = 'lighter';
      const thrust = 0.82 + Math.sin(time * 27 + spec.w) * 0.16;
      const engines = key === 'ship03' ? [-25, 22] : key === 'ship02' ? [-22, 18] : [0];
      for (const ey of engines) {
        const tailX = -spec.w / 2 + 8;
        const plume = g.createLinearGradient(tailX - 105 * thrust, ey, tailX + 5, ey);
        plume.addColorStop(0, 'rgba(30,130,255,0)');
        plume.addColorStop(0.34, '#168cff'); plume.addColorStop(0.68, '#55eeff');
        plume.addColorStop(1, '#ffffff');
        g.fillStyle = plume; g.globalAlpha = 0.82;
        g.beginPath();
        g.moveTo(tailX + 4, ey - 8); g.lineTo(tailX - 105 * thrust, ey);
        g.lineTo(tailX + 4, ey + 8); g.closePath(); g.fill();
        g.globalAlpha = 0.85; g.fillStyle = '#dfffff';
        g.beginPath(); g.ellipse(tailX, ey, 13, 7, 0, 0, Math.PI * 2); g.fill();
        for (let i = 0; i < 5; i++) {
          const px = tailX - 24 - ((time * (80 + i * 13) + i * 31) % 90);
          const py = ey + Math.sin(time * 16 + i * 2.2) * (4 + i);
          g.globalAlpha = 0.5 - i * 0.06; g.fillStyle = i % 2 ? '#68efff' : '#ffffff';
          g.fillRect(px, py, 4 + (i % 2) * 2, 2);
        }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      g.drawImage(img, -spec.w / 2, -spec.h / 2);
      // Some runs are peaceful; firing runs use intermittent twin laser bursts.
      const firing = fireEnabled && Math.sin((local || 0) * 3.4 + spec.w) > 0.2;
      if (firing) {
        const muzzles = SHIP_MUZZLES[key] || [[spec.w / 2 - 5, 0]];
        g.globalCompositeOperation = 'lighter';
        // Discrete high-speed bolts match the player's machine-gun language
        // and originate from each ship's authored cannon socket.
        for (let shot = 0; shot < 4; shot++) {
          const travel = (((local || 0) * 560 - shot * 86) % 390 + 390) % 390;
          if (travel > 300) continue;
          for (const muzzle of muzzles) {
            const bx = muzzle[0] + 12 + travel, by = muzzle[1];
            g.globalAlpha = 0.4; g.fillStyle = '#36dfff';
            g.fillRect(bx - 5, by - 3, 34, 7);
            g.globalAlpha = 1; g.fillStyle = '#ffffff';
            g.fillRect(bx, by - 1, 25, 2);
          }
        }
        g.globalAlpha = 0.7; g.fillStyle = '#dfffff';
        for (const muzzle of muzzles) {
          g.beginPath(); g.ellipse(muzzle[0] + 3, muzzle[1], 13, 9, 0, 0, Math.PI * 2); g.fill();
        }
      }
      const missileSockets = SHIP_MISSILE_SOCKETS[key];
      if (fireEnabled && missileSockets && Math.sin((local || 0) * 1.7) > 0.58) {
        g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < missileSockets.length; i++) {
          const travel = (((local || 0) * 210 - i * 95) % 430 + 430) % 430;
          if (travel > 320) continue;
          const progress = travel / 320;
          const mx = missileSockets[i][0] + travel;
          const my = missileSockets[i][1] - Math.sin(progress * Math.PI) * 54;
          g.globalAlpha = 0.38; g.strokeStyle = '#68efff'; g.lineWidth = 6;
          g.beginPath(); g.moveTo(missileSockets[i][0], missileSockets[i][1]);
          g.quadraticCurveTo(missileSockets[i][0] + travel * 0.5, my - 35, mx, my); g.stroke();
          g.globalAlpha = 1; g.fillStyle = '#f2f5f6'; g.fillRect(mx - 7, my - 3, 14, 6);
          g.fillStyle = '#ff5a45'; g.fillRect(mx + 5, my - 2, 5, 4);
        }
      }
      g.restore();
    } else drawFallbackShip(x, y, scale, time);
  }

  function spacedText(value, x, y, size, spacing, color, alpha) {
    g.save();
    g.font = 'bold ' + size + 'px "Courier New", monospace';
    g.textBaseline = 'middle';
    let width = 0;
    for (const ch of value) width += g.measureText(ch).width + spacing;
    width -= spacing;
    let cursor = x - width / 2;
    g.globalAlpha = alpha;
    for (const ch of value) {
      const cw = g.measureText(ch).width;
      g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillText(ch, cursor + 2, y + 2);
      g.fillStyle = color; g.fillText(ch, cursor, y);
      cursor += cw + spacing;
    }
    g.restore();
  }

  function skipHint(alpha) {
    g.save();
    g.globalAlpha = alpha * (0.45 + Math.sin(performance.now() * 0.004) * 0.2);
    g.font = 'bold 11px "Courier New", monospace';
    g.textAlign = 'center';
    g.fillStyle = '#d9e4ea';
    const labels = (MusicTracks.isPlaying() || audioGestureConsumed) ? skipLabels : audioLabels;
    g.fillText(labels[introLanguage] || labels.en, W / 2, H - 24);
    g.restore();
  }

  function slideFade(local) {
    return Math.min(1, local / 0.8, (SLIDE_TIME - local) / 0.9);
  }

  function drawCreditSlide(local, now) {
    g.fillStyle = '#01030a'; g.fillRect(0, 0, W, H);
    // Layered rotating galaxy: colored core, spiral arms and dust lanes.
    g.save(); g.translate(W * 0.5, H * 0.48); g.rotate(now * 0.000025);
    const galaxy = g.createRadialGradient(0, 0, 4, 0, 0, 285);
    galaxy.addColorStop(0, 'rgba(255,245,205,0.52)');
    galaxy.addColorStop(0.08, 'rgba(110,220,255,0.34)');
    galaxy.addColorStop(0.35, 'rgba(66,74,180,0.18)');
    galaxy.addColorStop(1, 'rgba(10,20,65,0)');
    g.fillStyle = galaxy; g.scale(1.65, 0.62);
    g.beginPath(); g.arc(0, 0, 285, 0, Math.PI * 2); g.fill();
    g.scale(1 / 1.65, 1 / 0.62);
    g.globalCompositeOperation = 'lighter';
    for (let arm = 0; arm < 4; arm++) {
      g.strokeStyle = arm % 2 ? 'rgba(104,239,255,0.16)' : 'rgba(168,104,255,0.13)';
      g.lineWidth = 9 - arm;
      g.beginPath();
      for (let i = 0; i < 70; i++) {
        const radius = i * 4.2;
        const angle = arm * Math.PI / 2 + i * 0.125;
        const x = Math.cos(angle) * radius * 1.45;
        const y = Math.sin(angle) * radius * 0.48;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
    g.restore();
    // Two distant companion galaxies add scale without competing with the title.
    for (const companion of [
      { x:155, y:125, r:82, color:'104,180,255', tilt:-0.34 },
      { x:805, y:392, r:104, color:'174,104,255', tilt:0.28 },
    ]) {
      g.save(); g.translate(companion.x, companion.y); g.rotate(companion.tilt + now * 0.000012);
      g.scale(1.8, 0.46);
      const glow = g.createRadialGradient(0, 0, 2, 0, 0, companion.r);
      glow.addColorStop(0, 'rgba(255,255,220,0.38)');
      glow.addColorStop(0.18, 'rgba(' + companion.color + ',0.22)');
      glow.addColorStop(1, 'rgba(' + companion.color + ',0)');
      g.fillStyle = glow; g.beginPath(); g.arc(0, 0, companion.r, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18;
      g.strokeStyle = 'rgb(' + companion.color + ')'; g.lineWidth = 3;
      for (let ring = 0; ring < 3; ring++) {
        g.beginPath(); g.arc(0, 0, companion.r * (0.38 + ring * 0.22),
          ring * 0.8 + now * 0.00004, Math.PI * 1.45 + ring * 0.8 + now * 0.00004); g.stroke();
      }
      g.restore();
    }
    // Dense secondary star layer plus the authored deterministic stars.
    for (let i = 0; i < 420; i++) {
      const sx = (i * 197 + 43) % W, sy = (i * 83 + 17) % H;
      const sparkle = 0.12 + Math.abs(Math.sin(now * 0.0025 + i * 1.73)) * 0.42;
      g.globalAlpha = sparkle; g.fillStyle = i % 13 === 0 ? '#b58cff' : i % 9 === 0 ? '#68efff' : '#ffffff';
      g.fillRect(sx, sy, i % 17 === 0 ? 2 : 1, i % 17 === 0 ? 2 : 1);
    }
    // Internal deterministic star layers with independent drift and twinkle.
    for (let i = 0; i < starData.length; i++) {
      const star = starData[i];
      const sx = (star.x + now * (0.002 + (i % 4) * 0.0007)) % W;
      const alpha = 0.28 + Math.sin(now * 0.004 + star.phase) * 0.28;
      g.globalAlpha = alpha; g.fillStyle = i % 7 === 0 ? '#68efff' : '#ffffff';
      g.fillRect(sx, star.y, star.size, star.size);
    }
    g.globalAlpha = 1;
    // Quantize the complete galaxy background to a 240×135 pixel buffer, then
    // enlarge with nearest-neighbor sampling. Typography is drawn afterward at
    // full resolution, so the world looks authentically pixelated but readable.
    creditPixelG.clearRect(0, 0, 240, 135);
    creditPixelG.imageSmoothingEnabled = true;
    creditPixelG.drawImage(canvas, 0, 0, 240, 135);
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#02040b'; g.fillRect(0, 0, W, H);
    g.imageSmoothingEnabled = false;
    g.drawImage(creditPixels, 0, 0, W, H);
    const appear = smooth((local - 0.55) / 0.9);
    const disappear = 1 - smooth((local - 6.35) / 0.65);
    const alpha = appear * disappear;
    const jitter = Math.sin(now * 0.035) > 0.92 ? 2 : 0;
    g.save(); g.translate(W / 2, H / 2 - 8);
    // Free-floating retro typography: no panel or surrounding box.
    // Chromatic echo and horizontal scan fragments provide the arcade treatment.
    g.globalAlpha = alpha * 0.28; g.fillStyle = '#27dfff';
    g.font = 'bold 25px "Courier New", monospace'; g.textAlign = 'center';
    g.fillText('PATRICIO SALFATE', -2 - jitter, -15);
    g.fillStyle = '#ff4d72'; g.fillText('PATRICIO SALFATE', 2 + jitter, -15);
    spacedText('PATRICIO SALFATE', 0, -15, 25, 3, '#fff0c8', alpha);
    spacedText('PRESENTS', 0, 25, 15, 6, '#68efff', alpha * 0.95);
    g.globalAlpha = alpha * 0.22; g.fillStyle = '#ffffff';
    for (let y = -56; y < 58; y += 9) g.fillRect(-205 + Math.sin(y + now * 0.02) * 8, y, 410, 1);
    g.restore();
    const fade = slideFade(local);
    g.fillStyle = 'rgba(0,0,0,' + (1 - fade) + ')'; g.fillRect(0, 0, W, H);
    skipHint(fade);
  }

  function drawStorySlide(local, now) {
    // Enhanced cinematic background
    g.fillStyle='#02040b';g.fillRect(0,0,W,H);
    for(let i=0;i<380;i++){
      const x=(i*173+now*(.0025+(i%5)*.0007))%W;
      const y=(i*67+31 + Math.sin(now*.0006+i)*12)%H;
      g.globalAlpha=0.18+Math.abs(Math.sin(now*.003+i*0.7))*0.52;
      g.fillStyle=i%13===0?'#8ab5ff':i%11===0?'#68efff':'#c5d8e8';
      g.fillRect(Math.round(x), Math.round(y), i%20===0?2:1, i%20===0?2:1);
    }
    g.save();g.globalCompositeOperation='lighter';
    const dust=g.createRadialGradient(W/2,H/2,20,W/2,H/2,520);
    dust.addColorStop(0,'rgba(70,120,190,.20)');dust.addColorStop(.55,'rgba(70,40,130,.12)');dust.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=dust; g.globalAlpha=0.9; g.fillRect(0,0,W,H);
    for(let i=0;i<42;i++){
      const x=(i*97+now*.022*(1+i%3))%(W+80)-40;
      const y=H-((local*28+i*71)%(H+120));
      g.globalAlpha=0.12+(i%5)*0.045;
      g.fillStyle=i%3?'#68efff':'#ffb347';
      g.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,i%9===0?4:2,i%9===0?4:2);
      if(i%7===0){ g.font='8px "Courier New",monospace'; g.fillText(Math.random()>0.5?'1':'0', x, y); }
    }
    g.restore();

    g.save();
    const crtGrad=g.createRadialGradient(W/2,H/2,0,W/2,H/2,420);
    crtGrad.addColorStop(0,'rgba(0,0,0,0)'); crtGrad.addColorStop(1,'rgba(0,0,0,0.38)');
    g.fillStyle=crtGrad; g.fillRect(0,0,W,H);
    g.restore();

    const lines=storyText[introLanguage]||storyText.en;
    const elapsed=Math.max(0,local-0.6);
    const typeSpeed=32;
    const revealed=Math.floor(elapsed*typeSpeed);

    const fade=Math.min(1,local/0.9,(STORY_TIME-local)/1.05);

    g.save(); g.globalAlpha=fade;
    let charCount=0;
    g.textBaseline='middle';
    const startY = 180;
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      const lineStart=lines.slice(0,i).reduce((a,l)=>a+l.length+12,0);
      let visibleCount=0;
      if(revealed>lineStart) visibleCount=Math.min(line.length, revealed-lineStart);
      const visibleText=line.slice(0,visibleCount);
      const y=startY + i*62;
      g.font='bold 16px "Courier New", monospace';
      const fullWidth=g.measureText(line).width;
      const targetX=W/2;
      const drawX=targetX - fullWidth/2;
      const glitch=Math.random()<0.06 ? (Math.random()-0.5)*2 : 0;
      g.fillStyle='rgba(0,0,0,0.85)'; g.fillText(visibleText, drawX+2+glitch, y+2);
      g.globalCompositeOperation='lighter'; g.globalAlpha=fade*0.32; g.fillStyle='#00eaff';
      g.fillText(visibleText, drawX-1+glitch, y);
      g.fillStyle='#ff2a5a'; g.fillText(visibleText, drawX+1-glitch, y);
      g.globalCompositeOperation='source-over'; g.globalAlpha=fade;
      g.fillStyle=i===lines.length-1?'#ffe28a':'#e6f3f8';
      g.fillText(visibleText, drawX, y);
      if(visibleCount>0 && visibleCount<line.length && Math.floor(now/180)%2===0){
        const cursorX=drawX + g.measureText(visibleText).width + 3;
        g.fillStyle=i===lines.length-1?'#ffe28a':'#68efff';
        g.fillRect(cursorX, y-9, 9, 2);
        g.fillRect(cursorX, y+7, 9, 2);
      }
    }
    g.restore();
    g.fillStyle='rgba(0,0,0,'+(1-fade)+')';g.fillRect(0,0,W,H);skipHint(fade);
  }

  function drawSlideOne(local, now, slot) {
    // Cinematic dolly zoom + heat haze
    const p = smooth(local / SLIDE_TIME);
    const zoom = 1 + p * 0.06 + Math.sin(now*0.0004)*0.012;
    g.save();
    g.translate(W/2, H/2);
    g.scale(zoom, zoom);
    g.translate(-W/2, -H/2);
    // PNGs drawn opaque, normal (no transparency artifacts)
    g.globalAlpha=1; g.globalCompositeOperation='source-over';
    drawLayer('desertSky', 60, p, fallbackDesertSky);
    drawLayer('desertMountains', 130, p, fallbackDesertMountains);
    drawLayer('desertDunes', 260, p, fallbackDesertDunes);
    g.restore();

    // Enhanced ship with longer contrail
    const shipP = smooth(clamp((local - 0.35) / 6.15, 0, 1));
    const shipX = -135 + shipP * 1230;
    const shipY = 345 - Math.sin(shipP * Math.PI) * 105 + Math.sin(now * 0.006) * 3 + Math.sin(now*0.0012)*2;
    drawShip(shipX, shipY, 0.66 + shipP*0.04, now / 1000, slideShips[0], local, slideFire[0]);
    drawSandWind(now, 1.15);

    // Extra dust devils and heat particles (more particles)
    g.save(); g.globalCompositeOperation='lighter';
    for(let i=0;i<18;i++){
      const x=((now*0.07 + i*137) % (W+200)) - 100;
      const y=380 + Math.sin(now*0.0008 + i)*12 + (i%3)*24;
      const alpha=0.12 + Math.abs(Math.sin(now*0.002+i))*0.18;
      g.globalAlpha=alpha;
      g.fillStyle=i%2?'#ffae6a':'#ffe9a0';
      g.beginPath(); g.arc(x, y, 2+ (i%3), 0, Math.PI*2); g.fill();
    }
    g.restore();

    // Cinematic sun flare
    g.save(); g.globalCompositeOperation='lighter';
    const sunX=720 - p*60, sunY=174 - p*12;
    const flare=g.createRadialGradient(sunX, sunY, 6, sunX, sunY, 120);
    flare.addColorStop(0,'rgba(255,240,180,0.55)'); flare.addColorStop(0.3,'rgba(255,180,90,0.22)'); flare.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=flare; g.globalAlpha=0.65; g.beginPath(); g.arc(sunX,sunY,120,0,Math.PI*2); g.fill();
    g.restore();

    const textIn = smooth((local - 1.15) / 0.8);
    const textOut = 1 - smooth((local - 5.65) / 0.75);
    const textAlpha = clamp(textIn * textOut, 0, 1);
    const creditScale = 1.06 - smooth((local - 1.1) / 2.8) * 0.06;
    g.save();
    g.translate(W / 2, 254);
    g.scale(creditScale, creditScale);
    spacedText('CONCEPT, ART AND MUSIC BY', 0, -16, 15, 2, '#ffffff', textAlpha * 0.9);
    spacedText('PATRICIO SALFATE', 0, 18, 22, 3, '#fff0c8', textAlpha);
    g.restore();

    const fade = slideFade(local);
    g.fillStyle = 'rgba(0,0,0,' + (1 - fade) + ')'; g.fillRect(0, 0, W, H);
    skipHint(fade);
  }

  function drawIrisOut(progress, centerX, centerY) {
    const k = smooth(progress);
    if (k <= 0) return;
    const maxRadius = Math.hypot(W, H) * 0.62;
    const radius = Math.max(0, Math.round(maxRadius * (1 - k) / 12) * 12);
    g.save();
    g.fillStyle = '#000000';
    g.beginPath();
    g.rect(0, 0, W, H);
    if (radius > 0.5) {
      const steps = 28, grid = 12;
      for (let i = 0; i <= steps; i++) {
        const angle = -i / steps * Math.PI * 2;
        const px = Math.round((centerX + Math.cos(angle) * radius) / grid) * grid;
        const py = Math.round((centerY + Math.sin(angle) * radius) / grid) * grid;
        if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.closePath();
    }
    g.fill('evenodd');
    // Block fragments around the quantized edge reinforce the pixel wipe.
    if (radius > 12) {
      g.globalAlpha = 0.72;
      for (let i = 0; i < 18; i++) {
        const angle = i / 18 * Math.PI * 2;
        const px = Math.round((centerX + Math.cos(angle) * radius) / 12) * 12;
        const py = Math.round((centerY + Math.sin(angle) * radius) / 12) * 12;
        g.fillRect(px - 6, py - 6, 12, 12);
      }
    }
    if (radius < 12 && radius > 0.5) {
      g.globalAlpha = radius / 12;
      g.fillStyle = '#fff1c2'; g.fillRect(centerX - 2, centerY - 2, 4, 4);
    }
    g.restore();
  }

  function drawSlideTwo(local, now, slot) {
    const p = smooth(local / SLIDE_TIME);
    const zoom = 1 + p*0.08;
    g.save();
    g.translate(W/2, H/2); g.scale(zoom, zoom); g.translate(-W/2, -H/2);
    // Ensure PNGs are drawn opaque normal, no transparency glitch
    g.globalAlpha=1; g.globalCompositeOperation='source-over';
    drawLayer('spaceStars', 60, p, fallbackSpaceStars);
    g.restore();

    drawMovingStars(now, 1.35);

    g.save();
    g.translate(W/2, H/2); g.scale(zoom, zoom); g.translate(-W/2, -H/2);
    g.globalAlpha=1; g.globalCompositeOperation='source-over';
    drawLayer('spacePlanet', 125, p, fallbackSpacePlanet);
    // Planet atmospheric glow enhanced
    g.save(); g.globalCompositeOperation='lighter';
    const planetX=690 - p*20, planetY=260 + Math.sin(now*0.0005)*4;
    const glow=g.createRadialGradient(planetX, planetY, 110, planetX, planetY, 210);
    glow.addColorStop(0,'rgba(90,200,255,0.32)'); glow.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=glow; g.globalAlpha=0.75; g.beginPath(); g.arc(planetX, planetY, 210, 0, Math.PI*2); g.fill();
    g.restore();
    g.restore();

    const shipP = smooth(clamp((local - 0.45) / 6.15, 0, 1));
    const shipX = 80 + shipP * 520 + Math.sin(now*0.001)*6;
    const shipY = 405 - shipP * 155 + Math.sin(now * 0.005) * 4;
    drawShip(shipX, shipY, 0.38 + shipP * 0.46, now / 1000, slideShips[1], local, slideFire[1]);

    // More asteroids + parallax dust
    g.save(); g.globalAlpha=1; g.globalCompositeOperation='source-over';
    drawLayer('spaceAsteroids', 250, p, fallbackAsteroids);
    g.restore();
    g.save(); g.globalCompositeOperation='lighter';
    for(let i=0;i<22;i++){
      const x=((now*0.04 + i*97)%(W+160))-80;
      const y=60 + (i*43)%(H-80) + Math.sin(now*0.0007+i)*8;
      g.globalAlpha=0.18 + (i%3)*0.08;
      g.fillStyle=i%2?'#8ab5ff':'#a0e0ff';
      g.fillRect(x, y, i%4===0?3:1, 1);
    }
    g.restore();

    // Cosmic rays
    g.save(); g.globalCompositeOperation='lighter'; g.globalAlpha=0.07;
    g.strokeStyle='#6be7ff'; g.lineWidth=1;
    for(let i=0;i<6;i++){
      const x=(i*191 + now*0.12)%W;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x-80, H); g.stroke();
    }
    g.restore();

    const titleIn = smooth((local - 1.0) / 1.15);
    const titleOut = 1 - smooth((local - 6.15) / 0.5);
    const titleAlpha = clamp(titleIn * titleOut, 0, 1);
    const settle = smooth(clamp((local - 0.95) / 2.35, 0, 1));
    const titleScale = 0.72 + settle * 0.30 + Math.sin(settle * Math.PI) * 0.045;
    const logo = images.logo;
    if (ready(logo)) {
      const size = 340 * titleScale;
      g.save();
      g.globalAlpha = titleAlpha;
      g.imageSmoothingEnabled = false;
      g.translate(W / 2, 268 + Math.sin(now*0.0006)*2);
      // logo glow
      g.shadowColor='#ffb347'; g.shadowBlur=18*titleAlpha;
      g.drawImage(logo, -size / 2, -size / 2, size, size);
      g.shadowBlur=0;
      g.restore();
    } else {
      g.save();
      g.translate(W / 2, 270);
      g.scale(titleScale, titleScale);
      spacedText("DESERT'S", 0, -28, 42, 4, '#ffb347', titleAlpha);
      spacedText('HEROES', 0, 28, 48, 6, '#ffffff', titleAlpha);
      g.restore();
    }

    const fadeIn = Math.min(1, local / 0.8);
    const fadeOut = 1 - smooth((local - 6.65) / 0.7);
    g.fillStyle = 'rgba(0,0,0,' + (1 - fadeIn * fadeOut) + ')'; g.fillRect(0, 0, W, H);
    skipHint(fadeIn * fadeOut);
  }

  function drawSlideThree(local, now, slot) {
    const p = smooth(local / SLIDE_TIME);
    const zoom = 1 + p*0.07 + Math.sin(now*0.0003)*0.01;
    g.save(); g.translate(W/2, H/2); g.scale(zoom, zoom); g.translate(-W/2, -H/2);
    g.globalAlpha=1; g.globalCompositeOperation='source-over';
    drawLayer('slide3Sky', 70, p, fallbackDesertSky);
    drawLayer('slide3Mountains', 135, p, fallbackDesertMountains);
    drawLayer('slide3Dunes', 270, p, fallbackDesertDunes);
    g.restore();

    const fly = smooth(clamp((local - 0.55) / 4.8, 0, 1));
    const shipX = -190 + fly * 1380;
    const shipY = H * 0.49 + Math.sin(fly * Math.PI * 2) * 6 + Math.sin(now*0.001)*2;
    const shipScale = 0.20 + Math.sin(fly * Math.PI) * 0.045 + fly*0.04;
    drawShip(shipX, shipY, shipScale, now / 1000, slideShips[2], local, slideFire[2]);

    // Intense supersonic streaks, shock cones, heat haze
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 34; i++) {
      const x = ((now * (0.32 + i * 0.004) + i * 83) % (W + 340)) - 240;
      const y = 60 + (i * 29) % 380 + Math.sin(now*0.001+i)*4;
      g.globalAlpha = 0.10 + (i % 5) * 0.03;
      g.strokeStyle = i % 3 ? '#e8fbff' : '#68efff'; g.lineWidth = i % 6 === 0 ? 2.5 : 1.2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 160 + i * 4 + fly*80, y + Math.sin(i)*2); g.stroke();
      // afterburner wake
      if(i%4===0){
        g.fillStyle='#ffb347'; g.globalAlpha=0.10;
        g.fillRect(x-30, y-1, 24, 2);
      }
    }
    // sonic boom ring at ship
    if(fly>0.25 && fly<0.75){
      g.globalAlpha=0.18*(1-Math.abs(fly-0.5)*2);
      g.strokeStyle='#ffffff'; g.lineWidth=2;
      g.beginPath(); g.arc(shipX, shipY, 20 + fly*90, 0, Math.PI*2); g.stroke();
      g.strokeStyle='#68efff'; g.lineWidth=1;
      g.beginPath(); g.arc(shipX, shipY, 32 + fly*120, 0, Math.PI*2); g.stroke();
    }
    g.restore();

    // Low altitude dust kicked
    g.save(); g.globalAlpha=0.16; g.fillStyle='#d8a45f';
    for(let i=0;i<14;i++){
      const x=((now*0.18 + i*123)%(W+200))-100;
      const y=430 + (i%3)*12 + Math.sin(now*0.002+i)*3;
      g.fillRect(x, y, 18 + (i%4)*4, 1);
    }
    g.restore();

    const fade = slideFade(local);
    g.fillStyle = 'rgba(0,0,0,' + (1 - fade) + ')'; g.fillRect(0, 0, W, H);
    skipHint(fade);
  }

  function drawSlideFour(local, now) {
    const p = smooth(local / SLIDE_TIME);
    const zoom = 1 + p*0.05 + Math.sin(now*0.00035)*0.015;
    g.save(); g.translate(W/2, H/2); g.scale(zoom, zoom); g.translate(-W/2, -H/2);
    g.globalAlpha=1; g.globalCompositeOperation='source-over';
    drawLayer('slide4Sky', 65, p, fallbackDesertSky);
    drawLayer('slide4Tank', 135, p, fallbackDesertMountains);
    g.restore();

    // Enhanced smoke columns + fire + embers - more cinematic
    const tankScroll = 120 * p;
    const smokeSources = [275 - tankScroll, 390 - tankScroll, 540 - tankScroll, 680 - tankScroll, 805 - tankScroll];
    g.save();
    for (let source = 0; source < smokeSources.length; source++) {
      for (let i = 0; i < 28; i++) {
        const age = ((local * 0.32 + i * 0.091 + source * 0.23) % 1);
        const x = smokeSources[source] + Math.sin(i * 3.7 + now * 0.0011) * (10 + age * 30) + Math.sin(now*0.0006+source)*6;
        const y = 360 - age * 250 - source * 10;
        const size = Math.round((8 + age * 28) / 3) * 3;
        g.globalAlpha = (1 - age) * 0.42;
        g.fillStyle = i % 3 ? '#2b2d32' : '#4a4440';
        g.fillRect(Math.round(x / 3) * 3, Math.round(y / 3) * 3, size, size);
        g.fillStyle = 'rgba(180,155,125,0.18)';
        g.fillRect(Math.round(x / 3) * 3 + 3, Math.round(y / 3) * 3 + 3, Math.max(3, size - 7), Math.max(3, size - 7));
        // ember rising inside smoke
        if(i%5===0 && age>0.3){
          g.globalCompositeOperation='lighter'; g.globalAlpha=(1-age)*0.55; g.fillStyle='#ff9a42';
          g.fillRect(x+Math.random()*6, y, 2, 2);
          g.globalCompositeOperation='source-over';
        }
      }
    }
    // Fire pockets enhanced with inner white core and flicker
    g.globalCompositeOperation = 'lighter';
    for (const fire of [[275-tankScroll,354],[390-tankScroll,342],[540-tankScroll,350],[680-tankScroll,338],[805-tankScroll,360]]) {
      const pulse = 0.85 + Math.sin(now * 0.022 + fire[0]*0.02) * 0.32;
      g.globalAlpha = 0.58; g.fillStyle = '#e93424';
      g.fillRect(fire[0]-14*pulse, fire[1]-24*pulse, 28*pulse, 32*pulse);
      g.globalAlpha = 0.82; g.fillStyle = '#ff8a24';
      g.fillRect(fire[0]-9*pulse, fire[1]-21*pulse, 18*pulse, 24*pulse);
      g.globalAlpha = 0.95; g.fillStyle = '#ffe28a';
      g.fillRect(fire[0]-4, fire[1]-18*pulse, 8, 14*pulse);
      g.globalAlpha = 1; g.fillStyle='#ffffff';
      g.fillRect(fire[0]-1, fire[1]-12*pulse, 2, 5*pulse);
    }
    // Sparks + hot debris + sand - more density
    for (let i = 0; i < 95; i++) {
      const x = ((now * (0.08 + i % 5 * 0.018) + i * 113) % (W + 200)) - 100;
      const y = 235 + (i * 37 % 280) + Math.sin(now*0.001+i)*6;
      g.globalAlpha = 0.16 + (i % 5) * 0.06;
      g.fillStyle = i % 7 === 0 ? '#ffb347' : i%3===0?'#fff2a0':'#d6a15f';
      g.fillRect(x, y, i % 9 === 0 ? 4 : 8 + i % 10, i % 9 === 0 ? 3 : 1);
    }
    g.restore();

    // Smog banks with more volume and parallax
    g.save();
    for (let bank = 0; bank < 12; bank++) {
      const x = ((bank * 133 + now * (0.012 + bank * 0.0009)) % (W + 300)) - 150;
      const y = 320 + (bank % 4) * 32 + Math.sin(now * 0.0011 + bank)*18;
      const radius = 62 + (bank % 4) * 28 + Math.sin(now*0.0007+bank)*8;
      const smog = g.createRadialGradient(x, y, 6, x, y, radius);
      smog.addColorStop(0, 'rgba(85,78,70,0.32)'); smog.addColorStop(0.5, 'rgba(60,58,55,0.18)'); smog.addColorStop(1, 'rgba(40,38,40,0)');
      g.fillStyle = smog; g.beginPath(); g.arc(x, y, radius, 0, Math.PI * 2); g.fill();
    }
    g.restore();

    // Foreground with slight shake; keep semi-transparent so PNG alpha blends softly.
    g.save();
    g.globalAlpha = 0.82;
    g.translate(Math.sin(now*0.002)*1.5, 0);
    drawLayer('slide4Foreground', 260, p, fallbackDesertDunes);
    g.restore();

    // Battlefield distant explosions flash
    if(local>1.2 && local<6.5 && Math.sin(now*0.008 + local*1.2)>0.88){
      g.save(); g.globalCompositeOperation='lighter'; g.globalAlpha=0.18;
      g.fillStyle='#ff9a42'; g.fillRect(0, H*0.45, W, H*0.18); g.restore();
    }

    const fade = slideFade(local);
    g.fillStyle = 'rgba(0,0,0,' + (1 - fade) + ')'; g.fillRect(0, 0, W, H);
    skipHint(fade);
  }

  const slideRenderers = [drawCreditSlide, drawStorySlide].concat(shuffled([drawSlideOne, drawSlideTwo, drawSlideThree, drawSlideFour]));

  function drawFilmOverlay(now, elapsed) {
    g.save();
    // Stable arcade letterbox and a soft optical vignette unify random slides.
    g.fillStyle = 'rgba(0,0,0,0.82)'; g.fillRect(0, 0, W, 9); g.fillRect(0, H - 9, W, 9);
    const vignette = g.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.72);
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
    g.fillStyle = vignette; g.fillRect(0, 0, W, H);
    // Fine scanlines and deterministic projector dust.
    g.globalAlpha = 0.055; g.fillStyle = '#02050b';
    for (let y = 1; y < H; y += 4) g.fillRect(0, y, W, 1);
    const frameSeed = Math.floor(now / 70);
    for (let i = 0; i < 24; i++) {
      const x = Math.abs(Math.sin(frameSeed * 1.17 + i * 9.31)) * W;
      const y = Math.abs(Math.sin(frameSeed * 0.63 + i * 4.71)) * H;
      g.globalAlpha = 0.06 + (i % 3) * 0.025; g.fillStyle = i % 5 ? '#ffffff' : '#68efff';
      g.fillRect(x, y, i % 7 === 0 ? 3 : 1, 1);
    }
    // An occasional one-frame vertical film scratch.
    if (Math.sin(frameSeed * 2.37) > 0.94) {
      g.globalAlpha = 0.11; g.fillStyle = '#d9f8ff';
      const scratchX = (frameSeed * 73) % W; g.fillRect(scratchX, 18, 1, H - 36);
    }
    g.restore();
  }

  function frame(now) {
    if (finished) return;
    const elapsed = (now - startTime) / 1000;
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#02040b'; g.fillRect(0, 0, W, H);
    if (elapsed < SLIDE_TIME) {
      slideRenderers[0](elapsed, now, 0);
    } else if (elapsed < SLIDE_TIME + STORY_TIME) {
      slideRenderers[1](elapsed - SLIDE_TIME, now, 1);
    } else if (elapsed < TOTAL_TIME) {
      const illustratedTime = elapsed - SLIDE_TIME - STORY_TIME;
      const illustratedIndex = Math.min(3, Math.floor(illustratedTime / SLIDE_TIME));
      slideRenderers[illustratedIndex + 2](illustratedTime - illustratedIndex * SLIDE_TIME, now, illustratedIndex + 2);
    } else { navigate(); return; }
    drawFilmOverlay(now, elapsed);
    // Classic circular opening and a final iris independent of random order.
    if (elapsed < 1.1) drawIrisOut(1 - elapsed / 1.1, W / 2, H / 2);
    const finalIris = clamp((elapsed - (TOTAL_TIME - 1.08)) / 1.08, 0, 1);
    if (finalIris > 0) drawIrisOut(finalIris, W / 2, H / 2);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
