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
  const enemyShip01Image = new Image();
  enemyShip01Image.decoding = 'async';
  enemyShip01Image.src = 'assets/vehicles/enemy_ship01/enemy_ship01.png';
  const bigShip03Image = new Image();
  bigShip03Image.decoding = 'async';
  bigShip03Image.src = 'assets/vehicles/ships/bigship03.png';
  const bigShip04Image = new Image();
  bigShip04Image.decoding = 'async';
  bigShip04Image.src = 'assets/vehicles/ships/bigship04.png';
  const PORTAL_X = 20750;
  // The first BigShip03 platform encounter is intentionally a little farther
  // from the starting skirmish so the player has more desert runway before the
  // large ship-platform climb begins.
  const BIG_SHIP03_X = 4040;
  const BIG_SHIP03_SHIFT = BIG_SHIP03_X - 3800;
  // BigShip04: floating ship after BigShip03, same scale as BigShip03.
  // Image 1408×737 at 0.96× scale → 1352×708, bottom on GROUND, centered at x=8500.
  const BIG_SHIP04_X = 8500;
  const BIG_SHIP04_SCALE = 0.96;
  const BIG_SHIP04_DW = Math.round(1408 * BIG_SHIP04_SCALE);
  const BIG_SHIP04_DH = Math.round(737 * BIG_SHIP04_SCALE);
  const BIG_SHIP04_BOTTOM = GROUND;
  const BIG_SHIP04_DRAWY = GROUND - BIG_SHIP04_DH;

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

    // Invisible playable surfaces extracted from assets/vehicles/ships/bigship03_refe.png
    // after drawing BigShip03 later in the level at scale 0.96 with its bottom on Level.GROUND.
    { x: 3589 + BIG_SHIP03_SHIFT, baseY: 26, y: 26, w: 524, amp: 0, speed: 0, phase: 0 },
    { x: 3369 + BIG_SHIP03_SHIFT, baseY: 166, y: 166, w: 335, amp: 0, speed: 0, phase: 0 },
    { x: 3802 + BIG_SHIP03_SHIFT, baseY: 167, y: 167, w: 342, amp: 0, speed: 0, phase: 0 },
    { x: 3624 + BIG_SHIP03_SHIFT, baseY: 257, y: 257, w: 505, amp: 0, speed: 0, phase: 0 },
    { x: 3332 + BIG_SHIP03_SHIFT, baseY: 348, y: 348, w: 854, amp: 0, speed: 0, phase: 0 },
    // Invisible playable surfaces extracted from bigship04_refe.png
    // Ship at 0.96× scale (matching BigShip03), bottom on GROUND, centered at x=8500.
    // Top deck (img y≈196): world y≈-49
    { x: 8013, baseY: -49, y: -49, w: 959, amp: 0, speed: 0, phase: 0 },
    // Mid deck (img y≈379): world y≈126
    { x: 8009, baseY: 126, y: 126, w: 299, amp: 0, speed: 0, phase: 0 },
    { x: 8353, baseY: 126, y: 126, w: 257, amp: 0, speed: 0, phase: 0 },
    { x: 8693, baseY: 126, y: 126, w: 225, amp: 0, speed: 0, phase: 0 },
    // Bottom deck (img y≈550): world y≈290
    { x: 8009, baseY: 290, y: 290, w: 889, amp: 0, speed: 0, phase: 0 },
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
    // BigShip03 ship-platform encounter: normal enemies only on the first three upper decks.
    { x: 3405 + BIG_SHIP03_SHIFT, y: 166, type: 'soldier' },
    { x: 3645 + BIG_SHIP03_SHIFT, y: 26, type: 'bazooka' },
    { x: 3865 + BIG_SHIP03_SHIFT, y: 167, type: 'grenadier' },
    { x: 4480, type: 'pickup', pickup: 'jetpack' },
    { x: 4550, type: 'knife' },
    { x: 4610, type: 'knife' },
    { x: 4780, type: 'tank' },
    { x: 4880, type: 'bazooka' },
    { x: 5050, type: 'pow' },
    { x: 5180, type: 'turret' },
    { x: 5250, type: 'soldier' },
    { x: 5330, type: 'soldier' },
    { x: 5350, type: 'gunship' }, // miniboss, delayed until after BigShip03 section
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
    // First spider tank encounter after BigShip04 section.
    { x: 7500, type: 'spider_tank' },
    // BigShip04 ship-platform encounter: enemies on the floating ship decks.
    { x: 8150, y: 290, type: 'soldier' },
    { x: 8400, y: 290, type: 'grenadier' },
    { x: 8650, y: 290, type: 'knife' },
    { x: 8200, y: 126, type: 'bazooka' },
    { x: 8500, y: 126, type: 'soldier' },
    { x: 8400, y: 126, type: 'turret' },
    { x: 8350, type: 'pickup', pickup: 'spread' },
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
    { x: 12820, type: 'soldier' },     { x: 12900, type: 'soldier' },
    // Mid-game spider tank encounter.
    { x: 13200, type: 'spider_tank' },
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
    // Late-mid spider tank encounter before the final push.
    { x: 17500, type: 'spider_tank' },

    // Longer late-game enemy territories with two extended calm pockets.
    { x: 18300, type: 'soldier' },
    { x: 18560, type: 'grenadier' },
    { x: 18820, type: 'knife' },
    { x: 19080, type: 'bazooka' },
    { x: 19340, type: 'soldier' },
    { x: 19600, type: 'heli' },
    { x: 19860, type: 'turret' },
    { x: 20120, type: 'tank' },
    { x: 20800, type: 'spider_tank' },
    { x: 21160, type: 'bazooka' },
    { x: 21420, type: 'soldier' },
    { x: 21680, type: 'heli' },
    { x: 21940, type: 'turret' },
    { x: 22200, type: 'tank' },
    { x: 22800, type: 'spider_tank' },
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
  const slugSpawns = [
    { x: 2250, type: 'ally_tank03' },
    { x: 5480, type: 'ally_tank02' },
    8650, 14520, 22600
  ];

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
    { x: 11040, w: 310 }, { x: 12110, w: 310 },
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

  // Pixel-art lava: offscreen buffer at low resolution, scaled up for retro look.
  const LAVA_BUF_W = 160, LAVA_BUF_H = 28;
  const _lavaBuf = document.createElement('canvas');
  _lavaBuf.width = LAVA_BUF_W; _lavaBuf.height = LAVA_BUF_H;
  const _lavaCtx = _lavaBuf.getContext('2d');
  const _lavaColors = {
    deep: '#8b0000', dark: '#b22222', mid: '#cc3300', orange: '#e65c00',
    bright: '#ff8800', yellow: '#ffaa00', hot: '#ffcc00', white: '#ffee66'
  };
  const _lavaBubbles = Array.from({length: 14}, () => ({
    x: 5 + Math.random() * (LAVA_BUF_W - 10),
    y: 10 + Math.random() * 12,
    size: 1 + Math.floor(Math.random() * 2),
    speed: 0.15 + Math.random() * 0.2,
    wobble: Math.random() * Math.PI * 2,
    alive: true, popTimer: 0, maxPop: 6 + Math.floor(Math.random() * 6)
  }));
  const _lavaEmbers = Array.from({length: 14}, () => ({
    x: 3 + Math.random() * (LAVA_BUF_W - 6),
    y: 5 - Math.random() * 6,
    speed: 0.15 + Math.random() * 0.3,
    wobble: Math.random() * Math.PI * 2,
    life: Math.random() * 60,
    maxLife: 30 + Math.random() * 50
  }));
  function _lavaSurfY(x, t) {
    return Math.floor(6 +
      Math.sin(x * 0.09 + t * 0.8) * 1.3 +
      Math.sin(x * 0.15 - t * 1.2) * 0.6 +
      Math.sin(x * 0.045 + t * 0.4) * 1.0);
  }
  function _lavaPx(x, y, color) {
    if (x >= 0 && x < LAVA_BUF_W && y >= 0 && y < LAVA_BUF_H) {
      _lavaCtx.fillStyle = color;
      _lavaCtx.fillRect(x, y, 1, 1);
    }
  }
  function _lavaNoise(x, y, s) {
    return Math.abs(Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453 % 1);
  }

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
    // Opening BigShip03 deck caches (shifted with the ship art/platforms).
    { x:3440 + BIG_SHIP03_SHIFT, y:140, type:'mg' },
    { x:3680 + BIG_SHIP03_SHIFT, y:2, type:'homing' },
    { x:4000 + BIG_SHIP03_SHIFT, y:142, type:'grenades' },
    { x:4145 + BIG_SHIP03_SHIFT, y:322, type:'grenades' },

    // BigShip04 floating ship caches.
    { x:8450, y:100, type:'mg' },
    { x:8550, y:100, type:'homing' },
    { x:8320, y:260, type:'homing' },

    // Main path platforms now carry most of the visible rewards; ground props
    // are less loot-heavy so climbing feels valuable.
    { x:1220, y:360, type:'grenades' },
    { x:2080, y:318, type:'spread' },
    { x:3488, y:374, type:'grenades' },
    { x:4215, y:288, type:'rocket' },
    { x:5700, y:350, type:'grenades' },
    { x:6135, y:274, type:'homing' },

    { x:7238, y:360, type:'mg' },
    { x:7568, y:268, type:'grenades' },
    { x:8368, y:250, type:'homing' },
    { x:9205, y:298, type:'flame' },
    { x:9668, y:230, type:'homing' },

    { x:11135, y:330, type:'grenades' },
    { x:11582, y:220, type:'grenades' },
    { x:12652, y:198, type:'homing' },
    { x:13662, y:218, type:'homing' },
    { x:14395, y:248, type:'grenades' },
    { x:15732, y:193, type:'grenades' },
    { x:16472, y:278, type:'rocket' },

    { x:18495, y:318, type:'grenades' },
    { x:19090, y:208, type:'homing' },
    { x:20292, y:315, type:'homing' },
    { x:20900, y:208, type:'grenades' },
    { x:22398, y:262, type:'flame' },
    { x:23895, y:318, type:'grenades' },
    { x:24490, y:208, type:'homing' },
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
    drawIntroEnemyShip(g, camX, time, VW);
    drawDuneLayer(g, camX, VW);

    // A single atmospheric grade unifies transparent cloud, mountain, and dune
    // modules without generating tinted texture copies every frame.
    if (amount > 0) {
      g.save();
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = 'rgba(5, 14, 45,' + (amount * 0.56).toFixed(3) + ')';
      g.fillRect(0, 0, VW, GROUND + 60);
      g.restore();
    }
  }

  function drawIntroEnemyShip(g, camX, time, VW) {
    // Opening vista: the enemy ship starts mostly hidden by the nearest dunes,
    // then rises slowly until it exits above the screen. Drawn before dunes so
    // the sand layer naturally occludes the lower hull.
    if (!imageReady(enemyShip01Image) || !window.G || G.state !== 'play' || G.mode !== 'arcade') return;
    const life = G.bannerT || 0;
    const duration = 42;
    if (life > duration) return;
    const t = Math.max(0, Math.min(1, life / duration));
    const rise = t * t * (3 - 2 * t); // slow reveal, steady climb, gentle exit
    const scale = 0.72;
    const sw = enemyShip01Image.naturalWidth || enemyShip01Image.width;
    const sh = enemyShip01Image.naturalHeight || enemyShip01Image.height;
    const dw = Math.round(sw * scale), dh = Math.round(sh * scale);
    const vibY = Math.cos(time * 47.0) * 1.15 + Math.sin(time * 83.0) * 0.55;
    // Opening UFO is anchored in world space and has no self/parallax horizontal
    // drift: it only rises upward. If the player runs away, the camera leaves it
    // behind instead of the ship following the player across the screen.
    const UFO_WORLD_X = 520;
    const sx = Math.round(UFO_WORLD_X - camX - dw / 2);
    const startY = 386;
    const endY = -dh - 90;
    const sy = Math.round(startY + (endY - startY) * rise + Math.sin(time * 0.35) * 3 + vibY);
    if (sx + dw < -80 || sx > VW + 80) return;
    g.save();
    g.imageSmoothingEnabled = false;
    g.globalAlpha = 0.92 * (life > duration - 5 ? Math.max(0, (duration - life) / 5) : 1);
    g.drawImage(enemyShip01Image, sx, sy, dw, dh);
    // Three failing reactor glows under the ship, still behind the dune layer.
    g.globalCompositeOperation = 'lighter';
    const reactorXs = [0.30, 0.47, 0.64];
    for (let r = 0; r < reactorXs.length; r++) {
      const rx = sx + dw * (reactorXs[r] + (r > 0 ? 0.045 : 0.0)) + Math.sin(time * 13 + r) * 1.4;
      const ry = sy + dh * (0.98 + (r === 0 ? 0.035 : 0.075));
      const flick = 0.78 + Math.sin(time * (9 + r * 2.7)) * 0.16 + Math.sin(time * 31 + r) * 0.06;
      const glow = g.createRadialGradient(rx, ry, 7, rx, ry, 106 * flick);
      glow.addColorStop(0, 'rgba(255,245,190,0.70)');
      glow.addColorStop(0.20, 'rgba(255,146,48,0.42)');
      glow.addColorStop(0.58, 'rgba(255,78,24,0.16)');
      glow.addColorStop(1, 'rgba(255,78,24,0)');
      g.globalAlpha = 0.75 * flick;
      g.fillStyle = glow;
      g.beginPath(); g.arc(rx, ry, 106 * flick, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.92 * flick;
      g.fillStyle = '#fff0a8';
      g.fillRect(Math.round(rx - 14), Math.round(ry - 4), 28, 8);
    }
    // Old-ship smoke puffs venting from damaged hull seams.
    g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 12; i++) {
      const baseX = sx + dw * (i % 2 ? 0.28 : 0.72);
      const baseY = sy + dh * (i % 3 ? 0.34 : 0.48);
      const drift = (time * (12 + i) + i * 23) % 120;
      const puff = 1 - drift / 120;
      g.globalAlpha = 0.10 * puff;
      g.fillStyle = i % 2 ? '#2f2d2a' : '#4a453d';
      g.beginPath();
      g.arc(baseX + Math.sin(time + i) * 10 - drift * 0.18, baseY - drift * 0.28, 10 + (1 - puff) * 18, 0, Math.PI * 2);
      g.fill();
    }
    // Heavy falling sand sheets from the lower hull, deterministic and allocation-free.
    for (let i = 0; i < 150; i++) {
      const seed = (i * 73) % 101;
      const px = sx + dw * (0.10 + ((seed % 89) / 89) * 0.80) + Math.sin(time * 2.0 + i) * (4 + (i % 5));
      const fall = ((time * (52 + (i % 7) * 9) + i * 19) % 300);
      const py = sy + dh * (0.50 + (i % 6) * 0.045) + fall;
      if (py > sy + dh * 0.60 && py < GROUND + 20) {
        g.globalAlpha = 0.16 + (i % 6) * 0.035;
        g.fillStyle = i % 4 ? '#d39a5a' : '#ffd18a';
        g.fillRect(Math.round(px), Math.round(py), 1 + (i % 3 === 0 ? 2 : 0), 4 + (i % 8));
      }
    }
    g.restore();
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
      GROUND - tileH + 55, VW);
  }

  function drawBigShip03Decor(g, camX, VW) {
    if (!imageReady(bigShip03Image)) return;
    if(window.G && G.state !== 'play') return;
    const worldX = BIG_SHIP03_X;
    const screenX = Math.round(worldX - camX);
    const scale = 0.96;
    const iw = bigShip03Image.naturalWidth || bigShip03Image.width;
    const ih = bigShip03Image.naturalHeight || bigShip03Image.height;
    const dw = Math.round(iw * scale), dh = Math.round(ih * scale);
    const sx = screenX - Math.round(dw / 2);
    const sy = GROUND - dh;
    if (sx + dw < -120 || sx > VW + 120) return;
    g.save();
    g.imageSmoothingEnabled = false;
    g.globalAlpha = 0.94;
    g.drawImage(bigShip03Image, sx, sy, dw, dh);
    // Subtle platform readability: glint along the main lower ship deck.
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.08 + Math.sin(((window.G&&G.time)||0) * 2.4) * 0.025;
    g.fillStyle = '#68efff';
    g.fillRect(Math.round(screenX - 468), 348, 854, 2);
    const t = (window.G&&G.time)||0;

    // Two right-end reactor nozzles extracted from bigship03.png pixel structure:
    // Upper nozzle opening: y 0.381–0.486, exit plane at x≈0.988, center y≈0.446
    // Lower nozzle opening: y 0.661–0.764, exit plane at x≈0.988, center y≈0.726
    // Gap 0.49–0.65 is hull body extending only to x≈0.957 (no nozzle).
    const rightReactors = [
      { x:0.988, y:0.446, s:1.4, phase:0.0, w:26 },
      { x:0.988, y:0.726, s:1.3, phase:1.5, w:24 },
    ];
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < rightReactors.length; i++) {
      const r = rightReactors[i];
      const rx = sx + dw * r.x;
      const ry = sy + dh * r.y;
      const flick = 0.72 + Math.sin(t * 9.0 + r.phase) * 0.18 + Math.sin(t * 31.0 + i) * 0.08;
      const flameLen = (72 + Math.sin(t * 5.5 + i) * 16) * r.s * flick;
      const flameW = r.w * r.s * (0.85 + flick * 0.35);

      // Outer glow halo behind flame
      g.globalAlpha = 0.18 * flick;
      g.fillStyle = 'rgba(255,140,40,1)';
      g.beginPath();
      g.arc(rx + flameLen * 0.25, ry, flameW * 1.8, 0, Math.PI * 2);
      g.fill();

      // Main flame body
      const flame = g.createLinearGradient(rx - 4, ry, rx + flameLen, ry);
      flame.addColorStop(0, 'rgba(255,255,220,0.95)');
      flame.addColorStop(0.15, 'rgba(255,230,120,0.88)');
      flame.addColorStop(0.35, 'rgba(255,180,50,0.72)');
      flame.addColorStop(0.60, 'rgba(255,80,20,0.48)');
      flame.addColorStop(1, 'rgba(100,12,6,0)');
      g.globalAlpha = 0.85;
      g.fillStyle = flame;
      g.beginPath();
      g.moveTo(rx - 3, ry - flameW * 0.48);
      g.bezierCurveTo(rx + flameLen * 0.25, ry - flameW * 1.30, rx + flameLen * 0.65, ry - flameW * 0.55, rx + flameLen, ry);
      g.bezierCurveTo(rx + flameLen * 0.65, ry + flameW * 0.58, rx + flameLen * 0.22, ry + flameW * 1.20, rx - 3, ry + flameW * 0.48);
      g.closePath();
      g.fill();

      // Inner hot core
      g.globalAlpha = 0.70;
      const core = g.createLinearGradient(rx - 2, ry, rx + flameLen * 0.55, ry);
      core.addColorStop(0, 'rgba(255,255,255,0.95)');
      core.addColorStop(0.3, 'rgba(255,248,200,0.75)');
      core.addColorStop(0.7, 'rgba(255,200,80,0.30)');
      core.addColorStop(1, 'rgba(255,100,20,0)');
      g.fillStyle = core;
      g.beginPath();
      g.moveTo(rx - 1, ry - flameW * 0.22);
      g.bezierCurveTo(rx + flameLen * 0.18, ry - flameW * 0.60, rx + flameLen * 0.42, ry - flameW * 0.28, rx + flameLen * 0.55, ry);
      g.bezierCurveTo(rx + flameLen * 0.42, ry + flameW * 0.30, rx + flameLen * 0.16, ry + flameW * 0.58, rx - 1, ry + flameW * 0.22);
      g.closePath();
      g.fill();

      // White-hot nozzle-exit bar
      g.globalAlpha = 0.95;
      g.fillStyle = '#fff8d0';
      g.fillRect(Math.round(rx - 3), Math.round(ry - 3), Math.round(flameLen * 0.28), 6);
    }

    // Dense oily black crash smoke — two strong sources at the reactor nozzles,
    // then progressively weaker sources along the ship hull toward the left.
    g.globalCompositeOperation = 'source-over';
    const smokeSources = [
      { x:0.975, y:0.446, strength:2.0, drift:1.5 },
      { x:0.975, y:0.726, strength:1.9, drift:1.4 },
      { x:0.82, y:0.48, strength:1.3, drift:1.1 },
      { x:0.68, y:0.35, strength:1.1, drift:0.95 },
      { x:0.52, y:0.62, strength:1.2, drift:1.0 },
      { x:0.35, y:0.40, strength:1.15, drift:0.95 },
    ];
    for (let sIdx = 0; sIdx < smokeSources.length; sIdx++) {
      const src = smokeSources[sIdx];
      const count = sIdx < 2 ? 14 : 9;
      const baseX = sx + dw * src.x;
      const baseY = sy + dh * src.y;
      for (let i = 0; i < count; i++) {
        const drift = (t * (10 + sIdx * 0.7) + i * 13 + sIdx * 19) % 180;
        const puff = 1 - drift / 180;
        const wobble = Math.sin(t * 0.9 + i * 1.5 + sIdx) * (6 + i % 4);
        g.globalAlpha = (0.18 + src.strength * 0.08) * puff;
        g.fillStyle = i % 3 === 0 ? '#030304' : i % 2 ? '#0d0d12' : '#17100e';
        g.beginPath();
        g.arc(
          baseX + drift * (0.4 + src.drift * 0.3) + wobble,
          baseY - drift * (0.2 + src.drift * 0.15),
          (12 + (1 - puff) * 32 + (i % 4) * 3) * src.strength,
          0, Math.PI * 2
        );
        g.fill();
        if (i % 2 === 0) {
          g.globalAlpha *= 0.6;
          g.fillStyle = '#050507';
          g.beginPath();
          g.arc(baseX + drift * 0.5 + wobble - 8, baseY - drift * 0.28 - 5,
            (9 + (1 - puff) * 18) * src.strength, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
    g.globalAlpha=1;
    g.restore();
  }

  function drawBigShip04Decor(g, camX, VW) {
    if (!imageReady(bigShip04Image)) return;
    if(window.G && G.state !== 'play') return;
    const worldX = BIG_SHIP04_X;
    const screenX = Math.round(worldX - camX);
    const dw = BIG_SHIP04_DW, dh = BIG_SHIP04_DH;
    const sx = screenX - Math.round(dw / 2);
    const sy = BIG_SHIP04_DRAWY;
    if (sx + dw < -120 || sx > VW + 120) return;
    g.save();
    g.imageSmoothingEnabled = false;
    g.globalAlpha = 0.94;
    g.drawImage(bigShip04Image, sx, sy, dw, dh);

    const t = (window.G&&G.time)||0;

    // Two left-side reactor nozzles (rear of the ship, exhaust blows left).
    // Estimated from bigship04.png pixel structure: left edge at x≈0.02,
    // upper nozzle center y≈0.47, lower nozzle center y≈0.75.
    const leftReactors = [
      { x:0.00, y:0.365, s:1.3, phase:0.0, w:22 },
      { x:0.00, y:0.659, s:1.2, phase:1.7, w:20 },
    ];
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < leftReactors.length; i++) {
      const r = leftReactors[i];
      const rx = sx + dw * r.x;
      const ry = sy + dh * r.y;
      const flick = 0.72 + Math.sin(t * 9.0 + r.phase) * 0.18 + Math.sin(t * 31.0 + i) * 0.08;
      const flameLen = (58 + Math.sin(t * 5.5 + i) * 14) * r.s * flick;
      const flameW = r.w * r.s * (0.85 + flick * 0.35);

      // Outer glow halo
      g.globalAlpha = 0.18 * flick;
      g.fillStyle = 'rgba(255,140,40,1)';
      g.beginPath();
      g.arc(rx - flameLen * 0.25, ry, flameW * 1.8, 0, Math.PI * 2);
      g.fill();

      // Main flame body (blowing LEFT)
      const flame = g.createLinearGradient(rx + 4, ry, rx - flameLen, ry);
      flame.addColorStop(0, 'rgba(255,255,220,0.95)');
      flame.addColorStop(0.15, 'rgba(255,230,120,0.88)');
      flame.addColorStop(0.35, 'rgba(255,180,50,0.72)');
      flame.addColorStop(0.60, 'rgba(255,80,20,0.48)');
      flame.addColorStop(1, 'rgba(100,12,6,0)');
      g.globalAlpha = 0.85;
      g.fillStyle = flame;
      g.beginPath();
      g.moveTo(rx + 3, ry - flameW * 0.48);
      g.bezierCurveTo(rx - flameLen * 0.25, ry - flameW * 1.30, rx - flameLen * 0.65, ry - flameW * 0.55, rx - flameLen, ry);
      g.bezierCurveTo(rx - flameLen * 0.65, ry + flameW * 0.58, rx - flameLen * 0.22, ry + flameW * 1.20, rx + 3, ry + flameW * 0.48);
      g.closePath();
      g.fill();

      // Inner hot core
      g.globalAlpha = 0.70;
      const core = g.createLinearGradient(rx + 2, ry, rx - flameLen * 0.55, ry);
      core.addColorStop(0, 'rgba(255,255,255,0.95)');
      core.addColorStop(0.3, 'rgba(255,248,200,0.75)');
      core.addColorStop(0.7, 'rgba(255,200,80,0.30)');
      core.addColorStop(1, 'rgba(255,100,20,0)');
      g.fillStyle = core;
      g.beginPath();
      g.moveTo(rx + 1, ry - flameW * 0.22);
      g.bezierCurveTo(rx - flameLen * 0.18, ry - flameW * 0.60, rx - flameLen * 0.42, ry - flameW * 0.28, rx - flameLen * 0.55, ry);
      g.bezierCurveTo(rx - flameLen * 0.42, ry + flameW * 0.30, rx - flameLen * 0.16, ry + flameW * 0.58, rx + 1, ry + flameW * 0.22);
      g.closePath();
      g.fill();

      // White-hot nozzle-exit bar
      g.globalAlpha = 0.95;
      g.fillStyle = '#fff8d0';
      g.fillRect(Math.round(rx - Math.round(flameLen * 0.28)), Math.round(ry - 3), Math.round(flameLen * 0.28), 6);
    }

    // Black crash smoke — sources at reactor nozzles and along hull toward right.
    g.globalCompositeOperation = 'source-over';
    const smokeSources = [
      { x:0.03, y:0.47, strength:1.8, drift:-1.4 },
      { x:0.03, y:0.75, strength:1.7, drift:-1.3 },
      { x:0.18, y:0.50, strength:1.1, drift:-1.0 },
      { x:0.35, y:0.38, strength:1.0, drift:-0.9 },
      { x:0.50, y:0.60, strength:1.05, drift:-0.95 },
      { x:0.68, y:0.42, strength:0.95, drift:-0.85 },
    ];
    for (let sIdx = 0; sIdx < smokeSources.length; sIdx++) {
      const src = smokeSources[sIdx];
      const count = sIdx < 2 ? 14 : 9;
      const baseX = sx + dw * src.x;
      const baseY = sy + dh * src.y;
      for (let i = 0; i < count; i++) {
        const drift = (t * (10 + sIdx * 0.7) + i * 13 + sIdx * 19) % 180;
        const puff = 1 - drift / 180;
        const wobble = Math.sin(t * 0.9 + i * 1.5 + sIdx) * (6 + i % 4);
        g.globalAlpha = (0.18 + src.strength * 0.08) * puff;
        g.fillStyle = i % 3 === 0 ? '#030304' : i % 2 ? '#0d0d12' : '#17100e';
        g.beginPath();
        g.arc(
          baseX + drift * (0.4 + src.drift * 0.3) + wobble,
          baseY - drift * (0.2 + src.drift * 0.15),
          (10 + (1 - puff) * 26 + (i % 4) * 3) * src.strength,
          0, Math.PI * 2
        );
        g.fill();
        if (i % 2 === 0) {
          g.globalAlpha *= 0.6;
          g.fillStyle = '#050507';
          g.beginPath();
          g.arc(baseX + drift * 0.5 + wobble - 6, baseY - drift * 0.28 - 4,
            (7 + (1 - puff) * 14) * src.strength, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
    g.globalAlpha=1;
    g.restore();
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
    // Supplied palm/cactus PNGs and large ship decor occupy this layer, behind
    // gameplay entities but in front of the dune panorama.
    drawBigShip03Decor(g, camX, VW);
    drawBigShip04Decor(g, camX, VW);
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

    // Pixel-art lava: each gap renders a low-res buffer scaled up for a retro look.
    for (const gap of lavaGaps) {
      const gx = gap.x - camX;
      if (gx + gap.w < 0 || gx > VW) continue;
      const visibleX = Math.max(0, gx), visibleRight = Math.min(VW, gx + gap.w);
      const visibleW = Math.max(0, visibleRight - visibleX);
      const gapW = Math.max(1, gap.w);
      const lavaTime = hazardTime * 0.54 + gap.x * 0.0011;

      // Render lava into low-res buffer
      _lavaCtx.clearRect(0, 0, LAVA_BUF_W, LAVA_BUF_H);
      const C = _lavaColors;

      // Draw lava body pixel by pixel
      for (let x = 0; x < LAVA_BUF_W; x++) {
        const sy = _lavaSurfY(x, lavaTime);
        for (let y = sy; y < LAVA_BUF_H; y++) {
          const d = y - sy;
          const maxD = LAVA_BUF_H - sy;
          let color;
          if (d <= 1) {
            const s1 = Math.sin(x * 0.8 + lavaTime * 2.5) * 0.5 + 0.5;
            const s2 = Math.sin(x * 1.5 - lavaTime * 1.8) * 0.5 + 0.5;
            color = s1 > 0.7 && s2 > 0.5 ? C.white : s1 > 0.4 ? C.hot : C.yellow;
          } else if (d <= 3) {
            const v = Math.sin(x * 1.2 + lavaTime * 1.5 + y * 0.5);
            color = v > 0.5 ? C.hot : v > 0 ? C.yellow : C.bright;
          } else if (d <= 7) {
            const v = Math.sin(x * 0.9 + lavaTime + y * 0.3);
            const v2 = Math.sin(x * 1.8 - lavaTime * 0.7 + y * 0.6);
            color = v > 0.4 && v2 > 0.2 ? C.bright : v > 0 ? C.orange : C.mid;
          } else if (d <= 14) {
            const v = Math.sin(x * 0.7 + lavaTime * 0.6 + y * 0.4);
            color = v > 0.5 ? C.orange : v > 0 ? C.mid : C.dark;
          } else {
            const v = Math.sin(x * 0.5 + lavaTime * 0.3 + y * 0.2);
            color = v > 0.6 ? C.mid : v > 0.2 ? C.dark : C.deep;
          }
          // Flow streaks
          const f1 = Math.sin((x + y * 0.5) * 0.6 + lavaTime * 1.3);
          const f2 = Math.sin((x * 0.8 - y * 0.3) * 0.9 - lavaTime * 0.9);
          if (d > 3 && f1 > 0.7 && f2 > 0.3)
            color = d <= 7 ? C.yellow : d <= 14 ? C.bright : C.orange;
          // Texture noise
          if (_lavaNoise(x, y, Math.floor(lavaTime * 3)) > 0.92 && d > 2)
            color = d <= 7 ? C.mid : C.deep;
          _lavaPx(x, y, color);
        }
      }

      // Surface highlights
      for (let x = 0; x < LAVA_BUF_W; x++) {
        const sy = _lavaSurfY(x, lavaTime);
        const b = Math.sin(x * 1.1 + lavaTime * 2) * 0.5 + 0.5;
        if (b > 0.3) _lavaPx(x, sy, b > 0.7 ? C.white : C.hot);
        const crust = Math.sin(x * 2.3 + lavaTime * 0.5) * Math.cos(x * 1.7 - lavaTime * 0.3);
        if (crust > 0.6 && sy + 1 < LAVA_BUF_H) _lavaPx(x, sy + 1, C.orange);
      }

      // Bubbles
      for (const b of _lavaBubbles) {
        if (!b.alive) {
          if (b.popTimer < 4) {
            const bx = Math.floor(b.x), by = _lavaSurfY(bx, lavaTime);
            _lavaPx(bx - 1, by - 1 - b.popTimer, C.hot);
            _lavaPx(bx + 1, by - 1 - b.popTimer, C.yellow);
            if (b.popTimer < 2) _lavaPx(bx, by - 2 - b.popTimer, C.white);
          }
          continue;
        }
        const bx = Math.floor(b.x), by = Math.floor(b.y);
        const sy = _lavaSurfY(bx, lavaTime);
        if (by < sy) continue;
        const d = by - sy;
        const col = d < 3 ? '#ffdd44' : d < 8 ? C.bright : C.mid;
        if (b.size === 1) {
          _lavaPx(bx, by, col);
        } else {
          _lavaPx(bx, by, col); _lavaPx(bx + 1, by, col);
          _lavaPx(bx, by + 1, col); _lavaPx(bx + 1, by + 1, d < 3 ? C.hot : C.bright);
        }
      }

      // Embers
      for (const e of _lavaEmbers) {
        const px2 = Math.floor(e.x), py = Math.floor(e.y);
        if (py >= 0 && py < LAVA_BUF_H) {
          const r = e.life / e.maxLife;
          _lavaPx(px2, py, r < 0.3 ? C.white : r < 0.6 ? C.hot : C.orange);
        }
      }

      // Extra procedural rising embers for denser particle feel
      for (let i = 0; i < 10; i++) {
        const ephase = ((lavaTime * (0.18 + (i % 4) * 0.03) + i * 0.23) % 1);
        const ex = (i * 17 + Math.floor(lavaTime * 8 + i * 7)) % LAVA_BUF_W;
        const esy = _lavaSurfY(ex, lavaTime);
        const ey = esy - 1 - ephase * (LAVA_BUF_H - esy);
        if (ey >= 0 && ey < LAVA_BUF_H) {
          _lavaPx(ex, Math.floor(ey), ephase < 0.25 ? C.white : ephase < 0.5 ? C.hot : C.orange);
        }
      }

      // Scale buffer to fill the gap on the main canvas
      // Calculate source rect so only the visible portion of the buffer is drawn
      // (prevents accordion stretching when gap is partially off-screen)
      const srcX = (visibleX - gx) / gapW * LAVA_BUF_W;
      const srcW = visibleW / gapW * LAVA_BUF_W;
      g.save();
      g.beginPath();
      g.rect(visibleX, GROUND - 80, visibleW, VH - GROUND + 80);
      g.clip();
      g.imageSmoothingEnabled = false;
      g.drawImage(_lavaBuf, srcX, 0, srcW, LAVA_BUF_H,
        visibleX, GROUND - 8, visibleW, VH - GROUND + 8);

      // Amber glow above lava
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.14 + Math.max(0, Math.sin(lavaTime * 0.48)) * 0.10;
      const glow = g.createLinearGradient(0, GROUND - 60, 0, GROUND + 20);
      glow.addColorStop(0, 'rgba(255,92,20,0)');
      glow.addColorStop(0.55, 'rgba(255,116,24,0.18)');
      glow.addColorStop(1, 'rgba(255,200,80,0.08)');
      g.fillStyle = glow;
      g.fillRect(visibleX, GROUND - 60, visibleW, 80);

      // 1x1 pixel rising sparks above the lava surface
      const sparkCount = Math.max(14, Math.floor(visibleW / 10));
      for (let i = 0; i < sparkCount; i++) {
        const phase = ((lavaTime * (0.22 + (i % 5) * 0.025) + i * 0.137) % 1);
        const sx = visibleX + ((i * 29 + gap.x * 0.17) % visibleW);
        const sy = GROUND - 2 - phase * 52;
        g.globalAlpha = (1 - phase) * 0.85;
        g.fillStyle = i % 4 === 0 ? '#ffffff' : i % 3 === 0 ? '#ffee66' : i % 2 ? '#ffcc44' : '#ff8822';
        g.fillRect(Math.round(sx), Math.round(sy), 1, 1);
      }

      // Pulsing glow: visible rhythmic heat pulse over the entire lava body
      const pulsePhase = Math.sin(lavaTime * 1.8) * 0.5 + 0.5;
      g.save();
      g.beginPath();
      g.rect(visibleX, GROUND - 4, visibleW, VH - GROUND + 4);
      g.clip();
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 0.12 + pulsePhase * 0.22;
      const pulseGrad = g.createLinearGradient(0, GROUND - 4, 0, VH);
      pulseGrad.addColorStop(0, 'rgba(255,220,100,0.7)');
      pulseGrad.addColorStop(0.12, 'rgba(255,140,30,0.5)');
      pulseGrad.addColorStop(0.35, 'rgba(220,60,15,0.3)');
      pulseGrad.addColorStop(0.7, 'rgba(140,20,8,0.12)');
      pulseGrad.addColorStop(1, 'rgba(60,5,2,0)');
      g.fillStyle = pulseGrad;
      g.fillRect(visibleX, GROUND - 4, visibleW, VH - GROUND + 4);

      // Secondary shimmer: faster warm wobble at the surface
      g.globalAlpha = 0.08 + Math.sin(lavaTime * 3.2) * 0.08;
      const shimGrad = g.createLinearGradient(0, GROUND - 6, 0, GROUND + 24);
      shimGrad.addColorStop(0, 'rgba(255,255,200,0.6)');
      shimGrad.addColorStop(0.3, 'rgba(255,180,60,0.3)');
      shimGrad.addColorStop(1, 'rgba(180,40,10,0)');
      g.fillStyle = shimGrad;
      g.fillRect(visibleX, GROUND - 6, visibleW, 30);
      g.restore();

      g.restore();

      // Small warm rock lips at gap edges
      g.fillStyle = '#6b321f';
      g.fillRect(Math.round(gx - 8), GROUND - 5, 13, 10);
      g.fillRect(Math.round(gx + gap.w - 5), GROUND - 5, 13, 10);
      g.fillStyle = '#a34f2c';
      g.fillRect(Math.round(gx - 5), GROUND - 5, 9, 3);
      g.fillRect(Math.round(gx + gap.w - 4), GROUND - 5, 9, 3);
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.45;
      g.fillStyle = '#ff8b25';
      g.fillRect(Math.round(gx), GROUND - 2, 3, 6);
      g.fillRect(Math.round(gx + gap.w - 2), GROUND - 2, 3, 6);
      g.restore();
    }

    // Update lava bubbles and embers once per frame
    for (const b of _lavaBubbles) {
      if (!b.alive) {
        b.popTimer++;
        if (b.popTimer > b.maxPop) {
          b.x = 5 + Math.random() * (LAVA_BUF_W - 10);
          b.y = 12 + Math.random() * 10;
          b.alive = true; b.popTimer = 0;
        }
        continue;
      }
      b.y -= b.speed;
      b.wobble += 0.05 + Math.random() * 0.03;
      b.x += Math.sin(b.wobble) * 0.15;
      if (b.y <= _lavaSurfY(Math.floor(b.x), hazardTime * 0.54) + 1) {
        b.alive = false; b.popTimer = 0;
      }
    }
    for (const e of _lavaEmbers) {
      e.y -= e.speed * 0.3;
      e.wobble += 0.06;
      e.x += Math.sin(e.wobble) * 0.2;
      e.life++;
      if (e.life > e.maxLife) {
        e.x = 3 + Math.random() * (LAVA_BUF_W - 6);
        e.y = _lavaSurfY(Math.floor(e.x), hazardTime * 0.54) - 1;
        e.life = 0;
        e.maxLife = 30 + Math.random() * 50;
      }
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
      const portalPulse = Math.sin(G.time * 2.2) * 0.2 + 0.8;
      g.globalCompositeOperation = 'lighter';
      let grad = g.createRadialGradient(portalScreenX, GROUND - 34, 4, portalScreenX, GROUND - 34, 140);
      grad.addColorStop(0, '#fff8cc'); grad.addColorStop(0.2, '#68efff'); grad.addColorStop(0.45, '#2a9aff'); grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = 0.85 * portalPulse; g.fillStyle = grad; g.beginPath(); g.arc(portalScreenX, GROUND - 34, 140, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(portalScreenX, GROUND - 34, 4 + Math.sin(G.time * 6) * 1.2, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.55; g.strokeStyle = '#a0f0ff'; g.lineWidth = 2;
      g.beginPath(); g.arc(portalScreenX, GROUND - 34, 18 + Math.sin(G.time * 3) * 2, G.time * 1.2, G.time * 1.2 + Math.PI * 1.6); g.stroke();
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      if (imageReady(portalDoorImage)) {
        g.shadowColor = '#58eaff'; g.shadowBlur = 6 + portalPulse * 4;
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
      g.font = 'bold 7px "Press Start 2P", "Courier New", monospace'; g.textAlign = 'center';
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
