// ============================================================
// ENTITIES — giocatore, nemici, proiettili, esplosioni, boss
// (opera sullo stato globale G definito in game.js)
// ============================================================
(function () {
  const GRAV = 2200;
  const P_W = 24, P_H = 54, P_H_CROUCH = 36;
  const DEATH_SPIRIT_START = 1.12;
  const DEATH_RESPAWN_TIME = 2.85;
  const enemyHeliArt = { small: new Image(), big: new Image() };
  enemyHeliArt.small.src = 'assets/vehicles/enemies/heli01_small.png';
  enemyHeliArt.big.src = 'assets/vehicles/enemies/heli01_big.png';
  const bossTankArt = { full: new Image(), chassis: new Image(), pieces: new Image(), destroyed: new Image() };
  bossTankArt.full.src = 'assets/vehicles/boss_tank01/full.png';
  bossTankArt.chassis.src = 'assets/vehicles/boss_tank01/chassis.png';
  bossTankArt.pieces.src = 'assets/vehicles/boss_tank01/pieces.png';
  bossTankArt.destroyed.src = 'assets/vehicles/boss_tank01/destroyed.png';
  const enemyTankArt = { full: new Image(), chassis: new Image(), pieces: new Image(), destroyed: new Image() };
  enemyTankArt.full.src = 'assets/vehicles/enemy_tank01/full.png';
  enemyTankArt.chassis.src = 'assets/vehicles/enemy_tank01/chassis.png';
  enemyTankArt.pieces.src = 'assets/vehicles/enemy_tank01/pieces.png';
  enemyTankArt.destroyed.src = 'assets/vehicles/enemy_tank01/destroyed.png';
  const robotSoldierArt = {};
  for (const part of ['full', 'fire', 'legs', 'hands', 'torso', 'head']) {
    const image = new Image(); image.src = 'assets/enemies/soldier01/' + part + '.png';
    robotSoldierArt[part] = image;
  }
  const soldier02Art = {}, soldier03Art = {};
  for (const part of ['full', 'head', 'legs', 'hands', 'gun', 'torso']) {
    const image = new Image(); image.src = 'assets/enemies/soldier02/' + part + '.png'; soldier02Art[part] = image;
  }
  for (const part of ['full', 'wheel', 'chassis', 'saw']) {
    const image = new Image(); image.src = 'assets/enemies/soldier03/' + part + '.png'; soldier03Art[part] = image;
  }
  const soldier04Art = {};
  for (const part of ['full', 'bunker', 'gun']) {
    const image = new Image(); image.src = 'assets/enemies/soldier04/' + part + '.png'; soldier04Art[part] = image;
  }
  const soldier05Art = {};
  for (const part of ['full', 'body', 'gun', 'legs', 'head']) {
    const image = new Image(); image.src = 'assets/enemies/soldier05/' + part + '.png'; soldier05Art[part] = image;
  }
  const soldier06Art = {};
  for (const part of ['full', 'head', 'torso', 'legs', 'laser_camera']) {
    // Support both old typo filename 'enemie_soldier06_*.png' and normalized 'enemie_soldier06' fallback
    const image = new Image();
    const key = part === 'full' ? 'enemie_soldier06' : 'enemie_soldier06_' + part;
    image.src = 'assets/enemies/soldier06/' + key + '.png';
    // also try alternate without 'enemie_' prefix if missing (future normalized)
    const altSrc = 'assets/enemies/soldier06/' + part + '.png';
    image.onerror = (function (img, alt) { return function () { if (img.src.indexOf(alt) === -1) img.src = alt; }; })(image, altSrc);
    soldier06Art[part] = image;
  }
  const allyTank02Art = { full: new Image(), chassis: new Image(), wheels: new Image(), turret: new Image(), drill: new Image() };
  allyTank02Art.full.src = 'assets/vehicles/ally_tank02/ally_tank02.png';
  allyTank02Art.chassis.src = 'assets/vehicles/ally_tank02/ally_tank02_chassis.png';
  allyTank02Art.wheels.src = 'assets/vehicles/ally_tank02/ally_tank02_wheels.png';
  allyTank02Art.turret.src = 'assets/vehicles/ally_tank02/ally_tank02_guntorretpng.png';
  allyTank02Art.drill.src = 'assets/vehicles/ally_tank02/ally_tank02_point.png';
  const destroyedHeliArt = { small:new Image(), big:new Image() };
  destroyedHeliArt.small.src = 'assets/vehicles/enemies/heli01_small_destroyed.png';
  destroyedHeliArt.big.src = 'assets/vehicles/enemies/heli01_big_destroyed.png';

  function deathSpiritStart(p) {
    return p && p.characterId === 'juan_p' ? 0.75 : DEATH_SPIRIT_START;
  }

  const WEAPONS = {
    pistol: { nameKey: 'weapon.pistol', rate: 0.16, auto: false, ammo: Infinity, recoil: 3 },
    mg:     { nameKey: 'weapon.mg', rate: 0.07, auto: true, ammo: 200, recoil: 2.2 },
    spread: { nameKey: 'weapon.spread', rate: 0.45, auto: false, ammo: 30, recoil: 6 },
    rocket: { nameKey: 'weapon.rocket', rate: 0.5, auto: false, ammo: 25, recoil: 7 },
    flame:  { nameKey: 'weapon.flame', rate: 0.055, auto: true, ammo: 90, recoil: 1.2 },
  };

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function overlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // ============================================================
  // PLAYER
  // ============================================================
  function createPlayer(x, characterId) {
    const profile = Characters.get(characterId || 'juan_p');
    return {
      x: x, y: Level.GROUND, vx: 0, vy: 0,
      characterId: profile.id, profile: profile,
      armor: profile.maxArmor, maxArmor: profile.maxArmor,
      facing: 1, onGround: true, crouch: false, aimUp: false,
      weapon: 'pistol', ammo: Infinity,
      grenades: profile.startingGrenades, homingMissiles: 0,
      fireT: 0, secondaryT: 0, animT: 0, inv: 2.0, dead: false, deadT: 0,
      deathHeavenFx: false, deathTrailT: 0, jetpackT: 0,
      hudPulse: 0, secondaryPulse: 0,
      dropT: 0, knifeT: 0, runFrame: 0, lastRunFrame: -1, recoil: 0,
      jumpBufT: 0, coyoteT: 0, doubleJumpReady: true, // buffered jump + one air jump
      inSlug: null, mountCd: 0,     // veicolo pilotato
    };
  }

  function playerHitbox(p) {
    const h = p.crouch ? P_H_CROUCH : P_H;
    return { x: p.x - P_W / 2, y: p.y - h, w: P_W, h: h };
  }

  function playerPoseName(p) {
    if (p.crouch) return 'crouch';
    if (!p.onGround) return p.aimUp ? 'jumpUp' : 'jump';
    if (Math.abs(p.vx) > 10) return p.aimUp ? 'runUp' : 'run';
    return p.aimUp ? 'idleUp' : 'idle';
  }

  function updatePlayer(dt) {
    const p = G.player;
    p.fireT -= dt;
    p.secondaryT -= dt;
    p.knifeT -= dt;
    p.dropT -= dt;
    p.mountCd -= dt;
    p.recoil = Math.max(0, p.recoil - dt * 45);
    p.hudPulse = Math.max(0, p.hudPulse - dt);
    p.secondaryPulse = Math.max(0, p.secondaryPulse - dt);
    if (p.jetpackT > 0) p.jetpackT = Math.max(0, p.jetpackT - dt);
    if (p.inv > 0) p.inv -= dt;

    // input buffer del salto (sopravvive a hit-stop e atterraggi imminenti)
    if (Input.jump()) p.jumpBufT = p.profile.jumpBuffer;
    else p.jumpBufT -= dt;

    if (p.dead) {
      p.deadT += dt;
      // The authored frames contain the fall; physics only settles an airborne
      // death onto the ground and adds a small horizontal impact drift.
      p.vy += GRAV * dt;
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      p.vx *= Math.max(0, 1 - dt * 4.5);
      if (p.y > Level.GROUND) { p.y = Level.GROUND; p.vy = 0; }

      const spiritStart = deathSpiritStart(p);
      if (p.deadT >= spiritStart && !p.deathHeavenFx) {
        p.deathHeavenFx = true;
        p.deathTrailT = 0;
        startHeavenFx(p);
      }
      if (p.deadT >= spiritStart) {
        p.deathTrailT -= dt;
        if (p.deathTrailT <= 0) {
          const spirit = deathSpiritPosition(p);
          spawnHeavenTrail(spirit.x, spirit.y);
          p.deathTrailT = 0.055;
        }
      }

      if (p.deadT > DEATH_RESPAWN_TIME) respawn();
      return;
    }

    // --- a bordo dello SLUG: i controlli sono gestiti da updateSlugs ---
    if (p.inSlug) {
      p.crouch = false;
      p.aimUp = Input.up();
      return;
    }

    // --- salita a bordo di uno SLUG libero ---
    if (p.mountCd <= 0) {
      for (const s of G.slugs) {
        if (s.hp > 0 && !s.destroying && !s.occupied &&
            Math.abs(p.x - s.x) < 72 && Math.abs(p.y - s.y) < 105) {
          s.occupied = true;
          p.inSlug = s;
          p.crouch = false;
          SFX.mount();
          return;
        }
      }
    }

    // --- movimento orizzontale ---
    const speed = p.profile.speed;
    p.crouch = p.onGround && Input.downDir();
    let move = 0;
    if (Input.left()) move -= 1;
    if (Input.right()) move += 1;
    if (p.crouch) move *= 0.45;
    p.vx = move * speed;
    if (move !== 0) p.facing = move > 0 ? 1 : -1;
    p.aimUp = Input.up();
    if (p.jetpackT > 0) {
      let fly = 0;
      if (Input.up() || Input.jumpHeld()) fly -= 1;
      if (Input.downDir()) fly += 1;
      p.vy = fly * 235;
      p.onGround = false;
      p.crouch = false;
    }

    // --- salto / drop (con buffer e coyote time) ---
    if (p.jumpBufT > 0 && (p.onGround || p.coyoteT > 0 || p.doubleJumpReady)) {
      const airJump = !p.onGround && p.coyoteT <= 0;
      if (p.crouch && p.onGround && onPlatform(p)) {
        p.dropT = 0.22; p.y += 4; p.onGround = false; p.vy = 120;
      } else {
        p.vy = p.profile.jumpVelocity; p.onGround = false; SFX.jump();
        if (airJump) {
          p.doubleJumpReady = false;
          G.particles.push({ kind: 'ring', x: p.x, y: p.y - 8, vx: 0, vy: 0,
            t: 0, life: 0.28, color: '#68efff', size: 9, grav: 0 });
          for (let i = 0; i < 8; i++) G.particles.push({ kind: 'spark',
            x: p.x, y: p.y - 6, vx: rnd(-150, 150), vy: rnd(30, 180),
            t: 0, life: rnd(0.12, 0.28), color: '#d9f8ff', size: rnd(1.5, 3.5), grav: 180 });
        }
      }
      p.jumpBufT = 0;
      p.coyoteT = 0;
    }

    // --- fisica ---
    const wasAir = !p.onGround;
    p.vy += (p.jetpackT > 0 ? 0 : GRAV) * dt;
    const prevY = p.y;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.x = clamp(p.x, G.camLockL + 14, G.camLockR - 14);
    if (p.jetpackT > 0) {
      p.y = clamp(p.y, 105, Level.GROUND - 18);
      if (Math.random() < dt * 28) G.particles.push({ kind: 'fireball',
        x: p.x - p.facing * 9, y: p.y - 18, vx: rnd(-35, 35), vy: rnd(100, 210),
        t: 0, life: rnd(0.16, 0.3), color: '#ff8b2f', size: rnd(4, 8),
        grav: -20, drag: 0.4, phase: rnd(0, 6.28), stretch: 1.4 });
    }

    // atterraggio
    p.onGround = false;
    if (p.jetpackT <= 0 && p.vy >= 0) {
      if (p.y >= Level.GROUND && !Level.isLavaGap(p.x)) {
        if (prevY <= Level.GROUND + 1) {
          p.y = Level.GROUND; p.vy = 0; p.onGround = true;
        }
      }
      if (!p.onGround && p.dropT <= 0) {
        for (const pl of Level.platforms) {
          if (pl.dead) continue;
          if (p.x > pl.x - 4 && p.x < pl.x + pl.w + 4 &&
              prevY <= pl.y + 1 && p.y >= pl.y) {
            p.y = pl.y; p.vy = 0; p.onGround = true;
            if (pl.fragile && !pl.triggered) { pl.triggered = true; pl.breakT = 1.45; }
            break;
          }
        }
      }
      if (p.y > Level.GROUND && !Level.isLavaGap(p.x)) { p.y = Level.GROUND; p.vy = 0; p.onGround = true; }
    }

    if (Level.isLavaGap(p.x) && p.y > 565) {
      killPlayer();
      return;
    }

    // coyote time: piccola finestra di salto dopo aver lasciato un bordo
    if (p.onGround) { p.coyoteT = p.profile.coyoteTime; p.doubleJumpReady = true; }
    else p.coyoteT -= dt;

    // sbuffo di polvere all'atterraggio
    if (wasAir && p.onGround) {
      SFX.land();
      for (let i = 0; i < 5; i++) {
        G.particles.push({
          x: p.x + rnd(-12, 12), y: p.y, vx: rnd(-70, 70), vy: rnd(-60, -10),
          t: 0, life: rnd(0.2, 0.4), color: '#b09a6a', size: rnd(3, 6), grav: 200,
        });
      }
    }

    // --- animazione corsa ---
    if (p.onGround && move !== 0) {
      p.animT += dt * 10;
      const nextRunFrame = Math.floor(p.animT) % 4;
      const detailedPhase = p.characterId === 'juan_p' ?
        Math.floor((p.animT / 10) * 30) % 20 : nextRunFrame;
      const footContact = p.characterId === 'juan_p' ?
        (detailedPhase === 0 || detailedPhase === 10) :
        (detailedPhase === 1 || detailedPhase === 3);
      if (p.lastRunFrame >= 0 && detailedPhase !== p.lastRunFrame && footContact) {
        SFX.step();
      }
      p.lastRunFrame = detailedPhase;
      p.runFrame = nextRunFrame;
      // polvere occasionale dai piedi
      if (Math.random() < dt * 6) {
        G.particles.push({
          x: p.x - p.facing * 10, y: p.y, vx: -p.facing * rnd(20, 50), vy: rnd(-40, -10),
          t: 0, life: 0.3, color: '#a8946a', size: rnd(2, 4), grav: 150,
        });
      }
    } else {
      p.animT = 0; p.runFrame = 0; p.lastRunFrame = -1;
    }

    // --- fuoco ---
    const w = WEAPONS[p.weapon];
    const wantFire = w.auto ? Input.fire() : Input.firePressed() || (Input.fire() && p.fireT < -0.12);
    if (wantFire && p.fireT <= 0) {
      const knifed = tryKnife(p);
      if (!knifed) firePlayerWeapon(p);
      p.fireT = w.rate;
    }

    // --- arma secondaria sulla spalla ---
    // L'upgrade guidato ha priorità; esauriti i 10 missili il lanciatore
    // torna automaticamente alle granate normali.
    if (Input.grenade() && p.secondaryT <= 0 && (p.homingMissiles > 0 || p.grenades > 0)) {
      firePlayerSecondary(p);
      p.secondaryT = 0.3;
    }
  }

  function onPlatform(p) {
    if (p.y >= Level.GROUND) return false;
    return true;
  }

  function tryKnife(p) {
    for (const e of G.enemies) {
      if (e.dead || !isInfantry(e.type)) continue;
      const dx = e.x - p.x, dy = Math.abs(e.y - p.y);
      if (dy < 50 && Math.abs(dx) < 46 && (dx === 0 || (dx > 0) === (p.facing > 0))) {
        killEnemy(e, p.facing);
        p.knifeT = 0.18;
        hitSparks(e.x, e.y - 34, p.facing, 'pistol');
        SFX.knife();
        comboKill(150, e.x, e.y - 60);
        G.hitStop = Math.max(G.hitStop, 0.05);
        return true;
      }
    }
    // il coltello rompe anche casse e barili
    for (const pr of G.props) {
      if (pr.dead) continue;
      const dx = pr.x - p.x;
      if (Math.abs(p.y - pr.y) < 40 && Math.abs(dx) < 44 && (dx > 0) === (p.facing > 0)) {
        EntityProps.damage(pr, 1);
        p.knifeT = 0.18;
        SFX.knife();
        return true;
      }
    }
    return false;
  }

  function firePlayerWeapon(p) {
    const muzzleY = p.crouch ? p.y - 16 : p.y - 28;
    const poseName = playerPoseName(p);
    const artMuzzle = Sprites.getPlayerSocket(poseName, 'muzzle', p.facing);
    let mx, my, dirX, dirY;
    if (p.aimUp && !p.crouch) {
      mx = artMuzzle ? p.x + artMuzzle.x : p.x + p.facing * 4;
      my = artMuzzle ? p.y + artMuzzle.y : p.y - P_H - 6;
      dirX = 0; dirY = -1;
    } else {
      mx = artMuzzle ? p.x + artMuzzle.x : p.x + p.facing * 28;
      my = artMuzzle ? p.y + artMuzzle.y : muzzleY;
      dirX = p.facing; dirY = 0;
    }
    const spawnMuzzle = () => weaponMuzzleFx(mx, my, dirX, dirY, p.weapon);

    p.recoil = WEAPONS[p.weapon].recoil;

    // bossolo espulso (non per flame/rocket)
    if (p.weapon !== 'flame' && p.weapon !== 'rocket') {
      G.particles.push({
        kind: 'casing', x: p.x - p.facing * 6, y: my - 4,
        vx: -p.facing * rnd(60, 150), vy: rnd(-280, -160),
        t: 0, life: 0.7, color: '#d8b84a', size: 3, grav: 1100,
        rot: rnd(0, Math.PI * 2), spin: rnd(-18, 18),
      });
    }

    if (p.weapon === 'spread') {
      SFX.spread();
      for (let i = -2; i <= 2; i++) {
        const a = i * 0.16;
        const bvx = (dirX * Math.cos(a) - dirY * Math.sin(a)) * 760;
        const bvy = (dirX * Math.sin(a) + dirY * Math.cos(a)) * 760;
        G.pBullets.push({ x: mx, y: my, vx: bvx, vy: bvy, life: 0.32, dmg: 2, type: 'spread' });
      }
      spawnMuzzle();
    } else if (p.weapon === 'rocket') {
      SFX.rocket();
      G.pBullets.push({ x: mx, y: my, vx: dirX * 640, vy: dirY * 640, life: 2.2, dmg: 6, type: 'rocket', trailT: 0 });
      spawnMuzzle();
    } else if (p.weapon === 'flame') {
      if (Math.random() < 0.35) SFX.flame();
      G.pBullets.push({
        x: mx, y: my,
        vx: dirX * 430 + rnd(-26, 26) + p.vx * 0.4,
        vy: dirY * 430 + rnd(-26, 26) - (dirY === 0 ? 24 : 0),
        life: 0.4, dmg: 1, type: 'flame', t: 0, trailT: 0,
      });
      if (Math.random() < 0.4) spawnMuzzle();
    } else {
      if (p.weapon === 'mg') SFX.mg(); else SFX.pistol();
      const sp = p.weapon === 'mg' ? 980 : 900;
      const jit = p.weapon === 'mg' ? rnd(-30, 30) : 0;
      G.pBullets.push({
        x: mx, y: my,
        vx: dirX * sp + (dirY !== 0 ? jit : 0),
        vy: dirY * sp + (dirX !== 0 ? jit : 0),
        life: 0.9, dmg: 1, type: p.weapon,
      });
      spawnMuzzle();
    }

    if (p.weapon !== 'pistol') {
      p.ammo--;
      if (p.ammo <= 0) {
        SFX.ammoEmpty();
        p.hudPulse = 0.45;
        p.weapon = 'pistol'; p.ammo = Infinity;
      }
    }
  }

  function firePlayerSecondary(p) {
    const poseName = playerPoseName(p);
    const socket = Sprites.getPlayerSocket(poseName, 'launcher', p.facing);
    const aimingUp = p.aimUp && !p.crouch;
    const fallbackX = aimingUp ? p.facing * -12 : p.facing * 18;
    const fallbackY = aimingUp ? -62 : -48;
    const sx = p.x + (socket ? socket.x : fallbackX);
    const sy = p.y + (socket ? socket.y : fallbackY);
    const dirX = aimingUp ? 0 : p.facing;
    const dirY = aimingUp ? -1 : 0;

    const guided = p.homingMissiles > 0;
    if (guided) {
      p.homingMissiles--;
      const angle = aimingUp ? -Math.PI / 2 : (p.facing > 0 ? 0 : Math.PI);
      const speed = 380;
      G.grenades.push({
        kind: 'homing', x: sx, y: sy,
        vx: Math.cos(angle) * speed + p.vx * 0.2,
        vy: Math.sin(angle) * speed,
        speed: speed, life: 4.2, turnRate: 5.2,
        target: null, retargetT: 0, trailT: 0, lockSound: false,
      });
      SFX.guidedLaunch();
      secondaryMuzzleFx(sx, sy, dirX, dirY, true);
    } else {
      p.grenades--;
      G.grenades.push({
        kind: 'pgren', x: sx, y: sy,
        vx: aimingUp ? p.facing * 55 + p.vx * 0.2 : p.facing * 500 + p.vx * 0.25,
        vy: aimingUp ? -680 : -330,
        t: aimingUp ? 1.2 : 1.05, bounced: false, rot: 0,
      });
      SFX.grenadeLaunch();
      secondaryMuzzleFx(sx, sy, dirX, dirY, false);
    }

    p.recoil = Math.max(p.recoil, guided ? 3 : 4.5);
    G.shake = Math.max(G.shake, 1.5);
  }

  function killPlayer() {
    const p = G.player;
    // god mode (debug): nessun danno, solo feedback visivo discreto
    if (G.godMode) { G.hurtFlash = Math.max(G.hurtFlash, 0.12); return; }
    // a bordo dello SLUG: l'armatura assorbe il colpo
    if (p.inSlug) {
      const s = p.inSlug;
      if (s.hitCd <= 0) {
        damageSlug(s, 1);
        s.hitCd = 0.8;
      }
      return;
    }
    if (p.dead || p.inv > 0) return;
    if (p.armor > 1) {
      p.armor--;
      p.inv = 0.9;
      p.vx = -p.facing * 90 * p.profile.knockback;
      if (!p.onGround) p.vy = Math.min(p.vy, -90 * p.profile.knockback);
      p.hudPulse = 0.65;
      G.shake = Math.max(G.shake, 5);
      G.hitStop = Math.max(G.hitStop, 0.055);
      G.hurtFlash = 0.32;
      G.combo.t = 0; G.combo.n = 0;
      SFX.armorBreak();
      armorBreakFx(p.x, p.y - 48, p.facing);
      return;
    }
    p.dead = true; p.deadT = 0; p.jetpackT = 0;
    p.deathHeavenFx = false; p.deathTrailT = 0;
    p.vy = p.onGround ? 0 : Math.min(p.vy, 80);
    p.vx = -p.facing * 42 * p.profile.knockback;
    SFX.deathBurst();
    G.shake = Math.max(G.shake, 7);
    G.hurtFlash = 0.48;
    G.combo.t = 0; G.combo.n = 0; // la catena si spezza
    deathImpactFx(p.x, p.y - 52, p.facing);
  }

  function respawn() {
    G.lives--;
    if (G.lives < 0) { G.gameOver(); return; }
    const p = G.player;
    p.dead = false; p.deadT = 0;
    p.armor = p.maxArmor;
    p.deathHeavenFx = false; p.deathTrailT = 0;
    p.x = clamp(p.x, G.camLockL + 40, G.camLockR - 40);
    p.y = -40; p.vy = 0; p.vx = 0; p.doubleJumpReady = true;
    p.inv = 2.5;
    p.weapon = 'pistol'; p.ammo = Infinity;
    p.grenades = Math.max(p.grenades, 5);
  }

  function deathBodyFrame(t) {
    if (t < 0.16) return 0;
    if (t < 0.33) return 1;
    if (t < 0.52) return 2;
    if (t < 0.73) return 3;
    return 4;
  }

  function deathSpiritPosition(p) {
    const progress = clamp((p.deadT - DEATH_SPIRIT_START) /
      (DEATH_RESPAWN_TIME - DEATH_SPIRIT_START), 0, 1);
    const eased = Math.pow(progress, 1.18);
    return {
      x: p.x + Math.sin(progress * Math.PI * 5) * (2 + progress * 5),
      y: p.y - 24 - eased * 485,
      progress: progress,
    };
  }

  function drawHeavenAura(g, x, y, groundY, progress) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    const beamAlpha = Math.sin(Math.min(1, progress * 1.4) * Math.PI) * 0.18;
    const beam = g.createLinearGradient(x - 36, 0, x + 36, 0);
    beam.addColorStop(0, 'rgba(170,235,255,0)');
    beam.addColorStop(0.5, 'rgba(230,250,255,1)');
    beam.addColorStop(1, 'rgba(170,235,255,0)');
    g.globalAlpha = beamAlpha;
    g.fillStyle = beam;
    g.fillRect(x - 36, 0, 72, Math.max(0, groundY));

    // Floating halo and a soft inner glow around the spirit.
    g.globalAlpha = Math.max(0, 0.8 - progress * 0.35);
    g.strokeStyle = '#fff3a8';
    g.lineWidth = 2;
    g.save();
    g.translate(x, y - 96);
    g.scale(1, 0.32);
    g.beginPath();
    g.arc(0, 0, 15 + Math.sin(G.time * 8) * 2, 0, Math.PI * 2);
    g.stroke();
    g.restore();
    g.globalAlpha = Math.max(0, 0.26 - progress * 0.12);
    g.fillStyle = '#dff8ff';
    g.beginPath();
    g.arc(x, y - 28, 34, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  function drawPlayer(g, camX) {
    const p = G.player;
    if (p.inSlug) return; // il pilota è disegnato dentro lo SLUG

    if (p.dead) {
      if (p.characterId === 'juan_p') {
        // Frames 0–9 contain the collapse and spirit formation over the body.
        // Frames 10–12 contain the separated spirit, which the engine carries
        // upward while holding a faded body frame on the ground.
        const splitTime = 10 / 8;
        if (p.deadT < splitTime) {
          const frameIndex = Math.min(9, Math.floor(p.deadT * 8));
          const frame = Sprites.getPlayerFrameAt('dead', frameIndex, 0);
          const emergence = clamp((p.deadT - 0.75) / 0.5, 0, 1);
          if (emergence > 0) drawHeavenAura(g, p.x - camX, p.y, p.y, emergence * 0.35);
          Sprites.draw(g, frame, p.x - camX, p.y, p.facing);
        } else {
          const progress = clamp((p.deadT - splitTime) / (DEATH_RESPAWN_TIME - splitTime), 0, 1);
          const eased = Math.pow(progress, 1.14);
          const spiritX = p.x + Math.sin(progress * Math.PI * 5) * (2 + progress * 6);
          const spiritY = p.y - 12 - eased * 495;
          const body = Sprites.getPlayerFrameAt('dead', 5, 0);
          const bodyAlpha = Math.max(0.14, 1 - progress * 1.45);
          Sprites.draw(g, body, p.x - camX, p.y, p.facing, bodyAlpha);

          const spiritIndex = progress < 0.3 ? 10 : progress < 0.62 ? 11 : 12;
          const spirit = Sprites.getPlayerFrameAt('dead', spiritIndex, 0);
          const spiritAlpha = progress > 0.84 ? (1 - progress) / 0.16 : 1;
          drawHeavenAura(g, spiritX - camX, spiritY, p.y, progress);
          Sprites.draw(g, spirit, spiritX - camX, spiritY, p.facing, spiritAlpha);
        }
      } else if (p.deadT < DEATH_SPIRIT_START) {
        const frame = Sprites.getPlayerFrameAt('dead', deathBodyFrame(p.deadT), 0);
        Sprites.draw(g, frame, p.x - camX, p.y, p.facing);
      } else {
        const spirit = deathSpiritPosition(p);
        const bodyAlpha = Math.max(0.16, 1 - spirit.progress * 1.35);
        const body = Sprites.getPlayerFrameAt('dead', 4, 0);
        Sprites.draw(g, body, p.x - camX, p.y, p.facing, bodyAlpha);

        const spiritFrameIndex = spirit.progress < 0.34 ? 5 : spirit.progress < 0.7 ? 6 : 7;
        const spiritFrame = Sprites.getPlayerFrameAt('dead', spiritFrameIndex, 0);
        const spiritAlpha = spirit.progress > 0.82 ? (1 - spirit.progress) / 0.18 : 1;
        drawHeavenAura(g, spirit.x - camX, spirit.y, p.y, spirit.progress);
        Sprites.draw(g, spiritFrame, spirit.x - camX, spirit.y, p.facing, spiritAlpha);
      }
      return;
    }

    const stateName = playerPoseName(p);
    // animT is stored in generated-frame units (10 per second).
    const animTime = stateName === 'run' || stateName === 'runUp' ? p.animT / 10 : G.time;
    const spr = Sprites.getPlayerFrame(stateName, animTime, p.runFrame);

    const blink = p.inv > 0 && Math.floor(p.inv * 14) % 2 === 0;
    const ox = -p.facing * p.recoil; // arretramento da rinculo
    Sprites.draw(g, spr, p.x - camX + ox, p.y, p.facing, blink ? 0.35 : 1);

    // Layered arcade melee sweep generated by the combat FX module.
    if (p.knifeT > 0) {
      const meleeSocket = Sprites.getPlayerSocket(stateName, 'melee', p.facing);
      const knifeX = p.x - camX + (meleeSocket ? meleeSocket.x : p.facing * 26);
      const knifeY = p.y + (meleeSocket ? meleeSocket.y : -34);
      CombatFX.drawMeleeSlash(g, knifeX, knifeY, p.facing, 1 - p.knifeT / 0.18);
    }
  }

  // ============================================================
  // SLUG — carro armato alleato pilotabile (supports ally_tank02 drill variant)
  // ============================================================
  function spawnSlug(x, type) {
    type = type || 'ally_tank';
    G.slugs.push({
      x: x, y: Level.GROUND, vx: 0, vy: 0, facing: 1,
      type: type,
      hp: type === 'ally_tank02' ? 4 : 3, maxHp: type === 'ally_tank02' ? 4 : 3,
      tread: 0, occupied: false,
      drillSpin: 0,
      fireT: 0, cannonT: 0, recoil: 0, flash: 0, hitCd: 0,
      lavaCd: 0,
      idleAnimT: rnd(0, 1), moveAnimT: 0, mgAnimT: 0, mgAnimLeft: 0,
      cannonAnimT: 0, cannonAnimLeft: 0, hitAnimT: 0, hitAnimLeft: 0,
      jumpAnimT: 0, landAnimLeft: 0, destroying: false, destroyT: 0, destroyBursts: 0,
      onGround: true, dead: false,
    });
  }

  function slugHitbox(s) {
    // Damageable armor body; cannon barrel and antenna remain outside.
    return { x: s.x - 70, y: s.y - 82, w: 140, h: 82 };
  }

  function allyTankGroundAim(s, muzzleX, muzzleY) {
    let best = null;
    let bestScore = Infinity;

    function consider(targetX, targetY, priority) {
      const forward = (targetX - muzzleX) * s.facing;
      if (forward < 34 || forward > 780) return;
      const rawAngle = Math.atan2(targetY - muzzleY, forward);
      // Limited assistance: enough to meet infantry centers, never homing.
      const angle = clamp(rawAngle, -0.04, 0.32);
      const score = forward + Math.abs(targetY - muzzleY) * 0.35 + (priority || 0);
      if (score < bestScore) {
        bestScore = score;
        best = { angle: angle, targetX: targetX, targetY: targetY };
      }
    }

    for (const e of G.enemies) {
      if (e.dead || e.type === 'heli' || e.type === 'gunship') continue;
      const hb = enemyHitbox(e);
      consider(hb.x + hb.w / 2, hb.y + hb.h / 2, 0);
    }
    if (G.boss && G.boss.state === 'fight') {
      const hb = bossHitbox(G.boss);
      consider(hb.x + hb.w * 0.35, hb.y + hb.h * 0.58, 80);
    }

    // A gentle default downward line reaches ground-height enemies at range,
    // while a nearby valid target can bend it by at most about 18 degrees.
    const angle = best ? best.angle : 0.085;
    return {
      x: s.facing * Math.cos(angle),
      y: Math.sin(angle),
      assisted: !!best,
    };
  }

  function slugCosmeticBurst(s, power) {
    const x = s.x + rnd(-46, 46);
    const y = s.y - rnd(34, 88);
    CombatFX.spawnImpact(G.flashes, x, y, 'explosion', power || 0.8);
    for (let i = 0; i < 8; i++) {
      G.particles.push({
        kind: i % 3 === 0 ? 'smoke' : 'spark', x: x, y: y,
        vx: rnd(-210, 210), vy: rnd(-250, 80),
        t: 0, life: rnd(0.18, 0.55),
        color: i % 3 === 0 ? '#444a50' : i % 2 ? '#ffb347' : '#ffffff',
        size: rnd(2.5, 7), grav: i % 3 === 0 ? -35 : 520, drag: 0.7,
      });
    }
  }

  function damageSlug(s, dmg) {
    if (s.hp <= 0 || s.destroying) return;
    if (G.godMode) { s.flash = 0.06; return; }
    s.hp -= dmg;
    s.flash = 0.1;
    s.hitAnimT = 0;
    s.hitAnimLeft = 0.14;
    SFX.metalHit();
    G.shake = Math.max(G.shake, 4);
    if (s.hp <= 0) destroySlug(s);
  }

  function destroySlug(s) {
    if (s.destroying) return;
    s.hp = 0;
    s.destroying = true;
    s.destroyT = 0;
    s.destroyBursts = 0;
    s.vx = 0;
    slugCosmeticBurst(s, 0.85);
    const p = G.player;
    if (s.occupied && p.inSlug === s) {
      // Immediate emergency ejection; the authored destruction then continues.
      s.occupied = false;
      p.inSlug = null;
      p.x = s.x;
      p.y = s.y - 88;
      p.vy = -560;
      p.inv = Math.max(p.inv, 1.5);
      p.mountCd = 1.2;
      SFX.eject();
    }
  }

  function updateSlugs(dt) {
    const p = G.player;
    for (const s of G.slugs) {
      s.fireT -= dt;
      s.cannonT -= dt;
      s.hitCd -= dt;
      s.lavaCd -= dt;
      s.idleAnimT += dt;
      if (s.flash > 0) s.flash -= dt;
      if (s.recoil > 0) s.recoil -= dt * 55;
      if (s.mgAnimLeft > 0) { s.mgAnimLeft -= dt; s.mgAnimT += dt; }
      if (s.cannonAnimLeft > 0) { s.cannonAnimLeft -= dt; s.cannonAnimT += dt; }
      if (s.hitAnimLeft > 0) { s.hitAnimLeft -= dt; s.hitAnimT += dt; }
      if (s.landAnimLeft > 0) s.landAnimLeft -= dt;

      // Shared gravity keeps the baseline correct for jump and destruction frames.
      const wasAir = !s.onGround;
      s.vy += GRAV * dt;
      s.y += s.vy * dt;
      if (s.y >= Level.GROUND) {
        s.y = Level.GROUND; s.vy = 0; s.onGround = true;
        if (wasAir) s.landAnimLeft = 0.1;
      } else { s.onGround = false; s.jumpAnimT += dt; }

      if (s.destroying) {
        s.destroyT += dt;
        if (s.destroyT >= 0.25 && s.destroyBursts < 1) {
          s.destroyBursts = 1; slugCosmeticBurst(s, 0.72); SFX.explosion();
        }
        if (s.destroyT >= 0.55 && s.destroyBursts < 2) {
          s.destroyBursts = 2; slugCosmeticBurst(s, 1.0); SFX.explosion();
        }
        if (s.destroyT >= 10 / 12) {
          explode(s.x, s.y - 48, 112, false, true, true);
          s.dead = true;
        }
        continue;
      }

      if (!s.occupied || p.dead) { s.vx = 0; continue; }

      // --- driving ---
      let move = 0;
      if (Input.left()) move -= 1;
      if (Input.right()) move += 1;
      s.vx = move * 210;
      if (move !== 0) {
        s.facing = move > 0 ? 1 : -1;
        s.tread += dt * 70 * move;
        s.moveAnimT += dt;
      } else {
        s.moveAnimT = 0;
      }
      s.x += s.vx * dt;
      s.x = clamp(s.x, G.camLockL + 82, G.camLockR - 82);

      // Test lava after horizontal driving, so entering a gap damages the tank
      // on the same simulation step instead of relying on its previous position.
      if (Level.isLavaGap(s.x) && s.y >= Level.GROUND - 3 && s.lavaCd <= 0) {
        damageSlug(s, 1);
        s.lavaCd = 0.85;
        for (let i = 0; i < 12; i++) G.particles.push({
          kind:i % 3 ? 'ember' : 'smoke', x:s.x + rnd(-44,44), y:Level.GROUND - rnd(2,18),
          vx:rnd(-120,120), vy:rnd(-220,-70), t:0, life:rnd(0.35,0.8),
          color:i % 3 ? '#ff8a24' : '#343036', size:rnd(3,8), grav:i % 3 ? 260 : -45,
        });
        G.screenFlash = Math.max(G.screenFlash || 0, 0.12);
        G.screenFlashColor = '#ff6a24';
        if (!s.destroying) { s.vy = -250; s.onGround = false; }
        else continue;
      }

      // jump / eject (Down + Jump)
      if (p.jumpBufT > 0 && s.onGround) {
        if (Input.downDir()) {
          s.occupied = false;
          p.inSlug = null;
          p.x = s.x; p.y = s.y - 88;
          p.vy = -520;
          p.mountCd = 1.0;
          p.inv = Math.max(p.inv, 0.8);
          SFX.eject();
        } else {
          s.vy = -560;
          s.jumpAnimT = 0;
          SFX.jump();
        }
        p.jumpBufT = 0;
      }
      if (!s.occupied) continue;

      // Player proxy position is still ground-based for camera, POWs and pickups.
      p.x = s.x; p.y = s.y;
      p.facing = s.facing; p.vx = s.vx; p.vy = s.vy;

      // Large new treads crush infantry using the upgraded body dimensions.
      if (Math.abs(s.vx) > 50) {
        for (const e of G.enemies) {
          if (e.dead || !isInfantry(e.type)) continue;
          if (Math.abs(e.x - s.x) < 76 && Math.abs(e.y - s.y) < 82) {
            killEnemy(e, s.facing);
            comboKill(ENEMY_PTS[e.type] || 100, e.x, e.y - 60);
            G.hitStop = Math.max(G.hitStop, 0.04);
          }
        }
      }

      // Contextual primary fire with no extra control key:
      // Up+Fire uses the roof gun for anti-air; normal Fire uses a rapid
      // coaxial laser from the lower main-cannon socket for ground targets.
      if (Input.fire() && s.fireT <= 0) {
        const up = Input.up();
        let mx, my, dirX, dirY, bulletType, muzzleStyle;
        if (up) {
          mx = s.x + s.facing * 2;
          my = s.y - 112;
          dirX = rnd(-0.04, 0.04);
          dirY = -1;
          bulletType = 'mg';
          muzzleStyle = 'mg';
          SFX.mg();
        } else {
          if (s.type === 'ally_tank02') {
            // Drill tank laser starts at the actual drill point, not the higher turret socket.
            // Tuned to the visible center of the drill's extreme front point in drawAllyTank02().
            // Reference image green point: source image (391,211) in 400x274 art.
            // Runtime scale 0.62 with bottom anchor => x +118.5, y -39.1.
            mx = s.x + s.facing * 119;
            my = s.y - 39;
          } else {
            const socket = Sprites.getVehicleSocket('allyTank', 'mgFire', 'mainCannon', s.facing);
            mx = s.x + (socket ? socket.x : s.facing * 88);
            my = s.y + (socket ? socket.y : -68);
          }
          const aim = allyTankGroundAim(s, mx, my);
          dirX = aim.x;
          dirY = aim.y;
          bulletType = 'tankLaser';
          muzzleStyle = 'tankLaser';
          SFX.tankLaser();
        }
        const speed = bulletType === 'tankLaser' ? 1040 : 980;
        G.pBullets.push({
          x: mx, y: my,
          vx: dirX * speed,
          vy: dirY * speed,
          life: 0.9, dmg: 1, type: bulletType,
        });
        muzzleBlast(mx, my, bulletType === 'tankLaser' ? 6 : 4,
          dirX, dirY, muzzleStyle, bulletType === 'tankLaser' ? 1.05 : 0.9);
        if (s.mgAnimLeft <= 0) s.mgAnimT = 0;
        s.mgAnimLeft = 0.24;
        s.fireT = bulletType === 'tankLaser' ? 0.11 : 0.09;
      }

      // Main cannon from the supplied barrel socket.
      if (Input.grenade() && s.cannonT <= 0) {
        const up = Input.up();
        const socket = Sprites.getVehicleSocket('allyTank', 'cannonFire', 'mainCannon', s.facing);
        const cx = s.x + (socket ? socket.x : s.facing * 88);
        const cy = s.y + (socket ? socket.y : -68);
        G.grenades.push({
          kind: 'pshell', x: cx, y: cy,
          vx: up ? s.facing * 160 : s.facing * 560,
          vy: up ? -700 : -160, t: 99,
        });
        SFX.slugCannon();
        s.recoil = 10;
        s.cannonAnimT = 0;
        s.cannonAnimLeft = 0.5;
        G.shake = Math.max(G.shake, 5);
        muzzleBlast(cx, cy, 10,
          up ? s.facing * 0.18 : s.facing, up ? -1 : -0.12, 'cannon', 1.2);
        s.cannonT = 0.85;
      }
    }
    EntityUtils.removeDead(G.slugs);
  }

  function allyTankVisual(s) {
    if (s.destroying) {
      return { state: 'destroy', frame: Math.floor(s.destroyT * 12) };
    }
    if (s.hitAnimLeft > 0) return { state: 'hit', time: s.hitAnimT };
    if (s.cannonAnimLeft > 0) return { state: 'cannonFire', time: s.cannonAnimT };
    if (s.mgAnimLeft > 0) return { state: 'mgFire', time: s.mgAnimT };
    if (s.landAnimLeft > 0) return { state: 'jump', frame: 3 };
    if (!s.onGround) {
      const frame = s.jumpAnimT < 0.08 ? 0 : s.vy < -180 ? 1 : s.vy < 0 ? 2 : 3;
      return { state: 'jump', frame: frame };
    }
    if (s.hp <= 1) return { state: 'damage', time: s.idleAnimT };
    if (Math.abs(s.vx) > 5) return { state: 'move', time: s.moveAnimT };
    return { state: 'idle', time: s.idleAnimT };
  }

  function drawAllyTank02(g, sx, s) {
    // Drill tank v3: hammer-drill style (no spin), vibrates left-right like hammer drill
    // + heavier smoke from 2 exhaust pipes at turret top-left
    const facing = s.facing;
    const time = (window.G ? G.time : 0);
    const moveSpeed = Math.abs(s.vx);
    const bob = Math.sin((s.tread || 0) * 0.08) * 1.0 + (moveSpeed > 10 ? Math.sin(time*16)*0.5 : 0);
    const scale = 0.62;
    const width = 400 * scale, height = 274 * scale;
    const left = -width / 2, top = -height + bob;
    if (!allyTank02Art.full || allyTank02Art.full.naturalWidth <= 0) {
      Sprites.drawSlug(g, sx, s.y, facing, s.tread, s.flash > 0, s.occupied, Math.max(0, s.recoil));
      return;
    }
    g.save();
    g.translate(Math.round(sx), Math.round(s.y + bob));
    if (facing < 0) g.scale(-1, 1);
    if (s.flash > 0) g.filter = 'brightness(0) invert(1)';

    // Chassis vibration - very subtle, hammer drill chassis vibrates even when idle
    g.save();
    const chassisVibX = (moveSpeed>2 || s.occupied) ? Math.sin(time*28)*0.5 : Math.sin(time*12)*0.18;
    const chassisVibY = (moveSpeed>2) ? Math.cos(time*34)*0.6 : Math.cos(time*18)*0.22;
    g.translate(chassisVibX, chassisVibY);
    if (allyTank02Art.chassis.naturalWidth > 0) g.drawImage(allyTank02Art.chassis, left, top, width, height);
    else g.drawImage(allyTank02Art.full, left, top, width, height);
    g.restore();

    // Wheels: subtle vertical bob when moving, no spin
    if (allyTank02Art.wheels.naturalWidth > 0) {
      g.save();
      const wheelBobY = moveSpeed>4 ? Math.cos(time*22)*0.9 : 0;
      g.translate(0, wheelBobY);
      g.globalAlpha = 0.97;
      g.drawImage(allyTank02Art.wheels, left, top, width, height);
      g.restore();
    }

    // Turret: constant micro-vibration + recoil kick back when firing
    if (allyTank02Art.turret.naturalWidth > 0) {
      g.save();
      const rec = Math.max(0, s.recoil);
      const recoilX = rec * 5.5;
      // Hammer drill vibration extends to turret slightly
      const hammerVib = (s.occupied || moveSpeed>2) ? Math.sin(time*32)*0.6 : 0;
      const vibX = -recoilX + hammerVib + (moveSpeed>10?Math.sin(time*18)*0.4:0);
      const vibY = (moveSpeed>6?Math.cos(time*24)*0.45:0) + Math.sin(time*16)*0.18;
      g.translate(vibX, vibY);
      if (rec > 0.2) {
        g.save(); g.globalCompositeOperation='lighter'; g.globalAlpha=0.48*rec/10;
        g.fillStyle='#ffec8a'; g.beginPath(); g.arc(left+width*0.84, top+height*0.42, 12+rec*0.9, 0, Math.PI*2); g.fill(); g.restore();
      }
      g.drawImage(allyTank02Art.turret, left, top, width, height);
      g.restore();
    }

    // DRILL: hammer drill only - in/out horizontally, slight vertical vibration, NO rotation
    if (allyTank02Art.drill.naturalWidth > 0) {
      g.save();
      // Hammer drill motion: fast in/out horizontally + micro vertical shake
      const drillActive = s.occupied || moveSpeed>2;
      const basePiston = drillActive ? 6 : 1.5;
      // Main hammer stroke: sin at high frequency for piston action
      const hammerStroke = Math.sin(time*26) * (drillActive ? 7.5 : 1.2) + Math.sin(time*48)* (drillActive?2.2:0.4);
      // Slow push-pull drift
      const slowPush = Math.sin(time*3.2 + (s.tread||0)*0.2) * (drillActive?3.5:0.8);
      const pistonX = basePiston + hammerStroke + slowPush;
      const vibY = (drillActive? Math.sin(time*34)*0.9 : Math.sin(time*16)*0.25);
      const vibX2 = drillActive ? Math.sin(time*52)*0.5 : 0;
      g.translate(pistonX + vibX2, vibY);
      // Draw drill at same size, no rotation
      g.drawImage(allyTank02Art.drill, left, top, width, height);
      g.restore();
      if (s.occupied) {
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.48 + Math.sin(time * 13) * 0.18;
        g.fillStyle = '#ff8a24'; g.beginPath(); g.arc(left+width*0.86+pistonX, top+height*0.58+vibY, 8, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#ffe8a0'; g.beginPath(); g.arc(left+width*0.86+pistonX, top+height*0.58+vibY, 3.2, 0, Math.PI * 2); g.fill();
        // impact spark at drill tip when hammering
        if (drillActive && Math.random()<0.28) {
          g.globalAlpha=0.7; g.fillStyle='#ffb347'; g.beginPath(); g.arc(left+width*0.92+pistonX, top+height*0.58+vibY + (Math.random()-0.5)*4, 1.8,0,Math.PI*2); g.fill();
        }
        g.restore();
      }
    }

    g.filter = 'none';
    g.restore();

    // Exhaust: main rear + 2 top-left turret exhaust pipes (heavier smoke as requested)
    const exhaustActive = s.occupied || moveSpeed>2;
    if (Math.random() < (exhaustActive?0.58:0.22) || moveSpeed>40) {
      // main rear exhaust - darker
      G.particles.push({
        kind: 'smoke', x: s.x - facing * 66, y: s.y - 56 + Math.sin(time*10)*1.5,
        vx: -facing * rnd(28, 68) + rnd(-10, 10), vy: rnd(-52, -10),
        t: 0, life: 0.58 + Math.random() * 0.52,
        color: moveSpeed>70?'#3d2e29':'#3a3a42', size: 4.2 + Math.random() * 5.8, grav: -16, drag: 0.84
      });
      if (moveSpeed>60 && Math.random()<0.35) {
        G.particles.push({
          kind: 'ember', x: s.x - facing*66, y: s.y -54,
          vx: -facing*rnd(20,50)+rnd(-8,8), vy: rnd(-30,-8),
          t:0, life:0.25+Math.random()*0.25, color:'#ff8a24', size:1.5+Math.random()*2.2, grav:-8, drag:0.9
        });
      }
    }
    // Two exhaust pipes at turret top-left - continuous light smoke, heavier when moving/occupied
    if (Math.random() < (exhaustActive?0.52:0.14)) {
      for(let k=0;k<2;k++){
        const offsetX = -18 + k*7; // top-left relative to turret
        const offsetY = -68 + k*9;
        G.particles.push({
          kind: 'smoke', x: s.x + facing*offsetX, y: s.y + offsetY + Math.sin(time*8+k)*0.8,
          vx: -facing*rnd(6,18)+rnd(-8,8) + (moveSpeed>2? -facing*4:0), vy: rnd(-52,-18),
          t: 0, life: 0.62+Math.random()*0.58,
          color: k===0 ? '#2a2522' : '#302c28', size: 3.0+Math.random()*4.2, grav:-14, drag:0.86
        });
        // occasional darker puff
        if (Math.random()<0.18) {
          G.particles.push({
            kind: 'smoke', x: s.x + facing*offsetX, y: s.y + offsetY,
            vx: -facing*rnd(10,24), vy: rnd(-38,-16),
            t:0, life:0.48+Math.random()*0.42, color:'#1e1a18', size:2.2+Math.random()*3.0, grav:-10, drag:0.88
          });
        }
      }
    }
  }

  function drawSlugs(g, camX) {
    for (const s of G.slugs) {
      const sx = s.x - camX;
      if (sx < -260 || sx > 960 + 260) continue;
      if (s.type === 'ally_tank02') {
        drawAllyTank02(g, sx, s);
      } else {
        const visual = allyTankVisual(s);
        const spr = visual.frame !== undefined ?
          Sprites.getVehicleFrameAt('allyTank', visual.state, visual.frame) :
          Sprites.getVehicleFrame('allyTank', visual.state, visual.time || 0);
        if (spr) {
          Sprites.draw(g, spr, sx, s.y, s.facing, 1, s.flash > 0);
        } else {
          Sprites.drawSlug(g, sx, s.y, s.facing, s.tread, s.flash > 0,
            s.occupied, Math.max(0, s.recoil));
        }
      }

      if (s.hp > 0 && s.hp <= 1 && !s.destroying) {
        drawCriticalText(g, sx, s.y - 142, G.time);
      }

      if (!s.occupied && s.hp > 0 && !s.destroying && G.player && !G.player.dead &&
          Math.abs(G.player.x - s.x) < 200) {
        if (Math.floor(G.time * 3) % 2 === 0) {
          g.fillStyle = '#ffffff';
          g.font = 'bold 11px \"Courier New\", monospace';
          g.textAlign = 'center';
          g.fillText(I18n.t('entity.vehicleReady'), sx, s.y - 126);
        }
      }
    }
  }

  // ============================================================
  // NEMICI
  // ============================================================
  function isInfantry(t) {
    return t === 'soldier' || t === 'grenadier' || t === 'knife' ||
           t === 'bazooka' || t === 'turret' || t === 'observer';
  }

  const ENEMY_PTS = {
    soldier: 100, knife: 150, grenadier: 150, bazooka: 200,
    turret: 300, observer: 250, heli: 800, tank: 1000, gunship: 3000,
  };

  // uccisione in catena: moltiplicatore arcade se i kill sono ravvicinati
  function comboKill(pts, x, y) {
    const c = G.combo;
    c.n = c.t > 0 ? c.n + 1 : 1;
    c.t = 2.2;
    const mult = 1 + Math.min(2, (c.n - 1) * 0.15);
    EntityScore.add(Math.round(pts * mult / 10) * 10, x, y);
    if (c.n >= 2) {
      SFX.combo(c.n);
      G.scorePops.push({
        x: x, y: y - 18, labelKey: 'hud.chain', labelVars: { count: c.n }, t: 0,
      });
    }
  }

  function spawnEnemy(type, x, opts) {
    opts = opts || {};
    const base = {
      type: type, x: x, y: opts.y !== undefined ? opts.y : Level.GROUND,
      vx: 0, vy: 0, facing: -1, hp: 1,
      state: 'patrol', t: rnd(0, 1), fireT: rnd(0.5, 1.5),
      animT: rnd(0, 4), runFrame: 0, spawnX: x, dead: false,
      flash: 0, burst: 0, recoil: 0,
    };
    if (type === 'soldier') base.hp = 1;
    else if (type === 'grenadier') base.hp = 1;
    else if (type === 'knife') { base.hp = 1; }
    else if (type === 'bazooka') { base.hp = 2; base.fireT = rnd(1.0, 1.8); }
    else if (type === 'turret') { base.hp = 4; base.fireT = rnd(0.8, 1.4); }
    else if (type === 'heli') {
      base.hp = 10; base.y = 130; base.bobT = rnd(0, 6); base.fireT = 1.2;
      base.entering = true;
    } else if (type === 'gunship') {
      base.hp = 36; base.y = -60; base.bobT = 0; base.fireT = 1.6;
      base.bombT = 3.0; base.entering = true;
      SFX.alarm();
      if (G.mode === 'arcade') SFX.setIntensity(1);
    } else if (type === 'tank') {
      base.hp = 14; base.fireT = 1.6; base.tread = 0;
    } else if (type === 'observer' || type === 'soldier06') {
      // New tutorial drone: hovering observer with laser camera
      base.type = 'observer';
      base.hp = 2;
      base.y = opts.y !== undefined ? opts.y : 240 + Math.random() * 80;
      base.baseY = base.y;
      base.bobT = rnd(0, 6);
      base.fireT = rnd(1.0, 2.2);
      base.vx = 0;
      base.patrolMin = x - 160;
      base.patrolMax = x + 160;
      base.facing = 1;
    }
    base.maxHp = base.hp;
    G.enemies.push(base);
    return base;
  }

  function enemyHitbox(e) {
    if (e.type === 'heli') return { x: e.x - 50, y: e.y - 24, w: 100, h: 48 };
    if (e.type === 'gunship') return { x: e.x - 78, y: e.y - 36, w: 156, h: 72 };
    if (e.type === 'tank') return { x: e.x - 70, y: e.y - 70, w: 140, h: 70 };
    if (e.type === 'observer') return { x: e.x - 28, y: e.y - 72, w: 56, h: 72 };
    if (e.type === 'soldier') return { x: e.x - 18, y: e.y - 86, w: 36, h: 86 };
    if (e.type === 'grenadier') return { x: e.x - 28, y: e.y - 84, w: 56, h: 84 };
    if (e.type === 'knife') return { x: e.x - 44, y: e.y - 57, w: 88, h: 57 };
    if (e.type === 'turret') return { x: e.x - 45, y: e.y - 136, w: 90, h: 136 };
    if (e.type === 'bazooka') return { x: e.x - 34, y: e.y - 83, w: 68, h: 83 };
    return { x: e.x - 12, y: e.y - P_H, w: 24, h: P_H };
  }

  function damageEnemy(e, dmg, dir) {
    e.hp -= dmg;
    e.flash = 0.08;
    if (e.hp <= 0) {
      killEnemy(e, dir || 1);
      comboKill(ENEMY_PTS[e.type] || 100, e.x, e.y - 60);
      G.hitStop = Math.max(G.hitStop, isInfantry(e.type) ? 0.04 : 0.07);
    } else if (e.type === 'heli' || e.type === 'tank' || e.type === 'gunship') {
      SFX.bossHit();
    }
  }

  function killEnemy(e, dir) {
    e.dead = true;
    if (e.type === 'observer') {
      SFX.bigExplosion();
      explode(e.x, e.y, 36, false, false);
      for (let i = 0; i < 10; i++) {
        G.particles.push({
          kind: i % 2 ? 'spark' : 'debris',
          x: e.x + rnd(-12, 12), y: e.y + rnd(-20, 20),
          vx: rnd(-240, 240), vy: rnd(-340, -40),
          t: 0, life: rnd(0.3, 0.75),
          color: i % 3 === 0 ? '#58f0ff' : (i % 2 ? '#a08a52' : '#4a3a2a'),
          size: rnd(2, 5.5), grav: 850, drag: 0.3,
          rot: rnd(0, Math.PI * 2), spin: rnd(-12, 12),
        });
      }
      for (let i = 0; i < 6; i++) {
        G.particles.push({
          kind: 'smoke', x: e.x, y: e.y,
          vx: rnd(-60, 60), vy: rnd(-120, -20),
          t: 0, life: 0.5 + Math.random() * 0.5,
          color: '#3a3a44', size: 5 + Math.random() * 6, grav: -20, drag: 0.85
        });
      }
      G.corpses.push({
        observer: true,
        x: e.x, y: e.y,
        vx: dir * rnd(80, 160), vy: rnd(-220, -80),
        angle: 0, spin: dir * rnd(4, 8), facing: e.facing, t: 0, life: 0.9,
        nextBoom: 0.15, boomCount: 0
      });
    } else if (isInfantry(e.type)) {
      SFX.enemyDie(e.type);
      bloodBurst(e.x, e.y - 30, 7);
      // A few readable uniform/armor fragments make fatal hits feel authored
      // without flooding the screen during automatic fire.
      const armorColor = e.type === 'bazooka' ? '#8a4a3a' : '#a08a52';
      for (let i = 0; i < 5; i++) {
        G.particles.push({
          kind: 'debris', x: e.x + rnd(-8, 8), y: e.y - rnd(20, 48),
          vx: rnd(-190, 190), vy: rnd(-310, -90),
          t: 0, life: rnd(0.35, 0.7),
          color: i % 2 ? armorColor : '#3a3a3f', size: rnd(2.5, 5),
          grav: 850, drag: 0.3, rot: rnd(0, Math.PI * 2), spin: rnd(-15, 15),
        });
      }
      if (e.type === 'turret') {
        // i sacchi di sabbia si sbriciolano
        for (let i = 0; i < 10; i++) {
          G.particles.push({
            x: e.x + rnd(-26, 26), y: e.y - rnd(0, 26),
            vx: rnd(-140, 140), vy: rnd(-260, -80),
            t: 0, life: rnd(0.4, 0.8), color: '#b09a6a', size: rnd(3, 7), grav: 900,
          });
        }
      }
      G.corpses.push({
        spr: (e.type === 'bazooka' ? Sprites.elite : Sprites.enemy).idle,
        robot: e.type === 'soldier', soldier02: e.type === 'grenadier', soldier03: e.type === 'knife', soldier04: e.type === 'turret', soldier05: e.type === 'bazooka',
        x: e.x, y: e.y - 10,
        vx: dir * rnd(120, 220), vy: rnd(-420, -300),
        angle: 0, spin: dir * rnd(5, 9), facing: e.facing, t: 0, life: 1.1,
      });
    } else if (e.type === 'heli' || e.type === 'gunship') {
      const big = e.type === 'gunship';
      if (big && G.mode === 'arcade') SFX.setIntensity(0);
      explode(e.x, e.y, big ? 72 : 55, false, false);
      spawnDestructionFire(e.x, e.y, big ? 1.35 : 0.95, big ? 14 : 9);
      G.corpses.push({
        heli: true, enemyHeliBig: big, vehicleWreck: true, scale: big ? 1.6 : 1,
        x: e.x, y: e.y + (big ? 43 : 26),
        vx: rnd(-45, 45), vy: 45, angle: 0, spin: rnd(2.2, 4.2),
        facing: e.facing, t: 0, life: 2.35, nextBoom: 0.24, boomCount: 0,
      });
    } else if (e.type === 'tank') {
      explode(e.x, e.y - 30, 58, false, false);
      spawnDestructionFire(e.x, e.y - 30, 1.05, 10);
      G.corpses.push({ tank: true, vehicleWreck: true, x: e.x, y: e.y,
        vx: 0, vy: 0, angle: 0, spin: rnd(-0.25, 0.25), facing: e.facing,
        t: 0, life: 2.1, nextBoom: 0.2, boomCount: 0 });
    }
  }

  function updateEnemies(dt) {
    const p = G.player;
    for (const e of G.enemies) {
      if (e.dead) continue;
      e.t += dt;
      e.fireT -= dt;
      if (e.flash > 0) e.flash -= dt;
      if (e.recoil > 0) e.recoil = Math.max(0, e.recoil - dt * 48);
      if ((e.type === 'heli' || e.type === 'gunship' || e.type === 'tank') &&
          e.hp > 0 && e.hp <= e.maxHp * 0.25 && Math.random() < dt * 9) {
        G.particles.push({ kind: Math.random() < 0.45 ? 'ember' : 'smoke',
          x: e.x + rnd(-24, 24), y: e.y - rnd(18, 48),
          vx: rnd(-32, 32), vy: rnd(-105, -42), t: 0, life: rnd(0.45, 0.9),
          color: Math.random() < 0.45 ? '#ff6a24' : '#292d32',
          size: rnd(4, 10), grav: -45, drag: 0.8 });
      }
      if (e.type === 'soldier' && Math.random() < dt * 10) {
        G.particles.push({ kind: Math.random() < 0.38 ? 'ember' : 'smoke',
          x: e.x + rnd(-12, 12), y: e.y - rnd(42, 82), vx: rnd(-22, 22),
          vy: rnd(-95, -35), t: 0, life: rnd(0.38, 0.8),
          color: Math.random() < 0.4 ? '#ff6a24' : '#34383d',
          size: rnd(3, 7), grav: -38, drag: 0.8 });
      }
      if (e.type === 'knife' && Math.random() < dt * 8) {
        G.particles.push({ kind: 'spark', x: e.x + e.facing * 43, y: e.y - 26,
          vx: e.facing * rnd(60, 160), vy: rnd(-90, 40), t: 0, life: rnd(0.08, 0.18),
          color: '#ffe28a', size: rnd(1.5, 3), grav: 320 });
      }
      const dx = p.x - e.x;
      const adx = Math.abs(dx);
      const ady = Math.abs((p.y - P_H / 2) - (e.y - P_H / 2));

      if (isInfantry(e.type)) {
        // gravità per la fanteria
        e.vy += GRAV * dt;
        e.y += e.vy * dt;
        if (e.y >= Level.GROUND) { e.y = Level.GROUND; e.vy = 0; }
      }

      switch (e.type) {
        case 'soldier': {
          const engaged = adx < 560 && ady < 160 && !p.dead;
          if (engaged) {
            e.facing = dx > 0 ? 1 : -1;
            if (adx > 380) { e.vx = e.facing * 90; }
            else e.vx = 0;
            if (e.burst > 0) {
              if (e.fireT <= 0) {
                fireEnemyBullet(e, 6);
                e.burst--;
                e.fireT = e.burst === 0 ? rnd(1.4, 2.2) : 0.14; // pausa dopo la raffica
              }
            } else if (e.fireT <= 0 && adx > 60) {
              e.burst = 3;
              e.fireT = 0.1;
            }
          } else {
            // pattuglia
            e.vx = Math.sin(e.t * 0.8) > 0 ? 40 : -40;
            e.facing = e.vx > 0 ? 1 : -1;
            if (Math.abs(e.x - e.spawnX) > 90) e.vx = (e.spawnX - e.x) > 0 ? 40 : -40;
          }
          e.x += e.vx * dt;
          break;
        }
        case 'grenadier': {
          const engaged = adx < 500 && !p.dead;
          e.facing = dx > 0 ? 1 : -1;
          if (engaged) {
            if (adx > 320) e.vx = e.facing * 70;
            else e.vx = 0;
            if (e.fireT <= 0 && adx > 90) {
              const ft = 0.6; // tempo di volo della granata (gravità 1700, vy -420)
              G.grenades.push({
                kind: 'egren', x: e.x + e.facing * 8, y: e.y - 44,
                vx: dx / ft + rnd(-40, 40), vy: -420, t: 99, bounced: false,
              });
              SFX.throwG(); e.recoil = 7;
              e.fireT = rnd(2.0, 2.8);
            }
          } else e.vx = 0;
          e.x += e.vx * dt;
          break;
        }
        case 'knife': {
          if (!p.dead && adx < 700) {
            e.facing = dx > 0 ? 1 : -1;
            e.vx = e.facing * 215;
          } else e.vx = 0;
          e.x += e.vx * dt;
          // contatto = morte del giocatore
          if (!p.dead && adx < 24 && ady < 50) killPlayer();
          break;
        }
        case 'bazooka': {
          // tiratore d'élite: mantiene la distanza e lancia razzi lenti
          e.facing = dx > 0 ? 1 : -1;
          if (!p.dead) {
            if (adx < 180) e.vx = -e.facing * 75;       // arretra
            else if (adx > 620) e.vx = e.facing * 60;   // avanza
            else e.vx = 0;
            if (e.fireT <= 0 && adx >= 150 && adx < 700) {
              const ang = Math.atan2((p.y - 30) - (e.y - 34), dx);
              G.grenades.push({
                kind: 'erkt', x: e.x + e.facing * 18, y: e.y - 34,
                vx: Math.cos(ang) * 330, vy: Math.sin(ang) * 330, fuse: 2.4,
              });
              SFX.rocket(); e.recoil = 8;
              muzzleBlast(e.x + e.facing * 22, e.y - 34, 5,
                Math.cos(ang), Math.sin(ang), 'rocket', 0.9);
              e.fireT = rnd(2.6, 3.6);
            }
          } else e.vx = 0;
          e.x += e.vx * dt;
          break;
        }
        case 'turret': {
          // postazione fissa: raffiche lunghe dietro i sacchi di sabbia
          e.facing = dx > 0 ? 1 : -1;
          if (adx < 640 && !p.dead) {
            if (e.burst > 0) {
              if (e.fireT <= 0) {
                fireEnemyBullet(e, 9); e.recoil = 5;
                e.burst--;
                e.fireT = e.burst === 0 ? rnd(1.8, 2.6) : 0.12;
              }
            } else if (e.fireT <= 0 && adx > 50) {
              e.burst = 5;
              e.fireT = 0.1;
            }
          }
          break;
        }
        case 'gunship': {
          // miniboss volante: ventagli di proiettili + passaggi di bombardamento
          e.bobT += dt;
          if (e.entering) {
            e.y += (170 - e.y) * Math.min(1, dt * 1.5);
            if (Math.abs(e.y - 170) < 6) e.entering = false;
          }
          const targetX = p.x + Math.sin(e.t * 0.45) * 260;
          const targetY = 170 + Math.sin(e.bobT * 1.8) * 30;
          e.x += clamp(targetX - e.x, -170, 170) * dt;
          e.y += clamp(targetY - e.y, -80, 80) * dt;
          e.facing = dx > 0 ? 1 : -1;
          e.bombT -= dt;
          if (!p.dead && !e.entering) {
            if (e.fireT <= 0) {
              // ventaglio di 3 proiettili
              for (let i = -1; i <= 1; i++) {
                const ang = Math.atan2((p.y - 28) - e.y, dx) + i * 0.18;
                G.eBullets.push({
                  x: e.x, y: e.y + 18,
                  vx: Math.cos(ang) * 360, vy: Math.sin(ang) * 360, life: 2.6,
                  style: 'enemyGunship', phase: rnd(0, Math.PI * 2), trailT: 0,
                });
              }
              SFX.enemyShot('enemyGunship');
              const gunAng = Math.atan2((p.y - 28) - (e.y + 18), dx);
              muzzleBlast(e.x, e.y + 18, 6, Math.cos(gunAng), Math.sin(gunAng), 'enemyGunship', 1.1);
              e.fireT = rnd(1.4, 2.0);
            }
            if (e.bombT <= 0 && adx < 220) {
              G.grenades.push({ kind: 'bomb', x: e.x, y: e.y + 30, vx: 0, vy: 80, t: 99 });
              G.grenades.push({ kind: 'bomb', x: e.x + e.facing * 50, y: e.y + 30, vx: e.facing * 40, vy: 60, t: 99 });
              SFX.heliBomb();
              e.bombT = rnd(3.2, 4.2);
            }
          }
          break;
        }
        case 'heli': {
          e.bobT += dt;
          const targetX = p.x + Math.sin(e.t * 0.6) * 180;
          const targetY = 150 + Math.sin(e.bobT * 2) * 22;
          e.x += clamp(targetX - e.x, -130, 130) * dt;
          e.y += clamp(targetY - e.y, -70, 70) * dt;
          e.facing = dx > 0 ? 1 : -1;
          if (e.fireT <= 0 && !p.dead) {
            if (Math.random() < 0.55 && adx < 140) {
              // bomba in caduta
              G.grenades.push({ kind: 'bomb', x: e.x, y: e.y + 24, vx: e.vx * 0.2, vy: 60, t: 99 });
              SFX.heliBomb();
            } else {
              fireEnemyBullet(e, 10, e.x - e.facing * 0, e.y + 10);
            }
            e.fireT = rnd(1.6, 2.4);
          }
          break;
        }
        case 'tank': {
          e.facing = dx > 0 ? 1 : -1;
          if (adx > 460) { e.vx = e.facing * 55; e.tread += dt * 40; }
          else e.vx = 0;
          e.x += e.vx * dt;
          if (e.fireT <= 0 && !p.dead && adx < 760) {
            const ft = 1.1; // tempo di volo del colpo (gravità 900, vy -480)
            G.grenades.push({
              kind: 'shell', x: e.x + e.facing * 70, y: e.y - 44,
              vx: (dx + rnd(-50, 50)) / ft, vy: -480, t: 99,
            });
            SFX.tankShot();
            muzzleBlast(e.x + e.facing * 74, e.y - 44, 8, e.facing, -0.08, 'cannon', 1.15);
            e.recoil = 9;
            e.fireT = rnd(2.6, 3.4);
          }
          // schiaccia il giocatore
          if (!p.dead && adx < 56 && p.y > e.y - 56) killPlayer();
          break;
        }
        case 'observer': {
          // Tutorial surveillance drone: hovers, patrols, fires laser bursts
          e.bobT += dt;
          e.y = e.baseY + Math.sin(e.bobT * 1.8) * 12 + Math.sin(e.t * 0.9) * 5;
          if (!e.patrolMin) { e.patrolMin = e.spawnX - 160; e.patrolMax = e.spawnX + 160; }
          e.vx = Math.sin(e.t * 0.6) * 45;
          e.x += e.vx * dt;
          if (e.x < e.patrolMin) { e.x = e.patrolMin; }
          if (e.x > e.patrolMax) { e.x = e.patrolMax; }
          e.facing = dx > 0 ? 1 : -1;
          // subtle scanning glow
          if (Math.random() < dt * 3) {
            G.particles.push({
              kind: 'spark', x: e.x + e.facing * 10, y: e.y + 6,
              vx: e.facing * rnd(10, 30), vy: rnd(-10, 10),
              t: 0, life: 0.12 + Math.random() * 0.12,
              color: '#58f0ff', size: 2 + Math.random() * 2, grav: 0
            });
          }
          if (e.fireT <= 0 && !p.dead && adx < 520) {
            // laser shot
            const sx = e.x + e.facing * 18, sy = e.y + 8;
            const ang = Math.atan2((p.y - 28) - sy, p.x - sx) + rnd(-0.08, 0.08);
            G.eBullets.push({
              x: sx, y: sy, vx: Math.cos(ang) * 420, vy: Math.sin(ang) * 420, life: 1.8,
              style: 'enemyTurret', phase: rnd(0, Math.PI * 2), trailT: 0,
            });
            SFX.enemyShot('enemyTurret');
            CombatFX.spawnImpact(G.flashes, sx, sy, 'enemyTurret', 1.0);
            // laser camera flash
            G.particles.push({
              kind: 'flash', x: sx, y: sy, vx: 0, vy: 0, t: 0, life: 0.08,
              color: '#ff3b3b', size: 9, grav: 0
            });
            e.recoil = 5;
            e.fireT = rnd(1.8, 2.8);
          }
          break;
        }
      }

      // animazione corsa fanteria
      if (isInfantry(e.type)) {
        if (Math.abs(e.vx) > 5) {
          e.animT += dt * (e.type === 'knife' ? 14 : 8);
          e.runFrame = Math.floor(e.animT) % 4;
        } else e.runFrame = 0;
      }
    }
    // rimuovi i morti
    EntityUtils.removeDead(G.enemies);
  }

  function fireEnemyBullet(e, spread, fx, fy) {
    const p = G.player;
    const sx = fx !== undefined ? fx : e.x + e.facing * 22;
    const sy = fy !== undefined ? fy : e.y - 30;
    const tx = p.x, ty = p.y - (p.crouch ? 18 : 30);
    let ang = Math.atan2(ty - sy, tx - sx);
    ang += rnd(-spread, spread) * 0.012;

    let style = 'enemyRifle';
    if (e === G.boss || !e.type) style = 'enemyBoss';
    else if (e.type === 'turret') style = 'enemyTurret';
    else if (e.type === 'heli') style = 'enemyHeli';
    else if (e.type === 'gunship') style = 'enemyGunship';
    const sp = style === 'enemyBoss' ? 370 : style === 'enemyTurret' ? 360 : 340;
    const dirX = Math.cos(ang), dirY = Math.sin(ang);
    G.eBullets.push({
      x: sx, y: sy, vx: dirX * sp, vy: dirY * sp, life: 2.6,
      style: style, phase: rnd(0, Math.PI * 2), trailT: 0,
    });
    SFX.enemyShot(style);
    muzzleBlast(sx, sy, style === 'enemyBoss' ? 6 : 3, dirX, dirY, style,
      style === 'enemyBoss' ? 1.2 : 0.85);
  }

  // Procedural impact and muzzle FX. Particle kinds are rendered differently
  // below (streaks, soft smoke, additive glows and expanding rings).
  function hitSparks(x, y, dir, style) {
    const energyColor = style === 'spread' || style === 'tankLaser' ? '#72f4ff' :
      style === 'enemyTurret' ? '#ff55d5' :
      style === 'enemyHeli' ? '#9cff57' :
      style === 'enemyGunship' ? '#50ddff' :
      style === 'enemyBoss' ? '#c16dff' : '#ffd76a';
    const energy = style === 'spread' || style === 'tankLaser' || style === 'enemyTurret' ||
      style === 'enemyHeli' || style === 'enemyGunship' || style === 'enemyBoss';
    SFX.hitConfirm(style);
    CombatFX.spawnImpact(G.flashes, x, y, style || 'pistol', energy ? 1.2 : 0.86);
    G.particles.push({ kind: 'glow', x: x, y: y, vx: 0, vy: 0,
      t: 0, life: 0.11, color: energyColor, size: energy ? 15 : 10, grav: 0 });
    if (energy) {
      G.particles.push({ kind: 'ring', x: x, y: y, vx: 0, vy: 0,
        t: 0, life: 0.18, color: energyColor, size: 4.5, grav: 0 });
    }
    for (let i = 0; i < (energy ? 10 : 7); i++) {
      G.particles.push({
        kind: 'spark', x: x, y: y,
        vx: -dir * rnd(80, energy ? 350 : 290) + rnd(-90, 90), vy: rnd(-250, 80),
        t: 0, life: rnd(0.12, 0.32),
        color: Math.random() < 0.3 ? '#ffffff' : energyColor,
        size: rnd(2, energy ? 4.8 : 4), grav: energy ? 320 : 760, drag: 0.8,
      });
    }
  }

  function weaponMuzzleFx(x, y, dirX, dirY, weapon) {
    CombatFX.spawnMuzzle(G.flashes, x, y, dirX, dirY, weapon, weapon === 'spread' ? 1.1 : 1);
    const sideX = -dirY, sideY = dirX;
    const power = weapon === 'spread' ? 1.55 : weapon === 'rocket' ? 1.8 : weapon === 'mg' ? 0.8 : 1;
    const color = weapon === 'flame' ? '#ff7a2a' : weapon === 'spread' ? '#d8f4ff' : '#ffe28a';
    const n = weapon === 'spread' ? 9 : weapon === 'rocket' ? 10 : weapon === 'mg' ? 3 : 5;

    G.particles.push({
      kind: 'glow', x: x, y: y, vx: 0, vy: 0,
      t: 0, life: 0.075 + power * 0.025, color: color, size: 9 + power * 5, grav: 0,
    });
    for (let i = 0; i < n; i++) {
      const forward = rnd(120, 310) * power;
      const side = rnd(-95, 95) * power;
      G.particles.push({
        kind: 'spark', x: x, y: y,
        vx: dirX * forward + sideX * side,
        vy: dirY * forward + sideY * side,
        t: 0, life: rnd(0.055, 0.14), color: color,
        size: rnd(2, 4.5) * power, grav: 0, drag: 2.5,
      });
    }
    if (weapon === 'rocket' || weapon === 'spread') {
      for (let i = 0; i < 3; i++) {
        G.particles.push({
          kind: 'smoke', x: x - dirX * 4, y: y - dirY * 4,
          vx: -dirX * rnd(30, 90) + rnd(-25, 25),
          vy: -dirY * rnd(30, 90) + rnd(-25, 25),
          t: 0, life: rnd(0.25, 0.45), color: '#9aa0a6', size: rnd(4, 8), grav: -25,
        });
      }
    }
  }

  function secondaryMuzzleFx(x, y, dirX, dirY, guided) {
    CombatFX.spawnMuzzle(G.flashes, x, y, dirX, dirY, guided ? 'guided' : 'grenade', 1.05);
    const color = guided ? '#68efff' : '#ffb347';
    G.particles.push({ kind: 'ring', x: x, y: y, vx: 0, vy: 0,
      t: 0, life: 0.16, color: color, size: guided ? 7 : 9, grav: 0 });
    G.particles.push({ kind: 'glow', x: x, y: y, vx: 0, vy: 0,
      t: 0, life: 0.12, color: color, size: guided ? 18 : 15, grav: 0 });
    const sideX = -dirY, sideY = dirX;
    for (let i = 0; i < (guided ? 10 : 7); i++) {
      const f = rnd(110, guided ? 360 : 280);
      const s = rnd(-100, 100);
      G.particles.push({
        kind: 'spark', x: x, y: y,
        vx: dirX * f + sideX * s, vy: dirY * f + sideY * s,
        t: 0, life: rnd(0.08, 0.18), color: color, size: rnd(2, 4), grav: guided ? 0 : 120,
      });
    }
    for (let i = 0; i < 4; i++) {
      G.particles.push({
        kind: 'smoke', x: x - dirX * 4, y: y - dirY * 4,
        vx: -dirX * rnd(40, 120) + rnd(-35, 35),
        vy: -dirY * rnd(40, 120) + rnd(-35, 35),
        t: 0, life: rnd(0.3, 0.55), color: guided ? '#67838a' : '#7c7770',
        size: rnd(5, 9), grav: -30,
      });
    }
  }

  function armorBreakFx(x, y, facing) {
    CombatFX.spawnImpact(G.flashes, x, y, 'tankLaser', 1.05);
    G.particles.push({ kind: 'ring', x: x, y: y, vx: 0, vy: 0,
      t: 0, life: 0.28, color: '#72f4ff', size: 7, grav: 0 });
    for (let i = 0; i < 12; i++) {
      G.particles.push({
        kind: i % 4 === 0 ? 'debris' : 'spark', x: x, y: y,
        vx: -facing * rnd(40, 170) + rnd(-130, 130), vy: rnd(-260, 80),
        t: 0, life: rnd(0.16, 0.48),
        color: i % 3 === 0 ? '#ffffff' : i % 2 ? '#72f4ff' : '#ffb347',
        size: rnd(2, 5), grav: 520,
        rot: rnd(0, Math.PI * 2), spin: rnd(-14, 14),
      });
    }
  }

  function deathImpactFx(x, y, facing) {
    // Cosmetic only: a compact suit-impact burst with no gameplay damage.
    G.flashes.push({ kind: 'explosion', x: x, y: y, r: 28, t: 0, life: 0.18 });
    G.particles.push({ kind: 'ring', x: x, y: y, vx: 0, vy: 0,
      t: 0, life: 0.24, color: '#ffb347', size: 7, grav: 0 });
    for (let i = 0; i < 13; i++) {
      const a = rnd(-2.5, 2.5) + (facing > 0 ? Math.PI : 0);
      const sp = rnd(90, 310);
      G.particles.push({
        kind: i % 4 === 0 ? 'debris' : 'spark', x: x, y: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - rnd(20, 120),
        t: 0, life: rnd(0.18, 0.52),
        color: i % 3 === 0 ? '#dbe8ef' : i % 2 === 0 ? '#ffcf66' : '#ff6a32',
        size: rnd(2, 5), grav: rnd(420, 760), drag: 0.4,
        rot: rnd(0, Math.PI * 2), spin: rnd(-14, 14),
      });
    }
    for (let i = 0; i < 4; i++) {
      G.particles.push({
        kind: 'smoke', x: x + rnd(-5, 5), y: y + rnd(-5, 5),
        vx: rnd(-55, 55), vy: rnd(-100, -35),
        t: 0, life: rnd(0.4, 0.72), color: '#4b5055', size: rnd(5, 10),
        grav: -40, drag: 1.1,
      });
    }
  }

  function startHeavenFx(p) {
    SFX.heavenRise();
    const x = p.x, y = p.y - 52;
    G.particles.push({ kind: 'ring', x: x, y: y, vx: 0, vy: 0,
      t: 0, life: 0.55, color: '#dff8ff', size: 10, grav: 0 });
    G.particles.push({ kind: 'ring', x: x, y: y, vx: 0, vy: 0,
      t: 0, life: 0.8, color: '#fff0a0', size: 7, grav: 0 });
    G.particles.push({ kind: 'glow', x: x, y: y, vx: 0, vy: -18,
      t: 0, life: 0.65, color: '#dff8ff', size: 30, grav: -12 });
    for (let i = 0; i < 14; i++) {
      G.particles.push({
        kind: 'spirit', x: x + rnd(-24, 24), y: y + rnd(-20, 30),
        vx: rnd(-55, 55), vy: rnd(-160, -45),
        t: 0, life: rnd(0.45, 0.95),
        color: Math.random() < 0.35 ? '#fff2a8' : '#d9f8ff',
        size: rnd(2, 5), grav: -18, drag: 0.7,
      });
    }
  }

  function spawnHeavenTrail(x, y) {
    G.particles.push({
      kind: 'spirit', x: x + rnd(-22, 22), y: y - rnd(10, 62),
      vx: rnd(-24, 24), vy: rnd(-90, -28),
      t: 0, life: rnd(0.45, 0.8),
      color: Math.random() < 0.25 ? '#fff2a8' : '#d9f8ff',
      size: rnd(2, 4.5), grav: -12, drag: 0.45,
    });
    if (Math.random() < 0.35) {
      G.particles.push({
        kind: 'glow', x: x + rnd(-12, 12), y: y - rnd(12, 48),
        vx: rnd(-8, 8), vy: rnd(-36, -14),
        t: 0, life: 0.38, color: '#dff8ff', size: rnd(5, 9), grav: -8,
      });
    }
  }

  function muzzleBlast(x, y, n, dirX, dirY, style, power) {
    n = n || 5;
    if (dirX !== undefined && dirY !== undefined) {
      CombatFX.spawnMuzzle(G.flashes, x, y, dirX, dirY, style || 'cannon', power || 1);
    }
    G.particles.push({ kind: 'glow', x: x, y: y, vx: 0, vy: 0,
      t: 0, life: 0.08, color: '#ffd76a', size: 11, grav: 0 });
    for (let i = 0; i < n; i++) {
      G.particles.push({
        kind: 'spark', x: x, y: y, vx: rnd(-150, 150), vy: rnd(-150, 150),
        t: 0, life: rnd(0.06, 0.14), color: '#ffd76a', size: rnd(2, 5), grav: 0,
      });
    }
  }

  function drawCriticalText(g, x, y, time) {
    const pulse = 1 + Math.sin(time * 11) * 0.08;
    g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(-0.08); g.scale(pulse, pulse);
    const criticalLabel = I18n.t('combat.critical');
    const criticalSize = criticalLabel.length > 13 ? 13 : criticalLabel.length > 9 ? 16 : 19;
    g.font = 'italic bold ' + criticalSize + 'px "Courier New", monospace'; g.textAlign = 'center';
    g.lineWidth = 5; g.strokeStyle = '#111018'; g.strokeText(criticalLabel, 0, 0);
    g.lineWidth = 2; g.strokeStyle = '#fff3a0'; g.strokeText(criticalLabel, 0, 0);
    g.fillStyle = '#ffcc24'; g.fillText(criticalLabel, 0, 0);
    g.restore();
  }

  function drawEnemyHeliArt(g, x, y, facing, time, flash, big) {
    const image = big ? enemyHeliArt.big : enemyHeliArt.small;
    if (!image || image.naturalWidth <= 0) return false;
    const width = big ? 220 : 142;
    const height = big ? 86 : 51;
    g.save(); g.translate(Math.round(x), Math.round(y));
    // Supplied helicopter PNGs face right.
    if (facing < 0) g.scale(-1, 1);
    if (flash) g.filter = 'brightness(0) invert(1)';
    g.drawImage(image, -width / 2, -height / 2, width, height);
    g.filter = 'none';
    // Procedural high-speed rotor blur remains independent from future PNG frames.
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = flash ? '#ffffff' : 'rgba(205,235,245,0.72)';
    g.lineWidth = 2;
    const rotor = function (cx, cy, radius, phase) {
      // Two black horizontal blade traces at a tiny height offset sell a rotor
      // moving too quickly for individual blades to remain visible.
      const sweep = 0.72 + Math.abs(Math.sin(time * 42 + phase)) * 0.28;
      g.globalCompositeOperation = 'source-over';
      g.strokeStyle = flash ? '#ffffff' : '#11151a';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(cx - radius * sweep, cy - 1); g.lineTo(cx + radius * sweep, cy - 1); g.stroke();
      g.globalAlpha = 0.72;
      g.beginPath(); g.moveTo(cx - radius * (1.05 - sweep * 0.18), cy - 4);
      g.lineTo(cx + radius * (1.05 - sweep * 0.18), cy - 4); g.stroke();
      g.globalAlpha = 1;
    };
    // Hub coordinates measured from the supplied annotated reference PNGs.
    if (big) { rotor(-26, -37, 84, 0); rotor(60, -27, 76, 1.7); }
    else rotor(11, -18, 72, 0);
    // Cyan engine bloom integrates the supplied hull with the game's FX language.
    g.globalAlpha = 0.32 + Math.sin(time * 18) * 0.08;
    g.fillStyle = '#68efff'; g.beginPath();
    g.ellipse(width * 0.38, 4, big ? 16 : 10, big ? 8 : 5, 0, 0, Math.PI * 2); g.fill();
    g.restore(); return true;
  }

  function drawRobotSoldier(g, x, y, facing, enemy, corpse) {
    const scale = 0.4;
    if (!robotSoldierArt.full || robotSoldierArt.full.naturalWidth <= 0) return false;
    g.save(); g.translate(Math.round(x), Math.round(y));
    if (facing < 0) g.scale(-1, 1);
    if (enemy && enemy.flash > 0) g.filter = 'brightness(0) invert(1)';
    const moving = enemy && Math.abs(enemy.vx) > 5;
    const phase = (enemy ? enemy.t : G.time) * (moving ? 10 : 4);
    const layer = function (image, px, py, angle, ox, oy) {
      if (!image || image.naturalWidth <= 0) return;
      g.save();
      g.translate((px - 77.5) * scale + (ox || 0), (py - 232) * scale + (oy || 0));
      if (angle) g.rotate(angle);
      g.drawImage(image, -px * scale, -py * scale, 155 * scale, 232 * scale);
      g.restore();
    };
    // Authored fire layer plus procedural light; it remains behind body modules.
    if (!corpse && robotSoldierArt.fire.naturalWidth > 0) {
      g.save(); g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.72 + Math.sin(phase * 1.7) * 0.14;
      g.shadowColor = '#ff6a24'; g.shadowBlur = 10;
      g.drawImage(robotSoldierArt.fire, -31 + Math.sin(phase) * 1.2, -93, 62, 93);
      g.restore();
    }
    const cropLayer = function (image, sx, sy, sw, sh, px, py, angle, ox, oy) {
      if (!image || image.naturalWidth <= 0) return;
      g.save();
      g.translate((px - 77.5) * scale + (ox || 0), (py - 232) * scale + (oy || 0));
      if (angle) g.rotate(angle);
      g.drawImage(image, sx, sy, sw, sh,
        (sx - px) * scale, (sy - py) * scale, sw * scale, sh * scale);
      g.restore();
    };
    if (corpse) {
      const blast = Math.min(1, (enemy ? enemy.t : 0) / 0.82);
      // Every authored body module separates along a different explosion arc.
      layer(robotSoldierArt.legs, 89, 158, 0.18 + blast * 0.5,
        -blast * 11, blast * 30);
      layer(robotSoldierArt.torso, 83, 132, -0.12 - blast * 0.65,
        blast * 9, -Math.sin(blast * Math.PI) * 24);
      cropLayer(robotSoldierArt.hands, 34, 99, 49, 93, 66, 125,
        -0.25 - blast * 1.0, -blast * 24, -Math.sin(blast * Math.PI) * 20);
      cropLayer(robotSoldierArt.hands, 107, 106, 32, 82, 119, 126,
        0.22 + blast * 1.15, blast * 28, -Math.sin(blast * Math.PI) * 28);
      layer(robotSoldierArt.head, 93, 117, 0.2 + blast * 1.4,
        blast * 24, -Math.sin(blast * Math.PI) * 48 - blast * 8);
    } else {
      const legSwing = Math.sin(phase) * (moving ? 0.075 : 0.018);
      layer(robotSoldierArt.legs, 89, 158, legSwing, 0, Math.abs(Math.sin(phase)) * -1.5);
      layer(robotSoldierArt.torso, 83, 132, Math.sin(phase * 0.5) * 0.025, 0, 0);
      // Hands counter-swing more clearly than the previous nearly static layer.
      layer(robotSoldierArt.hands, 84, 126, -legSwing * 1.15 + Math.sin(phase * 0.7) * 0.025, 0, 0);
      layer(robotSoldierArt.head, 93, 117, Math.sin(phase * 0.42) * 0.06,
        Math.sin(phase * 0.33) * 1.2, -1 + Math.cos(phase * 0.5) * 0.8);
    }
    g.filter = 'none'; g.restore(); return true;
  }

  function drawEnemyTankArt(g, x, y, facing, enemy, flash) {
    const scale = 0.42;
    const width = 362 * scale, height = 181 * scale;
    const readyParts = enemyTankArt.chassis.naturalWidth > 0 && enemyTankArt.pieces.naturalWidth > 0;
    if (!readyParts && enemyTankArt.full.naturalWidth <= 0) return false;
    g.save(); g.translate(Math.round(x), Math.round(y));
    if (facing > 0) g.scale(-1, 1); // supplied tank points left
    if (flash) g.filter = 'brightness(0) invert(1)';
    const left = -width / 2, top = -height;
    if (!readyParts) g.drawImage(enemyTankArt.full, left, top, width, height);
    else {
      const treadPhase = (enemy.tread || 0) * 0.2;
      const suspension = Math.sin(treadPhase) * 1.55;
      const chainTravel = Math.sin(treadPhase * 2.2) * 2.1;
      const wreck = !!enemy.vehicleWreck;
      const wreckT = wreck ? Math.min(1, enemy.t / 1.35) : 0;
      g.save();
      if (wreck) { g.translate(Math.sin(enemy.t * 24) * (1 - wreckT) * 2.5, wreckT * 5); g.rotate(-wreckT * 0.035); }
      g.drawImage(enemyTankArt.chassis, left, top + suspension * 0.35, width, height);
      g.restore();
      const cropPiece = function (sx, sy, sw, sh, dx, dy, angle) {
        g.save();
        const cx = left + sx * scale + sw * scale / 2 + dx;
        const cy = top + sy * scale + sh * scale / 2 + dy;
        g.translate(cx, cy); if (angle) g.rotate(angle);
        g.drawImage(enemyTankArt.pieces, sx, sy, sw, sh,
          -sw * scale / 2, -sh * scale / 2, sw * scale, sh * scale);
        g.restore();
      };
      // Wheels and chain travel independently from the hull. On destruction the
      // complete lower assembly drops and slides away as one authored piece.
      cropPiece(115, 97, 238, 84,
        chainTravel + (wreck ? wreckT * 34 : 0),
        suspension + (wreck ? wreckT * 30 : 0), wreck ? wreckT * 0.16 : 0);
      // Turret recoil while firing; fatal blasts throw it upward and backward.
      cropPiece(143, 2, 148, 63,
        Math.max(0, enemy.recoil || 0) * 0.55 + (wreck ? wreckT * 42 : 0),
        -suspension * 0.25 - (wreck ? Math.sin(wreckT * Math.PI) * 58 : 0),
        wreck ? -wreckT * 0.42 : 0);
      // Fast moving track highlights reinforce chain motion without redrawing art.
      if (!wreck && Math.abs(enemy.vx || 0) > 3) {
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.24;
        g.fillStyle = '#d6c08a';
        for (let i = 0; i < 5; i++) {
          const tx = ((i * 25 + (enemy.tread || 0) * 1.8) % 118) - 59;
          g.fillRect(tx, -9, 9, 2);
        }
      }
    }
    g.filter = 'none';
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.2 + Math.sin(enemy.t * 9) * 0.05;
    g.fillStyle = '#68efff'; g.beginPath(); g.ellipse(56, -24, 13, 7, 0, 0, Math.PI * 2); g.fill();
    g.restore(); return true;
  }

  function drawSoldier02(g, x, y, facing, enemy, corpse) {
    if (!soldier02Art.full || soldier02Art.full.naturalWidth <= 0) return false;
    const scale = 0.5, phase = (enemy ? enemy.t : G.time) * 8;
    g.save(); g.translate(Math.round(x), Math.round(y)); if (facing < 0) g.scale(-1, 1);
    if (enemy && enemy.flash > 0) g.filter = 'brightness(0) invert(1)';
    const layer = function(img, px, py, angle, ox, oy) {
      if (!img || img.naturalWidth <= 0) return;
      g.save(); g.translate((px-100)*scale+(ox||0),(py-174)*scale+(oy||0)); if(angle)g.rotate(angle);
      g.drawImage(img,-px*scale,-py*scale,200*scale,174*scale); g.restore();
    };
    const deadT = corpse ? Math.min(1, enemy.t / 0.8) : 0;
    layer(soldier02Art.legs, 78, 105, corpse ? deadT*.55 : Math.sin(phase)*.035, -deadT*12, deadT*28);
    layer(soldier02Art.torso, 82, 73, corpse ? -deadT*.5 : Math.sin(phase*.45)*.02, 0, -Math.sin(deadT*Math.PI)*18);
    layer(soldier02Art.hands, 95, 78, corpse ? deadT*.9 : -Math.sin(phase)*.045, deadT*18, -Math.sin(deadT*Math.PI)*25);
    layer(soldier02Art.gun, 150, 82, corpse ? deadT*1.2 : 0,
      -Math.max(0,enemy.recoil||0)*.45+deadT*30,-Math.sin(deadT*Math.PI)*32);
    layer(soldier02Art.head, 82, 34, corpse ? -deadT*1.4 : Math.sin(phase*.38)*.055,
      -deadT*18,-Math.sin(deadT*Math.PI)*44);
    g.filter='none';g.restore();return true;
  }

  function drawSoldier03(g, x, y, facing, enemy, corpse) {
    if (!soldier03Art.full || soldier03Art.full.naturalWidth <= 0) return false;
    const scale=.55, phase=(enemy?enemy.t:G.time), deadT=corpse?Math.min(1,enemy.t/.8):0;
    g.save();g.translate(Math.round(x),Math.round(y));if(facing<0)g.scale(-1,1);
    if(enemy&&enemy.flash>0)g.filter='brightness(0) invert(1)';
    const left=-91*scale,top=-103*scale;
    if(soldier03Art.chassis.naturalWidth>0){
      // Saw is deliberately rendered first so its hub and rear teeth sit behind
      // the chassis while the exposed cutting edge remains visible.
      g.save();g.translate(left+137*scale+deadT*38,top+54*scale-Math.sin(deadT*Math.PI)*28);g.rotate(phase*18+deadT*7);g.drawImage(soldier03Art.saw,94,14,88,89,-43*scale,-44*scale,88*scale,89*scale);g.restore();
      g.save();g.translate(deadT*-12,-Math.sin(deadT*Math.PI)*18);g.rotate(deadT*-.35+Math.sin(phase*9)*.012);g.drawImage(soldier03Art.chassis,left,top,182*scale,103*scale);g.restore();
      // Wheel remains in front of the chassis lower mount.
      g.save();g.translate(left+30*scale-deadT*24,top+75*scale+deadT*20);g.rotate(phase*10+deadT*4);g.drawImage(soldier03Art.wheel,2,48,56,55,-28*scale,-27.5*scale,56*scale,55*scale);g.restore();
    }else g.drawImage(soldier03Art.full,left,top,182*scale,103*scale);
    g.filter='none';g.restore();return true;
  }

  function drawSoldier05(g, x, y, facing, enemy, corpse) {
    if (!soldier05Art.full || soldier05Art.full.naturalWidth <= 0) return false;
    const scale = 0.5, phase = (enemy ? enemy.t : G.time) * 7;
    const deadT = corpse ? Math.min(1, enemy.t / 0.86) : 0;
    g.save(); g.translate(Math.round(x), Math.round(y)); if (facing < 0) g.scale(-1, 1);
    if (enemy && enemy.flash > 0) g.filter = 'brightness(0) invert(1)';
    const layer = function(img, px, py, angle, ox, oy) {
      if (!img || img.naturalWidth <= 0) return;
      g.save(); g.translate((px-86)*scale+(ox||0),(py-167)*scale+(oy||0)); if(angle)g.rotate(angle);
      g.drawImage(img,-px*scale,-py*scale,172*scale,167*scale); g.restore();
    };
    layer(soldier05Art.legs, 61, 112, corpse ? deadT*.55 : Math.sin(phase)*.045,
      -deadT*15, deadT*28);
    layer(soldier05Art.body, 76, 76, corpse ? -deadT*.52 : Math.sin(phase*.42)*.018,
      0, -Math.sin(deadT*Math.PI)*20);
    layer(soldier05Art.gun, 112, 79, corpse ? deadT*1.2 : 0,
      -Math.max(0,enemy.recoil||0)*.55+deadT*34, -Math.sin(deadT*Math.PI)*33);
    layer(soldier05Art.head, 65, 31, corpse ? -deadT*1.45 : Math.sin(phase*.35)*.05,
      -deadT*20, -Math.sin(deadT*Math.PI)*48);
    g.filter='none'; g.restore(); return true;
  }

  function drawSoldier04(g, x, y, facing, enemy, corpse) {
    if (!soldier04Art.full || soldier04Art.full.naturalWidth <= 0) return false;
    const deadT = corpse ? Math.min(1, enemy.t / 0.85) : 0;
    g.save(); g.translate(Math.round(x), Math.round(y)); if (facing < 0) g.scale(-1, 1);
    if (enemy && enemy.flash > 0) g.filter = 'brightness(0) invert(1)';
    const bunker = soldier04Art.bunker.naturalWidth > 0 ? soldier04Art.bunker : soldier04Art.full;
    g.save(); g.translate(-deadT * 16, deadT * 25); g.rotate(-deadT * 0.2);
    g.drawImage(bunker, -44.5, -50, 89, 50); g.restore();
    if (soldier04Art.gun.naturalWidth > 0) {
      g.save(); g.translate(4 + Math.max(0, enemy.recoil || 0) * -0.7 + deadT * 30,
        -28 - Math.sin(deadT * Math.PI) * 35);
      g.rotate(Math.sin((enemy.t || 0) * 1.4) * 0.025 + deadT * 1.1);
      g.drawImage(soldier04Art.gun, -44.5, -25, 89, 50); g.restore();
    }
    g.filter = 'none'; g.restore();
    // Soldier 01 is mounted on the authored bunker and keeps all modular fire,
    // head, hand and destruction animation from the existing robot system.
    drawRobotSoldier(g, x - facing * 8, y - 42 - Math.sin(deadT * Math.PI) * 30,
      facing, enemy, corpse);
    return true;
  }

  function drawSoldier06(g, x, y, facing, enemy, corpse) {
    // Modular drone: torso + head + laser_camera + legs (tentacles) with hover bob
    if (!soldier06Art.full || soldier06Art.full.naturalWidth <= 0) {
      // fallback to full if parts missing, try torso at least
      if (soldier06Art.torso && soldier06Art.torso.naturalWidth > 0) {
        // still attempt parts
      } else return false;
    }
    const scale = 0.56;
    const phase = (enemy ? enemy.t : (window.G ? G.time : 0));
    const bob = Math.sin(phase * 1.8) * 4;
    const deadT = corpse ? Math.min(1, enemy.t / 0.85) : 0;
    g.save();
    g.translate(Math.round(x), Math.round(y + bob - deadT * 30));
    if (facing < 0) g.scale(-1, 1);
    if (enemy && enemy.flash > 0) g.filter = 'brightness(0) invert(1)';

    const layer = function (img, px, py, angle, ox, oy) {
      if (!img || img.naturalWidth <= 0) return;
      g.save();
      g.translate((px - 62.5) * scale + (ox || 0), (py - 104.5) * scale + (oy || 0));
      if (angle) g.rotate(angle);
      g.drawImage(img, -px * scale, -py * scale, 125 * scale, 209 * scale);
      g.restore();
    };

    if (corpse) {
      const blast = deadT;
      layer(soldier06Art.legs, 62, 120, 0.25 + blast * 0.9, -blast * 18, blast * 20);
      layer(soldier06Art.torso, 62, 80, -0.15 - blast * 0.7, blast * 12, -Math.sin(blast * Math.PI) * 26);
      layer(soldier06Art.laser_camera, 62, 78, blast * 0.5, blast * 26, -Math.sin(blast * Math.PI) * 30);
      layer(soldier06Art.head, 62, 38, 0.22 + blast * 1.2, blast * 28, -Math.sin(blast * Math.PI) * 44);
    } else {
      const swing = Math.sin(phase * 0.7) * 0.06;
      // subtle hover physics: legs dangle, torso stable, camera tracks
      layer(soldier06Art.legs, 62, 120, Math.sin(phase * 2.2) * 0.08, 0, Math.sin(phase * 2.6) * 1.5);
      layer(soldier06Art.torso, 62, 80, swing * 0.4, 0, 0);
      // laser camera glows red when about to fire
      const firing = enemy && enemy.fireT < 0.35;
      if (firing) {
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.65 + Math.sin(phase * 22) * 0.25;
        g.shadowColor = '#ff2a2a'; g.shadowBlur = 12;
        layer(soldier06Art.laser_camera, 62, 78, 0, 0, 0);
        g.restore();
        // extra red glow
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.45;
        g.fillStyle = '#ff2a2a'; g.beginPath(); g.arc((62 - 62.5) * scale + 18 * scale, (78 - 104.5) * scale, 9, 0, Math.PI * 2); g.fill(); g.restore();
      } else {
        layer(soldier06Art.laser_camera, 62, 78, Math.sin(phase * 0.5) * 0.04, 0, 0);
      }
      layer(soldier06Art.head, 62, 38, Math.sin(phase * 0.42) * 0.07, Math.sin(phase * 0.31) * 1.2, Math.cos(phase * 0.5) * 0.6);
      // cyan eye glow additive
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.55 + Math.sin(phase * 3) * 0.15;
      g.fillStyle = '#58f0ff'; g.beginPath(); g.arc((62 - 62.5) * scale + 6 * scale, (38 - 104.5) * scale - 6 * scale, 4.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#a0fdff'; g.beginPath(); g.arc((62 - 62.5) * scale + 6 * scale, (38 - 104.5) * scale - 6 * scale, 2, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    g.filter = 'none'; g.restore(); return true;
  }

  function drawEnemies(g, camX) {
    for (const e of G.enemies) {
      const sx = e.x - camX;
      if (sx < -180 || sx > 960 + 180) continue;
      if (isInfantry(e.type)) {
        if (e.type === 'soldier' && drawRobotSoldier(g, sx, e.y, e.facing, e, false)) continue;
        if (e.type === 'grenadier' && drawSoldier02(g, sx, e.y, e.facing, e, false)) continue;
        if (e.type === 'knife' && drawSoldier03(g, sx, e.y, e.facing, e, false)) continue;
        if (e.type === 'turret' && drawSoldier04(g, sx, e.y, e.facing, e, false)) continue;
        if (e.type === 'bazooka' && drawSoldier05(g, sx, e.y, e.facing, e, false)) continue;
        if (e.type === 'observer' && drawSoldier06(g, sx, e.y, e.facing, e, false)) continue;
        const S = e.type === 'bazooka' ? Sprites.elite : Sprites.enemy;
        let spr;
        if (e.type === 'turret') spr = S.crouch;
        else if (Math.abs(e.vx) > 5) spr = S.run[e.runFrame];
        else spr = S.idle;
        Sprites.draw(g, spr, sx, e.y, e.facing, 1, e.flash > 0);
        if (e.type === 'turret') Sprites.drawSandbags(g, sx + e.facing * 20, e.y);
      } else if (e.type === 'heli') {
        if (!drawEnemyHeliArt(g, sx, e.y, e.facing, e.t, e.flash > 0, false))
          Sprites.drawHeli(g, sx, e.y, e.facing, e.t, e.flash > 0);
      } else if (e.type === 'gunship') {
        if (!drawEnemyHeliArt(g, sx, e.y, e.facing, e.t, e.flash > 0, true)) {
          g.save(); g.translate(sx, e.y); g.scale(1.6, 1.6);
          Sprites.drawHeli(g, 0, 0, e.facing, e.t, e.flash > 0); g.restore();
        }
        // mini barra HP del miniboss
        g.fillStyle = '#000';
        g.fillRect(sx - 42, e.y - 62, 84, 8);
        g.fillStyle = '#e83a2a';
        g.fillRect(sx - 40, e.y - 60, 80 * Math.max(0, e.hp / 36), 4);
      } else if (e.type === 'tank') {
        if (!drawEnemyTankArt(g, sx, e.y, e.facing, e, e.flash > 0))
          Sprites.drawTank(g, sx, e.y, e.facing, e.tread * 10, e.flash > 0);
      }
      if ((e.type === 'heli' || e.type === 'gunship' || e.type === 'tank') &&
          e.hp > 0 && e.hp <= e.maxHp * 0.25) {
        drawCriticalText(g, sx, e.type === 'tank' ? e.y - 82 : e.y - 74, e.t);
      }
    }
  }

  // ============================================================
  // BOSS — fortezza corazzata
  // ============================================================
  function spawnBoss() {
    G.boss = {
      x: Level.W + 150, y: Level.GROUND, hp: 70, maxHp: 70,
      state: 'enter', t: 0, fireT: 2.0, mgT: 4.0, spawnT: 6.0,
      flash: 0, tread: 0, recoil: 0, dieT: 0, dieBoomT: 0.12, dieBoomCount: 0, minions: 0,
      mgBurst: 0, mgShotT: 0,
      phase2: false, rainT: 0,
    };
  }

  function bossHitbox(b) {
    return { x: b.x - 150, y: b.y - 190, w: 300, h: 190 };
  }

  function updateBoss(dt) {
    const b = G.boss;
    if (!b) return;
    const p = G.player;
    b.t += dt;
    if (b.flash > 0) b.flash -= dt;
    if (b.recoil > 0) b.recoil -= dt * 60;

    if (b.state === 'enter') {
      b.x -= 90 * dt;
      b.tread += dt * 60;
      if (b.x <= Level.BOSS_X) { b.x = Level.BOSS_X; b.state = 'fight'; }
      return;
    }

    if (b.state === 'die') {
      b.dieT += dt;
      b.dieBoomT -= dt;
      if (b.dieBoomT <= 0 && b.dieBoomCount < 7) {
        const finalInternal = b.dieBoomCount === 6;
        const bx = b.x + rnd(-105, 85), by = b.y - rnd(22, 125);
        explode(bx, by, finalInternal ? 92 : rnd(38, 68), false, finalInternal);
        spawnDestructionFire(bx, by, finalInternal ? 1.85 : 1.05,
          finalInternal ? 20 : 10);
        for (let i = 0; i < 8; i++) G.particles.push({
          kind: i % 3 ? 'ember' : 'smoke', x: bx + rnd(-20, 20), y: by + rnd(-16, 16),
          vx: rnd(-110, 110), vy: rnd(-220, -70), t: 0, life: rnd(0.6, 1.3),
          color: i % 3 ? '#ff6a24' : '#22262b', size: rnd(6, 15),
          grav: i % 3 ? 150 : -70, drag: 0.8 });
        b.dieBoomCount++;
        b.dieBoomT = 0.22 + b.dieBoomCount * 0.035;
      }
      if (b.dieT > 2.75) {
        spawnDestructionFire(b.x, b.y - 66, 2.4, 28);
        explode(b.x, b.y - 60, 155, false, true);
        explode(b.x - 78, b.y - 28, 98, false, true);
        explode(b.x + 72, b.y - 92, 105, false, true);
        G.wrecks.push({ type:'boss', x:b.x, y:b.y, facing:-1 });
        G.boss = null;
        G.victory();
      }
      return;
    }

    // --- combattimento ---
    const enraged = b.hp < b.maxHp * 0.35;
    const mul = enraged ? 0.62 : 1;
    b.fireT -= dt; b.mgT -= dt; b.spawnT -= dt;

    // --- FASE 2 (sotto il 60%): la corazza salta, parte la pioggia di mortaio ---
    if (!b.phase2 && b.hp <= b.maxHp * 0.6) {
      b.phase2 = true;
      explode(b.x - 50, b.y - 90, 60, false, true);
      explode(b.x + 40, b.y - 60, 50, false, false);
      G.shake = Math.max(G.shake, 12);
      SFX.bossPhase();
      b.rainT = 2.0;
      // placche di corazza che volano via
      for (let i = 0; i < 12; i++) {
        G.particles.push({
          x: b.x + rnd(-80, 80), y: b.y - rnd(40, 110),
          vx: rnd(-260, -40), vy: rnd(-420, -180),
          t: 0, life: rnd(0.6, 1.1), color: Math.random() < 0.5 ? '#5c5a48' : '#403e30',
          size: rnd(5, 10), grav: 900,
        });
      }
    }
    if (b.phase2) {
      // fumo dalla corazza danneggiata
      if (Math.random() < dt * 8) {
        G.particles.push({
          x: b.x + rnd(-70, 30), y: b.y - rnd(70, 115),
          vx: rnd(-15, 15), vy: rnd(-70, -30),
          t: 0, life: rnd(0.6, 1.2), color: Math.random() < 0.3 ? '#ff8a3a' : '#666',
          size: rnd(4, 9), grav: -120,
        });
      }
      // pioggia di mortaio telegrafata
      b.rainT -= dt;
      if (b.rainT <= 0 && !p.dead) {
        SFX.warning();
        const n = enraged ? 5 : 4;
        for (let i = 0; i < n; i++) {
          const wx = clamp(
            p.x + rnd(-220, 220) + (i - n / 2) * 70,
            G.camX + 50, G.camX + 910
          );
          G.warnings.push({ x: wx, t: 0.75 + i * 0.1 });
        }
        b.rainT = (enraged ? 4.6 : 6.0);
      }
    }

    // colpi di cannone ad arco (3 proiettili)
    if (b.fireT <= 0 && !p.dead) {
      for (let i = 0; i < 3; i++) {
        const dx = (p.x + rnd(-90, 90)) - b.x;
        const ft = 1.25 + i * 0.08; // sincronizzato con gravità 900 e vy crescente
        G.grenades.push({
          kind: 'shell', x: b.x - 130, y: b.y - 102,
          vx: dx / ft, vy: -480 - i * 40, t: 99,
        });
      }
      SFX.tankShot();
      muzzleBlast(b.x - 140, b.y - 100, 12, -1, -0.1, 'cannon', 1.35);
      b.recoil = 16;
      G.shake = Math.max(G.shake, 5);
      b.fireT = 3.4 * mul;
    }

    // raffica di mitragliatrice (timer interno, sicuro con pausa e hit-stop)
    if (b.mgT <= 0 && !p.dead) {
      b.mgBurst = enraged ? 8 : 5;
      b.mgShotT = 0;
      b.mgT = 5.2 * mul;
    }
    if (b.mgBurst > 0) {
      b.mgShotT -= dt;
      if (b.mgShotT <= 0 && !p.dead) {
        fireEnemyBullet(b, 14, b.x - 115, b.y - 58);
        b.mgBurst--;
        b.mgShotT = 0.11;
      }
    }

    // rinforzi di fanteria
    if (b.spawnT <= 0 && b.minions < 3) {
      const e = spawnEnemy(Math.random() < 0.5 ? 'soldier' : 'knife', b.x - 130);
      e.fromBoss = true;
      b.minions++;
      b.spawnT = 7.5 * mul;
    }
    b.minions = 0;
    for (const enemy of G.enemies) {
      if (enemy.fromBoss && !enemy.dead) b.minions++;
    }

    // contatto con i cingoli
    if (!p.dead && Math.abs(p.x - b.x) < 112 && p.y > b.y - 80) killPlayer();
  }

  function damageBoss(dmg) {
    const b = G.boss;
    if (!b || b.state !== 'fight') return;
    b.hp -= dmg;
    b.flash = 0.07;
    SFX.bossHit();
    if (b.hp <= 0) {
      b.hp = 0;
      b.state = 'die';
      EntityScore.add(5000, b.x, b.y - 150);
      G.hitStop = Math.max(G.hitStop, 0.18);
      SFX.bigExplosion();
    }
  }

  function drawBossTankArt(g, x, y, b) {
    const scale = 0.5;
    const left = -650 * scale / 2;
    const top = -386 * scale;
    const readyParts = bossTankArt.chassis.naturalWidth > 0 && bossTankArt.pieces.naturalWidth > 0;
    g.save(); g.translate(Math.round(x), Math.round(y));
    if (b.flash > 0) g.filter = 'brightness(0) invert(1)';
    if (!readyParts) {
      if (bossTankArt.full.naturalWidth > 0)
        g.drawImage(bossTankArt.full, left, top, 650 * scale, 386 * scale);
      else { g.restore(); return false; }
    } else {
      const suspension = Math.sin(b.tread * 0.075) * (b.state === 'enter' ? 2 : 0.7);
      // A fortress-sized chassis vibrates with a slow diesel pulse rather than
      // the high-frequency shake used by light machinery.
      const combatVibeX = b.state === 'fight' ? Math.sin(b.t * 10) * 1.05 : 0;
      const combatVibeY = b.state === 'fight' ? Math.sin(b.t * 13 + 1.2) * 0.68 : 0;
      g.drawImage(bossTankArt.chassis, left + combatVibeX, top + suspension + combatVibeY,
        649 * scale, 386 * scale);
      const piece = function (sx, sy, sw, sh, ox, oy, angle) {
        const dx = left + sx * scale, dy = top + sy * scale;
        g.save(); g.translate(dx + sw * scale / 2 + (ox || 0), dy + sh * scale / 2 + (oy || 0));
        if (angle) g.rotate(angle);
        g.drawImage(bossTankArt.pieces, sx, sy, sw, sh,
          -sw * scale / 2, -sh * scale / 2, sw * scale, sh * scale);
        g.restore();
      };
      // Four authored modules: main weapon stack, scout turret, central drive
      // module and rear reactor. Their source-space placement remains exact.
      piece(168, 0, 385, 200, Math.max(0, b.recoil) * 0.48, -suspension * 0.4, 0);
      piece(110, 190, 145, 52, Math.sin(b.t * 1.7) * 1.5, -2, Math.sin(b.t * 0.8) * 0.012);
      piece(200, 198, 249, 188, 0, suspension, 0);
      piece(449, 190, 200, 160, 0, suspension * 0.45, 0);
    }
    g.filter = 'none';
    // Reactor and exhaust light are engine-driven and remain animated even when
    // future PNG frame sheets replace the static modules.
    g.globalCompositeOperation = 'lighter';
    const glow = 0.25 + Math.sin(b.t * 9) * 0.07;
    g.globalAlpha = glow; g.fillStyle = '#68efff';
    for (let i = 0; i < 3; i++) {
      g.beginPath(); g.arc(123 + i * 18, -55, 11 + Math.sin(b.t * 8 + i) * 2, 0, Math.PI * 2); g.fill();
    }
    if (b.recoil > 0 || b.mgBurst > 0) {
      g.globalAlpha = 0.5; g.fillStyle = '#ffb347';
      g.beginPath(); g.ellipse(-155, -112, 22 + b.recoil, 8, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore(); return true;
  }

  function drawBossEntity(g, camX) {
    const b = G.boss;
    if (!b) return;
    if (!drawBossTankArt(g, b.x - camX, b.y, b))
      Sprites.drawBoss(g, b.x - camX, b.y, -1, b.tread, b.flash > 0, Math.max(0, b.recoil));
    if (b.state === 'fight' && b.hp > 0 && b.hp <= b.maxHp * 0.2)
      drawCriticalText(g, b.x - camX, b.y - 205, b.t);
  }

  // ============================================================
  // PROIETTILI
  // ============================================================
  function updateBullets(dt) {
    const p = G.player;

    // proiettili del giocatore
    for (const b of G.pBullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.type === 'flame') {
        b.t += dt;
        b.vx *= 1 - 1.6 * dt; // la fiamma decelera e si allarga
        b.vy -= 50 * dt;
        b.trailT -= dt;
        if (b.trailT <= 0) {
          G.particles.push({
            kind: 'ember', x: b.x + rnd(-3, 3), y: b.y + rnd(-3, 3),
            vx: -b.vx * 0.12 + rnd(-35, 35), vy: -b.vy * 0.12 + rnd(-45, 15),
            t: 0, life: rnd(0.16, 0.3), color: Math.random() < 0.5 ? '#ffd76a' : '#ff5a2a',
            size: rnd(3, 6), grav: -80,
          });
          b.trailT = 0.035;
        }
      } else if (b.type === 'rocket') {
        b.trailT -= dt;
        if (b.trailT <= 0) {
          const speed = Math.max(1, Math.hypot(b.vx, b.vy));
          const nx = b.vx / speed, ny = b.vy / speed;
          G.particles.push({
            kind: 'smoke', x: b.x - nx * 13, y: b.y - ny * 13,
            vx: -nx * rnd(30, 80) + rnd(-18, 18), vy: -ny * rnd(30, 80) + rnd(-18, 18),
            t: 0, life: rnd(0.3, 0.55), color: '#8a8f96', size: rnd(5, 9), grav: -28,
          });
          G.particles.push({
            kind: 'spark', x: b.x - nx * 11, y: b.y - ny * 11,
            vx: -nx * rnd(100, 220), vy: -ny * rnd(100, 220),
            t: 0, life: 0.1, color: '#ffb347', size: 3, grav: 0,
          });
          b.trailT = 0.04;
        }
      }
      if (b.life <= 0 || Math.abs(b.x - (G.camX + 480)) > 1400) { b.dead = true; continue; }
      if (b.y >= Level.GROUND + 2 || b.y < -40) {
        if (b.type === 'rocket') explode(b.x, b.y, 85, false, false, true);
        else if (b.type === 'tankLaser' && b.y >= Level.GROUND) {
          hitSparks(b.x, Level.GROUND - 2, b.vx >= 0 ? 1 : -1, 'tankLaser');
        }
        b.dead = true; continue;
      }
      const r = b.type === 'flame' ? 6 + b.t * 26 : 4;
      // contro i distruttibili
      for (const pr of G.props) {
        if (pr.dead) continue;
        const hb = EntityProps.hitbox(pr);
        if (overlap(b.x - r, b.y - r, r * 2, r * 2, hb.x, hb.y, hb.w, hb.h)) {
          if (b.type === 'rocket') explode(b.x, b.y, 85, false, false, true);
          else EntityProps.damage(pr, 1);
          b.dead = true;
          break;
        }
      }
      if (b.dead) continue;
      // contro i nemici
      for (const e of G.enemies) {
        if (e.dead) continue;
        const hb = enemyHitbox(e);
        if (overlap(b.x - r, b.y - r, r * 2, r * 2, hb.x, hb.y, hb.w, hb.h)) {
          if (b.type === 'rocket') explode(b.x, b.y, 85, false, false, true);
          else {
            damageEnemy(e, b.dmg, b.vx >= 0 ? 1 : -1);
            hitSparks(b.x, b.y, b.vx >= 0 ? 1 : -1, b.type);
          }
          b.dead = true;
          break;
        }
      }
      if (b.dead) continue;
      // contro il boss
      if (G.boss && G.boss.state !== 'enter') {
        const hb = bossHitbox(G.boss);
        if (overlap(b.x - r, b.y - r, r * 2, r * 2, hb.x, hb.y, hb.w, hb.h)) {
          if (b.type === 'rocket') explode(b.x, b.y, 85, false, false, true);
          else {
            damageBoss(b.dmg);
            hitSparks(b.x, b.y, b.vx >= 0 ? 1 : -1, b.type);
          }
          b.dead = true;
        }
      }
    }
    EntityUtils.removeDead(G.pBullets);

    // proiettili nemici
    for (const b of G.eBullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      b.trailT = (b.trailT || 0) - dt;
      if (b.trailT <= 0) {
        const style = b.style || 'enemyRifle';
        const color = style === 'enemyTurret' ? '#ff55d5' :
          style === 'enemyHeli' ? '#9cff57' :
          style === 'enemyGunship' ? '#50ddff' :
          style === 'enemyBoss' ? '#c16dff' : '#ff6038';
        const energy = style === 'enemyGunship' || style === 'enemyBoss';
        G.particles.push({
          kind: energy ? 'glow' : 'spark',
          x: b.x - b.vx * 0.018, y: b.y - b.vy * 0.018,
          vx: -b.vx * (energy ? 0.035 : 0.08) + rnd(-12, 12),
          vy: -b.vy * (energy ? 0.035 : 0.08) + rnd(-12, 12),
          t: 0, life: energy ? 0.18 : 0.1, color: color,
          size: energy ? 5 : 2.2, grav: 0, drag: 2,
        });
        b.trailT = energy ? 0.045 : 0.07;
      }
      if (b.life <= 0 || b.y >= Level.GROUND + 2) { b.dead = true; continue; }
      // gli SLUG bloccano i proiettili leggeri (solo gli esplosivi li danneggiano)
      for (const s of G.slugs) {
        if (s.hp <= 0) continue;
        const hb = slugHitbox(s);
        if (overlap(b.x - 3, b.y - 3, 6, 6, hb.x, hb.y, hb.w, hb.h)) {
          hitSparks(b.x, b.y, b.vx >= 0 ? 1 : -1, b.style);
          b.dead = true;
          break;
        }
      }
      if (b.dead) continue;
      if (!p.dead && !p.inSlug && p.inv <= 0) {
        const hb = playerHitbox(p);
        if (overlap(b.x - 3, b.y - 3, 6, 6, hb.x, hb.y, hb.w, hb.h)) {
          killPlayer();
          b.dead = true;
        }
      }
    }
    EntityUtils.removeDead(G.eBullets);
  }

  function drawBullets(g, camX) {
    for (const b of G.pBullets) {
      CombatFX.drawPlayerProjectile(g, b, camX, G.time);
    }
    for (const b of G.eBullets) {
      CombatFX.drawEnemyProjectile(g, b, camX, G.time);
    }
  }

  // ============================================================
  // GRANATE / BOMBE / PROIETTILI BALISTICI
  // ============================================================
  function guidedTargetPoint(target) {
    if (!target) return null;
    if (target === G.boss) {
      if (!G.boss || G.boss.state !== 'fight') return null;
      const hb = bossHitbox(G.boss);
      return { x: hb.x + hb.w * 0.42, y: hb.y + hb.h * 0.45 };
    }
    if (target.dead || G.enemies.indexOf(target) < 0) return null;
    const hb = enemyHitbox(target);
    return { x: hb.x + hb.w / 2, y: hb.y + hb.h / 2 };
  }

  function acquireGuidedTarget(gr) {
    let best = null;
    let bestScore = Infinity;
    const speed = Math.max(1, Math.hypot(gr.vx, gr.vy));
    const nx = gr.vx / speed, ny = gr.vy / speed;

    function consider(target, x, y) {
      const dx = x - gr.x, dy = y - gr.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > 1000 * 1000) return;
      // Strongly prefer targets in the current forward hemisphere, but allow
      // a dramatic U-turn if nothing else is available.
      const dot = dx * nx + dy * ny;
      const score = d2 + (dot < 0 ? 240000 : 0);
      if (score < bestScore) { bestScore = score; best = target; }
    }

    for (const e of G.enemies) {
      if (e.dead) continue;
      const hb = enemyHitbox(e);
      consider(e, hb.x + hb.w / 2, hb.y + hb.h / 2);
    }
    if (G.boss && G.boss.state === 'fight') {
      const hb = bossHitbox(G.boss);
      consider(G.boss, hb.x + hb.w * 0.42, hb.y + hb.h * 0.45);
    }
    return best;
  }

  function updateGuidedMissile(gr, dt) {
    gr.life -= dt;
    gr.retargetT -= dt;
    let point = guidedTargetPoint(gr.target);
    if (!point || gr.retargetT <= 0) {
      gr.target = acquireGuidedTarget(gr);
      point = guidedTargetPoint(gr.target);
      if (point && !gr.lockSound) {
        gr.lockSound = true;
        SFX.missileLock();
      }
      gr.retargetT = 0.12;
    }

    let angle = Math.atan2(gr.vy, gr.vx);
    if (point) {
      const desired = Math.atan2(point.y - gr.y, point.x - gr.x);
      let delta = desired - angle;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      const maxTurn = gr.turnRate * dt;
      angle += clamp(delta, -maxTurn, maxTurn);
    }

    gr.speed = Math.min(720, gr.speed + 440 * dt);
    gr.vx = Math.cos(angle) * gr.speed;
    gr.vy = Math.sin(angle) * gr.speed;
    gr.x += gr.vx * dt;
    gr.y += gr.vy * dt;

    gr.trailT -= dt;
    if (gr.trailT <= 0) {
      const backX = gr.x - Math.cos(angle) * 13;
      const backY = gr.y - Math.sin(angle) * 13;
      G.particles.push({
        kind: 'smoke', x: backX, y: backY,
        vx: -gr.vx * 0.08 + rnd(-22, 22), vy: -gr.vy * 0.08 + rnd(-22, 22),
        t: 0, life: rnd(0.35, 0.55), color: '#77808c', size: rnd(5, 8), grav: -18,
      });
      G.particles.push({
        kind: 'spark', x: backX, y: backY,
        vx: -gr.vx * 0.28 + rnd(-35, 35), vy: -gr.vy * 0.28 + rnd(-35, 35),
        t: 0, life: 0.13, color: '#78f6ff', size: 3, grav: 0,
      });
      gr.trailT = 0.035;
    }
  }

  function updateGrenades(dt) {
    const GRAV_BY_KIND = { pgren: 1700, egren: 1700, bomb: 1400, shell: 900, erkt: 0, pshell: 900 };
    for (const gr of G.grenades) {
      if (gr.kind === 'homing') {
        updateGuidedMissile(gr, dt);
      } else {
        gr.vy += (GRAV_BY_KIND[gr.kind] || 0) * dt;
        gr.x += gr.vx * dt;
        gr.y += gr.vy * dt;
        if (gr.rot !== undefined) gr.rot += (gr.vx >= 0 ? 1 : -1) * dt * 12;
      }

      // razzo nemico: vola dritto, scia di fumo, esplode a fine corsa
      if (gr.kind === 'erkt') {
        gr.fuse -= dt;
        if (Math.random() < 0.5) {
          G.particles.push({
            x: gr.x - gr.vx * 0.03, y: gr.y, vx: rnd(-15, 15), vy: rnd(-25, 5),
            t: 0, life: 0.35, color: '#999', size: rnd(3, 5), grav: -50,
          });
        }
        if (gr.fuse <= 0) {
          gr.dead = true;
          explode(gr.x, gr.y, 68, true, false, false);
          continue;
        }
      }

      if (gr.kind === 'homing') {
        let detonate = gr.life <= 0 || gr.y >= Level.GROUND + 2 || gr.y < -190 ||
          Math.abs(gr.x - (G.camX + 480)) > 1500;

        // Guided missiles also detonate against destructible cover.
        if (!detonate) {
          for (const pr of G.props) {
            if (pr.dead) continue;
            const hb = EntityProps.hitbox(pr);
            if (overlap(gr.x - 7, gr.y - 7, 14, 14, hb.x, hb.y, hb.w, hb.h)) {
              detonate = true;
              break;
            }
          }
        }
        if (!detonate) {
          for (const e of G.enemies) {
            if (e.dead) continue;
            const hb = enemyHitbox(e);
            if (overlap(gr.x - 8, gr.y - 8, 16, 16, hb.x, hb.y, hb.w, hb.h)) {
              detonate = true;
              break;
            }
          }
        }
        if (!detonate && G.boss && G.boss.state === 'fight') {
          const hb = bossHitbox(G.boss);
          detonate = overlap(gr.x - 8, gr.y - 8, 16, 16, hb.x, hb.y, hb.w, hb.h);
        }
        if (detonate) {
          gr.dead = true;
          explode(gr.x, gr.y, 92, false, false, true);
        }
        continue;
      }

      if (gr.kind === 'pgren') {
        gr.t -= dt;
        gr.trailT = (gr.trailT || 0) - dt;
        if (!gr.bounced && gr.trailT <= 0) {
          G.particles.push({
            kind: 'smoke', x: gr.x - gr.vx * 0.018, y: gr.y - gr.vy * 0.018,
            vx: -gr.vx * 0.04 + rnd(-15, 15), vy: -gr.vy * 0.04 + rnd(-15, 15),
            t: 0, life: 0.24, color: '#6f7475', size: rnd(3, 5), grav: -20,
          });
          gr.trailT = 0.065;
        }
        if (gr.y >= Level.GROUND && gr.vy > 0) {
          if (!gr.bounced) {
            gr.y = Level.GROUND; gr.vy *= -0.45; gr.vx *= 0.6; gr.bounced = true;
            SFX.bounce();
          } else {
            gr.y = Level.GROUND;
            gr.dead = true;
            explode(gr.x, gr.y - 6, 80, false, false, true);
            continue;
          }
        }
        if (gr.t <= 0) {
          gr.dead = true;
          explode(gr.x, gr.y, 80, false, false, true);
          continue;
        }
        // esplode a contatto con i nemici
        for (const e of G.enemies) {
          if (e.dead) continue;
          const hb = enemyHitbox(e);
          if (overlap(gr.x - 5, gr.y - 5, 10, 10, hb.x, hb.y, hb.w, hb.h)) {
            gr.dead = true;
            explode(gr.x, gr.y, 80, false, false, true);
            break;
          }
        }
        if (!gr.dead && G.boss && G.boss.state === 'fight') {
          const hb = bossHitbox(G.boss);
          if (overlap(gr.x - 5, gr.y - 5, 10, 10, hb.x, hb.y, hb.w, hb.h)) {
            gr.dead = true;
            explode(gr.x, gr.y, 80, false, false, true);
          }
        }
      } else if (gr.kind === 'pshell') {
        // colpo di cannone dello SLUG: esplode su terreno, nemici o boss
        if (gr.y >= Level.GROUND) {
          gr.dead = true;
          explode(gr.x, Level.GROUND - 8, 95, false, false, true);
          continue;
        }
        for (const e of G.enemies) {
          if (e.dead) continue;
          const hb = enemyHitbox(e);
          if (overlap(gr.x - 7, gr.y - 7, 14, 14, hb.x, hb.y, hb.w, hb.h)) {
            gr.dead = true;
            explode(gr.x, gr.y, 95, false, false, true);
            break;
          }
        }
        if (!gr.dead && G.boss && G.boss.state === 'fight') {
          const hb = bossHitbox(G.boss);
          if (overlap(gr.x - 7, gr.y - 7, 14, 14, hb.x, hb.y, hb.w, hb.h)) {
            gr.dead = true;
            explode(gr.x, gr.y, 95, false, false, true);
          }
        }
      } else {
        // egren / bomb / shell / erkt: ostili, esplodono al suolo o sul bersaglio
        if (gr.y >= Level.GROUND) {
          gr.dead = true;
          explode(gr.x, Level.GROUND - 6, gr.kind === 'shell' ? 80 : 72, true, false, false);
          continue;
        }
        const p = G.player;
        if (p.inSlug) {
          const hb = slugHitbox(p.inSlug);
          if (overlap(gr.x - 6, gr.y - 6, 12, 12, hb.x, hb.y, hb.w, hb.h)) {
            gr.dead = true;
            explode(gr.x, gr.y, 72, true, false, false);
          }
        } else if (!p.dead && p.inv <= 0) {
          const hb = playerHitbox(p);
          if (overlap(gr.x - 6, gr.y - 6, 12, 12, hb.x, hb.y, hb.w, hb.h)) {
            gr.dead = true;
            explode(gr.x, gr.y, 72, true, false, false);
          }
        }
      }
    }
    EntityUtils.removeDead(G.grenades);
  }

  function drawGrenades(g, camX) {
    for (const gr of G.grenades) {
      const sx = gr.x - camX;
      if (gr.kind === 'homing') {
        const angle = Math.atan2(gr.vy, gr.vx);
        g.save();
        g.translate(sx, gr.y);
        g.rotate(angle);
        // Cyan engine bloom behind a compact guided missile body.
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = 0.75;
        g.fillStyle = '#48eaff';
        g.beginPath();
        g.arc(-13, 0, 7 + Math.sin(G.time * 45) * 2, 0, Math.PI * 2);
        g.fill();
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1;
        g.fillStyle = '#d8e2ea';
        g.fillRect(-11, -4, 20, 8);
        g.fillStyle = '#667786';
        g.fillRect(-5, -3, 9, 6);
        g.fillStyle = '#ff526d';
        g.fillRect(7, -3, 5, 6);
        g.fillStyle = '#7af5ff';
        g.fillRect(-13, -2, 4, 4);
        // Stabilizing fins.
        g.fillStyle = '#8ea1ad';
        g.fillRect(-7, -7, 6, 3);
        g.fillRect(-7, 4, 6, 3);
        g.restore();

        const lock = guidedTargetPoint(gr.target);
        if (lock) {
          const pulse = 7 + Math.sin(G.time * 12) * 2;
          g.save();
          g.globalAlpha = 0.45;
          g.strokeStyle = '#68efff';
          g.lineWidth = 1;
          g.beginPath();
          g.arc(lock.x - camX, lock.y, pulse, 0, Math.PI * 2);
          g.stroke();
          g.restore();
        }
      } else if (gr.kind === 'shell' || gr.kind === 'pshell') {
        const friendly = gr.kind === 'pshell';
        g.save();
        g.translate(sx, gr.y);
        g.rotate(Math.atan2(gr.vy, gr.vx));
        g.fillStyle = friendly ? '#4a5a38' : '#2e2c26';
        g.fillRect(-8, -5, 16, 10);
        g.fillStyle = friendly ? '#ffd76a' : '#55524a';
        g.fillRect(4, -5, 4, 10);
        g.restore();
        if (friendly && Math.random() < 0.5) {
          G.particles.push({
            x: gr.x - gr.vx * 0.02, y: gr.y, vx: rnd(-15, 15), vy: rnd(-20, 10),
            t: 0, life: 0.25, color: '#bbb', size: rnd(2, 4), grav: -40,
          });
        }
      } else if (gr.kind === 'erkt') {
        g.save();
        g.translate(sx, gr.y);
        g.rotate(Math.atan2(gr.vy, gr.vx));
        g.fillStyle = '#6a6a72';
        g.fillRect(-10, -4, 20, 8);
        g.fillStyle = '#b03a2e';
        g.fillRect(6, -4, 4, 8);
        g.fillStyle = '#ffae42';
        g.fillRect(-15, -3, 5, 6);
        g.restore();
      } else if (gr.kind === 'bomb') {
        g.fillStyle = '#3a3e30';
        g.fillRect(sx - 5, gr.y - 9, 10, 18);
        g.fillStyle = '#5a5e48';
        g.fillRect(sx - 5, gr.y - 9, 10, 4);
      } else if (gr.kind === 'pgren') {
        g.save();
        g.translate(sx, gr.y);
        g.rotate(gr.rot || 0);
        g.fillStyle = '#26342b';
        g.fillRect(-7, -4, 14, 8);
        g.fillStyle = '#6f8f55';
        g.fillRect(-4, -5, 8, 10);
        g.fillStyle = '#c9d6b5';
        g.fillRect(4, -3, 4, 6);
        g.fillStyle = '#20252a';
        g.fillRect(-9, -2, 3, 4);
        g.restore();
      } else {
        g.fillStyle = '#5e3a28';
        g.beginPath();
        g.arc(sx, gr.y, 6, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#222';
        g.fillRect(sx - 1, gr.y - 9, 3, 4);
      }
    }
  }

  // ============================================================
  // ESPLOSIONI E PARTICELLE
  // ============================================================
  // Large layered flame lobes derived from the Flame Shot visual language.
  // Used selectively by vehicle and boss destruction, not ordinary grenades.
  function spawnDestructionFire(x, y, scale, intensity) {
    const count = intensity || 8;
    G.particles.push({ kind: 'fireball', x: x, y: y, vx: 0, vy: -18,
      t: 0, life: 0.34 + scale * 0.12, color: '#ffffff',
      size: 28 * scale, grav: -18, phase: rnd(0, Math.PI * 2) });
    G.particles.push({ kind: 'glow', x: x, y: y, vx: 0, vy: -8,
      t: 0, life: 0.3 + scale * 0.08, color: '#ff8b2f',
      size: 34 * scale, grav: -12 });
    for (let i = 0; i < count; i++) {
      const angle = rnd(-Math.PI * 0.92, -Math.PI * 0.08);
      const speed = rnd(45, 175) * Math.sqrt(scale);
      G.particles.push({
        kind: 'fireball', x: x + rnd(-18, 18) * scale, y: y + rnd(-12, 12) * scale,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - rnd(15, 65),
        t: 0, life: rnd(0.32, 0.72) * (0.85 + scale * 0.18),
        color: i % 3 === 0 ? '#fff7c2' : i % 2 ? '#ff8b2f' : '#e72d20',
        size: rnd(10, 23) * scale, grav: rnd(80, 210), drag: 0.55,
        phase: rnd(0, Math.PI * 2), stretch: rnd(1.05, 1.65),
      });
    }
    for (let i = 0; i < Math.ceil(count * 1.4); i++) {
      const angle = rnd(-Math.PI, 0);
      const speed = rnd(120, 390) * Math.sqrt(scale);
      G.particles.push({ kind: 'spark', x: x + rnd(-8, 8), y: y + rnd(-8, 8),
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        t: 0, life: rnd(0.16, 0.48), color: i % 3 ? '#ffb52e' : '#ffffff',
        size: rnd(2, 5) * Math.min(1.5, scale), grav: 430, drag: 0.25 });
    }
  }

  function explode(x, y, r, hostileToPlayer, big, fromPlayer) {
    if (big) SFX.bigExplosion(); else SFX.explosion();
    G.shake = Math.max(G.shake, big ? 14 : 8);
    G.hitStop = Math.max(G.hitStop, big ? 0.06 : 0.025);
    G.flashes.push({ kind: 'explosion', x: x, y: y, r: r, t: 0, life: big ? 0.38 : 0.28 });
    CombatFX.spawnImpact(G.flashes, x, y, 'explosion', big ? 2.6 : 1.28);
    G.screenFlash = Math.max(G.screenFlash || 0, big ? 0.2 : 0.065);
    G.screenFlashColor = big ? '#fff2cf' : '#ffb347';
    G.particles.push({ kind: 'ring', x: x, y: y, vx: 0, vy: 0,
      t: 0, life: big ? 0.5 : 0.32, color: '#ffd76a', size: r * 0.28, grav: 0 });
    G.particles.push({ kind: 'ring', x: x, y: y, vx: 0, vy: 0,
      t: 0, life: big ? 0.7 : 0.42, color: '#ff6a32', size: r * 0.18, grav: 0 });

    const n = big ? 38 : 23;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = rnd(100, big ? 480 : 340);
      G.particles.push({
        kind: Math.random() < 0.72 ? 'spark' : 'debris',
        x: x, y: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - rnd(40, 140),
        t: 0, life: rnd(0.22, big ? 0.85 : 0.6),
        color: Math.random() < 0.25 ? '#ffffff' : Math.random() < 0.6 ? '#ffdf6a' : '#ff6a32',
        size: rnd(2.5, big ? 7 : 5), grav: rnd(420, 820), drag: 0.35,
        rot: rnd(0, Math.PI * 2), spin: rnd(-12, 12),
      });
    }

    const smokeCount = big ? 15 : 8;
    for (let i = 0; i < smokeCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = rnd(20, big ? 150 : 95);
      G.particles.push({
        kind: 'smoke', x: x + rnd(-8, 8), y: y + rnd(-8, 8),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - rnd(30, 90),
        t: 0, life: rnd(big ? 0.7 : 0.5, big ? 1.35 : 0.95),
        color: Math.random() < 0.35 ? '#5d6268' : '#34383d',
        size: rnd(big ? 10 : 7, big ? 22 : 15), grav: -55, drag: 1.2,
      });
    }

    // qualunque esplosione innesca i distruttibili vicini (reazioni a catena)
    for (const pr of G.props) {
      if (pr.dead) continue;
      const dx = pr.x - x, dy = (pr.y - 14) - y;
      if (dx * dx + dy * dy < (r + 16) * (r + 16)) EntityProps.damage(pr, 1);
    }

    // danni ad area
    if (hostileToPlayer) {
      const p = G.player;
      // gli SLUG nel raggio assorbono il danno
      for (const s of G.slugs) {
        if (s.hp <= 0) continue;
        const dx = s.x - x, dy = (s.y - 22) - y;
        if (dx * dx + dy * dy < (r + 20) * (r + 20)) damageSlug(s, 1);
      }
      if (!p.inSlug && !p.dead && p.inv <= 0) {
        const dx = p.x - x, dy = (p.y - 28) - y;
        if (dx * dx + dy * dy < r * r) killPlayer();
      }
    }
    if (fromPlayer) {
      for (const e of G.enemies) {
        if (e.dead) continue;
        const hb = enemyHitbox(e);
        const cx = hb.x + hb.w / 2, cy = hb.y + hb.h / 2;
        const dx = cx - x, dy = cy - y;
        if (dx * dx + dy * dy < (r + 20) * (r + 20)) damageEnemy(e, 5, dx >= 0 ? 1 : -1);
      }
      if (G.boss && G.boss.state === 'fight') {
        const hb = bossHitbox(G.boss);
        const cx = hb.x + hb.w / 2, cy = hb.y + hb.h / 2;
        const dx = cx - x, dy = cy - y;
        if (dx * dx + dy * dy < (r + 90) * (r + 90)) damageBoss(5);
      }
    }
  }

  function bloodBurst(x, y, n) {
    for (let i = 0; i < n; i++) {
      G.particles.push({
        x: x, y: y, vx: rnd(-160, 160), vy: rnd(-260, -60),
        t: 0, life: rnd(0.3, 0.6), color: '#b02020', size: rnd(2, 5), grav: 900,
      });
    }
  }

  function updateParticles(dt) {
    for (const pa of G.particles) {
      pa.t += dt;
      pa.vy += (pa.grav || 0) * dt;
      if (pa.drag) {
        const damp = Math.max(0, 1 - pa.drag * dt);
        pa.vx *= damp;
        pa.vy *= damp;
      }
      pa.x += pa.vx * dt;
      pa.y += pa.vy * dt;
      if (pa.rot !== undefined) pa.rot += (pa.spin || 0) * dt;
      if (pa.y > Level.GROUND && pa.vy > 0 && pa.kind !== 'ring' && pa.kind !== 'glow') {
        pa.y = Level.GROUND;
        if (pa.kind === 'casing' && !pa.bounced) {
          pa.bounced = true;
          SFX.casingPing();
        }
        pa.vy *= -0.3; pa.vx *= 0.7;
      }
    }
    EntityUtils.compactInPlace(G.particles, function (particle) { return particle.t < particle.life; });
    // tetto per evitare picchi di GC nelle scene più caotiche
    if (G.particles.length > 450) G.particles.splice(0, G.particles.length - 450);

    for (const f of G.flashes) f.t += dt;
    EntityUtils.compactInPlace(G.flashes, function (flash) { return flash.t < flash.life; });

    for (const c of G.corpses) {
      c.t += dt;
      if (c.vehicleWreck && !c.wreckAdded && c.t > c.life - 0.08) {
        c.wreckAdded = true;
        G.wrecks.push({ type:c.tank ? 'tank' : c.enemyHeliBig ? 'heliBig' : 'heliSmall',
          x:c.x, y:c.tank ? c.y : Level.GROUND, facing:c.facing });
      }
      if (c.vehicleWreck && c.t >= c.nextBoom && c.boomCount < 5) {
        const finalBlast = c.boomCount === 4;
        const fireX = c.x + rnd(-45, 45);
        const fireY = c.y - rnd(12, c.tank ? 55 : 35);
        explode(fireX, fireY,
          finalBlast ? (c.tank ? 105 : 120) : rnd(32, 58), false, finalBlast);
        spawnDestructionFire(fireX, fireY, finalBlast ? 1.75 : 0.9,
          finalBlast ? 18 : 8);
        // Each detonation leaves a rising fire/smoke pocket, creating a readable
        // ignition -> internal blasts -> fuel-tank finale sequence.
        for (let i = 0; i < (finalBlast ? 12 : 6); i++) {
          G.particles.push({ kind: i % 3 ? 'ember' : 'smoke',
            x: c.x + rnd(-42, 42), y: c.y - rnd(15, 55),
            vx: rnd(-85, 85), vy: rnd(-190, -65), t: 0,
            life: rnd(0.55, 1.15), color: i % 3 ? '#ff6a24' : '#25292e',
            size: rnd(5, 13), grav: i % 3 ? 120 : -65, drag: 0.85 });
        }
        c.boomCount++;
        c.nextBoom += finalBlast ? 99 : rnd(0.22, 0.38);
      }
      if (!c.tank) {
        c.vy += GRAV * 0.7 * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
      }
      c.angle += c.spin * dt;
      const floorY = c.heli ? Level.GROUND : Level.GROUND + 6;
      if (c.y > floorY) {
        c.y = floorY; c.vy = 0; c.vx *= 0.7; c.spin *= 0.5;
      }
      // Helicopters fall at a dramatic angle, then settle toward a horizontal
      // resting pose before the permanent destroyed PNG takes over.
      if (c.heli && c.y >= floorY - 1) {
        c.angle *= Math.max(0, 1 - dt * 4.2);
        c.spin *= Math.max(0, 1 - dt * 5.5);
      }
    }
    EntityUtils.compactInPlace(G.corpses, function (corpse) { return corpse.t < corpse.life; });
  }

  function drawParticles(g, camX) {
    for (const f of G.flashes) {
      if (CombatFX.drawFlash(g, f, camX)) continue;
      const k = f.t / f.life;
      const sx = f.x - camX;
      const radius = f.r * (0.18 + k * 0.92);
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = Math.max(0, 1 - k);
      const grad = g.createRadialGradient(sx, f.y, 0, sx, f.y, Math.max(1, radius));
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.22, '#fff4a8');
      grad.addColorStop(0.58, '#ff8a32');
      grad.addColorStop(1, 'rgba(255,70,20,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(sx, f.y, radius, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    for (const pa of G.particles) {
      const k = Math.max(0, Math.min(1, pa.t / pa.life));
      const alpha = Math.max(0, 1 - k);
      const sx = pa.x - camX;
      g.save();

      if (pa.kind === 'fireball') {
        // Expanded Flame Shot look: brilliant white core, yellow plasma,
        // orange body and a soft red transparent rim.
        const pulse = 0.9 + Math.sin(pa.phase + pa.t * 31) * 0.1;
        const radius = pa.size * (0.42 + k * 0.88) * pulse;
        const stretch = pa.stretch || 1.15;
        g.translate(sx, pa.y);
        if (Math.abs(pa.vx) + Math.abs(pa.vy) > 1) g.rotate(Math.atan2(pa.vy, pa.vx));
        g.scale(stretch, 1);
        g.globalCompositeOperation = 'lighter';
        const fire = g.createRadialGradient(0, 0, 1, 0, 0, Math.max(2, radius));
        fire.addColorStop(0, '#ffffff');
        fire.addColorStop(0.18, '#fff7c2');
        fire.addColorStop(0.38, '#ffe45f');
        fire.addColorStop(0.64, '#ff8b2f');
        fire.addColorStop(0.84, '#e72d20');
        fire.addColorStop(1, 'rgba(130,16,8,0)');
        g.globalAlpha = alpha * 0.94;
        g.fillStyle = fire;
        g.beginPath(); g.arc(0, 0, radius, 0, Math.PI * 2); g.fill();
        // Offset hot core makes each lobe feel directional rather than circular.
        g.globalAlpha = alpha * 0.78;
        g.fillStyle = '#fff9d2';
        g.beginPath(); g.ellipse(radius * 0.13, 0, radius * 0.3, radius * 0.16,
          0, 0, Math.PI * 2); g.fill();
      } else if (pa.kind === 'smoke') {
        const radius = pa.size * (0.55 + k * 1.35);
        g.globalAlpha = alpha * 0.58;
        g.fillStyle = pa.color;
        g.beginPath();
        g.arc(sx, pa.y, radius, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = alpha * 0.22;
        g.fillStyle = '#c5c8ca';
        g.beginPath();
        g.arc(sx - radius * 0.24, pa.y - radius * 0.2, radius * 0.55, 0, Math.PI * 2);
        g.fill();
      } else if (pa.kind === 'spark') {
        const speed = Math.max(1, Math.hypot(pa.vx, pa.vy));
        const len = Math.min(18, 3 + speed * 0.035) * (0.5 + alpha * 0.5);
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = alpha;
        g.strokeStyle = pa.color;
        g.lineWidth = Math.max(1, pa.size * alpha);
        g.beginPath();
        g.moveTo(sx, pa.y);
        g.lineTo(sx - pa.vx / speed * len, pa.y - pa.vy / speed * len);
        g.stroke();
      } else if (pa.kind === 'glow') {
        const radius = pa.size * (0.65 + k * 0.8);
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = alpha * 0.38;
        g.fillStyle = pa.color;
        g.beginPath();
        g.arc(sx, pa.y, radius, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = alpha;
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(sx, pa.y, Math.max(1, radius * 0.24), 0, Math.PI * 2);
        g.fill();
      } else if (pa.kind === 'ring') {
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = alpha * 0.85;
        g.strokeStyle = pa.color;
        g.lineWidth = Math.max(1, (1 - k) * 4);
        g.beginPath();
        g.arc(sx, pa.y, pa.size * (0.5 + k * 2.5), 0, Math.PI * 2);
        g.stroke();
      } else if (pa.kind === 'ember') {
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = alpha;
        g.fillStyle = pa.color;
        g.beginPath();
        g.arc(sx, pa.y, pa.size * (0.4 + alpha * 0.6), 0, Math.PI * 2);
        g.fill();
      } else if (pa.kind === 'spirit') {
        const twinkle = 0.65 + Math.sin((pa.t * 24) + pa.x * 0.07) * 0.35;
        const size = pa.size * (0.65 + alpha * 0.7);
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = alpha * twinkle;
        g.fillStyle = pa.color;
        g.translate(sx, pa.y);
        g.beginPath();
        g.moveTo(0, -size * 2.2);
        g.lineTo(size * 0.55, -size * 0.5);
        g.lineTo(size * 1.8, 0);
        g.lineTo(size * 0.55, size * 0.5);
        g.lineTo(0, size * 2.2);
        g.lineTo(-size * 0.55, size * 0.5);
        g.lineTo(-size * 1.8, 0);
        g.lineTo(-size * 0.55, -size * 0.5);
        g.closePath();
        g.fill();
      } else if (pa.kind === 'sand') {
        g.globalAlpha = alpha * (0.28 + Math.min(1, DesertWeather.intensity()) * 0.34);
        g.strokeStyle = pa.color;
        g.lineWidth = Math.max(1, pa.size);
        g.beginPath();
        g.moveTo(sx, pa.y);
        g.lineTo(sx - (pa.length || 10), pa.y - pa.vy * 0.018);
        g.stroke();
      } else if (pa.kind === 'casing') {
        g.globalAlpha = alpha;
        g.translate(sx, pa.y);
        g.rotate(pa.rot || 0);
        g.fillStyle = '#7a5520';
        g.fillRect(-3, -1.5, 7, 3);
        g.fillStyle = '#ffe08a';
        g.fillRect(-2, -1, 5, 1);
        g.fillStyle = '#2b241b';
        g.fillRect(3, -1, 1, 2);
      } else if (pa.kind === 'debris') {
        g.globalAlpha = alpha;
        g.fillStyle = pa.color;
        g.translate(sx, pa.y);
        g.rotate(pa.rot || 0);
        g.fillRect(-pa.size, -pa.size * 0.35, pa.size * 2, pa.size * 0.7);
      } else {
        g.globalAlpha = alpha;
        g.fillStyle = pa.color;
        g.fillRect(sx - pa.size / 2, pa.y - pa.size / 2, pa.size, pa.size);
      }
      g.restore();
    }
    for (const c of G.corpses) {
      if (c.tank) {
        g.save();
        g.globalAlpha = Math.max(0, 1 - c.t / c.life * 0.55);
        g.translate(c.x - camX, c.y);
        g.rotate(c.angle * 0.18);
        c.tread = c.t * 12;
        if (c.t > 1.35 && enemyTankArt.destroyed.naturalWidth > 0) {
          if (c.facing > 0) g.scale(-1, 1);
          g.drawImage(enemyTankArt.destroyed, -76, -76, 152, 76);
        } else if (!drawEnemyTankArt(g, 0, 0, c.facing, c, c.t < 0.15))
          Sprites.drawTank(g, 0, 0, c.facing, c.t * 12, c.t < 0.15);
        g.restore();
      } else if (c.heli) {
        g.save();
        // Ground clips the rotating crash body, preventing any angled wreck
        // pixels from appearing underneath the terrain surface.
        g.beginPath(); g.rect(-300, -300, 1600, Level.GROUND + 301); g.clip();
        g.globalAlpha = Math.max(0, 1 - c.t / c.life * 0.6);
        g.translate(c.x - camX, c.y);
        g.rotate(c.angle * 0.3);
        const destroyedHeli = c.enemyHeliBig ? destroyedHeliArt.big : destroyedHeliArt.small;
        const dw = c.enemyHeliBig ? 220 : 142, dh = c.enemyHeliBig ? 86 : 51;
        if (c.t > 1.35 && destroyedHeli.naturalWidth > 0) {
          if (c.facing < 0) g.scale(-1, 1);
          g.drawImage(destroyedHeli, -dw / 2, -dh, dw, dh);
        } else if (!drawEnemyHeliArt(g, 0, -dh / 2, c.facing, c.t, false, !!c.enemyHeliBig)) {
          if (c.scale && c.scale !== 1) g.scale(c.scale, c.scale);
          Sprites.drawHeli(g, 0, -dh / 2, c.facing, c.t, false);
        }
        g.restore();
      } else if (c.robot || c.soldier02 || c.soldier03 || c.soldier04 || c.soldier05 || c.observer) {
        g.save(); g.globalAlpha = Math.max(0, 1 - c.t / c.life);
        g.translate(c.x - camX, c.y); g.rotate(c.angle * 0.12);
        if (c.robot) drawRobotSoldier(g, 0, 0, c.facing, c, true);
        else if (c.soldier02) drawSoldier02(g, 0, 0, c.facing, c, true);
        else if (c.soldier03) drawSoldier03(g, 0, 0, c.facing, c, true);
        else if (c.soldier04) drawSoldier04(g, 0, 0, c.facing, c, true);
        else if (c.observer) drawSoldier06(g, 0, 0, c.facing, c, true);
        else drawSoldier05(g, 0, 0, c.facing, c, true);
        g.restore();
      } else {
        Sprites.drawRotated(g, c.spr, c.x - camX, c.y, c.facing, c.angle, 1 - c.t / c.life);
      }
    }
    // Persistent vehicle remains stay in the mission after smoke and fire clear.
    for (const wreck of G.wrecks) {
      const wx = wreck.x - camX;
      if (wx < -380 || wx > 1340) continue;
      g.save(); g.translate(Math.round(wx), Math.round(wreck.y));
      if (wreck.type === 'tank' && enemyTankArt.destroyed.naturalWidth > 0) {
        if (wreck.facing > 0) g.scale(-1, 1);
        g.drawImage(enemyTankArt.destroyed, -76, -76, 152, 76);
      } else if (wreck.type === 'heliSmall' && destroyedHeliArt.small.naturalWidth > 0) {
        if (wreck.facing < 0) g.scale(-1, 1);
        g.drawImage(destroyedHeliArt.small, -71, -51, 142, 51);
      } else if (wreck.type === 'heliBig' && destroyedHeliArt.big.naturalWidth > 0) {
        if (wreck.facing < 0) g.scale(-1, 1);
        g.drawImage(destroyedHeliArt.big, -110, -86, 220, 86);
      } else if (wreck.type === 'boss' && bossTankArt.destroyed.naturalWidth > 0) {
        g.drawImage(bossTankArt.destroyed, -162.5, -193, 325, 193);
      }
      g.restore();
    }
  }

  function drawMenuShowcase(g, time) {
    const tank = { t:time, tread:time * 32, vx:35, recoil:Math.max(0, Math.sin(time * 1.3) * 4), flash:0 };
    drawEnemyTankArt(g, 765, Level.GROUND, -1, tank, false);
    const robot = { t:time, vx:42, recoil:0, flash:0 };
    drawRobotSoldier(g, 610, Level.GROUND, -1, robot, false);
    const saw = { t:time, vx:85, recoil:0, flash:0 };
    drawSoldier03(g, 520, Level.GROUND, 1, saw, false);
    drawEnemyHeliArt(g, 865, 350, -1, time, false, false);
  }

  EntityProps.configure({ explode: explode });

  window.Entities = {
    WEAPONS: WEAPONS,
    drawMenuShowcase: drawMenuShowcase,
    createPlayer: createPlayer,
    updatePlayer: updatePlayer,
    drawPlayer: drawPlayer,
    killPlayer: killPlayer,
    spawnEnemy: spawnEnemy,
    updateEnemies: updateEnemies,
    drawEnemies: drawEnemies,
    spawnBoss: spawnBoss,
    updateBoss: updateBoss,
    drawBoss: drawBossEntity,
    updateBullets: updateBullets,
    drawBullets: drawBullets,
    updateGrenades: updateGrenades,
    drawGrenades: drawGrenades,
    updateParticles: updateParticles,
    drawParticles: drawParticles,
    spawnPow: EntityCollectibles.spawnPow,
    updatePows: EntityCollectibles.updatePows,
    drawPows: EntityCollectibles.drawPows,
    spawnPickup: EntityCollectibles.spawnPickup,
    updatePickups: EntityCollectibles.updatePickups,
    drawPickups: EntityCollectibles.drawPickups,
    updateScorePops: EntityScore.update,
    drawScorePops: EntityScore.draw,
    explode: explode,
    addScore: EntityScore.add,
    spawnSlug: spawnSlug,
    updateSlugs: updateSlugs,
    drawSlugs: drawSlugs,
    spawnProp: EntityProps.spawn,
    updateProps: EntityProps.update,
    drawProps: EntityProps.draw,
    updateWarnings: EntityWarnings.update,
    drawWarnings: EntityWarnings.draw,
    bufferInputs: function () {
      const p = G.player;
      if (p && Input.jump()) p.jumpBufT = p.profile.jumpBuffer;
    },
  };
})();
