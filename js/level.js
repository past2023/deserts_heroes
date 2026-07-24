// ============================================================
// LEVEL — terreno, piattaforme, scenografia a parallasse, spawn
// ============================================================
(function () {
  const W = 26000;
  const GROUND = 470;
  const LOGICAL_VIEW_W = 960;
  const LOGICAL_VIEW_H = 540;
  const SKY_PARALLAX = 0.03;
  const MOUNTAIN_PARALLAX = 0.18;
  const DUNE_PARALLAX = 0.45;
  const DUNE_SCALE = 0.58;
  // Parallax art is modular: runtime coverage is derived from level width and
  // repeated tiles, not from level-specific panorama dimensions.
  const DUNE_SPEC = Object.freeze({
    levelWidth: W, viewportWidth: LOGICAL_VIEW_W,
    parallax: DUNE_PARALLAX, sourceWidth: 1704, sourceHeight: 576,
    renderScale: DUNE_SCALE, tileDisplayWidth: Math.round(1704 * DUNE_SCALE),
    displayHeight: Math.round(576 * DUNE_SCALE), modular: true,
  });
  const MOUNTAIN_SPEC = Object.freeze({
    levelWidth: W, viewportWidth: LOGICAL_VIEW_W, viewportHeight: LOGICAL_VIEW_H,
    parallax: MOUNTAIN_PARALLAX, sourceWidth: 1080, sourceHeight: 540,
    renderScale: 1, modular: true,
  });
  const SKY_SPEC = Object.freeze({
    levelWidth: W, viewportWidth: LOGICAL_VIEW_W, viewportHeight: LOGICAL_VIEW_H,
    procedural: true, colorReference: 'assets/scenery/sky01_color.png',
    transitionCenters: [0.18, 0.40, 0.62, 0.84], transitionHalfWidth: 0.012,
  });

  // Direct PNG scenery. Images load from file:// and procedural fallbacks keep
  // the level playable if any individual file is missing.
  const sceneryImages = {};
  const sceneryFiles = [
    'deco_cactus01', 'deco_cactus02', 'deco_cactus03', 'deco_cactus04',
    'deco_cactus05', 'deco_cactus06', 'deco_cactus07', 'deco_cactus08',
    'deco_cactus09', 'deco_cactus10', 'deco_cactus11',
    'deco_palm001', 'deco_palm002', 'deco_palm003', 'deco_palm004',
    'deco001', 'deco002',
    'sky01_color', 'clouds01', 'mountain01', 'dune02',
  ];
  for (const key of sceneryFiles) {
    const img = new Image();
    img.decoding = 'async';
    img.src = 'assets/scenery/' + key + '.png';
    sceneryImages[key] = img;
  }

  const floatingPlatformImage = new Image();
  floatingPlatformImage.decoding = 'async';
  floatingPlatformImage.src = 'assets/platforms/floating_platform.png';
  const fragilePlatformImage = new Image();
  fragilePlatformImage.decoding = 'async';
  fragilePlatformImage.src = 'assets/platforms/floating_platform02.png';
  const portalDoorImage = new Image();
  portalDoorImage.decoding = 'async';
  portalDoorImage.src = 'assets/props/deco_portal02.png';
  const PORTAL_X = 20750;

  const GROUND_MODULE_W = 512;
  const GROUND_MODULE_H = 128;
  const terrainImages = {};
  for (const key of ['ground_desert_01', 'ground_desert_02', 'ground_desert_03']) {
    const img = new Image();
    img.decoding = 'async';
    img.src = 'assets/terrain/' + key + '.png';
    terrainImages[key] = img;
  }

  // piattaforme "one-way": ci si atterra sopra saltando
  const platforms = [
    { x: 1180, baseY: 392, y: 392, w: 150, amp: 18, speed: 0.75, phase: 0.0 },
    { x: 2040, baseY: 350, y: 350, w: 150, amp: 24, speed: 0.62, phase: 1.8, fragile: true },
    { x: 3440, baseY: 405, y: 405, w: 135, amp: 16, speed: 0.82, phase: 3.1 },
    { x: 4140, baseY: 320, y: 320, w: 175, amp: 26, speed: 0.58, phase: 4.2 },
    { x: 5640, baseY: 382, y: 382, w: 145, amp: 20, speed: 0.7, phase: 5.4, fragile: true },
    { x: 6080, baseY: 305, y: 305, w: 160, amp: 22, speed: 0.66, phase: 2.5 },
    // Extended exploration route: alternating low, medium and high paths.
    { x: 7180, baseY: 390, y: 390, w: 170, amp: 14, speed: 0.55, phase: 0.8 },
    { x: 7520, baseY: 300, y: 300, w: 140, amp: 20, speed: 0.72, phase: 2.2, fragile: true },
    { x: 7860, baseY: 365, y: 365, w: 185, amp: 28, speed: 0.48, phase: 4.7 },
    { x: 8360, baseY: 270, y: 270, w: 135, amp: 18, speed: 0.8, phase: 1.4 },
    { x: 8780, baseY: 395, y: 395, w: 160, amp: 20, speed: 0.64, phase: 3.8, fragile: true },
    { x: 9180, baseY: 330, y: 330, w: 190, amp: 24, speed: 0.52, phase: 5.6 },
    { x: 9640, baseY: 255, y: 255, w: 145, amp: 16, speed: 0.76, phase: 2.9, fragile: true },
    { x: 10020, baseY: 375, y: 375, w: 180, amp: 18, speed: 0.6, phase: 1.1 },

    // Long calm traversal sectors and stair-like routes.
    { x: 10880, baseY: 410, y: 410, w: 150, amp: 12, speed: 0.58, phase: 0.4 },
    { x: 11100, baseY: 360, y: 360, w: 145, amp: 10, speed: 0.62, phase: 1.1 },
    { x: 11310, baseY: 305, y: 305, w: 140, amp: 12, speed: 0.67, phase: 2.0, fragile: true },
    { x: 11520, baseY: 250, y: 250, w: 145, amp: 14, speed: 0.7, phase: 3.0 },
    { x: 11920, baseY: 385, y: 385, w: 170, amp: 18, speed: 0.54, phase: 4.0 },
    { x: 12170, baseY: 330, y: 330, w: 150, amp: 12, speed: 0.7, phase: 5.0, fragile: true },
    { x: 12410, baseY: 275, y: 275, w: 150, amp: 14, speed: 0.64, phase: 1.8 },
    { x: 12640, baseY: 220, y: 220, w: 140, amp: 12, speed: 0.74, phase: 2.7 },
    { x: 13020, baseY: 370, y: 370, w: 175, amp: 20, speed: 0.5, phase: 3.8 },
    { x: 13310, baseY: 305, y: 305, w: 155, amp: 14, speed: 0.65, phase: 4.8, fragile: true },
    { x: 13600, baseY: 245, y: 245, w: 150, amp: 16, speed: 0.59, phase: 0.9 },
    { x: 13920, baseY: 395, y: 395, w: 155, amp: 14, speed: 0.7, phase: 2.1 },
    { x: 14140, baseY: 335, y: 335, w: 145, amp: 12, speed: 0.76, phase: 3.2, fragile: true },
    { x: 14360, baseY: 275, y: 275, w: 145, amp: 13, speed: 0.68, phase: 4.3 },
    { x: 14780, baseY: 400, y: 400, w: 180, amp: 20, speed: 0.48, phase: 5.4 },
    { x: 15100, baseY: 335, y: 335, w: 160, amp: 16, speed: 0.61, phase: 1.3 },
    { x: 15420, baseY: 270, y: 270, w: 150, amp: 14, speed: 0.72, phase: 2.4, fragile: true },
    { x: 15720, baseY: 215, y: 215, w: 145, amp: 12, speed: 0.66, phase: 3.5 },
    { x: 16120, baseY: 375, y: 375, w: 175, amp: 17, speed: 0.53, phase: 4.6 },
    { x: 16420, baseY: 305, y: 305, w: 155, amp: 13, speed: 0.69, phase: 5.7, fragile: true },

    // Final long-form traversal and portal expedition approach.
    { x: 18150, baseY: 400, y: 400, w: 145, amp: 12, speed: 0.55, phase: 0.0, fragile: false },
    { x: 18450, baseY: 345, y: 345, w: 160, amp: 15, speed: 0.60, phase: 0.7, fragile: false },
    { x: 18750, baseY: 290, y: 290, w: 175, amp: 18, speed: 0.65, phase: 1.4, fragile: true },
    { x: 19050, baseY: 235, y: 235, w: 145, amp: 21, speed: 0.70, phase: 2.1, fragile: false },
    { x: 19350, baseY: 320, y: 320, w: 160, amp: 12, speed: 0.55, phase: 2.8, fragile: false },
    { x: 19650, baseY: 380, y: 380, w: 175, amp: 15, speed: 0.60, phase: 3.5, fragile: false },
    { x: 19950, baseY: 400, y: 400, w: 145, amp: 18, speed: 0.65, phase: 4.2, fragile: false },
    { x: 20250, baseY: 345, y: 345, w: 160, amp: 21, speed: 0.70, phase: 4.9, fragile: true },
    { x: 20550, baseY: 290, y: 290, w: 175, amp: 12, speed: 0.55, phase: 5.6, fragile: false },
    { x: 20850, baseY: 235, y: 235, w: 145, amp: 15, speed: 0.60, phase: 0.3, fragile: false },
    { x: 21150, baseY: 320, y: 320, w: 160, amp: 18, speed: 0.65, phase: 1.0, fragile: false },
    { x: 21450, baseY: 380, y: 380, w: 175, amp: 21, speed: 0.70, phase: 1.7, fragile: false },
    { x: 21750, baseY: 400, y: 400, w: 145, amp: 12, speed: 0.55, phase: 2.4, fragile: true },
    { x: 22050, baseY: 345, y: 345, w: 160, amp: 15, speed: 0.60, phase: 3.1, fragile: false },
    { x: 22350, baseY: 290, y: 290, w: 175, amp: 18, speed: 0.65, phase: 3.8, fragile: false },
    { x: 22650, baseY: 235, y: 235, w: 145, amp: 21, speed: 0.70, phase: 4.5, fragile: false },
    { x: 22950, baseY: 320, y: 320, w: 160, amp: 12, speed: 0.55, phase: 5.2, fragile: false },
    { x: 23250, baseY: 380, y: 380, w: 175, amp: 15, speed: 0.60, phase: 5.9, fragile: true },
    { x: 23550, baseY: 400, y: 400, w: 145, amp: 18, speed: 0.65, phase: 0.6, fragile: false },
    { x: 23850, baseY: 345, y: 345, w: 160, amp: 21, speed: 0.70, phase: 1.3, fragile: false },
    { x: 24150, baseY: 290, y: 290, w: 175, amp: 12, speed: 0.55, phase: 2.0, fragile: false },
    { x: 24450, baseY: 235, y: 235, w: 145, amp: 15, speed: 0.60, phase: 2.7, fragile: false },
    { x: 24750, baseY: 320, y: 320, w: 160, amp: 18, speed: 0.65, phase: 3.4, fragile: true },
  ];

  // tabella spawn: attivati quando il giocatore si avvicina
  const spawns = [
    { x: 620, type: 'soldier' },
    { x: 780, type: 'soldier' },
    { x: 950, type: 'pow' },
    { x: 1150, type: 'grenadier' },
    { x: 1300, type: 'soldier' },
    { x: 1360, type: 'soldier' },
    { x: 1550, type: 'knife' },
    { x: 1700, type: 'soldier' },
    { x: 1840, type: 'turret' },
    { x: 1950, type: 'grenadier' },
    { x: 2150, type: 'pow' },
    { x: 2380, type: 'heli' },
    { x: 2480, type: 'bazooka' },
    { x: 2620, type: 'soldier' },
    { x: 2700, type: 'soldier' },
    { x: 2780, type: 'soldier' },
    { x: 2950, type: 'knife' },
    { x: 3010, type: 'knife' },
    { x: 3150, type: 'grenadier' },
    // Guaranteed shoulder-launcher upgrade: 10 guided missiles.
    { x: 3230, type: 'pickup', pickup: 'homing' },
    { x: 3380, type: 'tank' },
    { x: 3520, type: 'turret' },
    { x: 3650, type: 'pow' },
    { x: 3780, type: 'bazooka' },
    { x: 3850, type: 'soldier' },
    { x: 3930, type: 'soldier' },
    { x: 4150, type: 'gunship' }, // miniboss di metà missione
    { x: 4260, type: 'grenadier' },
    { x: 4340, type: 'soldier' },
    { x: 4480, type: 'pickup', pickup: 'jetpack' },
    { x: 4550, type: 'knife' },
    { x: 4610, type: 'knife' },
    { x: 4780, type: 'tank' },
    { x: 4880, type: 'bazooka' },
    { x: 5050, type: 'pow' },
    { x: 5180, type: 'turret' },
    { x: 5250, type: 'soldier' },
    { x: 5330, type: 'soldier' },
    { x: 5410, type: 'soldier' },
    { x: 5560, type: 'heli' },
    { x: 5650, type: 'grenadier' },
    { x: 5880, type: 'tank' },
    { x: 5960, type: 'soldier' },
    { x: 5990, type: 'bazooka' },
    { x: 6250, type: 'pow' },
    { x: 6420, type: 'soldier' },
    { x: 6500, type: 'soldier' },
    { x: 6580, type: 'knife' },
    { x: 6680, type: 'turret' },
    { x: 6720, type: 'grenadier' },
    { x: 6800, type: 'grenadier' },
    { x: 6860, type: 'bazooka' },
    // Calm archaeological stretch: props, platforms and POWs before combat resumes.
    { x: 7350, type: 'pow' },
    { x: 7720, type: 'soldier' }, { x: 7800, type: 'soldier' },
    { x: 7950, type: 'grenadier' }, { x: 8120, type: 'heli' },
    { x: 8280, type: 'bazooka' },
    // Second quiet traversal pocket around 8500-8900.
    { x: 8920, type: 'pow' },
    { x: 9100, type: 'knife' }, { x: 9170, type: 'knife' },
    { x: 9340, type: 'tank' }, { x: 9500, type: 'soldier' },
    { x: 9580, type: 'grenadier' }, { x: 9760, type: 'turret' },
    { x: 9920, type: 'heli' }, { x: 10060, type: 'bazooka' },
    { x: 10140, type: 'soldier' }, { x: 10220, type: 'soldier' },

    // Extended enemy territories separated by long exploration corridors.
    { x: 10880, type: 'soldier' }, { x: 10960, type: 'grenadier' },
    { x: 11680, type: 'pow' },
    { x: 11980, type: 'knife' }, { x: 12050, type: 'knife' },
    { x: 12480, type: 'heli' }, { x: 12720, type: 'bazooka' },
    { x: 12820, type: 'soldier' }, { x: 12900, type: 'soldier' },
    { x: 13480, type: 'pow' },
    { x: 13720, type: 'tank' }, { x: 13860, type: 'grenadier' },
    { x: 14480, type: 'turret' }, { x: 14580, type: 'soldier' },
    { x: 14660, type: 'soldier' }, { x: 14920, type: 'heli' },
    { x: 15280, type: 'pow' },
    { x: 15580, type: 'bazooka' }, { x: 15700, type: 'grenadier' },
    { x: 16020, type: 'tank' }, { x: 16220, type: 'knife' },
    { x: 16290, type: 'knife' }, { x: 16500, type: 'turret' },
    { x: 16620, type: 'soldier' }, { x: 16700, type: 'soldier' },
    { x: 16900, type: 'bazooka' },

    // Longer late-game enemy territories with two extended calm pockets.
    { x: 18300, type: 'soldier' },
    { x: 18560, type: 'grenadier' },
    { x: 18820, type: 'knife' },
    { x: 19080, type: 'bazooka' },
    { x: 19340, type: 'soldier' },
    { x: 19600, type: 'heli' },
    { x: 19860, type: 'turret' },
    { x: 20120, type: 'tank' },
    { x: 21160, type: 'bazooka' },
    { x: 21420, type: 'soldier' },
    { x: 21680, type: 'heli' },
    { x: 21940, type: 'turret' },
    { x: 22200, type: 'tank' },
    { x: 22460, type: 'soldier' },
    { x: 22720, type: 'grenadier' },
    { x: 22980, type: 'knife' },
    { x: 23760, type: 'heli' },
    { x: 24020, type: 'turret' },
    { x: 24280, type: 'tank' },
    { x: 24540, type: 'soldier' },
    { x: 20600, type: 'pow' },
    { x: 23500, type: 'pow' },
  ];

  const BOSS_TRIGGER_X = 25200; // il boss appare quando il giocatore arriva qui
  const BOSS_X = 25600;         // posizione di stazionamento del boss

  // carri alleati "SLUG" parcheggiati, pilotabili dal giocatore
  const slugSpawns = [2250, 5480, 8650, 14520, 22600];

  // Supplied destructible gameplay decorations replace the old generated
  // crates and barrels. Fuel canisters (tonnel) retain chain-reaction damage.
  const props = [
    { x: 450, type: 'sign03' }, { x: 880, type: 'flag' },
    { x: 1340, type: 'barrel01' }, { x: 1620, type: 'mil1' },
    { x: 2260, type: 'dish02' }, { x: 2740, type: 'barrel02' },
    { x: 2900, type: 'door' }, { x: 3000, type: 'tonnel' },
    { x: 3320, type: 'dish' }, { x: 3700, type: 'sign01' },
    { x: 4330, type: 'barrel01' }, { x: 4650, type: 'flag' },
    { x: 5390, type: 'barrel02' }, { x: 5710, type: 'sign03' },
    { x: 5820, type: 'dish' }, { x: 6350, type: 'sign01' },
    { x: 6470, type: 'tonnel' }, { x: 6900, type: 'door' },
    // Reward-rich calm spaces in the extended half.
    { x: 7240, type: 'flag' }, { x: 7460, type: 'dish02' },
    { x: 8040, type: 'barrel01' }, { x: 8460, type: 'sign03' },
    { x: 8700, type: 'mil1' }, { x: 8980, type: 'door' },
    { x: 9280, type: 'barrel02' }, { x: 9680, type: 'dish' },
    { x: 10080, type: 'sign01' }, { x: 10320, type: 'tonnel' },

    { x: 10980, type: 'flag' }, { x: 11240, type: 'sign03' },
    { x: 11610, type: 'dish02' }, { x: 12020, type: 'barrel01' },
    { x: 12360, type: 'mil1' }, { x: 12780, type: 'door' },
    { x: 13180, type: 'sign01' }, { x: 13520, type: 'dish' },
    { x: 13820, type: 'barrel02' }, { x: 14280, type: 'flag' },
    { x: 14620, type: 'tonnel' }, { x: 15020, type: 'sign02' },
    { x: 15380, type: 'dish02' }, { x: 15880, type: 'door' },
    { x: 16320, type: 'mil1' }, { x: 16820, type: 'barrel01' },

    // Hidden caches across the final exploration half.
    { x: 18250, type: 'flag' },
    { x: 18640, type: 'dish02' },
    { x: 19030, type: 'sign03' },
    { x: 19420, type: 'mil1' },
    { x: 19810, type: 'barrel01' },
    { x: 20200, type: 'door' },
    { x: 20590, type: 'barrel02' },
    { x: 20980, type: 'sign01' },
    { x: 21370, type: 'flag' },
    { x: 21760, type: 'dish02' },
    { x: 22150, type: 'sign03' },
    { x: 22540, type: 'mil1' },
    { x: 22930, type: 'barrel01' },
    { x: 23320, type: 'door' },
    { x: 23710, type: 'barrel02' },
    { x: 24100, type: 'sign01' },
    { x: 24490, type: 'flag' },

    // Proximity mines with red warning glow.
    { x: 1760, type:'mine01' }, { x: 4860, type:'mine01' },
    { x: 7240, type:'mine01' }, { x: 10820, type:'mine01' },
    { x: 13220, type:'mine01' }, { x: 16680, type:'mine01' },
    { x: 19380, type:'mine01' }, { x: 22480, type:'mine01' },
    { x: 24720, type:'mine01' },
  ];

  // Lava gaps interrupt the normal ground collision. Wide gaps are crossed via
  // the stair-platform routes above them.
  const lavaGaps = [
    { x: 11040, w: 190 }, { x: 12110, w: 310 },
    { x: 13940, w: 350 }, { x: 15620, w: 360 },
    { x: 18880, w: 330 }, { x: 21840, w: 390 }, { x: 24120, w: 340 },
  ];
  const energyLasers = [
    { x: 11595, platformX: 11520, period: 3.8, activeFor: 1.45, phase: 0.2 },
    { x: 12555, platformX: 12410, period: 4.2, activeFor: 1.6, phase: 1.3 },
    { x: 13710, platformX: 13600, period: 3.6, activeFor: 1.35, phase: 2.0 },
    { x: 14455, platformX: 14360, period: 4.0, activeFor: 1.5, phase: 0.9 },
    { x: 15805, platformX: 15720, period: 3.7, activeFor: 1.4, phase: 1.8 },
  ];
  let hazardTime = 0;

  function isLavaGap(x) {
    for (const gap of lavaGaps) if (x > gap.x && x < gap.x + gap.w) return true;
    return false;
  }
  function platformForX(x) {
    for (const platform of platforms) if (Math.abs(platform.x - x) < 2) return platform;
    return null;
  }
  function updateHazards(dt) { hazardTime += dt; }
  function laserState(laser) {
    const cycle = (hazardTime + laser.phase) % laser.period;
    return { active: cycle < laser.activeFor, warning: cycle >= laser.period - 0.65 };
  }
  function playerTouchesLaser(player) {
    if (!player || player.dead || player.inv > 0) return false;
    for (const laser of energyLasers) {
      const state = laserState(laser);
      if (!state.active) continue;
      const platform = platformForX(laser.platformX);
      if (!platform || platform.dead) continue;
      if (Math.abs(player.x - laser.x) < 13 && player.y > 20 && player.y > platform.y - 520 && player.y - 54 < platform.y)
        return true;
    }
    return false;
  }

  // Persistent life rewards on optional high-platform routes.
  const highPickups = [
    { x:8368, y:250, type:'heart' },
    { x:12652, y:198, type:'heart' },
    { x:15732, y:193, type:'heart' },
    { x:21450, y:220, type:'heart' },
  ];

  // ---------------- scenografia (seeded, deterministica) ----------------
  function rng(seed) {
    let s = seed;
    return function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  const farMounts = [];
  {
    const r = rng(42);
    for (let x = -200; x < W * 0.4 + 400; x += 120 + r() * 160) {
      farMounts.push({ x: x, w: 220 + r() * 260, h: 90 + r() * 130 });
    }
  }
  const plantTypes = [
    // All new decorations render at exact 1:1 source-pixel dimensions.
    { key:'deco_cactus01', w:72, h:50, bottomPad:0 },
    { key:'deco_cactus02', w:61, h:100, bottomPad:0 },
    { key:'deco_cactus03', w:65, h:58, bottomPad:0 },
    { key:'deco_cactus04', w:120, h:120, bottomPad:0 },
    { key:'deco_cactus05', w:96, h:70, bottomPad:0 },
    { key:'deco_cactus06', w:99, h:159, bottomPad:0 },
    { key:'deco_cactus07', w:51, h:50, bottomPad:0 },
    { key:'deco_cactus08', w:80, h:100, bottomPad:0 },
    { key:'deco_cactus09', w:58, h:50, bottomPad:0 },
    { key:'deco_cactus10', w:77, h:100, bottomPad:0 },
    { key:'deco_cactus11', w:86, h:120, bottomPad:0 },
    { key:'deco_palm001', w:109, h:240, bottomPad:0 },
    { key:'deco_palm002', w:133, h:120, bottomPad:0 },
    { key:'deco_palm003', w:80, h:120, bottomPad:0 },
    { key:'deco_palm004', w:136, h:120, bottomPad:0 },
    { key:'deco001', w:126, h:50, bottomPad:0 },
    { key:'deco002', w:139, h:50, bottomPad:0 },
  ];
  const desertPlants = [];
  {
    const r = rng(133);
    let index = 0;
    for (let x = 150; x < W; x += 250 + r() * 250) {
      // Cycling with a small seeded offset guarantees that every delivered
      // plant appears while retaining a natural non-repeating distribution.
      const type = plantTypes[(index + Math.floor(r() * 4)) % plantTypes.length];
      desertPlants.push({
        x: x + r() * 90,
        type: type,
        scale: 1,
        flip: r() > 0.5,
        alpha: 0.9 + r() * 0.1,
      });
      index++;
    }
  }
  const groundModuleSequence = [];
  {
    const r = rng(2026);
    const weighted = ['ground_desert_01', 'ground_desert_03',
      'ground_desert_01', 'ground_desert_03', 'ground_desert_02'];
    const count = Math.ceil(W / GROUND_MODULE_W) + 1;
    for (let i = 0; i < count; i++) {
      let next = weighted[Math.floor(r() * weighted.length)];
      const previous = groundModuleSequence[i - 1];
      // Avoid obvious immediate repeats and consecutive lava cutaways.
      if (next === previous) next = next === 'ground_desert_01' ?
        'ground_desert_03' : 'ground_desert_01';
      if (next === 'ground_desert_02' && previous === 'ground_desert_02') {
        next = 'ground_desert_03';
      }
      groundModuleSequence.push(next);
    }
  }

  const groundProps = [];
  {
    const r = rng(99);
    for (let x = 200; x < W; x += 180 + r() * 320) {
      const t = r();
      groundProps.push({ x: x, type: t < 0.4 ? 'rock' : t < 0.7 ? 'grass' : 'skull', s: 0.6 + r() * 0.8 });
    }
  }
  const clouds = [];
  {
    const r = rng(7);
    for (let i = 0; i < 10; i++) {
      clouds.push({ x: r() * 1200, y: 30 + r() * 120, w: 80 + r() * 140, sp: 4 + r() * 8 });
    }
  }

  // ---------------- rendering ----------------
  function imageReady(img) {
    return !!img && (img.naturalWidth || img.width) > 0;
  }

  function clamp01(value) { return Math.max(0, Math.min(1, value)); }
  function smoothstep(edge0, edge1, value) {
    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  }

  // Four rapid environmental changes over normalized mission progress:
  // day → night → day → night → day. Narrow transition windows keep each
  // change dramatic while still blending without a visible color cut.
  function nightAmount(camX, VW) {
    const progress = Math.max(0, Math.min(1, (camX + VW * 0.5) / W));
    const centers = [0.18, 0.40, 0.62, 0.84];
    const halfWidth = 0.012;
    let state = 0;
    for (let i = 0; i < centers.length; i++) {
      const target = state > 0.5 ? 0 : 1;
      if (progress < centers[i] - halfWidth) return state;
      if (progress <= centers[i] + halfWidth) {
        const blend = smoothstep(centers[i] - halfWidth, centers[i] + halfWidth, progress);
        return state + (target - state) * blend;
      }
      state = target;
    }
    return state;
  }

  function mixColor(day, night, amount) {
    const channel = i => Math.round(day[i] + (night[i] - day[i]) * amount);
    return 'rgb(' + channel(0) + ',' + channel(1) + ',' + channel(2) + ')';
  }

  // Day colors are sampled from sky01_color.png. Keeping the compact reference
  // texture loaded documents the art source while these stops avoid a per-frame
  // pixel readback and work reliably under file://.
  const DAY_SKY = [
    { p: 0.00, c: [1, 83, 173] },
    { p: 0.20, c: [0, 116, 180] },
    { p: 0.40, c: [18, 174, 194] },
    { p: 0.60, c: [80, 232, 201] },
    { p: 0.78, c: [240, 250, 197] },
    { p: 1.00, c: [240, 187, 161] },
  ];
  const NIGHT_SKY = [
    [4, 8, 28], [7, 14, 42], [11, 23, 57],
    [20, 35, 72], [38, 47, 78], [55, 47, 72],
  ];

  const pixelMoon = (function () {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const craters = [
      { x:20, y:19, r:7 }, { x:43, y:17, r:5 }, { x:39, y:39, r:8 },
      { x:18, y:43, r:4 }, { x:29, y:30, r:3 }, { x:49, y:31, r:3 },
    ];
    for (let y = 2; y < 62; y += 2) {
      for (let x = 2; x < 62; x += 2) {
        const dx = x - 32, dy = y - 32, distance = Math.hypot(dx, dy);
        if (distance > 29.5) continue;
        const sphere = Math.sqrt(Math.max(0, 1 - distance * distance / (30 * 30)));
        let light = 132 + sphere * 92 - dx * 1.15 - dy * 0.22;
        let craterDepth = 0, craterRim = 0;
        for (const crater of craters) {
          const cd = Math.hypot(x - crater.x, y - crater.y);
          if (cd < crater.r) craterDepth = Math.max(craterDepth, 1 - cd / crater.r);
          else if (cd < crater.r + 2.5) craterRim = Math.max(craterRim, 1 - (cd - crater.r) / 2.5);
        }
        light += craterRim * 28 - craterDepth * 54;
        const edge = Math.max(0, (distance - 25) * 5);
        const r = Math.max(75, Math.min(235, light - edge));
        const gg = Math.max(88, Math.min(242, light + 7 - edge));
        const b = Math.max(105, Math.min(255, light + 25 - edge));
        ctx.fillStyle = 'rgb(' + (r|0) + ',' + (gg|0) + ',' + (b|0) + ')';
        ctx.fillRect(x, y, 2, 2);
      }
    }
    // Bright left rim and a few one-pixel mineral highlights.
    ctx.fillStyle = '#f4fbff';
    ctx.fillRect(13, 16, 2, 8); ctx.fillRect(10, 24, 2, 12);
    ctx.fillRect(23, 10, 2, 2); ctx.fillRect(28, 48, 2, 2); ctx.fillRect(48, 25, 2, 2);
    return canvas;
  })();

  function drawProceduralSky(g, amount, VW, VH) {
    const gradient = g.createLinearGradient(0, 0, 0, GROUND);
    for (let i = 0; i < DAY_SKY.length; i++) {
      gradient.addColorStop(DAY_SKY[i].p, mixColor(DAY_SKY[i].c, NIGHT_SKY[i], amount));
    }
    g.fillStyle = gradient;
    g.fillRect(0, 0, VW, VH);

    // Detailed nearest-neighbor pixel moon appears during both night intervals.
    const moonAlpha = smoothstep(0.58, 1, amount);
    if (moonAlpha > 0) {
      const moonX = Math.round(VW * 0.78), moonY = 92;
      g.save();
      g.globalCompositeOperation = 'lighter';
      const halo = g.createRadialGradient(moonX, moonY, 18, moonX, moonY, 62);
      halo.addColorStop(0, 'rgba(205,232,255,0.22)');
      halo.addColorStop(0.48, 'rgba(110,170,255,0.1)');
      halo.addColorStop(1, 'rgba(70,110,220,0)');
      g.globalAlpha = moonAlpha;
      g.fillStyle = halo;
      g.beginPath(); g.arc(moonX, moonY, 62, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'source-over';
      g.imageSmoothingEnabled = false;
      g.globalAlpha = moonAlpha;
      g.drawImage(pixelMoon, moonX - 36, moonY - 36, 72, 72);
      g.restore();
    }
  }

  function drawTiledLayer(g, img, camX, parallax, scale, y, VW) {
    if (!imageReady(img)) return false;
    const sourceW = img.naturalWidth || img.width;
    const sourceH = img.naturalHeight || img.height;
    const tileW = Math.max(1, Math.round(sourceW * scale));
    const tileH = Math.max(1, Math.round(sourceH * scale));
    const scroll = camX * parallax;
    let x = -(scroll % tileW) - tileW;
    g.save();
    g.imageSmoothingEnabled = scale === 1 ? false : true;
    for (; x < VW + tileW; x += tileW) {
      g.drawImage(img, Math.round(x), Math.round(y), tileW, tileH);
    }
    g.restore();
    return true;
  }

  function drawCloudLayer(g, camX, time, amount, VW) {
    const img = sceneryImages.clouds01;
    if (!imageReady(img)) return;
    const drift = time * 1.5;
    g.save();
    g.globalAlpha = 0.72 - amount * 0.16;
    // The small transparent cloud module repeats before the mountain layer.
    drawTiledLayer(g, img, camX + drift, 0.07, 1, 20, VW);
    g.restore();
  }

  function drawProceduralMountains(g, camX, VW) {
    g.fillStyle = '#3a3450';
    for (const mountain of farMounts) {
      const x = mountain.x - camX * MOUNTAIN_PARALLAX;
      if (x + mountain.w < -50 || x > VW + 50) continue;
      g.beginPath();
      g.moveTo(x, GROUND);
      g.lineTo(x + mountain.w / 2, GROUND - mountain.h);
      g.lineTo(x + mountain.w, GROUND);
      g.fill();
    }
  }

  function drawBackground(g, camX, time, VW, VH) {
    const amount = nightAmount(camX, VW);
    drawProceduralSky(g, amount, VW, VH);
    drawCloudLayer(g, camX, time, amount, VW);

    if (!drawTiledLayer(g, sceneryImages.mountain01, camX,
      MOUNTAIN_PARALLAX, 1, 0, VW)) {
      drawProceduralMountains(g, camX, VW);
    }
    // Native sand platforms occupy a dedicated depth plane immediately before
    // the dune layer, so dunes can naturally occlude their lower edges.
    if (window.ForegroundDecor) ForegroundDecor.drawBehindDunes(g);
    drawDuneLayer(g, camX, VW);

    // A single atmospheric grade unifies transparent cloud, mountain, and dune
    // modules without generating tinted texture copies every frame.
    if (amount > 0) {
      g.save();
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = 'rgba(5, 14, 45,' + (amount * 0.56).toFixed(3) + ')';
      g.fillRect(0, 0, VW, GROUND + 6);
      g.restore();
    }
  }

  function drawDuneLayer(g, camX, VW) {
    const img = sceneryImages.dune02;
    if (!imageReady(img)) {
      g.fillStyle = '#8b4d3c';
      const scroll = camX * DUNE_PARALLAX;
      for (let x = -((scroll | 0) % 520) - 520; x < VW + 520; x += 520) {
        g.beginPath();
        g.moveTo(x, GROUND);
        g.quadraticCurveTo(x + 180, GROUND - 150, x + 340, GROUND - 52);
        g.quadraticCurveTo(x + 430, GROUND - 12, x + 520, GROUND);
        g.fill();
      }
      return;
    }
    const sourceH = img.naturalHeight || img.height;
    const tileH = Math.round(sourceH * DUNE_SCALE);
    drawTiledLayer(g, img, camX, DUNE_PARALLAX, DUNE_SCALE,
      GROUND - tileH + 6, VW);
  }

  function drawDesertPlant(g, plant, camX) {
    const type = plant.type;
    const px = plant.x - camX;
    const width = type.w * plant.scale;
    const height = type.h * plant.scale;
    if (px + width / 2 < -40 || px - width / 2 > 1000) return;

    // Soft contact shadow integrates all supplied transparent sprites with the ground.
    g.save();
    g.globalAlpha = 0.16 * plant.alpha;
    g.fillStyle = '#2a1b18';
    g.translate(Math.round(px), GROUND + 1);
    g.scale(1, 0.28);
    g.beginPath();
    g.arc(0, 0, Math.max(13, width * 0.3), 0, Math.PI * 2);
    g.fill();
    g.restore();

    const img = sceneryImages[type.key];
    if (imageReady(img)) {
      g.save();
      g.globalAlpha = plant.alpha;
      g.imageSmoothingEnabled = false;
      g.translate(Math.round(px), Math.round(GROUND + type.bottomPad * plant.scale));
      g.scale(plant.flip ? -1 : 1, 1);
      g.drawImage(img, -width / 2, -height, width, height);
      g.restore();
      return;
    }

    // Simple silhouette fallback visible only during a missing/failed image load.
    g.save();
    g.translate(Math.round(px), GROUND);
    g.scale(plant.flip ? -1 : 1, 1);
    if (type.key.indexOf('palm') >= 0) {
      g.fillStyle = '#5e3f27';
      g.fillRect(-4, -height * 0.72, 8, height * 0.72);
      g.fillStyle = '#3f7b2d';
      for (let i = 0; i < 6; i++) {
        g.save(); g.translate(0, -height * 0.72); g.rotate(i * Math.PI / 3);
        g.fillRect(0, -3, width * 0.28, 6); g.restore();
      }
    } else {
      g.fillStyle = '#477b2d';
      g.fillRect(-width * 0.13, -height, width * 0.26, height);
      g.fillRect(-width * 0.32, -height * 0.6, width * 0.24, height * 0.13);
      g.fillRect(width * 0.08, -height * 0.74, width * 0.3, height * 0.13);
    }
    g.restore();
  }

  function drawGroundModules(g, camX, VW) {
    const keys = ['ground_desert_01', 'ground_desert_02', 'ground_desert_03'];
    if (!keys.every(key => imageReady(terrainImages[key]))) return false;
    const first = Math.max(0, Math.floor(camX / GROUND_MODULE_W));
    const last = Math.min(groundModuleSequence.length - 1,
      Math.ceil((camX + VW) / GROUND_MODULE_W));
    g.save();
    g.imageSmoothingEnabled = false;
    for (let index = first; index <= last; index++) {
      const key = groundModuleSequence[index];
      const img = terrainImages[key];
      const x = Math.round(index * GROUND_MODULE_W - camX);
      g.drawImage(img, x, GROUND, GROUND_MODULE_W, GROUND_MODULE_H);
    }
    g.restore();
    return true;
  }

  function resetPlatforms() {
    for (const platform of platforms) {
      platform.dead = false;
      platform.triggered = false;
      platform.breakT = 0;
      platform.y = platform.baseY + Math.sin(platform.phase) * platform.amp;
    }
  }

  function updatePlatforms(dt, player) {
    for (const platform of platforms) {
      if (platform.dead) continue;
      const oldY = platform.y;
      platform.phase += dt * platform.speed;
      platform.y = platform.baseY + Math.sin(platform.phase) * platform.amp;
      const riding = player && !player.dead && player.jetpackT <= 0 &&
        Math.abs(player.y - oldY) < 4 && player.x > platform.x &&
        player.x < platform.x + platform.w && player.vy >= 0;
      if (riding) {
        player.y += platform.y - oldY;
        player.onGround = true;
        if (platform.fragile && !platform.triggered) {
          platform.triggered = true;
          platform.breakT = 1.45;
        }
      }
      if (platform.triggered) {
        platform.breakT -= dt;
        if (platform.breakT <= 0) {
          platform.dead = true;
          if (riding) { player.onGround = false; player.vy = 80; }
          SFX.crate();
          for (let i = 0; i < 18; i++) G.particles.push({
            kind: i % 3 === 0 ? 'spark' : 'debris',
            x: platform.x + Math.random() * platform.w, y: platform.y + 7,
            vx: -110 + Math.random() * 220, vy: -80 + Math.random() * 180,
            t: 0, life: 0.45 + Math.random() * 0.55,
            color: i % 3 === 0 ? '#68efff' : '#6a4b3e',
            size: 2 + Math.random() * 6, grav: 850,
            rot: Math.random() * 6.28, spin: -8 + Math.random() * 16,
          });
        }
      }
    }
  }

  function drawGround(g, camX, VW, VH) {
    // Supplied palm and cactus PNGs occupy the original palm layer, behind
    // gameplay entities but in front of the dune panorama.
    for (const plant of desertPlants) drawDesertPlant(g, plant, camX);

    const externalGround = drawGroundModules(g, camX, VW);
    if (!externalGround) {
      // Generated fallback while the three terrain modules are loading.
      g.fillStyle = '#7a5e38';
      g.fillRect(0, GROUND, VW, VH - GROUND);
      g.fillStyle = '#4e6e35';
      g.fillRect(0, GROUND, VW, 8);
      g.fillStyle = '#5e4a2c';
      for (let x = -((camX | 0) % 48); x < VW; x += 48) {
        g.fillRect(x, GROUND + 18, 22, 5);
        g.fillRect(x + 26, GROUND + 38, 16, 4);
      }
    }

    // Legacy generated decorations are hidden when rich external modules are
    // active; future transparent overlay PNGs can be placed intentionally.
    if (!externalGround) for (const pr of groundProps) {
      const px = pr.x - camX;
      if (px < -60 || px > VW + 60) continue;
      if (pr.type === 'rock') {
        g.fillStyle = '#8a7a5e';
        g.fillRect(px, GROUND - 10 * pr.s, 18 * pr.s, 10 * pr.s);
        g.fillStyle = '#6e6048';
        g.fillRect(px + 3 * pr.s, GROUND - 5 * pr.s, 18 * pr.s, 5 * pr.s);
      } else if (pr.type === 'grass') {
        g.fillStyle = '#557a36';
        g.fillRect(px, GROUND - 8, 3, 8);
        g.fillRect(px + 5, GROUND - 12, 3, 12);
        g.fillRect(px + 10, GROUND - 7, 3, 7);
      } else {
        g.fillStyle = '#d8d0b8';
        g.fillRect(px, GROUND - 8, 10, 8);
        g.fillStyle = '#26241c';
        g.fillRect(px + 2, GROUND - 6, 2, 2);
        g.fillRect(px + 6, GROUND - 6, 2, 2);
      }
    }

    // Intermittent lava light leaking through the modular ground cutaway.
    const lavaPulse = Math.max(0, Math.sin(G.time * 0.72 + camX * 0.002) - 0.28) / 0.72;
    if (lavaPulse > 0) {
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = lavaPulse * 0.28;
      const lava = g.createLinearGradient(0, VH, 0, GROUND + 18);
      lava.addColorStop(0, '#ff2d12'); lava.addColorStop(0.55, '#ff7a20');
      lava.addColorStop(1, 'rgba(255,190,70,0)');
      g.fillStyle = lava; g.fillRect(0, GROUND + 18, VW, VH - GROUND - 18); g.restore();
    }

    // Open lava cuts use a bright animated surface—never a flat black strip.
    for (const gap of lavaGaps) {
      const gx = gap.x - camX;
      if (gx + gap.w < 0 || gx > VW) continue;
      const visibleX = Math.max(0, gx), visibleRight = Math.min(VW, gx + gap.w);
      const magma = g.createLinearGradient(0, GROUND - 3, 0, VH);
      magma.addColorStop(0, '#fff29a');
      magma.addColorStop(0.08, '#ffc52f');
      magma.addColorStop(0.32, '#ff641c');
      magma.addColorStop(0.7, '#b92318');
      magma.addColorStop(1, '#4b1017');
      g.fillStyle = magma;
      g.fillRect(gx, GROUND - 3, gap.w, VH - GROUND + 3);

      // Two irregular molten currents travel at different speeds.
      g.save();
      g.beginPath();
      g.moveTo(gx, GROUND + 8);
      for (let x = gx; x <= gx + gap.w; x += 8) {
        const wave = Math.sin(x * 0.055 + hazardTime * 3.4) * 4 +
          Math.sin(x * 0.12 - hazardTime * 2.1) * 2;
        g.lineTo(x, GROUND + 7 + wave);
      }
      g.lineTo(gx + gap.w, GROUND + 24);
      g.lineTo(gx, GROUND + 24);
      g.closePath();
      g.fillStyle = '#ff8b1f';
      g.fill();
      g.restore();

      // White-yellow surface ribbons are broken into pixel-art segments.
      for (let x = gx + 8; x < gx + gap.w - 6; x += 27) {
        const y = GROUND + 2 + Math.sin(x * 0.08 + hazardTime * 4.6) * 3;
        const length = 9 + ((Math.abs(Math.sin(x + hazardTime)) * 13) | 0);
        g.fillStyle = '#fff3a0'; g.fillRect(Math.round(x), Math.round(y), length, 3);
        g.fillStyle = '#ffc62e'; g.fillRect(Math.round(x + 3), Math.round(y + 3), Math.max(4, length - 6), 2);
      }

      // Rising bubbles, popping sparks and heat glow make each gap feel alive.
      g.save();
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < Math.max(3, Math.floor(gap.w / 70)); i++) {
        const phase = (hazardTime * (0.28 + i * 0.035) + i * 0.37) % 1;
        const bx = gx + 18 + ((i * 83 + gap.x * 0.13) % Math.max(25, gap.w - 36));
        const by = GROUND + 38 - phase * 44;
        const radius = 2 + (i % 3);
        g.globalAlpha = (1 - phase) * 0.75;
        g.fillStyle = i % 2 ? '#fff070' : '#ff7a20';
        g.fillRect(Math.round(bx - radius), Math.round(by - radius), radius * 2, radius * 2);
      }
      const surfaceGlow = g.createLinearGradient(0, GROUND - 22, 0, GROUND + 34);
      surfaceGlow.addColorStop(0, 'rgba(255,120,25,0)');
      surfaceGlow.addColorStop(0.55, 'rgba(255,110,20,0.18)');
      surfaceGlow.addColorStop(1, 'rgba(255,45,15,0)');
      g.globalAlpha = 1; g.fillStyle = surfaceGlow;
      g.fillRect(visibleX, GROUND - 22, Math.max(0, visibleRight - visibleX), 56);
      g.restore();

      // Small rock lips connect terrain edges without drawing across the lava.
      g.fillStyle = '#5a3025';
      g.fillRect(gx - 6, GROUND - 4, 10, 9);
      g.fillRect(gx + gap.w - 4, GROUND - 4, 10, 9);
      g.fillStyle = '#b25b31';
      g.fillRect(gx - 4, GROUND - 4, 7, 3);
      g.fillRect(gx + gap.w - 3, GROUND - 4, 7, 3);
    }

    // Energy walls are readable: warning sparks precede every lethal beam.
    for (const laser of energyLasers) {
      const platform = platformForX(laser.platformX);
      if (!platform || platform.dead) continue;
      const lx = laser.x - camX;
      if (lx < -40 || lx > VW + 40) continue;
      const state = laserState(laser);
      if (state.warning && !state.active) {
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.55 + Math.sin(hazardTime * 22) * 0.25;
        g.fillStyle = '#68efff'; g.fillRect(lx - 3, 12, 6, platform.y - 12); g.restore();
      }
      if (state.active) {
        g.save(); g.globalCompositeOperation = 'lighter';
        g.fillStyle = 'rgba(70,220,255,0.3)'; g.fillRect(lx - 14, 0, 28, platform.y);
        g.fillStyle = '#58eaff'; g.fillRect(lx - 6, 0, 12, platform.y);
        g.fillStyle = '#ffffff'; g.fillRect(lx - 2, 0, 4, platform.y);
        g.globalAlpha = 0.45; g.fillStyle = '#8ff8ff';
        g.beginPath(); g.arc(lx, platform.y, 24 + Math.sin(hazardTime * 18) * 5, 0, Math.PI * 2); g.fill();
        g.restore();
      }
    }

    // Optional time-rift door leading to the orbital platform challenge.
    const portalScreenX = PORTAL_X - camX;
    if (portalScreenX > -100 && portalScreenX < VW + 100) {
      g.save();
      const portalPulse = 0.55 + Math.sin(G.time * 7) * 0.2;
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = portalPulse * 0.45; g.fillStyle = '#58eaff';
      g.beginPath(); g.ellipse(portalScreenX, GROUND - 34, 37, 51, 0, 0, Math.PI * 2); g.fill();
      for (let ring = 0; ring < 3; ring++) {
        g.globalAlpha = (0.35 - ring * 0.08) * portalPulse;
        g.strokeStyle = ring % 2 ? '#b56cff' : '#68efff'; g.lineWidth = 2;
        g.beginPath(); g.ellipse(portalScreenX, GROUND - 34,
          38 + ring * 8 + Math.sin(G.time * 4 + ring) * 3,
          50 + ring * 9, 0, 0, Math.PI * 2); g.stroke();
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      if (imageReady(portalDoorImage)) {
        g.shadowColor = '#58eaff'; g.shadowBlur = 18 + portalPulse * 12;
        g.drawImage(portalDoorImage, portalScreenX - 32, GROUND - 64, 64, 64);
        g.shadowBlur = 0;
      }
      // Bouncing pixel arrow and localized label make the optional route clear.
      const arrowY = GROUND - 91 + Math.sin(G.time * 6) * 5;
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      g.fillStyle = '#000';
      g.beginPath(); g.moveTo(portalScreenX - 11, arrowY - 18); g.lineTo(portalScreenX + 11, arrowY - 18);
      g.lineTo(portalScreenX, arrowY); g.closePath(); g.fill();
      g.fillStyle = '#ffe45f';
      g.beginPath(); g.moveTo(portalScreenX - 8, arrowY - 16); g.lineTo(portalScreenX + 8, arrowY - 16);
      g.lineTo(portalScreenX, arrowY - 3); g.closePath(); g.fill();
      g.font = 'bold 11px "Courier New", monospace'; g.textAlign = 'center';
      g.fillStyle = '#000'; g.fillText(I18n.t('portal.label'), portalScreenX + 2, arrowY - 25 + 2);
      g.fillStyle = '#d9f8ff'; g.fillText(I18n.t('portal.label'), portalScreenX, arrowY - 25);
      g.restore();
    }

    // floating platforms
    for (const pl of platforms) {
      if (pl.dead) continue;
      const px = pl.x - camX;
      if (px + pl.w < -20 || px > VW + 20) continue;
      const platformImage = pl.fragile && imageReady(fragilePlatformImage) ?
        fragilePlatformImage : floatingPlatformImage;
      if (imageReady(platformImage)) {
        g.save(); g.imageSmoothingEnabled = false;
        if (pl.triggered && Math.floor(pl.breakT * 12) % 2 === 0) {
          g.globalAlpha = 0.48;
          g.translate((Math.random() - 0.5) * 3, 0);
        }
        g.drawImage(platformImage, Math.round(px), Math.round(pl.y), pl.w, pl.fragile ? 12 : 11);
        if (pl.fragile) {
          g.globalAlpha = 0.8; g.fillStyle = pl.triggered ? '#ff4d45' : '#ffb347';
          const ratio = pl.triggered ? Math.max(0, pl.breakT / 1.45) : 1;
          g.fillRect(Math.round(px), Math.round(pl.y + 12), pl.w * ratio, 2);
        }
        g.restore();
      } else {
        g.fillStyle = '#6a5a3c'; g.fillRect(px, pl.y, pl.w, 12);
        g.fillStyle = '#c38a4a'; g.fillRect(px, pl.y, pl.w, 3);
      }
      // Heat shimmer beneath the anti-gravity platform.
      g.save(); g.globalAlpha = 0.18 + Math.sin(pl.phase + pl.y) * 0.05;
      g.fillStyle = '#68efff'; g.fillRect(px + pl.w * 0.2, pl.y + 12, pl.w * 0.6, 2); g.restore();
    }
  }

  window.Level = {
    W: W,
    GROUND: GROUND,
    platforms: platforms,
    spawns: spawns,
    BOSS_TRIGGER_X: BOSS_TRIGGER_X,
    PORTAL_X: PORTAL_X,
    BOSS_X: BOSS_X,
    slugSpawns: slugSpawns,
    props: props,
    highPickups: highPickups,
    duneSpec: DUNE_SPEC,
    mountainSpec: MOUNTAIN_SPEC,
    skySpec: SKY_SPEC,
    groundSpec: Object.freeze({
      moduleWidth: GROUND_MODULE_W,
      moduleHeight: GROUND_MODULE_H,
      moduleCount: groundModuleSequence.length,
      sequence: groundModuleSequence.slice(),
    }),
    nightAmount: nightAmount,
    lavaGaps: lavaGaps,
    energyLasers: energyLasers,
    isLavaGap: isLavaGap,
    updateHazards: updateHazards,
    playerTouchesLaser: playerTouchesLaser,
    resetPlatforms: resetPlatforms,
    updatePlatforms: updatePlatforms,
    drawBackground: drawBackground,
    drawGround: drawGround,
  };
})();
