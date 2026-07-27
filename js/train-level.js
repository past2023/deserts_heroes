// ============================================================
// TRAIN LEVEL — Level 2: High-Speed Desert Railway
// Player runs on train rooftops while the train tears through
// the desert at extreme speed. Enemies board from other wagons.
// ============================================================
(function () {
  var VW = 960, VH = 540;
  var W = 12800;
  var GROUND = 375;
  var ROOF_RATIO = 0.30;
  var PARALLAX_Y_ADJ = 70;
  var TRAIN_X_OFFSET = -400;
  var TRAIN_SCALE = 0.95;

  function imageReady(img) { return img && img.naturalWidth > 0 && img.complete !== false; }

  // --- Seeded RNG for deterministic layout ---
  function makeRng(seed) {
    var s = seed;
    return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  }

  // --- Load all train images ---
  var trainSrcs = {
    motor01: 'assets/trains/main_train_motor01.png',
    motor02: 'assets/trains/main_train_motor02.png',
    motor03: 'assets/trains/main_train_motor03.png',
    vagon01: 'assets/trains/vagon01.png', vagon02: 'assets/trains/vagon02.png',
    vagon03: 'assets/trains/vagon03.png', vagon04: 'assets/trains/vagon04.png',
    vagon05: 'assets/trains/vagon05.png', vagon06: 'assets/trains/vagon06.png',
    vagon07: 'assets/trains/vagon07.png', vagon08: 'assets/trains/vagon08.png',
    vagon09: 'assets/trains/vagon09.png', vagon10: 'assets/trains/vagon10.png',
    vagon11: 'assets/trains/vagon11.png',
  };
  var trainImgs = {};
  for (var k in trainSrcs) {
    var img = new Image(); img.decoding = 'async'; img.src = trainSrcs[k];
    trainImgs[k] = img;
  }

  // --- Load all mast images ---
  var mastSrcs = [
    'assets/trains/railway_electrification_mast01.png',
    'assets/trains/railway_electrification_mast02.png',
    'assets/trains/railway_electrification_mast03.png',
    'assets/trains/railway_electrification_mast04.png',
    'assets/trains/railway_electrification_mast05.png',
    'assets/trains/railway_electrification_mast06.png',
  ];
  var mastImgs = [];
  for (var i = 0; i < mastSrcs.length; i++) {
    var m = new Image(); m.decoding = 'async'; m.src = mastSrcs[i];
    mastImgs.push(m);
  }

  var portalArtImg = new Image(); portalArtImg.decoding = 'async';
  portalArtImg.src = 'assets/props/deco_portal02.png';

  var sceneryImages = {};
  for (var si = 0; si < ['clouds01','mountain01','dune02'].length; si++) {
    var key = ['clouds01','mountain01','dune02'][si];
    var sImg = new Image(); sImg.decoding = 'async'; sImg.src = 'assets/scenery/' + key + '.png';
    sceneryImages[key] = sImg;
  }

  // --- Build train segments: motor02 at start, random wagons, motor01 at end ---
  // All segments scaled 0.95x from their (already corrected) native sizes
  var wagonKeys = ['vagon01','vagon02','vagon03','vagon04','vagon05',
    'vagon06','vagon07','vagon08','vagon09','vagon10','vagon11'];

  var trainSegments = [];
  var rng = makeRng(2026);
  var cursorX = TRAIN_X_OFFSET;

  // Motor02 at the start
  var m02img = trainImgs.motor02;
  var m02w = Math.round((m02img.naturalWidth || 1288) * TRAIN_SCALE);
  var m02h = Math.round((m02img.naturalHeight || 359) * TRAIN_SCALE);
  var m02roof = Math.round(m02h * ROOF_RATIO);
  trainSegments.push({ key: 'motor02', img: m02img, w: m02w, h: m02h, roofOff: m02roof, x: cursorX });
  cursorX += m02w;

  // Motor01 reserved for the end
  var m01img = trainImgs.motor01;
  var m01w = Math.round((m01img.naturalWidth || 1331) * TRAIN_SCALE);
  var m01h = Math.round((m01img.naturalHeight || 359) * TRAIN_SCALE);
  var m01roof = Math.round(m01h * ROOF_RATIO);

  // Fill middle with random wagons at 0.95x scale
  var lastKey = '';
  while (cursorX + m01w < W) {
    var pick = wagonKeys[Math.floor(rng() * wagonKeys.length)];
    if (pick === lastKey) pick = wagonKeys[(wagonKeys.indexOf(pick) + 1) % wagonKeys.length];
    lastKey = pick;
    var wimg = trainImgs[pick];
    var nw = Math.round((wimg.naturalWidth || 800) * TRAIN_SCALE);
    var nh = Math.round((wimg.naturalHeight || 300) * TRAIN_SCALE);
    var roof = Math.round(nh * ROOF_RATIO);
    trainSegments.push({ key: pick, img: wimg, w: nw, h: nh, roofOff: roof, x: cursorX });
    cursorX += nw;
  }

  // Motor01 at the end
  trainSegments.push({ key: 'motor01', img: m01img, w: m01w, h: m01h, roofOff: m01roof, x: cursorX });

  // --- Enemies ---
  var spawns = [
    { x: 1200, type: 'soldier' },
    { x: 1600, type: 'soldier' },
    { x: 2000, type: 'knife' },
    { x: 2500, type: 'grenadier' },
    { x: 3000, type: 'soldier' },
    { x: 3400, type: 'bazooka' },
    { x: 3900, type: 'heli' },
    { x: 4400, type: 'soldier' },
    { x: 4900, type: 'knife' },
    { x: 5400, type: 'grenadier' },
    { x: 5800, type: 'pickup', pickup: 'mg' },
    { x: 6300, type: 'turret' },
    { x: 6800, type: 'soldier' },
    { x: 7300, type: 'bazooka' },
    { x: 7800, type: 'heli' },
    { x: 8300, type: 'soldier' },
    { x: 8700, type: 'knife' },
    { x: 9100, type: 'grenadier' },
    { x: 9500, type: 'pickup', pickup: 'grenades' },
    { x: 9900, type: 'turret' },
    { x: 10300, type: 'soldier' },
    { x: 10700, type: 'bazooka' },
    { x: 11100, type: 'heli' },
    { x: 11500, type: 'pickup', pickup: 'spread' },
  ];

  var highPickups = [
    { x: 1400, y: GROUND - 30, type: 'grenades' },
    { x: 2400, y: GROUND - 30, type: 'mg' },
    { x: 3500, y: GROUND - 30, type: 'grenades' },
    { x: 4600, y: GROUND - 30, type: 'homing' },
    { x: 5700, y: GROUND - 30, type: 'rocket' },
    { x: 6800, y: GROUND - 30, type: 'homing' },
    { x: 7900, y: GROUND - 30, type: 'flame' },
    { x: 9000, y: GROUND - 30, type: 'grenades' },
    { x: 10100, y: GROUND - 30, type: 'grenades' },
    { x: 11200, y: GROUND - 30, type: 'homing' },
  ];

  var PORTAL_EXIT_X = 12400;

  function resetPlatforms() {}
  function updatePlatforms(dt, player) {}
  function updateHazards(dt) {}
  function isLavaGap() { return false; }
  function playerTouchesLaser() { return false; }
  function nightAmount() { return 0; }

  // --- Speed lines ---
  var speedLines = [];
  for (var i = 0; i < 50; i++) {
    speedLines.push({
      x: Math.random() * VW * 2, y: 60 + Math.random() * 380,
      len: 30 + Math.random() * 150, speed: 900 + Math.random() * 1800,
      alpha: 0.04 + Math.random() * 0.10, width: 1 + Math.random() * 1.5,
    });
  }
  function drawSpeedLines(g, dt) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (var i = 0; i < speedLines.length; i++) {
      var l = speedLines[i];
      l.x -= l.speed * dt;
      if (l.x + l.len < -50) { l.x = VW + 50 + Math.random() * 300; l.y = 60 + Math.random() * 380; }
      g.globalAlpha = l.alpha; g.fillStyle = '#f0e0c8';
      g.fillRect(Math.round(l.x), Math.round(l.y), Math.round(l.len), l.width);
    }
    g.restore();
  }

  // --- Dust particles ---
  var dustParticles = [];
  for (var i = 0; i < 35; i++) {
    dustParticles.push({
      x: Math.random() * VW, y: GROUND - 2 + Math.random() * 70,
      vx: -(300 + Math.random() * 700), vy: -(5 + Math.random() * 40),
      size: 1.5 + Math.random() * 5, alpha: 0.12 + Math.random() * 0.20,
      life: Math.random(),
    });
  }
  function drawDust(g, dt) {
    g.save();
    for (var i = 0; i < dustParticles.length; i++) {
      var p = dustParticles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 0.25;
      if (p.life <= 0 || p.x < -30) {
        p.x = VW + 10 + Math.random() * 100; p.y = GROUND - 2 + Math.random() * 70;
        p.life = 0.6 + Math.random() * 0.4;
      }
      g.globalAlpha = p.alpha * Math.max(0, p.life); g.fillStyle = '#c8a878';
      g.beginPath(); g.arc(p.x, p.y, p.size, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  // --- Black smoke: always rising from the train ---
  var smokeSources = [];
  var smokeRng = makeRng(77);
  for (var si = 0; si < trainSegments.length; si++) {
    var seg = trainSegments[si];
    if (seg.key.indexOf('motor') >= 0) {
      for (var j = 0; j < 3; j++) {
        smokeSources.push({
          baseX: seg.x + seg.w * (0.3 + smokeRng() * 0.5),
          baseY: GROUND - seg.roofOff + seg.h * 0.15,
          strength: 1.5 + smokeRng() * 0.8,
        });
      }
    } else if (smokeRng() > 0.5) {
      smokeSources.push({
        baseX: seg.x + seg.w * (0.2 + smokeRng() * 0.6),
        baseY: GROUND - seg.roofOff + seg.h * 0.2,
        strength: 0.6 + smokeRng() * 0.5,
      });
    }
  }

  function drawSmoke(g, camX, time) {
    g.save();
    for (var i = 0; i < smokeSources.length; i++) {
      var src = smokeSources[i];
      var sx = src.baseX - camX;
      if (sx < -120 || sx > VW + 120) continue;
      for (var j = 0; j < 8; j++) {
        var phase = (time * (0.15 + j * 0.02) + i * 0.37 + j * 0.19) % 1;
        var drift = phase * 140;
        var wobble = Math.sin(time * 0.8 + i * 2.1 + j * 1.3) * (8 + j * 2);
        var puff = 1 - phase;
        var radius = (6 + phase * 18 + (j % 3) * 3) * src.strength;
        g.globalAlpha = (0.14 + src.strength * 0.06) * puff;
        g.fillStyle = j % 3 === 0 ? '#0a0a0c' : j % 2 ? '#151518' : '#1e1c1a';
        g.beginPath();
        g.arc(sx + wobble + drift * 0.15, src.baseY - drift * 0.35, radius, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.restore();
  }

  // --- Electric sparks: random flashes on masts/train ---
  var sparks = [];
  var sparkRng = makeRng(444);
  function drawSparks(g, camX, time) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 12; i++) {
      var cycle = (time * (0.4 + sparkRng() * 0.3) + i * 0.83) % 1;
      if (cycle > 0.15) continue;
      var sx = (sparkRng() * 12800) - camX;
      if (sx < -40 || sx > VW + 40) continue;
      var sy = GROUND - 60 - sparkRng() * 180;
      var flash = 1 - cycle / 0.15;
      g.globalAlpha = 0.7 * flash;
      g.fillStyle = '#a0d8ff';
      g.fillRect(Math.round(sx), Math.round(sy), 2, 6 + sparkRng() * 8);
      g.globalAlpha = 0.35 * flash;
      g.fillStyle = '#60b8ff';
      g.beginPath(); g.arc(sx, sy + 4, 6 + sparkRng() * 5, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  // --- Electrification masts: always moving ---
  var MAST_SPACING = 350;
  var MAST_SPEED = 600;
  var MAST_SCALE = 0.80;

  var mastData = [];
  var mastRng = makeRng(999);
  for (var i = 0; i < 200; i++) {
    var mIdx = Math.floor(mastRng() * mastImgs.length);
    mastData.push({ imgIdx: mIdx, offset: (mastRng() - 0.5) * 30 });
  }

  function drawMasts(g, camX, time, VW) {
    g.save(); g.imageSmoothingEnabled = false;
    var scroll = camX + time * MAST_SPEED;
    var first = Math.floor(scroll / MAST_SPACING);
    for (var i = first - 1; i <= first + Math.ceil(VW / MAST_SPACING) + 3; i++) {
      var sx = i * MAST_SPACING - scroll;
      var d = mastData[((i % mastData.length) + mastData.length) % mastData.length];
      var img = mastImgs[d.imgIdx];
      if (!imageReady(img)) continue;
      var mw = Math.round((img.naturalWidth || 180) * MAST_SCALE);
      var mh = Math.round((img.naturalHeight || 350) * MAST_SCALE);
      if (sx + mw < -60 || sx > VW + 60) continue;
      g.globalAlpha = 0.90;
      g.drawImage(img, Math.round(sx), GROUND - mh + 90 + d.offset, mw, mh);
    }
    g.restore();
  }

  // --- Background (+70px lower) ---
  function drawBackground(g, camX, time, VW, VH) {
    time = time || (window.G && G.time) || 0;
    var Y = PARALLAX_Y_ADJ;

    var grad = g.createLinearGradient(0, 0, 0, VH);
    grad.addColorStop(0, '#1a6eaa');
    grad.addColorStop(0.30, '#38a8d8');
    grad.addColorStop(0.60, '#6ad4c8');
    grad.addColorStop(0.82, '#f0e8c0');
    grad.addColorStop(1, '#d8a870');
    g.fillStyle = grad; g.fillRect(0, 0, VW, VH);

    if (imageReady(sceneryImages.clouds01)) {
      g.save(); g.globalAlpha = 0.50;
      var scroll = camX * 0.03;
      var img = sceneryImages.clouds01;
      var tw = img.naturalWidth || img.width;
      for (var x = -(scroll % tw) - tw; x < VW + tw; x += tw) {
        g.drawImage(img, x, 20 + Y, tw, Math.round((img.naturalHeight || img.height) * 0.55));
      }
      g.restore();
    }

    if (imageReady(sceneryImages.mountain01)) {
      g.save(); g.globalAlpha = 0.65;
      var scroll = camX * 0.18;
      var img = sceneryImages.mountain01;
      var tw = img.naturalWidth || img.width;
      var th = img.naturalHeight || img.height;
      for (var x = -(scroll % tw) - tw; x < VW + tw; x += tw) {
        g.drawImage(img, x, GROUND - th + Y, tw, th);
      }
      g.restore();
    }

    if (imageReady(sceneryImages.dune02)) {
      g.save();
      var scroll = camX * 0.45;
      var img = sceneryImages.dune02;
      var sourceW = img.naturalWidth || img.width;
      var sourceH = img.naturalHeight || img.height;
      var scale = 0.58;
      var tileW = Math.round(sourceW * scale);
      var tileH = Math.round(sourceH * scale);
      g.imageSmoothingEnabled = false; g.globalAlpha = 0.85;
      for (var x = -(scroll % tileW) - tileW; x < VW + tileW; x += tileW) {
        g.drawImage(img, Math.round(x), GROUND - tileH + 55 + Y, tileW, tileH);
      }
      g.restore();
    }

    drawMasts(g, camX, time, VW);
    drawSpeedLines(g, 1 / 60);
  }

  // --- Ground: train wagons + smoke + sparks ---
  function drawGround(g, camX, VW, VH) {
    var time = (window.G && G.time) || 0;
    g.save(); g.imageSmoothingEnabled = false;

    for (var i = 0; i < trainSegments.length; i++) {
      var seg = trainSegments[i];
      var tx = seg.x - camX;
      if (tx + seg.w < -50 || tx > VW + 50) continue;
      var drawY = GROUND - seg.roofOff;
      if (imageReady(seg.img)) {
        g.drawImage(seg.img, Math.round(tx), Math.round(drawY), seg.w, seg.h);
      } else {
        g.fillStyle = '#5a4a3a';
        g.fillRect(tx, drawY, seg.w, seg.h);
        g.fillStyle = '#7a6a5a';
        g.fillRect(tx, drawY, seg.w, 6);
      }
    }

    drawSmoke(g, camX, time);
    drawSparks(g, camX, time);
    drawDust(g, 1 / 60);

    var ex = PORTAL_EXIT_X - camX;
    if (ex > -80 && ex < VW + 80) {
      var pulse = Math.sin(time * 2.2) * 0.2 + 0.8;
      g.save(); g.globalCompositeOperation = 'lighter';
      var grad2 = g.createRadialGradient(ex, GROUND - 34, 4, ex, GROUND - 34, 140);
      grad2.addColorStop(0, '#fff8cc'); grad2.addColorStop(0.2, '#68efff');
      grad2.addColorStop(0.45, '#2a9aff'); grad2.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = 0.85 * pulse; g.fillStyle = grad2;
      g.beginPath(); g.arc(ex, GROUND - 34, 140, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1; g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(ex, GROUND - 34, 4 + Math.sin(time * 6) * 1.2, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.55; g.strokeStyle = '#a0f0ff'; g.lineWidth = 2;
      g.beginPath(); g.arc(ex, GROUND - 34, 18 + Math.sin(time * 3) * 2,
        time * 1.2, time * 1.2 + Math.PI * 1.6); g.stroke();
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      if (imageReady(portalArtImg)) {
        g.shadowColor = '#58eaff'; g.shadowBlur = 6 + pulse * 4;
        g.drawImage(portalArtImg, ex - 32, GROUND - 64, 64, 64); g.shadowBlur = 0;
      }
      var arrowY = GROUND - 91 + Math.sin(time * 6) * 5;
      g.fillStyle = '#000';
      g.beginPath(); g.moveTo(ex - 11, arrowY - 18); g.lineTo(ex + 11, arrowY - 18);
      g.lineTo(ex, arrowY); g.closePath(); g.fill();
      g.fillStyle = '#ffe45f';
      g.beginPath(); g.moveTo(ex - 8, arrowY - 16); g.lineTo(ex + 8, arrowY - 16);
      g.lineTo(ex, arrowY - 3); g.closePath(); g.fill();
      g.restore();
    }
  }

  function drawExtremeForeground(g, camX, VW, VH) {}

  window.TrainLevel = {
    W: W, GROUND: GROUND, VIEW_W: VW, VIEW_H: VH,
    platforms: [], spawns: spawns, props: [], highPickups: highPickups,
    slugSpawns: [], SURFBOARD_X: 999999, PORTAL_EXIT_X: PORTAL_EXIT_X,
    BOSS_TRIGGER_X: 999999, BOSS_X: 999999, PORTAL_X: 999999,
    nightAmount: nightAmount, isLavaGap: isLavaGap, updateHazards: updateHazards,
    playerTouchesLaser: playerTouchesLaser, resetPlatforms: resetPlatforms,
    updatePlatforms: updatePlatforms, drawBackground: drawBackground,
    drawGround: drawGround, drawExtremeForeground: drawExtremeForeground,
    duneSpec: null, mountainSpec: null, skySpec: null,
  };
})();
