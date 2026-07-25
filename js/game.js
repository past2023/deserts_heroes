// ============================================================
// GAME — loop principale, stati, modalità, camera, HUD
// ============================================================
(function () {
  const canvas = document.getElementById('game');
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = false;
  const VW = canvas.width, VH = canvas.height;
  const Content = window.GameContent;
  const tr = (key, vars) => I18n.t(key, vars);
  const logoImage = new Image();
  logoImage.decoding = 'async';
  logoImage.src = 'assets/ui/logodesertheroe.png';

  const ARENA_X = 350; // camera fissa della modalità survival
  const savedCharacter = localStorage.getItem('dh_character');
  const initialCharacter = Characters.isValid(savedCharacter) ? savedCharacter : 'juan_p';

  // ---------- stato globale ----------
  window.G = {
    state: 'menu',
    mode: 'arcade',
    pendingMode: 'arcade',
    characterId: initialCharacter,
    characterSel: Math.max(0, Characters.roster.findIndex(c => c.id === initialCharacter)),
    menuSel: 0,
    paused: false,
    pauseSel: 0,
    godMode: false,
    time: 0,
    score: 0,
    hiA: parseInt(localStorage.getItem('ma_hiscore') || '0', 10),
    hiS: parseInt(localStorage.getItem('ma_hiscore_surv') || '0', 10),
    lives: 3,
    camX: 0,
    camLockL: 0,
    camLockR: Level.W,
    shake: 0,
    hitStop: 0,
    hurtFlash: 0,
    screenFlash: 0,
    screenFlashColor: '#ffffff',
    combo: { n: 0, t: 0 },
    player: null,
    enemies: [], pBullets: [], eBullets: [], grenades: [],
    particles: [], flashes: [], corpses: [], wrecks: [], pows: [],
    pickups: [], scorePops: [],
    slugs: [], props: [], warnings: [],
    boss: null,
    bossTriggered: false,
    bossCardT: 0,
    jetpackNoticeT: 0,
    portalTransitionT: 0,
    storyFlags: {},
    menuIrisT: 1.15,
    spawnIdx: 0,
    bannerT: 0,
    winT: 0,
    overT: 0,
    intro: null,
    // survival
    wave: 0,
    waveQueue: [],
    waveSpawnT: 0,
    waveBreakT: 0,
    waveBanner: 0,
  };
  Sprites.setActiveCharacter(initialCharacter);
  MusicTracks.play('overture');

  G.gameOver = function () {
    G.state = 'gameover';
    G.overT = 0;
    SFX.stopMusic();
    SFX.gameover();
    saveHi();
  };

  G.victory = function () {
    G.state = 'win';
    G.winT = 0;
    G.score += G.lives * 1000; // bonus vite rimaste
    SFX.stopMusic();
    SFX.victory();
    saveHi();
  };

  function characterHiKey(mode, characterId) {
    return 'dh_hi_' + mode + '_' + characterId;
  }
  function characterHi(mode, characterId) {
    return parseInt(localStorage.getItem(characterHiKey(mode, characterId)) || '0', 10);
  }

  function saveHi() {
    const charKey = characterHiKey(G.mode, G.characterId);
    const charHi = characterHi(G.mode, G.characterId);
    if (G.score > charHi) localStorage.setItem(charKey, String(G.score));

    // Preserve the legacy overall records for the main menu summary.
    if (G.mode === 'survival') {
      if (G.score > G.hiS) {
        G.hiS = G.score;
        localStorage.setItem('ma_hiscore_surv', String(G.hiS));
      }
    } else if (G.score > G.hiA) {
      G.hiA = G.score;
      localStorage.setItem('ma_hiscore', String(G.hiA));
    }
  }

  function currentHi() { return characterHi(G.mode, G.characterId); }

  function openCharacterSelect(mode) {
    G.pendingMode = mode;
    G.state = 'characterselect';
    G.characterSel = Math.max(0, Characters.roster.findIndex(c => c.id === G.characterId));
    Sprites.setActiveCharacter(Characters.roster[G.characterSel].id);
  }

  function introRiderY(intro) {
    // Must match Sprites.drawRocketBoard's internal hover bob and deck top.
    return intro.boardY + Math.sin(G.time * 8) * 2 - 6;
  }

  function beginMissionIntro(targetX) {
    const boardY = Level.GROUND - 190;
    G.intro = {
      active: true,
      boardActive: true,
      phase: 'fly',
      t: 0,
      startX: G.camX - 150,
      targetX: targetX,
      boardX: G.camX - 150,
      boardY: boardY,
      boardVx: 0,
      boardVy: 0,
      exhaustT: 0,
      jumped: false,
    };
    G.player.x = G.intro.startX;
    G.player.y = introRiderY(G.intro);
    G.player.vx = 0;
    G.player.vy = 0;
    G.player.onGround = false;
    G.player.inv = Math.max(G.player.inv, 2.5);
    SFX.introFly();
  }

  function introExhaust(intro) {
    const x = intro.boardX - 48;
    for (const oy of [-8, 5]) {
      G.particles.push({
        kind: 'smoke', x: x - Math.random() * 8, y: intro.boardY + oy,
        vx: -80 - Math.random() * 100, vy: (Math.random() - 0.5) * 45,
        t: 0, life: 0.42 + Math.random() * 0.25,
        color: Math.random() < 0.35 ? '#68717a' : '#3f464d',
        size: 5 + Math.random() * 6, grav: -24, drag: 0.7,
      });
      G.particles.push({
        kind: 'spark', x: x, y: intro.boardY + oy,
        vx: -180 - Math.random() * 170, vy: (Math.random() - 0.5) * 70,
        t: 0, life: 0.09 + Math.random() * 0.08,
        color: Math.random() < 0.4 ? '#ffffff' : '#ffb347',
        size: 2 + Math.random() * 2, grav: 0,
      });
    }
  }

  function updateIntroBoard(dt) {
    const intro = G.intro;
    if (!intro || !intro.boardActive) return;
    intro.exhaustT -= dt;
    if (intro.exhaustT <= 0) {
      introExhaust(intro);
      intro.exhaustT = intro.phase === 'depart' ? 0.025 : 0.045;
    }
    if (intro.phase === 'depart') {
      intro.boardVx += 620 * dt;
      intro.boardVy -= 90 * dt;
      intro.boardX += intro.boardVx * dt;
      intro.boardY += intro.boardVy * dt;
      if (intro.boardX > G.camX + VW + 180 || intro.boardY < -80) intro.boardActive = false;
    }
  }

  function updateMissionIntro(dt) {
    const intro = G.intro;
    if (!intro || !intro.active) return false;
    intro.t += dt;

    if (intro.t < 1.35) {
      const u = intro.t / 1.35;
      const eased = 1 - Math.pow(1 - u, 3);
      intro.boardX = intro.startX + (intro.targetX - intro.startX) * eased;
      intro.boardY = Level.GROUND - 190 + Math.sin(intro.t * 8) * 4;
      G.player.x = intro.boardX;
      G.player.y = introRiderY(intro);
    } else if (intro.t < 1.7) {
      intro.phase = 'hover';
      intro.boardX += (intro.targetX - intro.boardX) * Math.min(1, dt * 10);
      intro.boardY = Level.GROUND - 190 + Math.sin(intro.t * 11) * 3;
      G.player.x = intro.boardX;
      G.player.y = introRiderY(intro);
    } else {
      if (!intro.jumped) {
        intro.jumped = true;
        intro.phase = 'jump';
        G.player.x = intro.targetX;
        G.player.y = introRiderY(intro);
        G.player.vx = 0;
        G.player.vy = -140;
        G.player.onGround = false;
        intro.boardVx = 340;
        intro.boardVy = -20;
        SFX.introJump();
      }
      G.player.vy += 2200 * dt;
      G.player.y += G.player.vy * dt;
      intro.phase = 'depart';
      updateIntroBoard(dt);
      if (G.player.y >= Level.GROUND) {
        G.player.y = Level.GROUND;
        G.player.vy = 0;
        G.player.onGround = true;
        G.player.inv = Math.max(G.player.inv, 1.5);
        intro.active = false;
        G.bannerT = 0;
        G.shake = Math.max(G.shake, 4);
        G.screenFlash = Math.max(G.screenFlash, 0.055);
        G.screenFlashColor = '#fff1b0';
        for (let i = 0; i < 12; i++) {
          G.particles.push({
            kind: i % 3 === 0 ? 'spark' : 'smoke',
            x: G.player.x + (Math.random() - 0.5) * 24, y: Level.GROUND,
            vx: (Math.random() - 0.5) * 190, vy: -30 - Math.random() * 140,
            t: 0, life: 0.22 + Math.random() * 0.35,
            color: i % 3 === 0 ? '#ffe28a' : '#a78b61',
            size: 3 + Math.random() * 5, grav: i % 3 === 0 ? 420 : 120, drag: 0.8,
          });
        }
        SFX.introLand();
        SFX.missionStart();
      }
    }

    if (intro.phase !== 'depart') updateIntroBoard(dt);
    Entities.updateParticles(dt);
    updateCamera(dt);
    return true;
  }

  // Tutorial support detection
  const IS_TUTORIAL_MODE = !!(window.IS_TUTORIAL || (typeof TutorialLevel !== 'undefined' && Level === TutorialLevel));

  function startGame(mode, characterId) {
    const selectedCharacter = Characters.get(characterId || G.characterId);
    const effectiveMode = (window.IS_TUTORIAL || mode === 'tutorial') ? 'tutorial' : mode;
    G.mode = effectiveMode;
    G.characterId = selectedCharacter.id;
    G.characterSel = Math.max(0, Characters.roster.findIndex(c => c.id === selectedCharacter.id));
    localStorage.setItem('dh_character', selectedCharacter.id);
    Sprites.setActiveCharacter(selectedCharacter.id);
    G.state = 'play';
    G.paused = false;
    G.score = 0;
    G.lives = 3;
    Level.resetPlatforms();
    G.shake = 0;
    G.hitStop = 0;
    G.hurtFlash = 0;
    G.screenFlash = 0;
    G.screenFlashColor = '#ffffff';
    G.combo = { n: 0, t: 0 };
    G.enemies = []; G.pBullets = []; G.eBullets = []; G.grenades = [];
    G.particles = []; G.flashes = []; G.corpses = []; G.wrecks = []; G.pows = [];
    G.pickups = []; G.scorePops = [];
    G.slugs = []; G.props = []; G.warnings = [];
    G.boss = null;
    G.bossTriggered = false;
    G.bossCardT = 0;
    G.jetpackNoticeT = 0;
    G.portalTransitionT = 0;
    G.storyFlags = {}; Dialogue.clear();
    G.spawnIdx = 0;
    G.bannerT = 0;
    G.tutorial = effectiveMode === 'tutorial' ? {
      hintT: 0,
      completed: {},
      surfboard: null,
      outroT: 0,
    } : null;

    if (effectiveMode === 'survival') {
      G.camX = ARENA_X;
      G.camLockL = ARENA_X;
      G.camLockR = ARENA_X + VW;
      G.player = Entities.createPlayer(ARENA_X + VW / 2, selectedCharacter.id);
      G.wave = 0;
      G.waveQueue = [];
      G.waveSpawnT = 0;
      G.waveBreakT = 1.6;
      G.waveBanner = 0;
      Entities.spawnProp(ARENA_X + 170, 'barrel01');
      Entities.spawnProp(ARENA_X + VW - 170, 'barrel02');
      SFX.setIntensity(1);
    } else if (effectiveMode === 'tutorial') {
      G.camX = 0;
      G.camLockL = 0;
      G.camLockR = Level.W;
      G.player = Entities.createPlayer(120, selectedCharacter.id);
      for (const sx of Level.slugSpawns) {
        if (typeof sx === 'object') Entities.spawnSlug(sx.x, sx.type || sx.type);
        else Entities.spawnSlug(sx);
      }
      for (const pr of Level.props) Entities.spawnProp(pr.x, pr.type);
      for (const pickup of Level.highPickups)
        EntityCollectibles.spawnPickup(pickup.x, pickup.type, pickup.y);
      // extra tutorial pickups for learning
      EntityCollectibles.spawnPickup(2300, 'homing');
      EntityCollectibles.spawnPickup(3100, 'jet_pack');
      SFX.setIntensity(0);
      // tutorial light ambient sound via particles
      G.tutorial.hintT = 3.5;
    } else {
      G.camX = 0;
      G.camLockL = 0;
      G.camLockR = Level.W;
      G.player = Entities.createPlayer(120, selectedCharacter.id);
      for (const sx of Level.slugSpawns) {
        if (typeof sx === 'object') Entities.spawnSlug(sx.x, sx.type);
        else Entities.spawnSlug(sx.x || sx);
      }
      for (const pr of Level.props) Entities.spawnProp(pr.x, pr.type);
      for (const pickup of Level.highPickups)
        EntityCollectibles.spawnPickup(pickup.x, pickup.type, pickup.y);
      // Apply tutorial bonus if just completed training
      try {
        const rew = JSON.parse(sessionStorage.getItem('dh_tutorial_reward') || 'null');
        if (rew && rew.characterId === selectedCharacter.id) {
          G.score = Math.max(G.score, rew.score || 0);
          G.player.weapon = rew.weapon || G.player.weapon;
          if (rew.ammo) G.player.ammo = rew.ammo;
          if (rew.grenades) G.player.grenades = rew.grenades;
          if (rew.homingMissiles) G.player.homingMissiles = rew.homingMissiles;
          G.player.armor = rew.armor || G.player.armor;
          G.lives = Math.max(G.lives, rew.lives || 3);
          // consume after one use? Keep for session
          Dialogue.say('player', 'tutorial.complete', 4.2);
        }
      } catch (e) {}
      SFX.setIntensity(0);
    }
    beginMissionIntro(G.player.x);
    if (effectiveMode === 'tutorial') {
      // tutorial entrance slightly shorter, less invuln
      if (G.intro) G.intro.t = 0.6;
      MusicTracks.play('reverie');
    } else {
      MusicTracks.play('level1');
    }
    SFX.startMusic();
  }

  // ---------- spawn progressivo (arcade + tutorial) ----------
  function handleSpawns() {
    const limit = G.camX + VW + 240;
    while (G.spawnIdx < Level.spawns.length && Level.spawns[G.spawnIdx].x < limit) {
      const s = Level.spawns[G.spawnIdx];
      if (s.type === 'pow') Entities.spawnPow(s.x);
      else if (s.type === 'pickup') Entities.spawnPickup(s.x, s.pickup);
      else if (s.type === 'ally_tank02') Entities.spawnSlug(s.x, 'ally_tank02');
      else Entities.spawnEnemy(s.type, s.x, s);
      G.spawnIdx++;
    }
    if (G.mode === 'tutorial') return;
    // trigger del boss (solo arcade)
    if (!G.bossTriggered && Level.BOSS_TRIGGER_X && G.player.x > Level.BOSS_TRIGGER_X) {
      G.bossTriggered = true;
      G.camLockL = Level.W - VW;
      Entities.spawnBoss();
      G.bossCardT = 3.2;
      Dialogue.say('boss', 'dialogue.boss.arrival', 4.8);
      SFX.setIntensity(2);
      G.shake = Math.max(G.shake, 6);
    }
  }

  // ---------- tutorial logic v4 — player jumps onto board and rides off screen ----------
  function updateTutorial(dt) {
    if (!G.tutorial || G.mode !== 'tutorial') return;
    const t = G.tutorial;
    t.hintT -= dt;
    const p = G.player;
    if (!p) return;

    const milestones = [
      { x: 250, id: 'move', text: 'tutorial.hint.move', time: 4.0 },
      { x: 900, id: 'jump', text: 'tutorial.hint.jump', time: 4.5 },
      { x: 1400, id: 'shoot', text: 'tutorial.hint.shoot', time: 4.2 },
      { x: 2200, id: 'grenade', text: 'tutorial.hint.grenade', time: 4.0 },
      { x: 3000, id: 'observer', text: 'tutorial.hint.observer', time: 4.3 },
      { x: 3800, id: 'platform', text: 'tutorial.hint.platform', time: 4.0 },
      { x: 4500, id: 'tank', text: 'tutorial.hint.tank', time: 4.8 },
      { x: 5800, id: 'tankfire', text: 'tutorial.hint.tankfire', time: 4.5 },
      { x: 7200, id: 'combo', text: 'tutorial.hint.combo', time: 4.0 },
      { x: 9500, id: 'exit', text: 'tutorial.hint.exit', time: 5.0 },
    ];
    for (const ms of milestones) {
      if (!t.completed[ms.id] && p.x >= ms.x) {
        t.completed[ms.id] = true;
        if (ms.text) Dialogue.say('player', ms.text, ms.time);
        if (ms.id === 'tank') SFX.guidedReady();
      }
    }

    // Spawn surfboard early (visible waiting at exit from module 5 onwards)
    const SURF_X = (Level.SURFBOARD_X !== undefined ? Level.SURFBOARD_X : Level.W - 180);
    if (!t.surfboard && p.x > 4 * 1376) { // visible from ~module 5
      const boardY = Level.GROUND - 180;
      t.surfboard = { x: SURF_X, y: boardY, vx: 0, vy: 0, active: true, boardT: 0, exhaustT: 0, mounted: false };
    }

    // Auto-mount when player approaches the waiting surfboard
    if (t.surfboard && !t.surfboard.mounted) {
      const board = t.surfboard;
      board.boardT += dt;
      // Gentle hover
      board.vy = Math.sin(board.boardT * 3) * 6;
      board.y += board.vy * dt;

      const dx = Math.abs(p.x - board.x);
      const dy = Math.abs(p.y - board.y);
      const near = dx < 85 && dy < 55 && !p.dead;

      if (near) {
        // Auto-mount: lock player to board
        t.surfboard.mounted = true;
        t.exitTriggered = true;
        t.outroT = 0;
        p.inv = 999;
        p.vx = 0; p.vy = 0;
        p.onGround = true;
        SFX.introJump();
        for(let i=0;i<12;i++) G.particles.push({kind:'spark', x:p.x, y:p.y-10, vx:(Math.random()-0.5)*120, vy:-20-Math.random()*80, t:0, life:0.25+Math.random()*0.25, color:'#ffe28a', size:2+Math.random()*2.5, grav:120});
        G.camLockR = Level.W + 2000;
      }

      // Draw "BOARD" hint near exit
      if (!t.exitTriggered && p.x > 7 * 1376) {
        Dialogue.say('player', 'tutorial.hint.board', 5.0);
      }
    }

    if (t.exitTriggered && t.surfboard && t.surfboard.mounted) {
      t.outroT += dt;
      const board = t.surfboard;
      board.boardT += dt;
      board.exhaustT -= dt;

      // Exhaust particles
      if (board.exhaustT <= 0) {
        const bx = board.x - 48;
        for (const oy of [-8, 5]) {
          G.particles.push({ kind: 'smoke', x: bx - Math.random() * 8, y: board.y + oy, vx: -80 - Math.random() * 100, vy: (Math.random() - 0.5) * 45, t: 0, life: 0.42 + Math.random() * 0.25, color: Math.random() < 0.35 ? '#68717a' : '#3f464d', size: 5 + Math.random() * 6, grav: -24, drag: 0.7 });
          G.particles.push({ kind: 'spark', x: bx, y: board.y + oy, vx: -180 - Math.random() * 170, vy: (Math.random() - 0.5) * 70, t: 0, life: 0.09 + Math.random() * 0.08, color: Math.random() < 0.4 ? '#ffffff' : '#ffb347', size: 2 + Math.random() * 2, grav: 0 });
        }
        board.exhaustT = 0.032;
      }

      // Player locked to board
      p.x = board.x;
      p.y = board.y - 6 + Math.sin(board.boardT*8)*1.2;
      p.vx = board.vx; p.vy = board.vy;
      p.onGround = true;
      p.inv = 999;

      // Accelerate off screen
      board.vx += 560 * dt;
      board.vy -= 42 * dt;
      board.x += board.vx * dt;
      board.y += board.vy * dt;

      Entities.updateParticles(dt);
      updateCamera(dt);

      if (t.outroT > 2.8) {
        try {
          localStorage.setItem('dh_tutorial_done', '1');
          const reward = { score: G.score + 1000, lives: G.lives, characterId: G.player.characterId, weapon: 'mg', ammo: 80, grenades: 6, homingMissiles: 5, armor: G.player.maxArmor };
          sessionStorage.setItem('dh_tutorial_reward', JSON.stringify(reward));
        } catch (e) {}
        SFX.stopMusic();
        const char = G.characterId || localStorage.getItem('dh_character') || 'juan_p';
        window.location.href = 'galactic-map.html?mode=arcade&character=' + encodeURIComponent(char) + '&tutorialComplete=1';
      }
    }
  }

  function drawTutorialBoard(g, camX) {
    if (!G.tutorial || !G.tutorial.surfboard) return;
    const b = G.tutorial.surfboard;
    const sx = b.x - camX;
    if (sx < -320 || sx > VW + 320) return;
    const mounted = !!b.mounted;
    // draw board
    Sprites.drawRocketBoard(g, sx, b.y, 1, b.boardT, mounted ? 1.0 : 0.65);
    if (mounted) {
      const p = G.player;
      if (p) {
        const rider = Sprites.getPlayerFrame('idle', G.time, 0);
        const bob = Math.sin(b.boardT*8)*2;
        Sprites.draw(g, rider, sx, b.y - 6 + bob, 1);
      }
    } else {
      // hint text
      const pulse = 0.6 + Math.sin((G.time||0)*5)*0.35;
      if (pulse>0.4) {
        g.fillStyle = '#000'; g.font = 'bold 11px "Courier New", monospace'; g.textAlign='center';
        g.fillText('BOARD', sx+1, b.y - 36 +1);
        g.fillStyle = '#ffe45f'; g.fillText('BOARD', sx, b.y - 36);
      }
    }
  }

  // ---------- modalità survival: ondate ----------
  function startWave(n) {
    G.wave = n;
    G.waveBanner = 2.2;
    const q = [];
    const inf = 2 + Math.min(8, Math.floor(n * 1.1));
    for (let i = 0; i < inf; i++) {
      const r = Math.random();
      if (n >= 4 && r < 0.18) q.push('bazooka');
      else if (n >= 2 && r < 0.4) q.push('knife');
      else if (n >= 3 && r < 0.6) q.push('grenadier');
      else q.push('soldier');
    }
    if (n % 5 === 0) q.push('gunship');
    else if (n % 3 === 0) q.push('heli');
    if (n >= 4 && n % 4 === 0) q.push('tank');
    G.waveQueue = q;
    G.waveSpawnT = 1.0;
    // Upgrade garantito al terzo round: 10 missili guidati per il lanciatore.
    if (n === 3 && G.player.homingMissiles <= 0) {
      Entities.spawnPickup(G.camX + VW / 2, 'homing');
    }
    // ricompensa: uno SLUG fresco ogni 6 ondate
    if (n % 6 === 0 && G.slugs.length === 0) {
      Entities.spawnSlug(G.camX + VW / 2 + 120);
    }
    // Refill the arena with a rotating mix of hidden-item props.
    const survivalProps = ['barrel01', 'barrel02', 'dish02', 'flag', 'mil1', 'sign03'];
    while (G.props.length < 2) {
      Entities.spawnProp(G.camX + 150 + Math.random() * (VW - 300),
        survivalProps[Math.floor(Math.random() * survivalProps.length)]);
    }
    // Survival keeps the gameplay track; the dedicated boss track is reserved
    // for actual boss encounters rather than generic late-wave intensity.
    SFX.setIntensity(1);
  }

  function updateSurvival(dt) {
    if (G.waveBanner > 0) G.waveBanner -= dt;

    if (G.waveBreakT > 0) {
      G.waveBreakT -= dt;
      if (G.waveBreakT <= 0) startWave(G.wave + 1);
      return;
    }

    if (G.waveQueue.length > 0) {
      G.waveSpawnT -= dt;
      if (G.waveSpawnT <= 0) {
        const type = G.waveQueue.shift();
        const side = Math.random() < 0.5 ? -1 : 1;
        const x = side < 0 ? G.camX - 60 : G.camX + VW + 60;
        const e = Entities.spawnEnemy(type, x);
        e.spawnX = G.camX + VW / 2; // la pattuglia converge verso l'arena
        G.waveSpawnT = 0.7;
      }
    } else if (G.enemies.length === 0) {
      // ondata completata
      if (G.wave > 0) {
        const bonus = 300 + G.wave * 100;
        Entities.addScore(bonus, G.player.x, G.player.y - 80);
        SFX.waveClear();
        G.player.grenades = Math.min(99, G.player.grenades + 3);
        const cx = G.camX + 200 + Math.random() * (VW - 400);
        if (G.wave % 2 === 0) {
          const gifts = ['mg', 'spread', 'rocket', 'flame', 'grenades', 'homing'];
          Entities.spawnPickup(cx, gifts[Math.floor(Math.random() * gifts.length)]);
        }
        if (G.wave % 4 === 0) Entities.spawnPow(cx);
      }
      G.waveBreakT = 2.5;
    }
  }

  function updateStoryDialogues() {
    if (G.mode !== 'arcade' || !G.player || G.player.dead || G.intro && G.intro.active) return;
    const milestones = [
      [420, 'heroLanding', 'player', 'dialogue.hero.landing'],
      [3400, 'enemyArchive', 'enemy', 'dialogue.enemy.archive'],
      [7200, 'heroRuins', 'player', 'dialogue.hero.ruins'],
      [11800, 'heroLava', 'player', 'dialogue.hero.lava'],
      [19900, 'heroPortal', 'player', 'dialogue.hero.portal'],
      [24400, 'enemyFinal', 'enemy', 'dialogue.enemy.final'],
    ];
    for (const entry of milestones) if (!G.storyFlags[entry[1]] && G.player.x >= entry[0]) {
      G.storyFlags[entry[1]] = true; Dialogue.say(entry[2], entry[3], 4.3); break;
    }
  }

  // ---------- camera ----------
  function updateCamera(dt) {
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 30);
    if (G.mode === 'survival') return; // camera fissa
    let target = G.player.x - VW * 0.38;
    const minCam = G.bossTriggered ? Level.W - VW : 0;
    target = Math.max(minCam, Math.min(Level.W - VW, target));
    G.camX += (target - G.camX) * Math.min(1, dt * 6);
    G.camX = Math.max(minCam, Math.min(Level.W - VW, G.camX));
  }

  const MENU_ITEMS = ['menu.arcade', 'menu.survival', 'menu.settings', 'menu.help'];
  const PAUSE_ITEMS = ['pause.resume', 'pause.settings', 'pause.mainMenu'];

  // ---------- update ----------
  function update(dt) {
    Input.updateGamepad();
    G.time += dt;
    Dialogue.update(dt);

    // pannello impostazioni: priorità massima ovunque
    if (Settings.isOpen()) { Settings.update(dt); return; }

    if (G.state === 'menu') {
      if (G.menuIrisT > 0) G.menuIrisT = Math.max(0, G.menuIrisT - dt);
      if (Input.pressed('ArrowDown') || Input.pressed('KeyS')) {
        G.menuSel = (G.menuSel + 1) % MENU_ITEMS.length;
        SFX.bounce();
      }
      if (Input.pressed('ArrowUp') || Input.pressed('KeyW')) {
        G.menuSel = (G.menuSel + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
        SFX.bounce();
      }
      if (Input.start()) {
        if (G.menuSel === 0) openCharacterSelect('arcade');
        else if (G.menuSel === 1) openCharacterSelect('survival');
        else if (G.menuSel === 2) Settings.open('menu');
        else if (G.menuSel === 3) G.state = 'help';
      }
      return;
    }
    if (G.state === 'help') {
      if (Input.start() || Input.pressed('Escape') || Input.firePressed()) {
        G.state = 'menu'; G.menuIrisT = 1.15; MusicTracks.play('overture');
        SFX.bounce();
      }
      return;
    }
    if (G.state === 'characterselect') {
      let moved = 0;
      if (Input.pressed('ArrowLeft') || Input.pressed('KeyA')) moved = -1;
      if (Input.pressed('ArrowRight') || Input.pressed('KeyD')) moved = 1;
      if (moved) {
        G.characterSel = (G.characterSel + moved + Characters.roster.length) % Characters.roster.length;
        G.characterId = Characters.roster[G.characterSel].id;
        Sprites.setActiveCharacter(G.characterId);
        SFX.bounce();
      }
      if (Input.pressed('Escape')) {
        G.state = 'menu'; G.menuIrisT = 1.15; MusicTracks.play('overture');
        return;
      }
      if (Input.start() || Input.firePressed()) {
        const selected = Characters.roster[G.characterSel];
        if (G.pendingMode === 'arcade') {
          localStorage.setItem('dh_character', selected.id);
          window.location.href = 'galactic-map.html?mode=arcade&character=' +
            encodeURIComponent(selected.id);
        } else {
          startGame(G.pendingMode, selected.id);
        }
      }
      return;
    }
    if (G.state === 'gameover') {
      G.overT += dt;
      if (G.overT > 1 && Input.start()) { G.state = 'menu'; G.menuIrisT = 1.15; MusicTracks.play('overture'); }
      return;
    }
    if (G.state === 'win') {
      G.winT += dt;
      Entities.updateParticles(dt);
      Entities.updateScorePops(dt);
      if (G.winT > 2 && Input.start()) { G.state = 'menu'; G.menuIrisT = 1.15; MusicTracks.play('overture'); }
      return;
    }

    // --- play ---
    // pausa: Esc o tasto P (mentre non in pausa)
    if (!G.paused && (Input.pressed('Escape') || Input.pressed('KeyP'))) {
      G.paused = true; G.pauseSel = 0;
      return;
    }
    if (G.paused) {
      if (Input.pressed('Escape') || Input.pressed('KeyP')) { G.paused = false; return; }
      if (Input.pressed('ArrowDown') || Input.pressed('KeyS')) {
        G.pauseSel = (G.pauseSel + 1) % PAUSE_ITEMS.length; SFX.bounce();
      }
      if (Input.pressed('ArrowUp') || Input.pressed('KeyW')) {
        G.pauseSel = (G.pauseSel + PAUSE_ITEMS.length - 1) % PAUSE_ITEMS.length; SFX.bounce();
      }
      if (Input.start()) {
        if (G.pauseSel === 0) G.paused = false;
        else if (G.pauseSel === 1) Settings.open('pause');
        else if (G.pauseSel === 2) {
          SFX.stopMusic();
          G.paused = false;
          G.state = 'menu'; G.menuIrisT = 1.15; MusicTracks.play('overture');
        }
      }
      return;
    }

    if (Input.pressed('KeyM')) SFX.toggleMute();
    if (Input.pressed('F1')) {
      G.godMode = !G.godMode;
      Settings.flash(G.godMode ? tr('toast.godOn') : tr('toast.godOff'));
    }

    if (G.hurtFlash > 0) G.hurtFlash -= dt;
    if (G.screenFlash > 0) G.screenFlash = Math.max(0, G.screenFlash - dt * 1.9);
    if (G.combo.t > 0) G.combo.t -= dt;
    if (G.bossCardT > 0) G.bossCardT = Math.max(0, G.bossCardT - dt);
    if (G.jetpackNoticeT > 0) G.jetpackNoticeT = Math.max(0, G.jetpackNoticeT - dt);

    if (G.intro && G.intro.active) {
      updateMissionIntro(dt);
      return;
    }
    if (G.intro && G.intro.boardActive) updateIntroBoard(dt);

    if (G.portalTransitionT <= 0 && G.mode === 'arcade' && G.player && !G.player.dead && !G.player.inSlug &&
        Math.abs(G.player.x - Level.PORTAL_X) < 38 && Input.up()) {
      const portalSave = {
        returnX: Level.PORTAL_X + 95, score: G.score, lives: G.lives,
        characterId: G.player.characterId, weapon: G.player.weapon, ammo: G.player.ammo,
        grenades: G.player.grenades, homingMissiles: G.player.homingMissiles,
        armor: G.player.armor
      };
      sessionStorage.setItem('dh_portal_return', JSON.stringify(portalSave));
      G.portalTransitionT = 0.9;
      G.player.inv = Math.max(G.player.inv, 1);
      SFX.bigExplosion();
    }
    if (G.portalTransitionT > 0) {
      G.portalTransitionT -= dt;
      for (let i = 0; i < 4; i++) G.particles.push({ kind: 'spirit',
        x: G.player.x + (Math.random() - 0.5) * 90,
        y: G.player.y - 30 + (Math.random() - 0.5) * 110,
        vx: (Level.PORTAL_X - G.player.x) * 2, vy: (Math.random() - 0.5) * 80,
        t: 0, life: 0.45, color: i % 2 ? '#68efff' : '#c26cff',
        size: 3 + Math.random() * 6, grav: 0, drag: 1.2 });
      Entities.updateParticles(dt);
      if (G.portalTransitionT <= 0) { SFX.stopMusic(); window.location.href = 'portal-level.html'; }
      return;
    }

    // hit-stop: micro-congelamento del mondo per dare peso ai colpi
    if (G.hitStop > 0) {
      G.hitStop -= dt;
      Entities.bufferInputs(); // non perdere i salti premuti durante il freeze
      updateCamera(dt);
      return;
    }

    G.bannerT += dt;
    if (G.mode === 'survival') updateSurvival(dt);
    else if (G.mode === 'tutorial') {
      handleSpawns();
      updateTutorial(dt);
      if (G.tutorial && G.tutorial.surfboard && G.tutorial.surfboard.mounted) {
        // During board ride: skip game logic, only update particles and camera
        if (G.tutorial.outroT > 0 && G.tutorial.outroT < 2.2) {
          Level.updatePlatforms(dt, G.player);
          Entities.updateSlugs(dt);
          Entities.updateParticles(dt);
          updateCamera(dt);
          return;
        }
      }
    } else handleSpawns();
    if (G.mode !== 'tutorial') updateStoryDialogues();
    else {
      // tutorial story light version: keep track but no arcade milestones
    }
    Level.updatePlatforms(dt, G.player);
    Level.updateHazards(dt);
    Entities.updatePlayer(dt);
    if (Level.playerTouchesLaser(G.player)) Entities.killPlayer();
    if (G.player && !G.player.dead && G.player.y > Level.GROUND - 40) {
      for (const prop of G.props) {
        if (!prop.dead && prop.type === 'mine01' && Math.abs(G.player.x - prop.x) < 22) {
          EntityProps.destroy(prop);
          break;
        }
      }
    }
    Entities.updateSlugs(dt);
    Entities.updateEnemies(dt);
    Entities.updateBoss(dt);
    Entities.updateBullets(dt);
    Entities.updateGrenades(dt);
    Entities.updateWarnings(dt);
    Entities.updateProps(dt);
    Entities.updatePows(dt);
    Entities.updatePickups(dt);
    DesertWeather.update(dt);
    ForegroundDecor.update(dt);
    ExtremeForeground.update(dt);
    Entities.updateParticles(dt);
    Entities.updateScorePops(dt);
    updateCamera(dt);
  }

  // ---------- screen-space combat post FX ----------
  function drawScreenFX() {
    if (G.screenFlash <= 0) return;
    const alpha = Math.min(0.28, G.screenFlash * 0.9);
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = alpha;
    const flash = g.createRadialGradient(VW / 2, VH / 2, 20, VW / 2, VH / 2, VW * 0.72);
    flash.addColorStop(0, '#ffffff');
    flash.addColorStop(0.42, G.screenFlashColor || '#fff2cf');
    flash.addColorStop(1, 'rgba(255,120,40,0)');
    g.fillStyle = flash;
    g.fillRect(0, 0, VW, VH);
    g.restore();
  }

  // ---------- HUD ----------
  function text(str, x, y, size, color, align, bold) {
    g.font = (bold === false ? '' : 'bold ') + size + 'px "Courier New", monospace';
    g.textAlign = align || 'left';
    g.fillStyle = '#000';
    g.fillText(str, x + 2, y + 2);
    g.fillStyle = color || '#fff';
    g.fillText(str, x, y);
  }

  function hudPanel(x, y, w, h, accent) {
    const cut = 8;
    g.save();
    g.beginPath();
    g.moveTo(x + cut, y);
    g.lineTo(x + w - cut, y);
    g.lineTo(x + w, y + cut);
    g.lineTo(x + w, y + h - cut);
    g.lineTo(x + w - cut, y + h);
    g.lineTo(x + cut, y + h);
    g.lineTo(x, y + h - cut);
    g.lineTo(x, y + cut);
    g.closePath();
    const bg = g.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, 'rgba(25,38,53,0.34)');
    bg.addColorStop(0.55, 'rgba(8,14,24,0.2)');
    bg.addColorStop(1, 'rgba(4,8,15,0.3)');
    g.fillStyle = bg;
    g.fill();
    g.strokeStyle = accent;
    g.lineWidth = 1;
    g.globalAlpha = 0.58;
    g.stroke();
    g.globalAlpha = 0.28;
    g.fillStyle = accent;
    g.fillRect(x + cut, y + 2, w - cut * 2, 1);
    // Minimal corner marks preserve readability without a black HUD block.
    g.globalAlpha = 0.65;
    g.strokeStyle = '#ffffff';
    g.lineWidth = 1;
    const c = 7;
    g.beginPath();
    g.moveTo(x + 3, y + c + 3); g.lineTo(x + 3, y + 3); g.lineTo(x + c + 3, y + 3);
    g.moveTo(x + w - c - 3, y + h - 3); g.lineTo(x + w - 3, y + h - 3); g.lineTo(x + w - 3, y + h - c - 3);
    g.stroke();
    g.restore();
  }

  function drawHudPulse(x, y, w, h, color, time, duration) {
    if (time <= 0) return;
    const k = Math.max(0, Math.min(1, time / (duration || 0.6)));
    const expand = (1 - k) * 8;
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = k * 0.62;
    g.strokeStyle = color;
    g.lineWidth = 1.5 + k * 1.5;
    g.strokeRect(x - expand, y - expand, w + expand * 2, h + expand * 2);
    g.restore();
  }

  function segmentedBar(x, y, w, h, value, max, color) {
    const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
    const segments = 16;
    const gap = 2;
    g.fillStyle = 'rgba(5,8,14,0.42)';
    g.fillRect(x - 1, y - 1, w + 2, h + 2);
    for (let i = 0; i < segments; i++) {
      const sx = x + i * w / segments;
      const sw = w / segments - gap;
      const active = (i + 0.5) / segments <= ratio;
      g.fillStyle = active ? color : 'rgba(80,90,105,0.28)';
      g.fillRect(sx, y, sw, h);
      if (active) {
        g.globalAlpha = 0.42;
        g.fillStyle = '#ffffff';
        g.fillRect(sx + 1, y + 1, Math.max(0, sw - 2), 2);
        g.globalAlpha = 1;
      }
    }
  }

  function drawHudRailSection(x, y, w, h, accent) {
    g.save(); g.globalAlpha = 0.84;
    g.fillStyle = 'rgba(3,7,13,0.88)'; g.fillRect(x, y, w, h);
    g.fillStyle = '#d7a719'; g.fillRect(x, y, 9, h);
    g.fillStyle = accent; g.fillRect(x + 9, y, w - 9, 2);
    g.fillStyle = '#00b9ff'; g.fillRect(x + 9, y + h - 3, w - 9, 3);
    g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(x + 9, y + 3, w - 9, 1);
    g.restore();
  }

  function drawPixelHeart(x, y, filled) {
    g.save();
    g.translate(Math.round(x), Math.round(y));
    g.fillStyle = filled ? '#ff4d58' : 'rgba(105,115,125,0.34)';
    g.fillRect(2, 0, 4, 2); g.fillRect(10, 0, 4, 2);
    g.fillRect(0, 2, 16, 6); g.fillRect(2, 8, 12, 3);
    g.fillRect(4, 11, 8, 3); g.fillRect(6, 14, 4, 2);
    if (filled) { g.fillStyle = '#ff9a9f'; g.fillRect(3, 3, 4, 3); }
    g.restore();
  }

  function drawScoreIcon(x, y) {
    g.save(); g.translate(Math.round(x), Math.round(y));
    g.fillStyle = '#8a5a20'; g.fillRect(3, 0, 10, 16); g.fillRect(0, 3, 16, 10);
    g.fillStyle = '#ffd15a'; g.fillRect(3, 2, 10, 12); g.fillRect(2, 4, 12, 8);
    g.fillStyle = '#fff0a0'; g.fillRect(5, 4, 3, 5);
    g.fillStyle = '#b97925'; g.fillRect(9, 7, 3, 5);
    g.restore();
  }

  function drawWeaponIcon(x, y, color, type) {
    g.save(); g.translate(Math.round(x), Math.round(y));
    g.fillStyle = '#d8e1e8';
    if (type === 'rocket') {
      g.fillRect(0, 4, 19, 5); g.fillStyle = color; g.fillRect(15, 2, 6, 9);
      g.fillStyle = '#59636d'; g.fillRect(4, 9, 5, 4);
    } else if (type === 'spread') {
      g.fillRect(0, 4, 14, 5); g.fillStyle = color;
      g.fillRect(12, 1, 8, 2); g.fillRect(12, 5, 10, 2); g.fillRect(12, 9, 8, 2);
      g.fillStyle = '#59636d'; g.fillRect(5, 9, 5, 4);
    } else if (type === 'flame') {
      g.fillRect(0, 4, 16, 5); g.fillStyle = '#59636d'; g.fillRect(4, 9, 5, 4);
      g.fillStyle = color; g.fillRect(16, 3, 5, 7); g.fillRect(21, 5, 3, 3);
    } else if (type === 'mg') {
      g.fillRect(0, 3, 20, 5); g.fillStyle = color; g.fillRect(15, 1, 9, 3);
      g.fillStyle = '#59636d'; g.fillRect(5, 8, 5, 5); g.fillRect(12, 8, 3, 3);
    } else {
      g.fillRect(4, 3, 14, 5); g.fillStyle = color; g.fillRect(15, 2, 8, 3);
      g.fillStyle = '#59636d'; g.fillRect(7, 8, 5, 5);
    }
    g.restore();
  }

  function drawGrenadeIcon(x, y, color) {
    g.save(); g.translate(Math.round(x), Math.round(y));
    g.fillStyle = '#d6dde3'; g.fillRect(7, 0, 6, 3); g.fillRect(11, 2, 5, 2);
    g.fillStyle = color; g.fillRect(3, 4, 13, 11); g.fillRect(5, 2, 9, 15);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(6, 5, 3, 7);
    g.restore();
  }

  function drawHUD() {
    const p = G.player;
    let weaponAccent = p.inSlug ? '#9aff8a' :
      p.weapon === 'spread' ? '#68efff' :
      p.weapon === 'rocket' ? '#ff6845' :
      p.weapon === 'flame' ? '#ff9a38' :
      p.weapon === 'mg' ? '#ffe76a' : '#7ad0ff';
    const activeWeapon = !p.inSlug && Entities.WEAPONS[p.weapon];
    if (activeWeapon && p.weapon !== 'pistol' &&
        p.ammo / Characters.specialAmmo(p.characterId, activeWeapon.ammo) <= 0.2 &&
        Math.floor(G.time * 7) % 2 === 0) weaponAccent = '#ff4d58';

    // One compact information rail in the upper-right. No large panels or
    // duplicated labels: icons establish hierarchy and preserve battlefield view.
    const right = VW - 12;
    const railX = VW - 218;
    g.save();
    // Fixed opacity: the combat panel never pulses or changes transparency.
    g.globalAlpha = 0.84;
    g.fillStyle = 'rgba(3,7,13,0.88)';
    g.fillRect(railX, 8, 206, 91);
    // Reference-inspired equipment bands and bright lower status edge.
    g.fillStyle = '#d7a719'; g.fillRect(railX, 8, 9, 91);
    g.fillStyle = '#ffe04f'; g.fillRect(railX + 2, 13, 5, 24);
    g.fillStyle = weaponAccent; g.fillRect(railX + 9, 39, 197, 3);
    g.fillStyle = '#00b9ff'; g.fillRect(railX + 9, 94, 197, 5);
    g.fillStyle = '#2df071'; g.fillRect(railX + 9, 89, 128, 4);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(railX + 9, 8, 197, 1);

    // Score: icon + number only.
    drawScoreIcon(railX + 17, 16);
    text(String(G.score).padStart(7, '0'), right, 30, 13, '#ffe28a', 'right');

    // Weapon: icon + localized name + quantity.
    drawWeaponIcon(railX + 17, 43, weaponAccent, p.inSlug ? 'rocket' : p.weapon);
    if (p.inSlug) {
      text(tr('vehicle.weapon'), railX + 48, 54, 10, weaponAccent);
      text(String(p.inSlug.hp) + '/' + String(p.inSlug.maxHp), right, 54, 11, '#9aff8a', 'right');
    } else {
      const weapon = Entities.WEAPONS[p.weapon];
      const ammo = p.weapon === 'pistol' ? '∞' : String(Math.max(0, p.ammo));
      text(tr(weapon.nameKey), railX + 48, 54, 10, weaponAccent);
      text(ammo, right, 54, 13, '#ffffff', 'right');
    }

    // Secondary quantity remains on the same rail.
    const secondaryColor = p.jetpackT > 0 ? '#ffb347' : p.homingMissiles > 0 ? '#68efff' : '#9aff8a';
    drawGrenadeIcon(railX + 19, 69, secondaryColor);
    const secondaryCount = p.inSlug ? p.inSlug.hp : p.jetpackT > 0 ? Math.ceil(p.jetpackT) :
      (p.homingMissiles > 0 ? p.homingMissiles : p.grenades);
    text(p.jetpackT > 0 ? 'J' : p.homingMissiles > 0 ? 'T' : 'G', railX + 48, 83, 10, secondaryColor);
    text(String(Math.max(0, secondaryCount)), railX + 73, 83, 12, '#ffffff', 'right');

    // Lives are represented only by pixel hearts.
    const heartCount = Math.max(0, Math.min(5, G.lives));
    for (let i = 0; i < heartCount; i++) {
      if (G.lives === 1 && i === 0) g.globalAlpha = 0.38 + Math.abs(Math.sin(G.time * 7)) * 0.62;
      drawPixelHeart(right - 18 - i * 21, 69, true);
      g.globalAlpha = 0.84;
    }
    g.restore();

    // Nearby pickup comparison: compact and contextual, never a modal.
    let nearbyPickup = null;
    let nearestDistance = 145;
    for (const pickup of G.pickups) {
      const distance = Math.abs(pickup.x - p.x);
      if (!pickup.dead && distance < nearestDistance) {
        nearestDistance = distance; nearbyPickup = pickup;
      }
    }
    if (nearbyPickup) {
      const type = nearbyPickup.type;
      const isWeapon = !!Entities.WEAPONS[type];
      const color = type === 'heart' ? '#ff4d68' : type === 'homing' ? '#68efff' : type === 'grenades' ? '#9aff8a' : '#ffe76a';
      drawHudRailSection(VW - 218, 105, 206, 38, color);
      if (isWeapon) drawWeaponIcon(VW - 208, 116, color, type);
      else drawGrenadeIcon(VW - 206, 114, color);
      const label = isWeapon ? tr(Entities.WEAPONS[type].nameKey) :
        (type === 'homing' ? tr('hud.guided', { count: 10 }) :
          type === 'jetpack' ? tr('pickup.jetpack') :
          type === 'heart' ? tr('pickup.life') : tr('hud.grenade', { count: 6 }));
      text('> ' + label, VW - 177, 129, 10, color);
      if (isWeapon) text(tr(Entities.WEAPONS[p.weapon].nameKey), VW - 20, 129, 9, '#aeb8c2', 'right');
    }

    if (G.mode === 'arcade' && Math.abs(p.x - Level.PORTAL_X) < 90 && !p.inSlug) {
      drawHudRailSection(VW - 218, nearbyPickup ? 149 : 105, 206, 30, '#b56cff');
      text(tr('portal.enter'), VW - 200, (nearbyPickup ? 149 : 105) + 20, 10, '#e6c8ff');
    }

    if (G.jetpackNoticeT > 0) {
      const noticeAlpha = Math.min(1, (3.6 - G.jetpackNoticeT) * 4, G.jetpackNoticeT * 2);
      g.save(); g.globalAlpha = noticeAlpha;
      hudPanel(VW / 2 - 250, 112, 500, 48, '#ffb347');
      text(tr('pickup.jetpackHelp'), VW / 2, 142, 13, '#fff2c4', 'center');
      g.restore();
    }

    if (G.bossCardT > 0 && G.boss) {
      const appear = Math.min(1, (3.2 - G.bossCardT) * 3);
      const leave = Math.min(1, G.bossCardT * 2);
      g.save(); g.globalAlpha = appear * leave;
      hudPanel(VW / 2 - 210, 54, 420, 58, '#ff4d45');
      text(tr('boss.warning'), VW / 2, 76, 11, '#ff8a72', 'center');
      text(tr('boss.name'), VW / 2, 101, 24, '#ffffff', 'center');
      const quoteIndex = Math.min(3, Math.floor((3.2 - G.bossCardT) / 0.8) + 1);
      hudPanel(VW / 2 - 390, 119, 780, 35, '#ff9a52');
      text(tr('boss.taunt' + quoteIndex), VW / 2, 142, 11, '#ffe4bd', 'center');
      g.restore();
    }

    if (G.combo.t > 0 && G.combo.n >= 2) {
      // Stack below the pickup card instead of drawing both in the same space.
      const comboY = nearbyPickup ? 149 : 105;
      drawHudRailSection(VW - 218, comboY, 206, 25, '#68efff');
      text(tr('hud.chain', { count: G.combo.n }), VW - 200, comboY + 17, 11, '#bcefff');
      segmentedBar(VW - 105, comboY + 9, 84, 5, G.combo.t, 2.2, '#58dfff');
    }

    // Boss information is critical but remains a thin strip along the bottom.
    if (G.boss && G.boss.state !== 'enter') {
      const bw = 540, bx = (VW - bw) / 2;
      hudPanel(bx - 7, VH - 33, bw + 14, 26, '#ff4d45');
      text(tr('boss.name'), bx + 2, VH - 14, 10, '#ff9a7f');
      segmentedBar(bx + 145, VH - 23, bw - 153, 7, G.boss.hp, G.boss.maxHp,
        G.boss.hp < G.boss.maxHp * 0.35 ? '#ff2f58' : '#f05a3f');
    }

    // indicatore ondata (survival)
    if (G.mode === 'survival') {
      if (G.wave > 0) text(tr('hud.wave', { number: G.wave }), VW / 2, 30, 22, '#ffae42', 'center');
      if (G.waveBanner > 0) {
        const a = G.waveBanner > 0.4 ? 1 : G.waveBanner / 0.4;
        g.save();
        g.globalAlpha = a;
        hudPanel(VW / 2 - 170, VH / 2 - 112, 340, 72, '#ffb347');
        text(tr('hud.wave', { number: G.wave }), VW / 2, VH / 2 - 60, 46, '#ffae42', 'center');
        g.restore();
      } else if (G.waveBreakT > 0 && G.wave > 0) {
        text(tr('hud.getReady'), VW / 2, VH / 2 - 60, 24, '#fff', 'center');
      }
    }

    // banner inizio missione (arcade)
    if (G.mode === 'arcade' && G.bannerT < 2.2) {
      const a = G.bannerT < 1.8 ? 1 : (2.2 - G.bannerT) / 0.4;
      g.save();
      g.globalAlpha = a;
      hudPanel(VW / 2 - 230, VH / 2 - 105, 460, 142, '#ffb347');
      text(tr('mission.label', { number: Content.mission.number }), VW / 2, VH / 2 - 54, 42, '#ffe28a', 'center');
      text(tr('mission.name'), VW / 2, VH / 2 - 16, 18, '#ffae42', 'center');
      text(tr('mission.start'), VW / 2, VH / 2 + 20, 30, '#fff', 'center');
      g.restore();
    }

    if (G.bossCardT > 0 && G.boss) {
      const cinemaAlpha = Math.min(1, (3.2 - G.bossCardT) * 3, G.bossCardT * 2);
      g.save(); g.globalAlpha = cinemaAlpha * 0.82; g.fillStyle = '#000000';
      g.fillRect(0, 0, VW, 15); g.fillRect(0, VH - 15, VW, 15); g.restore();
    }

    // vignetta rossa quando si viene colpiti
    if (G.hurtFlash > 0) {
      g.save();
      g.globalAlpha = Math.min(0.45, G.hurtFlash * 0.8);
      const vg = g.createRadialGradient(VW / 2, VH / 2, VH * 0.3, VW / 2, VH / 2, VH * 0.75);
      vg.addColorStop(0, 'rgba(180,20,10,0)');
      vg.addColorStop(1, 'rgba(180,20,10,1)');
      g.fillStyle = vg;
      g.fillRect(0, 0, VW, VH);
      g.restore();
    }

    // badge GOD MODE
    if (G.godMode) {
      g.fillStyle = 'rgba(100,255,140,0.12)';
      g.fillRect(VW - 76, VH - 28, 62, 16);
      text(tr('hud.god'), VW - 45, VH - 15, 11, '#9aff8a', 'center');
    }

    // pausa: menu di scelta
    if (G.paused) {
      g.fillStyle = 'rgba(0,0,0,0.65)';
      g.fillRect(0, 0, VW, VH);
      text(tr('pause.title'), VW / 2, VH / 2 - 80, 40, '#fff', 'center');
      for (let i = 0; i < PAUSE_ITEMS.length; i++) {
        const sel = (i === G.pauseSel);
        text((sel ? '> ' : '  ') + tr(PAUSE_ITEMS[i]),
             VW / 2, VH / 2 - 20 + i * 36, 22, sel ? '#fff' : '#9a9a8a', 'center');
      }
      text(tr('pause.hint'), VW / 2, VH / 2 + 110, 13, '#888', 'center');
    }
  }

  // ---------- character selection ----------
  function drawWrapped(value, x, y, maxWidth, lineHeight, size, color) {
    const words = value.split(/\s+/);
    const lines = [];
    let line = '';
    g.font = 'bold ' + size + 'px "Courier New", monospace';
    for (const word of words) {
      const candidate = line ? line + ' ' + word : word;
      if (line && g.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      text(lines[i], x, y + i * lineHeight, size, color, 'center');
    }
  }


  // Deterministic star data for the character select carousel background
  let charSelStars = null;
  function initCharSelStars() {
    charSelStars = [];
    let seed = 7331;
    function rng() { seed = (seed * 1664525 + 1013904223) | 0; return (seed >>> 0) / 4294967296; }
    for (let i = 0; i < 360; i++) {
      const layer = rng() < 0.58 ? 0 : rng() < 0.82 ? 1 : 2;
      charSelStars.push({
        x: rng() * VW, y: rng() * VH,
        size: layer === 0 ? 1 : layer === 1 ? (rng() < 0.7 ? 1 : 2) : 2,
        speed: 0.10 + layer * 0.20 + rng() * 0.34,
        phase: rng() * 100,
        twinkle: rng() * 6.28,
        layer: layer,
        color: rng() < 0.18 ? '#68efff' : rng() < 0.34 ? '#ffb347' : rng() < 0.48 ? '#b58cff' : '#ffffff',
      });
    }
  }

  function drawPixelPanel(x, y, w, h, accent, alpha) {
    alpha = alpha === undefined ? 1 : alpha;
    g.save();
    g.globalAlpha = alpha;
    g.fillStyle = 'rgba(3,10,24,0.90)';
    g.fillRect(x, y, w, h);
    const bg = g.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, 'rgba(21,54,86,0.72)');
    bg.addColorStop(0.52, 'rgba(10,25,48,0.84)');
    bg.addColorStop(1, 'rgba(4,11,28,0.94)');
    g.fillStyle = bg;
    g.fillRect(x + 4, y + 4, w - 8, h - 8);
    g.strokeStyle = 'rgba(104,239,255,0.55)';
    g.lineWidth = 2;
    g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    g.strokeStyle = accent;
    g.lineWidth = 2;
    g.strokeRect(x + 5.5, y + 5.5, w - 11, h - 11);
    g.fillStyle = accent;
    const c = 10;
    g.fillRect(x, y, c, 3); g.fillRect(x, y, 3, c);
    g.fillRect(x + w - c, y, c, 3); g.fillRect(x + w - 3, y, 3, c);
    g.fillRect(x, y + h - 3, c, 3); g.fillRect(x, y + h - c, 3, c);
    g.fillRect(x + w - c, y + h - 3, c, 3); g.fillRect(x + w - 3, y + h - c, 3, c);
    g.restore();
  }

  // Draw an animated pixel stat bar for the character select profile.
  function drawStatBar(x, y, w, h, value, max, fillColor, time, delay) {
    const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
    const anim = Math.min(1, Math.max(0, (Math.sin(time * 2.8 - delay) + 1) * 0.5 * 0.10 + 0.90));
    const fillW = Math.max(0, Math.floor((w - 4) * ratio * anim));

    g.save();
    g.fillStyle = '#050b18';
    g.fillRect(x, y, w, h);
    g.strokeStyle = 'rgba(104,239,255,0.40)';
    g.lineWidth = 2;
    g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    for (let i = 0; i < 5; i++) {
      const tx = x + 4 + i * Math.floor((w - 8) / 5);
      g.fillStyle = 'rgba(255,255,255,0.05)';
      g.fillRect(tx, y + 3, 2, h - 6);
    }
    if (fillW > 0) {
      const grad = g.createLinearGradient(x, y, x + w, y);
      grad.addColorStop(0, fillColor);
      grad.addColorStop(0.55, '#fff0a8');
      grad.addColorStop(1, fillColor);
      g.fillStyle = grad;
      g.fillRect(x + 2, y + 2, fillW, h - 4);
      const scan = ((time * 90 + delay * 37) % (w + 42)) - 42;
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.55;
      g.fillStyle = '#ffffff';
      g.fillRect(x + 2 + Math.min(fillW, Math.max(0, scan)), y + 2, Math.min(10, fillW), h - 4);
      g.globalAlpha = 0.22 + Math.sin(time * 7 + delay) * 0.08;
      g.fillStyle = fillColor;
      g.fillRect(x + 2, y - 2, fillW, 2);
      g.fillRect(x + 2, y + h, fillW, 2);
    }
    g.restore();
  }

  function drawCarouselPortrait(ch, x, y, w, h, accent, selected, side) {
    const bob = selected ? Math.sin(G.time * 3.1) * 3 : Math.sin(G.time * 2.1 + x * 0.01) * 1.5;
    drawPixelPanel(x, y + bob, w, h, selected ? accent.border : '#4cecff', selected ? 1 : 0.82);
    g.save();
    g.beginPath(); g.rect(x + 9, y + 9 + bob, w - 18, h - 18); g.clip();
    const scanGrad = g.createLinearGradient(0, y, 0, y + h);
    scanGrad.addColorStop(0, 'rgba(15,110,135,0.46)');
    scanGrad.addColorStop(1, 'rgba(2,12,28,0.82)');
    g.fillStyle = scanGrad;
    g.fillRect(x + 9, y + 9 + bob, w - 18, h - 18);
    g.globalAlpha = selected ? 0.18 : 0.24;
    g.fillStyle = '#68efff';
    for (let yy = y + 10; yy < y + h - 8; yy += 7) g.fillRect(x + 9, Math.floor(yy + bob), w - 18, 1);
    g.globalAlpha = 1;

    const portrait = Sprites.getCharacterPortrait(ch.id);
    if (portrait && portrait.naturalWidth > 0) {
      const pad = selected ? 12 : 20;
      const scale = Math.min((w - pad * 2) / portrait.naturalWidth, (h - pad * 2) / portrait.naturalHeight) * (selected ? 1.12 : 1.02);
      const dw = portrait.naturalWidth * scale, dh = portrait.naturalHeight * scale;
      const dx = x + (w - dw) / 2;
      const dy = y + h - pad - dh + bob + (selected ? 4 : 10);
      g.globalAlpha = selected ? 1 : 0.55;
      g.drawImage(portrait, dx, dy, dw, dh);
      if (side) {
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = 'rgba(77,179,230,0.45)';
        g.fillRect(x + 9, y + 9 + bob, w - 18, h - 18);
      }
    } else {
      const preview = Sprites.getCharacterFrame(ch.id, 'idle', G.time, 0);
      Sprites.draw(g, preview, x + w / 2, y + h - 32 + bob, 1, selected ? 1.3 : 0.9);
    }
    g.restore();

    if (selected) {
      g.save(); g.globalCompositeOperation = 'lighter';
      const pulse = 0.45 + Math.sin(G.time * 4.8) * 0.18;
      g.strokeStyle = accent.border; g.globalAlpha = pulse; g.lineWidth = 4;
      g.strokeRect(x - 3.5, y - 3.5 + bob, w + 7, h + 7);
      g.restore();
    }
  }

  function drawCharacterSelect() {
    if (!charSelStars) initCharSelStars();

    // Animated galaxy backdrop: drifting star layers, scan lines, and small meteors.
    const bg = g.createLinearGradient(0, 0, 0, VH);
    bg.addColorStop(0, '#243a55');
    bg.addColorStop(0.38, '#06142a');
    bg.addColorStop(1, '#020617');
    g.fillStyle = bg;
    g.fillRect(0, 0, VW, VH);
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (let n = 0; n < 4; n++) {
      const nx = VW * (0.18 + n * 0.22) + Math.sin(G.time * (0.05 + n * 0.015) + n) * 44;
      const ny = VH * (0.20 + (n % 2) * 0.28) + Math.cos(G.time * 0.06 + n * 1.7) * 28;
      const nr = 180 + n * 54;
      const ng = g.createRadialGradient(nx, ny, 4, nx, ny, nr);
      ng.addColorStop(0, n % 2 ? 'rgba(255,154,56,0.07)' : 'rgba(104,239,255,0.08)');
      ng.addColorStop(0.38, 'rgba(80,120,255,0.035)');
      ng.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = ng;
      g.beginPath(); g.arc(nx, ny, nr, 0, Math.PI * 2); g.fill();
    }
    for (const s of charSelStars) {
      const driftX = (G.time * (12 + s.layer * 24) * s.speed + Math.sin(G.time * s.speed + s.phase) * 8) % (VW + 20);
      const sx = (s.x + driftX) % (VW + 20) - 10;
      const sy = s.y + Math.sin(G.time * 0.3 + s.phase) * (2 + s.layer);
      const alpha = 0.18 + Math.abs(Math.sin(G.time * (1.4 + s.layer * 0.5) + s.twinkle)) * 0.62;
      g.globalAlpha = alpha * (0.45 + s.layer * 0.16);
      g.fillStyle = s.color;
      g.fillRect(Math.round(sx), Math.round(sy), s.size, s.size);
      if (s.layer === 2 && alpha > 0.62) g.fillRect(Math.round(sx - 2), Math.round(sy), 5, 1);
    }
    for (let m = 0; m < 3; m++) {
      const mx = (VW + 160 - ((G.time * (90 + m * 36) + m * 260) % (VW + 360)));
      const my = 58 + m * 112 + Math.sin(G.time + m) * 18;
      g.globalAlpha = 0.14;
      g.strokeStyle = m % 2 ? '#ffb347' : '#68efff';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(mx, my); g.lineTo(mx - 84, my + 24); g.stroke();
    }
    g.restore();
    g.fillStyle = 'rgba(0,4,14,0.42)';
    g.fillRect(0, 0, VW, VH);
    g.globalAlpha = 0.10;
    g.fillStyle = '#68efff';
    for (let y = 0; y < VH; y += 6) g.fillRect(0, y + ((G.time * 18) % 6), VW, 1);
    g.globalAlpha = 1;

    const sel = G.characterSel;
    const count = Characters.roster.length;
    const ch = Characters.roster[sel];
    const prev = Characters.roster[(sel - 1 + count) % count];
    const next = Characters.roster[(sel + 1) % count];
    const accentColors = {
      'juan_p': { border: '#ff9a38', name: '#fff1c8', badge: '#ffbf54', bar: '#28e6ff' },
      'elena_k': { border: '#68efff', name: '#e9fbff', badge: '#68efff', bar: '#6ef8ff' },
      'sergio_h': { border: '#ff4d58', name: '#fff4e6', badge: '#ffb347', bar: '#ff765e' },
    };
    const accent = accentColors[ch.id] || accentColors.juan_p;

    g.font = 'bold 20px "Courier New", monospace';
    g.textAlign = 'left';
    g.fillStyle = 'rgba(160,210,235,0.48)';
    g.fillText('CONCEPT A', 22, 28);

    const topY = 42;
    drawCarouselPortrait(prev, 58, topY + 40, 210, 228, accent, false, true);
    drawCarouselPortrait(next, 692, topY + 40, 210, 228, accent, false, true);
    drawCarouselPortrait(ch, 335, topY, 290, 300, accent, true, false);

    // Bottom dossier panel, matching the reference composition.
    const infoX = 44, infoY = 348, infoW = 872, infoH = 158;
    drawPixelPanel(infoX, infoY, infoW, infoH, '#45eaff', 1);
    g.save();
    g.fillStyle = '#ff9a38';
    for (const c of [[infoX+16, infoY+13], [infoX+infoW-22, infoY+13], [infoX+16, infoY+infoH-18], [infoX+infoW-22, infoY+infoH-18]]) {
      g.fillRect(c[0], c[1], 5, 5); g.fillRect(c[0] + 2, c[1] - 2, 1, 9); g.fillRect(c[0] - 2, c[1] + 2, 9, 1);
    }
    g.restore();

    const nameStr = tr(ch.nameKey).toUpperCase();
    const roleStr = tr(ch.roleKey).toUpperCase();
    const bioStr = tr(ch.bioKey);
    g.textAlign = 'left';
    g.font = 'bold 24px "Courier New", monospace';
    g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillText('Name: ' + nameStr, infoX + 36 + 2, infoY + 42 + 2);
    g.fillStyle = '#ffe8b8'; g.fillText('Name: ', infoX + 36, infoY + 42);
    g.fillStyle = accent.name; g.fillText(nameStr, infoX + 122, infoY + 42);
    g.font = 'bold 21px "Courier New", monospace';
    g.fillStyle = '#ffd28a'; g.fillText('Class: ', infoX + 36, infoY + 72);
    g.fillStyle = accent.badge; g.fillText(roleStr, infoX + 124, infoY + 72);
    g.font = 'bold 18px "Courier New", monospace';
    g.fillStyle = '#ffe8b8'; g.fillText('Description:', infoX + 36, infoY + 94);
    g.fillStyle = '#f8f4df';
    let bioLine = bioStr;
    while (bioLine.length > 8 && g.measureText(bioLine).width > 680) bioLine = bioLine.slice(0, -2);
    if (bioLine !== bioStr) bioLine += '…';
    g.fillText(bioLine, infoX + 174, infoY + 94);

    g.strokeStyle = 'rgba(104,239,255,0.40)';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(infoX + 34, infoY + 106); g.lineTo(infoX + infoW - 34, infoY + 106); g.stroke();
    for (let x = infoX + 34; x < infoX + infoW - 34; x += 8) {
      g.globalAlpha = 0.18 + Math.sin(G.time * 7 + x * 0.03) * 0.08;
      g.fillStyle = '#68efff'; g.fillRect(x, infoY + 104, 3, 1);
    }
    g.globalAlpha = 1;

    const stats = [
      { label: 'SPEED', val: ch.speed / 310 * 50, max: 50, color: '#27e6ff' },
      { label: 'JUMP', val: Math.abs(ch.jumpVelocity) / 840 * 50, max: 50, color: '#43ff82' },
      { label: 'ARMOR', val: ch.maxArmor / 2 * 50, max: 50, color: '#ffb347' },
      { label: 'AMMO', val: ch.ammoMultiplier * 50, max: 50, color: '#ff6558' },
    ];
    const statY = infoY + 115;
    const cols = [infoX + 42, infoX + 430];
    for (let i = 0; i < stats.length; i++) {
      const st = stats[i];
      const col = i < 2 ? 0 : 1;
      const row = i % 2;
      const x = cols[col], y = statY + row * 25;
      g.font = 'bold 19px "Courier New", monospace';
      g.textAlign = 'left';
      g.fillStyle = '#fff3c7';
      g.fillText(st.label, x, y + 16);
      drawStatBar(x + 116, y, 162, 16, st.val, st.max, st.color, G.time, i * 0.9);
      g.font = 'bold 19px "Courier New", monospace';
      g.fillStyle = st.color;
      g.fillText(String(Math.round(st.val)), x + 292, y + 16);
    }

    const ctlY = VH - 16;
    g.font = 'bold 16px "Courier New", monospace';
    g.textAlign = 'center';
    g.fillStyle = '#b7c8d6';
    g.fillText('LEFT / RIGHT SELECT', VW / 2 - 115, ctlY);
    g.fillStyle = '#111925'; g.fillRect(VW / 2 + 65, ctlY - 17, 70, 20);
    g.strokeStyle = '#8797a6'; g.strokeRect(VW / 2 + 65.5, ctlY - 16.5, 69, 19);
    g.fillStyle = '#dce6ee'; g.fillText('ENTER', VW / 2 + 100, ctlY - 1);
    g.fillStyle = '#b7c8d6'; g.fillText('CONFIRM', VW / 2 + 184, ctlY);

    if (Characters.roster.length > 1) {
      const pulse = 0.55 + Math.sin(G.time * 5.2) * 0.25;
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = pulse;
      g.font = 'bold 34px "Courier New", monospace'; g.textAlign = 'center'; g.fillStyle = accent.border;
      g.fillText('\u25C0', 36, topY + 170);
      g.fillText('\u25B6', VW - 36, topY + 170);
      g.restore();
    }
  }

  // ---------- schermate ----------
  function drawMenu() {
    const menuCam = (G.time * 30) % (Level.W - VW);
    Level.drawBackground(g, menuCam, G.time, VW, VH);
    Level.drawGround(g, menuCam, VW, VH);

    // sprite decorativi
    const menuPlayer = Sprites.getPlayerFrame('run', G.time, Math.floor(G.time * 10) % 4);
    Sprites.draw(g, menuPlayer, VW * 0.3, Level.GROUND, 1);
    Entities.drawMenuShowcase(g, G.time);

    g.fillStyle = 'rgba(10,8,20,0.45)';
    g.fillRect(0, 0, VW, VH);

    // New supplied transparent pixel-art logo.
    if (logoImage.naturalWidth > 0) {
      const size = 245;
      g.save();
      g.imageSmoothingEnabled = false;
      g.drawImage(logoImage, (VW - size) / 2, 22, size, size);
      g.restore();
    } else {
      text(Content.game.titleTop + ' ' + Content.game.titleBottom,
        VW / 2, 120, 52, '#fff0d8', 'center');
    }

    const cx = VW / 2;
    const sel = G.menuSel;
    const drawRow = (i, label, hi, y) => {
      const selected = sel === i;
      text((selected ? '> ' : '  ') + label, cx - 145, y, 21,
        selected ? '#ffffff' : '#a7a39b');
      if (hi !== null) text(tr('hud.high') + ' ' + String(hi).padStart(7, '0'),
        cx + 135, y, 13, selected ? '#ffe28a' : '#796f5d');
    };
    drawRow(0, tr('menu.arcade'), G.hiA, 310);
    drawRow(1, tr('menu.survival'), G.hiS, 344);
    drawRow(2, tr('menu.settings'), null, 378);
    drawRow(3, tr('menu.help'), null, 412);

    if (Math.floor(G.time * 2) % 2 === 0) {
      text(tr('common.pressEnter'), cx, 462, 20, '#fff', 'center');
    }
    text(tr('menu.tip'), cx, 510, 13, '#9aff8a', 'center');
  }

  function drawHelpKey(label, x, y, w) {
    const width = w || 28;
    g.fillStyle = '#202936'; g.fillRect(x, y, width, 22);
    g.fillStyle = '#526070'; g.fillRect(x, y, width, 2);
    g.strokeStyle = '#93a3b5'; g.strokeRect(x + 0.5, y + 0.5, width - 1, 21);
    text(label, x + width / 2, y + 15, 9, '#ffffff', 'center');
  }

  function drawHelpDiagram(index, x, y) {
    if (index === 0) {
      drawHelpKey('W', x + 30, y, 26); drawHelpKey('A', x, y + 24, 26);
      drawHelpKey('S', x + 30, y + 24, 26); drawHelpKey('D', x + 60, y + 24, 26);
    } else if (index === 1) {
      drawHelpKey('J', x, y + 12, 28); drawWeaponIcon(x + 38, y + 16, '#ffe76a', 'mg');
      g.fillStyle = '#ffb347'; g.fillRect(x + 66, y + 20, 18, 2);
    } else if (index === 2) {
      g.fillStyle = '#657447'; g.fillRect(x + 4, y + 18, 72, 22);
      g.fillStyle = '#9aaa62'; g.fillRect(x + 18, y + 9, 39, 14);
      g.fillStyle = '#28312b'; g.fillRect(x + 14, y + 36, 14, 8); g.fillRect(x + 54, y + 36, 14, 8);
      g.fillStyle = '#d8e2ea'; g.fillRect(x + 49, y + 12, 36, 4);
    } else {
      drawHelpKey('ESC', x, y + 12, 42); drawHelpKey('M', x + 48, y + 12, 28);
    }
  }

  function drawHelp() {
    const menuCam = (G.time * 18) % (Level.W - VW);
    Level.drawBackground(g, menuCam, G.time, VW, VH);
    Level.drawGround(g, menuCam, VW, VH);
    g.fillStyle = 'rgba(3,7,14,0.82)'; g.fillRect(0, 0, VW, VH);
    text(tr('help.title'), VW / 2, 56, 34, '#ffe28a', 'center');
    const rows = [
      ['01', tr('menu.controls.move'), '#dce8ee'],
      ['02', tr('menu.controls.combat'), '#ffffff'],
      ['03', tr('menu.controls.vehicle'), '#9aff8a'],
      ['04', tr('menu.controls.system'), '#aeb8c2'],
    ];
    for (let i = 0; i < rows.length; i++) {
      const y = 115 + i * 72;
      g.fillStyle = 'rgba(255,255,255,0.045)'; g.fillRect(130, y - 27, 700, 52);
      g.fillStyle = rows[i][2]; g.fillRect(130, y - 27, 3, 52);
      text(rows[i][0], 151, y + 5, 12, '#ffb347');
      drawHelpDiagram(i, 185, y - 25);
      text(rows[i][1], 290, y + 5, 11, rows[i][2]);
    }
    text(tr('menu.tip'), VW / 2, 435, 13, '#ffe28a', 'center');
    text(tr('help.back'), VW / 2, 494, 15, '#ffffff', 'center');
  }

  function drawGameOver() {
    drawWorld();
    g.fillStyle = 'rgba(20,0,0,0.6)';
    g.fillRect(0, 0, VW, VH);
    text(tr('mission.gameOver'), VW / 2, VH / 2 - 20, 56, '#e83a2a', 'center');
    text(tr('hud.score') + '  ' + String(G.score).padStart(7, '0'), VW / 2, VH / 2 + 30, 20, '#ffe28a', 'center');
    if (G.mode === 'survival') {
      text(tr('mission.waveReached', { number: G.wave }), VW / 2, VH / 2 + 58, 16, '#ffae42', 'center');
    }
    if (G.overT > 1 && Math.floor(G.time * 2) % 2 === 0) {
      text(tr('common.pressEnter'), VW / 2, VH / 2 + 95, 20, '#fff', 'center');
    }
  }

  function drawWin() {
    drawWorld();
    g.fillStyle = 'rgba(0,10,30,0.55)';
    g.fillRect(0, 0, VW, VH);
    text(tr('mission.complete'), VW / 2, VH / 2 - 60, 46, '#9aff8a', 'center');
    if (G.winT > 0.8) text(tr('hud.score') + '  ' + String(G.score).padStart(7, '0'), VW / 2, VH / 2, 24, '#ffe28a', 'center');
    if (G.winT > 1.4) text(tr('mission.lifeBonus', { score: G.lives * 1000 }), VW / 2, VH / 2 + 34, 16, '#7ad0ff', 'center');
    if (G.winT > 2 && Math.floor(G.time * 2) % 2 === 0) {
      text(tr('common.pressEnter'), VW / 2, VH / 2 + 90, 20, '#fff', 'center');
    }
  }

  function drawIntroActors(cam) {
    const intro = G.intro;
    if (!intro) return false;
    if (intro.boardActive) {
      Sprites.drawRocketBoard(g, intro.boardX - cam, intro.boardY, 1, G.time,
        intro.phase === 'depart' ? 1 : intro.phase === 'fly' ? 0.72 : 0.4);
    }
    if (intro.active && !intro.jumped) {
      const rider = Sprites.getPlayerFrame('idle', G.time, 0);
      Sprites.draw(g, rider, G.player.x - cam, G.player.y, 1);
      return true;
    }
    return false;
  }

  // ---------- mondo ----------
  function bossCinematicZoom() {
    if (!G.boss || G.bossCardT <= 0) return 1;
    const elapsed = 3.2 - G.bossCardT;
    function ease(value) {
      const k = Math.max(0, Math.min(1, value));
      return k * k * (3 - 2 * k);
    }
    if (elapsed < 0.72) return 1 + ease(elapsed / 0.72) * 0.32;
    if (elapsed < 1.48) return 1.32;
    return 1 + (1 - ease((elapsed - 1.48) / 1.72)) * 0.32;
  }

  function drawWorld() {
    const shakeX = G.shake > 0 ? (Math.random() - 0.5) * G.shake : 0;
    const shakeY = G.shake > 0 ? (Math.random() - 0.5) * G.shake : 0;
    const cam = G.camX + shakeX;

    g.save();
    const cinematicZoom = bossCinematicZoom();
    if (cinematicZoom > 1 && G.boss) {
      const focusX = Math.max(650, Math.min(825, G.boss.x - cam));
      const focusY = Math.max(245, Math.min(410, G.boss.y - 72));
      g.translate(focusX, focusY);
      g.scale(cinematicZoom, cinematicZoom);
      g.translate(-focusX, -focusY);
    }
    Level.drawBackground(g, cam, G.time, VW, VH);
    g.save();
    g.translate(0, shakeY);
    Level.drawGround(g, cam, VW, VH);
    Entities.drawWarnings(g, cam);
    Entities.drawProps(g, cam);
    Entities.drawPows(g, cam);
    Entities.drawPickups(g, cam);
    Entities.drawEnemies(g, cam);
    Entities.drawBoss(g, cam);
    Entities.drawSlugs(g, cam);
    // Tutorial board: handles idle waiting and mounted ride (player on board)
    if (G.mode === 'tutorial') drawTutorialBoard(g, cam);
    const introDrewPlayer = drawIntroActors(cam);
    // During tutorial outro, player is drawn as rider inside drawTutorialBoard, so skip normal draw when mounted
    const skipNormalPlayer = G.mode === 'tutorial' && G.tutorial && G.tutorial.surfboard && G.tutorial.surfboard.mounted;
    if (G.player && !introDrewPlayer && !skipNormalPlayer) Entities.drawPlayer(g, cam);
    Entities.drawGrenades(g, cam);
    Entities.drawBullets(g, cam);
    Entities.drawParticles(g, cam);
    Entities.drawScorePops(g, cam);
    g.restore();
    g.restore();
  }

  function drawPortalTransition() {
    if (G.portalTransitionT <= 0) return;
    const k = 1 - G.portalTransitionT / 0.9;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      g.globalAlpha = (1 - k * 0.45) * (0.12 + i * 0.025);
      g.fillStyle = i % 2 ? '#68efff' : '#c26cff';
      const radius = Math.round((30 + k * 520 + i * 18) / 12) * 12;
      for (let point = 0; point < 24; point++) {
        const angle = point / 24 * Math.PI * 2 + k * 8 + i;
        const x = Math.round((VW / 2 + Math.cos(angle) * radius) / 12) * 12;
        const y = Math.round((VH / 2 + Math.sin(angle) * radius) / 12) * 12;
        g.fillRect(x - 6, y - 6, 12, 12);
      }
    }
    g.globalAlpha = k * 0.72; g.fillStyle = '#d9f8ff'; g.fillRect(0, 0, VW, VH); g.restore();
  }

  function drawMenuIris() {
    if (G.state !== 'menu' || G.menuIrisT <= 0) return;
    const progress = 1 - G.menuIrisT / 1.15;
    const eased = progress * progress * (3 - 2 * progress);
    const radius = Math.round(Math.hypot(VW, VH) * 0.62 * eased / 12) * 12;
    g.save(); g.fillStyle = '#000'; g.beginPath(); g.rect(0, 0, VW, VH);
    if (radius > 0.5) {
      for (let i = 0; i <= 28; i++) {
        const angle = -i / 28 * Math.PI * 2;
        const x = Math.round((VW / 2 + Math.cos(angle) * radius) / 12) * 12;
        const y = Math.round((VH / 2 + Math.sin(angle) * radius) / 12) * 12;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.closePath();
    }
    g.fill('evenodd');
    if (radius > 10) for (let i = 0; i < 16; i++) {
      const angle = i / 16 * Math.PI * 2;
      const x = Math.round((VW / 2 + Math.cos(angle) * radius) / 12) * 12;
      const y = Math.round((VH / 2 + Math.sin(angle) * radius) / 12) * 12;
      g.fillRect(x - 6, y - 6, 12, 12);
    }
    g.restore();
  }

  // ---------- render ----------
  function render() {
    g.clearRect(0, 0, VW, VH);
    if (G.state === 'menu') drawMenu();
    else if (G.state === 'characterselect') drawCharacterSelect();
    else if (G.state === 'help') drawHelp();
    else if (G.state === 'gameover') drawGameOver();
    else if (G.state === 'win') drawWin();
    else {
      drawWorld();
      drawScreenFX();
      ExtremeForeground.draw(g);
      // Tutorial extreme foreground must be frontmost (spec: tutorial_foreground01.png)
      if (Level && Level.drawExtremeForeground) Level.drawExtremeForeground(g, G.camX, VW, VH);
      if (!G.paused) Dialogue.draw(g, VW, VH, G.characterId);
      if (!G.intro || !G.intro.active) drawHUD();
    }
    // settings overlay sempre sopra a tutto
    drawMenuIris();
    drawPortalTransition();
    if (Settings.isOpen()) Settings.draw(g, VW, VH);
    RetroFilter.draw(g, VW, VH, G.time);
  }

  // Mission map hand-off: Level 1 starts directly after deployment instead of
  // returning the player to the main menu.
  const launchQuery = new URLSearchParams(window.location.search);
  if (launchQuery.get('resumePortal') === '1') {
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem('dh_portal_return') || 'null'); } catch (e) {}
    if (saved) {
      startGame('arcade', Characters.isValid(saved.characterId) ? saved.characterId : initialCharacter);
      G.intro = null;
      G.score = saved.score || 0; G.lives = saved.lives;
      G.player.x = saved.returnX || Level.PORTAL_X + 95; G.player.y = Level.GROUND;
      G.player.weapon = saved.weapon || 'pistol';
      G.player.ammo = G.player.weapon === 'pistol' ? Infinity : Math.max(0, saved.ammo || 0);
      G.player.grenades = saved.grenades || 0; G.player.homingMissiles = saved.homingMissiles || 0;
      G.player.armor = saved.armor || G.player.maxArmor;
      G.camX = Math.max(0, G.player.x - VW * 0.38);
      G.spawnIdx = Level.spawns.findIndex(entry => entry.x > G.player.x - 220);
      if (G.spawnIdx < 0) G.spawnIdx = Level.spawns.length;
      sessionStorage.removeItem('dh_portal_return');
      history.replaceState(null, '', 'level1.html');
    }
  } else if (launchQuery.get('autostart') === '1') {
    let launchMode = launchQuery.get('mode');
    if (launchMode === 'survival') launchMode = 'survival';
    else if (launchMode === 'tutorial' || window.IS_TUTORIAL) launchMode = 'tutorial';
    else launchMode = 'arcade';
    const launchCharacter = launchQuery.get('character');
    const validCharacter = Characters.isValid(launchCharacter) ? launchCharacter : initialCharacter;
    // keep current html filename (level1.html or tutorial.html) in history
    const currentFile = location.pathname.split('/').pop() || 'level1.html';
    try { history.replaceState(null, '', currentFile); } catch(e) {}
    startGame(launchMode, validCharacter);
  } else if (window.IS_TUTORIAL) {
    // Direct tutorial load without query (when opened via index.html iframe)
    const tq = new URLSearchParams(location.search);
    const tc = tq.get('character') || initialCharacter;
    const vc = Characters.isValid(tc) ? tc : initialCharacter;
    setTimeout(function(){ startGame('tutorial', vc); }, 80);
  }

  // ---------- loop a passo fisso ----------
  let last = performance.now();
  let acc = 0;
  const STEP = 1 / 60;

  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.25) dt = 0.25;
    acc += dt;
    while (acc >= STEP) {
      update(STEP);
      Input.endFrame();
      acc -= STEP;
    }
    render();
  }
  requestAnimationFrame(frame);

  // ---------- adattamento finestra ----------
  function resize() {
    const scale = Math.min(window.innerWidth / VW, window.innerHeight / VH);
    canvas.style.width = Math.floor(VW * scale) + 'px';
    canvas.style.height = Math.floor(VH * scale) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();
})();
