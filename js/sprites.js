// ============================================================
// SPRITES — pixel art generata da mappe di caratteri
// ============================================================
(function () {
  const SCALE = 3;

  function makeCanvas(rows, palette, scale) {
    scale = scale || SCALE;
    const h = rows.length;
    const w = Math.max(...rows.map(r => r.length));
    const c = document.createElement('canvas');
    c.width = w * scale; c.height = h * scale;
    const g = c.getContext('2d');
    for (let y = 0; y < h; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        g.fillStyle = palette[ch] || '#f0f';
        g.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    return c;
  }

  function flip(canvas) {
    const c = document.createElement('canvas');
    c.width = canvas.width; c.height = canvas.height;
    const g = c.getContext('2d');
    g.translate(c.width, 0);
    g.scale(-1, 1);
    g.drawImage(canvas, 0, 0);
    return c;
  }

  // versione bianca pre-renderizzata (flash quando colpiti, evita ctx.filter)
  function whiteOf(canvas) {
    const c = document.createElement('canvas');
    c.width = canvas.width; c.height = canvas.height;
    const g = c.getContext('2d');
    g.drawImage(canvas, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#fff';
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  function pair(rows, palette) {
    const r = makeCanvas(rows, palette);
    const l = flip(r);
    return { r: r, l: l, rw: whiteOf(r), lw: whiteOf(l), w: r.width, h: r.height };
  }

  // ---------------- palette ----------------
  const PLAYER_PAL = {
    r: '#c23b22', k: '#e8b486', e: '#26221c', u: '#5a7d3c', U: '#3e5a28',
    p: '#6f8a4a', b: '#4a3621', g: '#3a3a3f', G: '#9a9aa4', w: '#ffffff',
  };
  const ENEMY_PAL = {
    r: '#8a8d7a', k: '#dba275', e: '#26221c', u: '#a08a52', U: '#7a6739',
    p: '#8f7c4a', b: '#3f3221', g: '#3a3a3f', G: '#9a9aa4', w: '#ffffff',
  };
  // truppe d'élite (bazooka): uniforme cremisi, elmetto scuro
  const ELITE_PAL = {
    r: '#3a3a44', k: '#dba275', e: '#26221c', u: '#8a4a3a', U: '#63342a',
    p: '#7a4438', b: '#2f2418', g: '#3a3a3f', G: '#9a9aa4', w: '#ffffff',
  };
  const POW_PAL = {
    h: '#5a4630', k: '#e8b486', e: '#26221c', c: '#7a6248', R: '#caa86a',
  };

  // ---------------- corpo: torso (13 righe x 18 col) ----------------
  const TORSO_FWD = [
    '......rrrrr.......',
    '.....rrkkkkr......',
    '.....kkkkkkk......',
    '.....kkkekk.......',
    '......kkkkk.......',
    '.....uuuuuu.......',
    '....uuuuuuuu......',
    '....Uuuuuuukk.....',
    '....Uuuuuukkgggggg',
    '....Uuuuuuu.gGG...',
    '....uuuuuuu.......',
    '.....uuuuu........',
    '.....pppppp.......',
  ];
  const TORSO_UP = [
    '.........GG.......',
    '.........gg.......',
    '.........gg.......',
    '......rrrgg.......',
    '.....rrkkgg.......',
    '.....kkkkkk.......',
    '.....kkkekk.......',
    '.....uuuukk.......',
    '....uuuuuuk.......',
    '....Uuuuuu........',
    '....uuuuuuu.......',
    '.....uuuuu........',
    '.....pppppp.......',
  ];

  // ---------------- gambe (6 righe x 18 col) ----------------
  const LEGS_STAND = [
    '.....pp..pp.......',
    '.....pp..pp.......',
    '.....pp..pp.......',
    '.....pp..pp.......',
    '.....bb..bb.......',
    '....bbb..bbb......',
  ];
  const LEGS_RUN0 = [
    '....pp....pp......',
    '....pp....pp......',
    '...pp......pp.....',
    '...pp......pp.....',
    '...bb......bb.....',
    '..bbb......bbb....',
  ];
  const LEGS_RUN1 = [
    '.....pp.pp........',
    '.....pp.pp........',
    '.....pppp.........',
    '......ppp.........',
    '......bb..........',
    '.....bbb..........',
  ];
  const LEGS_RUN2 = [
    '.....pp..pp.......',
    '....pp....pp......',
    '....pp....pp......',
    '....bb.....pp.....',
    '...bbb.....bb.....',
    '...........bbb....',
  ];
  const LEGS_JUMP = [
    '.....pp..pp.......',
    '.....pp..pp.......',
    '....pp....pp......',
    '....bb....bb......',
    '...bbb....bb......',
    '..........bbb.....',
  ];

  // ---------------- accovacciato (13 righe) ----------------
  const CROUCH = [
    '......rrrrr.......',
    '.....rrkkkkr......',
    '.....kkkkkkk......',
    '.....kkkekk.......',
    '.....uuuuuu.......',
    '....uuuuuuuukk....',
    '....Uuuuuukkgggggg',
    '....Uuuuuuu.gGG...',
    '....uuuuuuuu......',
    '....pppppppp......',
    '....pp....pp......',
    '....bb....bb......',
    '...bbb....bbb.....',
  ];

  // ---------------- POW ----------------
  const POW_TIED = [
    '......hhhh........',
    '.....hkkkkh.......',
    '.....kkekek.......',
    '......kkkk........',
    '.....cccccc.......',
    '....ccRRRRcc......',
    '....ccRRRRcc......',
    '....cccccc........',
    '.....cccc.........',
    '....cc..cc........',
    '....cc..cc........',
    '...ccc..ccc.......',
  ];
  const POW_FREE = [
    '....kk....kk......',
    '....kkhhhhkk......',
    '.....hkkkkh.......',
    '....ckkekekc......',
    '....cckkkkcc......',
    '....cccccc........',
    '....cccccc........',
    '.....cccc.........',
    '....cc..cc........',
    '....cc..cc........',
    '...ccc..ccc.......',
  ];

  function buildBody(torso, legs, pal) {
    return pair(torso.concat(legs), pal);
  }

  function buildSet(pal) {
    return {
      idle: buildBody(TORSO_FWD, LEGS_STAND, pal),
      run: [
        buildBody(TORSO_FWD, LEGS_RUN0, pal),
        buildBody(TORSO_FWD, LEGS_RUN1, pal),
        buildBody(TORSO_FWD, LEGS_RUN2, pal),
        buildBody(TORSO_FWD, LEGS_RUN1, pal),
      ],
      runUp: [
        buildBody(TORSO_UP, LEGS_RUN0, pal),
        buildBody(TORSO_UP, LEGS_RUN1, pal),
        buildBody(TORSO_UP, LEGS_RUN2, pal),
        buildBody(TORSO_UP, LEGS_RUN1, pal),
      ],
      idleUp: buildBody(TORSO_UP, LEGS_STAND, pal),
      jump: buildBody(TORSO_FWD, LEGS_JUMP, pal),
      jumpUp: buildBody(TORSO_UP, LEGS_JUMP, pal),
      crouch: pair(CROUCH, pal),
    };
  }

  const Sprites = {
    scale: SCALE,
    player: buildSet(PLAYER_PAL), // generated fallback while PNG art is incomplete
    enemy: buildSet(ENEMY_PAL),
    elite: buildSet(ELITE_PAL),
    powTied: pair(POW_TIED, POW_PAL),
    powFree: pair(POW_FREE, POW_PAL),
  };

  // ---------------- direct PNG player pipeline ----------------
  // External frames are normalized to the same shape as generated sprites,
  // so gameplay code does not care where the art came from.
  const playerPng = {
    enabled: false,
    total: 0,
    loaded: 0,
    failed: 0,
    settled: false,
    activeCharacter: 'juan_p',
    characters: {},
  };

  function canvasOfImage(img, frameRect) {
    const sourceWidth = img.naturalWidth || img.width;
    const sourceHeight = img.naturalHeight || img.height;
    const rect = frameRect || { x: 0, y: 0, w: sourceWidth, h: sourceHeight };
    const c = document.createElement('canvas');
    c.width = rect.w;
    c.height = rect.h;
    const cg = c.getContext('2d');
    cg.imageSmoothingEnabled = false;
    cg.clearRect(0, 0, rect.w, rect.h);
    cg.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    return c;
  }

  function pngPair(img, stateConfig, sourceFacesRight, frameRect) {
    const source = canvasOfImage(img, frameRect);
    const targetWidth = stateConfig.renderWidth || source.width;
    const targetHeight = stateConfig.renderHeight || source.height;
    let normalized = source;
    // High-resolution source art is normalized once at load time. This keeps
    // gameplay rendering and mirrored/flash caches small today, while changing
    // renderWidth/renderHeight later can restore native 200px presentation.
    if (targetWidth !== source.width || targetHeight !== source.height) {
      normalized = document.createElement('canvas');
      normalized.width = targetWidth;
      normalized.height = targetHeight;
      const ng = normalized.getContext('2d');
      ng.imageSmoothingEnabled = false;
      ng.clearRect(0, 0, targetWidth, targetHeight);
      ng.drawImage(source, 0, 0, source.width, source.height,
        0, 0, targetWidth, targetHeight);
    }
    const r = sourceFacesRight ? normalized : flip(normalized);
    const l = flip(r);
    return {
      r: r,
      l: l,
      rw: whiteOf(r),
      lw: whiteOf(l),
      w: targetWidth,
      h: targetHeight,
      anchorX: stateConfig.anchorX === undefined ? 0.5 : stateConfig.anchorX,
      anchorY: stateConfig.anchorY === undefined ? 1 : stateConfig.anchorY,
      sockets: stateConfig.sockets || null,
      external: true,
    };
  }

  function finishPlayerPngLoad() {
    if (playerPng.loaded + playerPng.failed < playerPng.total) return;
    playerPng.settled = true;
    window.dispatchEvent(new CustomEvent('player-assets-ready', {
      detail: Sprites.getPlayerAssetStatus(),
    }));
  }

  function loadPlayerPngs() {
    const config = window.CharacterAssetConfig;
    if (!config || config.enabled === false || !config.characters) {
      playerPng.settled = true;
      return;
    }

    playerPng.enabled = true;
    playerPng.activeCharacter = config.defaultCharacter || 'juan_p';

    Object.keys(config.characters).forEach(function (characterId) {
      const characterConfig = config.characters[characterId] || {};
      const characterRecord = { states: {}, portrait: null };
      playerPng.characters[characterId] = characterRecord;
      const basePath = characterConfig.basePath || '';
      const sourceFacesRight = characterConfig.faceRight !== false;

      if (characterConfig.portrait) {
        playerPng.total++;
        const portrait = new Image();
        portrait.decoding = 'async';
        portrait.onload = function () {
          if ((characterConfig.portraitWidth && portrait.naturalWidth !== characterConfig.portraitWidth) ||
              (characterConfig.portraitHeight && portrait.naturalHeight !== characterConfig.portraitHeight)) {
            console.warn('[Character portrait] Unexpected size for ' + characterConfig.portrait + ': ' +
              portrait.naturalWidth + 'x' + portrait.naturalHeight);
          }
          characterRecord.portrait = portrait;
          playerPng.loaded++;
          finishPlayerPngLoad();
        };
        portrait.onerror = function () { playerPng.failed++; finishPlayerPngLoad(); };
        portrait.src = basePath + characterConfig.portrait;
      }

      Object.keys(characterConfig.states || {}).forEach(function (stateName) {
        const stateConfig = characterConfig.states[stateName] || {};
        const file = stateConfig.sheet;
        const frameCount = Math.max(1, stateConfig.frameCount || 1);
        const record = {
          fps: stateConfig.fps || 1,
          loop: stateConfig.loop !== false,
          frames: new Array(frameCount),
          readyFrames: [],
        };
        characterRecord.states[stateName] = record;
        if (!file) return;
        playerPng.total++;

        const img = new Image();
        img.decoding = 'async';
        img.onload = function () {
          const expectedWidth = stateConfig.expectedSheetWidth;
          const expectedHeight = stateConfig.expectedSheetHeight;
          if ((expectedWidth && img.naturalWidth !== expectedWidth) ||
              (expectedHeight && img.naturalHeight !== expectedHeight)) {
            console.warn('[Character art] Unexpected size for ' + file + ': ' +
              img.naturalWidth + 'x' + img.naturalHeight + '. Expected ' +
              (expectedWidth || '*') + 'x' + (expectedHeight || '*') + '.');
          }
          const frameWidth = stateConfig.frameWidth || img.naturalWidth;
          const frameHeight = stateConfig.frameHeight || img.naturalHeight;
          const columns = stateConfig.columns || Math.max(1, Math.floor(img.naturalWidth / frameWidth));
          const rows = Math.max(1, Math.floor(img.naturalHeight / frameHeight));
          const count = Math.min(frameCount, columns * rows);
          if (count < frameCount) {
            console.warn('[Character art] Sheet ' + file + ' contains only ' + count +
              ' frame slots; ' + frameCount + ' were requested.');
          }
          for (let index = 0; index < count; index++) {
            const rect = {
              x: (index % columns) * frameWidth,
              y: Math.floor(index / columns) * frameHeight,
              w: frameWidth,
              h: frameHeight,
            };
            record.frames[index] = pngPair(img, stateConfig, sourceFacesRight, rect);
          }
          record.readyFrames = record.frames.filter(Boolean);
          playerPng.loaded++;
          finishPlayerPngLoad();
        };
        img.onerror = function () { playerPng.failed++; finishPlayerPngLoad(); };
        img.src = basePath + file;
      });
    });

    if (playerPng.total === 0) playerPng.settled = true;
  }

  function generatedPlayerFrame(stateName, fallbackIndex) {
    const set = Sprites.player;
    const state = set[stateName] || set.idle;
    if (Array.isArray(state)) return state[(fallbackIndex || 0) % state.length];
    return state;
  }

  function characterState(characterId, stateName) {
    const character = playerPng.characters[characterId];
    const state = character && character.states[stateName];
    if (state && state.readyFrames.length) return state;
    // Juan's delivered art is the first visual fallback for incomplete sets.
    const juan = playerPng.characters.juan_p;
    const fallback = juan && juan.states[stateName];
    return fallback && fallback.readyFrames.length ? fallback : null;
  }

  Sprites.setActiveCharacter = function (characterId) {
    if (playerPng.characters[characterId] || (window.Characters && Characters.isValid(characterId))) {
      playerPng.activeCharacter = characterId;
    }
    return playerPng.activeCharacter;
  };
  Sprites.getActiveCharacter = function () { return playerPng.activeCharacter; };

  Sprites.getCharacterFrame = function (characterId, stateName, time, fallbackIndex) {
    const state = characterState(characterId, stateName);
    if (state) {
      const raw = Math.floor(Math.max(0, time || 0) * state.fps);
      const index = state.loop ? raw % state.readyFrames.length :
        Math.min(raw, state.readyFrames.length - 1);
      return state.readyFrames[index];
    }
    if (stateName === 'dead') stateName = 'idle';
    return generatedPlayerFrame(stateName, fallbackIndex);
  };

  Sprites.getCharacterFrameAt = function (characterId, stateName, frameIndex, fallbackIndex) {
    const state = characterState(characterId, stateName);
    if (state) {
      const index = Math.max(0, Math.min(state.readyFrames.length - 1, frameIndex | 0));
      return state.readyFrames[index];
    }
    if (stateName === 'dead') stateName = 'idle';
    return generatedPlayerFrame(stateName, fallbackIndex);
  };

  Sprites.getCharacterPortrait = function (characterId) {
    const character = playerPng.characters[characterId];
    return character && character.portrait ? character.portrait : null;
  };

  Sprites.getPlayerFrame = function (stateName, time, fallbackIndex) {
    return Sprites.getCharacterFrame(playerPng.activeCharacter, stateName, time, fallbackIndex);
  };
  Sprites.getPlayerFrameAt = function (stateName, frameIndex, fallbackIndex) {
    return Sprites.getCharacterFrameAt(playerPng.activeCharacter, stateName, frameIndex, fallbackIndex);
  };

  Sprites.getPlayerSocket = function (stateName, socketName, facing) {
    const state = characterState(playerPng.activeCharacter, stateName);
    if (!state || !state.readyFrames.length) return null;
    const sockets = state.readyFrames[0].sockets;
    const socket = sockets && sockets[socketName];
    if (!socket) return null;
    return {
      x: (facing < 0 ? -1 : 1) * socket.x,
      y: socket.y,
      radius: socket.radius,
    };
  };

  Sprites.getPlayerAssetStatus = function () {
    return {
      enabled: playerPng.enabled,
      total: playerPng.total,
      loaded: playerPng.loaded,
      failed: playerPng.failed,
      settled: playerPng.settled,
      usingPng: playerPng.loaded > 0,
      activeCharacter: playerPng.activeCharacter,
      characters: Object.keys(playerPng.characters),
    };
  };

  // ---------------- direct PNG vehicle pipeline ----------------
  const vehiclePng = {
    enabled: false, total: 0, loaded: 0, failed: 0, settled: false, vehicles: {},
  };

  function finishVehiclePngLoad() {
    if (vehiclePng.loaded + vehiclePng.failed < vehiclePng.total) return;
    vehiclePng.settled = true;
    window.dispatchEvent(new CustomEvent('vehicle-assets-ready', {
      detail: Sprites.getVehicleAssetStatus(),
    }));
  }

  function loadVehiclePngs() {
    const config = window.VehicleAssetConfig;
    if (!config || config.enabled === false || !config.vehicles) {
      vehiclePng.settled = true;
      return;
    }
    vehiclePng.enabled = true;
    const root = config.basePath || '';

    Object.keys(config.vehicles).forEach(function (vehicleName) {
      const vehicleConfig = config.vehicles[vehicleName] || {};
      const sourceFacesRight = vehicleConfig.faceRight !== false;
      const basePath = root + (vehicleConfig.basePath || '');
      const vehicleRecord = { states: {} };
      vehiclePng.vehicles[vehicleName] = vehicleRecord;

      Object.keys(vehicleConfig.states || {}).forEach(function (stateName) {
        const stateConfig = vehicleConfig.states[stateName] || {};
        const file = stateConfig.sheet;
        const frameCount = Math.max(1, stateConfig.frameCount || 1);
        const record = {
          fps: stateConfig.fps || 1,
          loop: stateConfig.loop !== false,
          frames: new Array(frameCount),
          readyFrames: [],
        };
        vehicleRecord.states[stateName] = record;
        if (!file) return;
        vehiclePng.total++;

        const img = new Image();
        img.decoding = 'async';
        img.onload = function () {
          const expectedWidth = stateConfig.expectedSheetWidth;
          const expectedHeight = stateConfig.expectedSheetHeight;
          if ((expectedWidth && img.naturalWidth !== expectedWidth) ||
              (expectedHeight && img.naturalHeight !== expectedHeight)) {
            console.warn('[Vehicle art] Unexpected size for ' + file + ': ' +
              img.naturalWidth + 'x' + img.naturalHeight + '. Expected ' +
              (expectedWidth || '*') + 'x' + (expectedHeight || '*') + '.');
          }
          const frameWidth = stateConfig.frameWidth || img.naturalWidth;
          const frameHeight = stateConfig.frameHeight || img.naturalHeight;
          const columns = stateConfig.columns || Math.max(1, Math.floor(img.naturalWidth / frameWidth));
          const rows = Math.max(1, Math.floor(img.naturalHeight / frameHeight));
          const count = Math.min(frameCount, columns * rows);
          for (let index = 0; index < count; index++) {
            const rect = {
              x: (index % columns) * frameWidth,
              y: Math.floor(index / columns) * frameHeight,
              w: frameWidth,
              h: frameHeight,
            };
            record.frames[index] = pngPair(img, stateConfig, sourceFacesRight, rect);
          }
          record.readyFrames = record.frames.filter(Boolean);
          vehiclePng.loaded++;
          finishVehiclePngLoad();
        };
        img.onerror = function () {
          vehiclePng.failed++;
          finishVehiclePngLoad();
        };
        img.src = basePath + file;
      });
    });

    if (vehiclePng.total === 0) vehiclePng.settled = true;
  }

  function vehicleState(vehicleName, stateName) {
    const vehicle = vehiclePng.vehicles[vehicleName];
    if (!vehicle) return null;
    const requested = vehicle.states[stateName];
    if (requested && requested.readyFrames.length) return requested;
    const idle = vehicle.states.idle;
    return idle && idle.readyFrames.length ? idle : null;
  }

  Sprites.getVehicleFrame = function (vehicleName, stateName, time) {
    const state = vehicleState(vehicleName, stateName);
    if (!state) return null;
    const raw = Math.floor(Math.max(0, time || 0) * state.fps);
    const index = state.loop ? raw % state.readyFrames.length :
      Math.min(raw, state.readyFrames.length - 1);
    return state.readyFrames[index];
  };

  Sprites.getVehicleFrameAt = function (vehicleName, stateName, frameIndex) {
    const state = vehicleState(vehicleName, stateName);
    if (!state) return null;
    const index = Math.max(0, Math.min(state.readyFrames.length - 1, frameIndex | 0));
    return state.readyFrames[index];
  };

  Sprites.getVehicleSocket = function (vehicleName, stateName, socketName, facing) {
    const state = vehicleState(vehicleName, stateName);
    if (!state || !state.readyFrames.length) return null;
    const sockets = state.readyFrames[0].sockets;
    const socket = sockets && sockets[socketName];
    if (!socket) return null;
    return {
      x: (facing < 0 ? -1 : 1) * socket.x,
      y: socket.y,
      radius: socket.radius,
    };
  };

  Sprites.getVehicleAssetStatus = function () {
    return {
      enabled: vehiclePng.enabled,
      total: vehiclePng.total,
      loaded: vehiclePng.loaded,
      failed: vehiclePng.failed,
      settled: vehiclePng.settled,
      usingPng: vehiclePng.loaded > 0,
    };
  };

  loadPlayerPngs();
  loadVehiclePngs();

  // Draw a sprite with its foot/ground anchor at (x, y), facing 1 = right.
  // white = true: pre-rendered white hit-flash silhouette.
  Sprites.draw = function (g, spr, x, y, facing, alpha, white) {
    if (!spr) return;
    const img = white ? (facing < 0 ? spr.lw : spr.rw) : (facing < 0 ? spr.l : spr.r);
    const anchorX = facing < 0 ? 1 - (spr.anchorX === undefined ? 0.5 : spr.anchorX) :
      (spr.anchorX === undefined ? 0.5 : spr.anchorX);
    const anchorY = spr.anchorY === undefined ? 1 : spr.anchorY;
    const dx = Math.round(x - spr.w * anchorX);
    const dy = Math.round(y - spr.h * anchorY);
    if (alpha !== undefined && alpha < 1) {
      g.save(); g.globalAlpha = Math.max(0, alpha);
      g.drawImage(img, dx, dy, spr.w, spr.h);
      g.restore();
    } else {
      g.drawImage(img, dx, dy, spr.w, spr.h);
    }
  };

  // Rotated sprite (used for bodies thrown by an impact).
  Sprites.drawRotated = function (g, spr, x, y, facing, angle, alpha) {
    if (!spr) return;
    const img = facing < 0 ? spr.l : spr.r;
    g.save();
    g.globalAlpha = Math.max(0, alpha === undefined ? 1 : alpha);
    g.translate(x, y - spr.h / 2);
    g.rotate(angle);
    g.drawImage(img, -spr.w / 2, -spr.h / 2, spr.w, spr.h);
    g.restore();
  };

  // ============================================================
  // VEICOLI E BOSS — disegnati a rettangoli
  // ============================================================

  // Rocket surfboard used by the mission-entry sequence. The rider's feet
  // anchor around y-10; twin rear engines point opposite the facing direction.
  Sprites.drawRocketBoard = function (g, x, y, facing, phase, thrust) {
    g.save();
    g.translate(Math.round(x), Math.round(y));
    if (facing < 0) g.scale(-1, 1);
    const bob = Math.sin((phase || 0) * 8) * 2;
    g.translate(0, bob);

    // Twin animated exhaust plumes behind the board.
    const flame = 22 + (thrust || 0) * 20 + Math.sin((phase || 0) * 35) * 5;
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const ey of [-8, 5]) {
      const grad = g.createLinearGradient(-52 - flame, ey, -38, ey);
      grad.addColorStop(0, 'rgba(255,55,25,0)');
      grad.addColorStop(0.45, '#ff5a2d');
      grad.addColorStop(0.78, '#ffd45a');
      grad.addColorStop(1, '#ffffff');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(-42, ey - 4);
      g.lineTo(-52 - flame, ey);
      g.lineTo(-42, ey + 4);
      g.closePath();
      g.fill();
    }
    g.restore();

    // Rear rocket pods.
    g.fillStyle = '#343d47';
    g.fillRect(-48, -13, 19, 10);
    g.fillRect(-48, 1, 19, 10);
    g.fillStyle = '#9aa8b2';
    g.fillRect(-45, -11, 12, 6);
    g.fillRect(-45, 3, 12, 6);
    g.fillStyle = '#d94a36';
    g.fillRect(-51, -11, 5, 6);
    g.fillRect(-51, 3, 5, 6);

    // Surf deck: bright upper edge, armored underside and pointed nose.
    g.fillStyle = '#2e3944';
    g.beginPath();
    g.moveTo(-39, -2); g.lineTo(43, -2); g.lineTo(58, 3);
    g.lineTo(38, 10); g.lineTo(-43, 9); g.lineTo(-51, 4); g.closePath();
    g.fill();
    const deck = g.createLinearGradient(0, -8, 0, 8);
    deck.addColorStop(0, '#f4e4a0');
    deck.addColorStop(0.4, '#e4a13c');
    deck.addColorStop(1, '#9e4d2a');
    g.fillStyle = deck;
    g.beginPath();
    g.moveTo(-42, -6); g.lineTo(42, -6); g.lineTo(57, 0);
    g.lineTo(38, 4); g.lineTo(-43, 3); g.closePath();
    g.fill();
    g.fillStyle = '#fff1b5';
    g.fillRect(-30, -6, 60, 2);
    g.fillStyle = '#53d8e8';
    g.fillRect(-17, 5, 31, 3);
    // Small stabilizer fins.
    g.fillStyle = '#cf4938';
    g.beginPath(); g.moveTo(-29, 8); g.lineTo(-16, 8); g.lineTo(-24, 17); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(24, 7); g.lineTo(36, 7); g.lineTo(31, 14); g.closePath(); g.fill();
    g.restore();
  };

  // Tank nemico (~110x60), x,y = centro base
  Sprites.drawTank = function (g, x, y, facing, tread, flash) {
    g.save();
    g.translate(Math.round(x), Math.round(y));
    if (facing > 0) g.scale(-1, 1); // il tank di default guarda a sinistra
    const body = flash ? '#ffffff' : '#6e6a4e';
    const dark = flash ? '#f4f8ff' : '#4e4a36';
    // cingoli
    g.fillStyle = '#2e2c22';
    g.fillRect(-52, -18, 104, 18);
    g.fillStyle = '#4a4636';
    for (let i = 0; i < 9; i++) {
      const tx = -50 + ((i * 12 + Math.floor(tread)) % 100);
      g.fillRect(tx, -16, 6, 14);
    }
    // scafo
    g.fillStyle = body;
    g.fillRect(-50, -34, 100, 18);
    g.fillStyle = dark;
    g.fillRect(-50, -22, 100, 5);
    // torretta
    g.fillStyle = body;
    g.fillRect(-22, -52, 44, 20);
    g.fillStyle = dark;
    g.fillRect(-22, -38, 44, 4);
    // cannone (verso sinistra dopo lo scale)
    g.fillStyle = '#3a3830';
    g.fillRect(-72, -48, 52, 7);
    g.fillStyle = '#55524a';
    g.fillRect(-72, -48, 8, 7);
    // stella
    g.fillStyle = '#b03a2e';
    g.fillRect(-6, -31, 12, 10);
    g.restore();
  };

  // Elicottero (~120x50), x,y = centro
  Sprites.drawHeli = function (g, x, y, facing, rotorPhase, flash) {
    g.save();
    g.translate(Math.round(x), Math.round(y));
    if (facing > 0) g.scale(-1, 1);
    const body = flash ? '#ffffff' : '#5e6e4e';
    const dark = flash ? '#f4f8ff' : '#46523a';
    // coda
    g.fillStyle = dark;
    g.fillRect(18, -6, 50, 9);
    g.fillRect(60, -16, 8, 22);
    // fusoliera
    g.fillStyle = body;
    g.fillRect(-34, -16, 58, 30);
    g.fillStyle = dark;
    g.fillRect(-34, 6, 58, 8);
    // cabina
    g.fillStyle = '#9ad0e8';
    g.fillRect(-32, -12, 18, 14);
    // pattini
    g.fillStyle = '#33312a';
    g.fillRect(-30, 18, 50, 4);
    g.fillRect(-22, 14, 4, 6);
    g.fillRect(8, 14, 4, 6);
    // rotore
    g.fillStyle = '#23211c';
    g.fillRect(-4, -22, 6, 8);
    const sp = Math.sin(rotorPhase * 30);
    const len = 56 * Math.abs(sp) + 12;
    g.fillRect(-len, -24, len * 2, 4);
    // mitragliatrice frontale
    g.fillStyle = '#3a3830';
    g.fillRect(-46, 0, 14, 5);
    g.restore();
  };

  // Boss: fortezza corazzata (~240x150), x,y = centro base
  Sprites.drawBoss = function (g, x, y, facing, tread, flash, cannonRecoil) {
    g.save();
    g.translate(Math.round(x), Math.round(y));
    if (facing > 0) g.scale(-1, 1);
    const body = flash ? '#ffffff' : '#5c5a48';
    const dark = flash ? '#f4f8ff' : '#403e30';
    const accent = flash ? '#ffffff' : '#73705a';
    // cingoli giganti
    g.fillStyle = '#26241c';
    g.fillRect(-110, -30, 220, 30);
    g.fillStyle = '#3e3c2e';
    for (let i = 0; i < 16; i++) {
      const tx = -106 + ((i * 14 + Math.floor(tread)) % 212);
      g.fillRect(tx, -26, 8, 24);
    }
    // scafo principale
    g.fillStyle = body;
    g.fillRect(-105, -78, 210, 50);
    g.fillStyle = dark;
    g.fillRect(-105, -40, 210, 12);
    // piastre
    g.fillStyle = accent;
    for (let i = 0; i < 5; i++) g.fillRect(-95 + i * 42, -74, 30, 8);
    // torre superiore
    g.fillStyle = body;
    g.fillRect(-55, -118, 110, 42);
    g.fillStyle = dark;
    g.fillRect(-55, -84, 110, 8);
    // cannone principale (verso sinistra)
    const rec = cannonRecoil || 0;
    g.fillStyle = '#312f26';
    g.fillRect(-150 + rec, -108, 100, 14);
    g.fillStyle = '#4a4838';
    g.fillRect(-150 + rec, -108, 14, 14);
    // mitragliatrice secondaria
    g.fillStyle = '#312f26';
    g.fillRect(-128, -62, 30, 8);
    // teschio insegna
    g.fillStyle = '#ddd5c0';
    g.fillRect(-12, -110, 24, 18);
    g.fillStyle = '#26241c';
    g.fillRect(-8, -104, 6, 6);
    g.fillRect(2, -104, 6, 6);
    g.fillRect(-4, -96, 8, 3);
    g.restore();
  };

  // muro di sacchi di sabbia per le postazioni torretta
  Sprites.drawSandbags = function (g, x, y) {
    g.save();
    g.translate(Math.round(x), Math.round(y));
    const bag = (bx, by) => {
      g.fillStyle = '#b09a6a';
      g.fillRect(bx, by, 24, 11);
      g.fillStyle = '#8a7850';
      g.fillRect(bx, by + 8, 24, 3);
      g.fillRect(bx, by, 3, 11);
    };
    bag(-36, -11); bag(-12, -11); bag(12, -11);
    bag(-24, -21); bag(0, -21);
    bag(-12, -31);
    g.restore();
  };

  // cassa pickup con lettera
  Sprites.drawCrate = function (g, x, y, letter, color) {
    g.save();
    g.translate(Math.round(x), Math.round(y));
    g.fillStyle = '#7a5c34';
    g.fillRect(-13, -26, 26, 26);
    g.fillStyle = '#5e4626';
    g.fillRect(-13, -26, 26, 4);
    g.fillRect(-13, -4, 26, 4);
    g.fillStyle = color || '#fff';
    g.font = 'bold 16px "Courier New", monospace';
    g.textAlign = 'center';
    g.fillText(letter, 0, -8);
    g.restore();
  };

  // SLUG: carro alleato pilotabile (~76x50 + cannone), x,y = centro base
  // di default guarda a DESTRA (al contrario di drawTank)
  Sprites.drawSlug = function (g, x, y, facing, tread, flash, occupied, cannonRecoil) {
    g.save();
    g.translate(Math.round(x), Math.round(y));
    if (facing < 0) g.scale(-1, 1);
    const body = flash ? '#c8dca8' : '#5a7d3c';
    const dark = flash ? '#a8bc88' : '#3e5a28';
    const accent = flash ? '#d4e4b8' : '#6f8a4a';
    // cingoli tozzi
    g.fillStyle = '#2e2c22';
    g.fillRect(-34, -16, 68, 16);
    g.fillRect(-38, -12, 76, 8);
    g.fillStyle = '#4a4636';
    for (let i = 0; i < 6; i++) {
      const tx = -32 + ((i * 11 + Math.floor(tread)) % 64);
      g.fillRect(tx, -14, 5, 12);
    }
    // scafo arrotondato (rettangoli sovrapposti per simulare le curve)
    g.fillStyle = body;
    g.fillRect(-36, -30, 72, 16);
    g.fillRect(-32, -34, 64, 6);
    g.fillStyle = dark;
    g.fillRect(-36, -19, 72, 5);
    g.fillStyle = accent;
    g.fillRect(-30, -33, 56, 3);
    // torretta a cupola
    g.fillStyle = body;
    g.fillRect(-16, -46, 32, 14);
    g.fillRect(-12, -50, 24, 6);
    g.fillStyle = dark;
    g.fillRect(-16, -35, 32, 3);
    // portello + pilota (se occupato spunta la testa)
    if (occupied) {
      g.fillStyle = '#e8b486';
      g.fillRect(-5, -56, 10, 8);
      g.fillStyle = '#c23b22';
      g.fillRect(-6, -58, 12, 4);
    } else {
      g.fillStyle = dark;
      g.fillRect(-7, -52, 14, 4);
    }
    // cannone in avanti (verso destra), arretra di cannonRecoil
    const rec = cannonRecoil || 0;
    g.fillStyle = '#3a3830';
    g.fillRect(14 - rec, -45, 46, 7);
    g.fillStyle = '#55524a';
    g.fillRect(54 - rec, -45, 6, 7);
    // stella bianca sul fianco
    g.fillStyle = '#ffffff';
    g.fillRect(-6, -28, 8, 8);
    g.fillRect(-9, -25, 14, 2);
    g.restore();
  };

  // barile esplosivo (~22x30), x,y = centro base a terra
  Sprites.drawBarrel = function (g, x, y, flash) {
    g.save();
    g.translate(Math.round(x), Math.round(y));
    const red = flash ? '#e88a7e' : '#b03a2e';
    const dark = flash ? '#c06a5a' : '#7a2a20';
    g.fillStyle = red;
    g.fillRect(-11, -28, 22, 28);
    // fasce scure
    g.fillStyle = dark;
    g.fillRect(-11, -28, 22, 3);
    g.fillRect(-11, -16, 22, 3);
    g.fillRect(-11, -4, 22, 3);
    // tappo
    g.fillStyle = '#3a3830';
    g.fillRect(-4, -30, 8, 3);
    // teschio stilizzato
    g.fillStyle = '#ffffff';
    g.fillRect(-4, -13, 8, 6);
    g.fillStyle = dark;
    g.fillRect(-3, -11, 2, 2);
    g.fillRect(1, -11, 2, 2);
    g.fillStyle = '#ffffff';
    g.fillRect(-2, -7, 4, 2);
    g.restore();
  };

  // cassa di legno distruttibile (~30x26), x,y = centro base a terra
  Sprites.drawWoodCrate = function (g, x, y, flash) {
    g.save();
    g.translate(Math.round(x), Math.round(y));
    const wood = flash ? '#d8c098' : '#8a6a3c';
    const edge = flash ? '#b89c70' : '#6e5430';
    const cross = flash ? '#a88a5c' : '#5e4626';
    g.fillStyle = wood;
    g.fillRect(-15, -26, 30, 26);
    // bordi
    g.fillStyle = edge;
    g.fillRect(-15, -26, 30, 3);
    g.fillRect(-15, -3, 30, 3);
    g.fillRect(-15, -26, 3, 26);
    g.fillRect(12, -26, 3, 26);
    // croce di rinforzo diagonale
    g.fillStyle = cross;
    for (let i = 0; i < 5; i++) {
      g.fillRect(-11 + i * 4, -22 + i * 4, 5, 4);
      g.fillRect(6 - i * 4, -22 + i * 4, 5, 4);
    }
    g.restore();
  };

  // indicatore di pericolo per mortai: x,y = punto d'impatto, t = secondi rimanenti
  Sprites.drawWarning = function (g, x, y, t) {
    // lampeggio sempre più rapido man mano che t scende
    if (Math.floor(t * (6 + (0.7 - t) * 30)) % 2 !== 0) return;
    g.save();
    g.translate(Math.round(x), Math.round(y));
    // ellisse schiacciata a terra
    g.globalAlpha = 0.35;
    g.fillStyle = '#e83a2a';
    g.beginPath();
    g.save();
    g.scale(1, 8 / 24);
    g.arc(0, 0, 24, 0, Math.PI * 2);
    g.restore();
    g.fill();
    // punto esclamativo con ombra nera
    g.globalAlpha = 1;
    g.fillStyle = '#000000';
    g.fillRect(-2, -29, 6, 12);
    g.fillRect(-2, -13, 6, 5);
    g.fillStyle = '#e83a2a';
    g.fillRect(-3, -30, 6, 12);
    g.fillRect(-3, -14, 6, 5);
    g.restore();
  };

  window.Sprites = Sprites;
})();
