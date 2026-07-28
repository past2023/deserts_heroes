/* spider-tank.js — Reusable spider tank animation module
 * Provides: art loading, multi-layer draw function, walk animation
 * Usage:  SpiderTank.draw(g, x, y, facing, enemy, flash, artSet)
 * Future variants:  SpiderTank.createArtSet(pathPrefix)
 */
(function () {
  'use strict';

  /* ── art set factory ─────────────────────────────────────── */

  function createArtSet(prefix) {
    var a = { full: new Image(), chassis: new Image(), turret: new Image(),
      leg01: new Image(), leg02: new Image(), leg03: new Image(), leg04: new Image(), destroyed: new Image() };
    a.full.src      = prefix + '.png';
    a.chassis.src   = prefix + '_chassis.png';
    a.turret.src    = prefix + '_turret.png';
    a.leg01.src     = prefix + '_leg01.png';
    a.leg02.src     = prefix + '_leg02.png';
    a.leg03.src     = prefix + '_leg03.png';
    a.leg04.src     = prefix + '_leg04.png';
    a.destroyed.src = prefix + '_destroyed.png';
    return a;
  }

  /* ── default art set (enemy_spider_tank01) ───────────────── */

  var DEFAULT_PREFIX = 'assets/vehicles/enemy_spider_tank01/enemy_spider_tank01';
  var defaultArt = createArtSet(DEFAULT_PREFIX);

  /* ── draw function ──────────────────────────────────────── */

  var BODY_SCALE  = 0.42;
  var WRECK_SCALE = 152 / 60;

  function draw(g, x, y, facing, enemy, flash, artSet) {
    artSet = artSet || defaultArt;
    var width  = 325 * BODY_SCALE;
    var height = 198 * BODY_SCALE;
    if (!artSet.full || artSet.full.naturalWidth <= 0) return;

    var time   = enemy ? enemy.t : (typeof G !== 'undefined' ? G.time : 0);
    var moving = enemy ? Math.abs(enemy.vx) > 3 : false;

    g.save();
    g.translate(Math.round(x), Math.round(y));
    if (flash) g.filter = 'brightness(0) invert(1)';

    var left  = -width / 2;
    var top   = -height;
    var wreck = enemy ? !!enemy.vehicleWreck : false;
    var wreckT = wreck ? Math.min(1, enemy.t / 1.35) : 0;

    /* idle vibration when stopped */
    var idleVibX = !moving && !wreck ? Math.sin(time * 22) * 1.2 : 0;
    var idleVibY = !moving && !wreck ? Math.cos(time * 26) * 0.8 : 0;
    g.translate(idleVibX, idleVibY);

    /* walking body bounce */
    var walkVibX = moving ? Math.sin(time * 18) * 0.6 : 0;
    var walkVibY = moving ? Math.sin(time * 22) * 0.8 : 0;
    g.translate(walkVibX, walkVibY);

    /* ── walk animation: diagonal pairs, X flipped by facing ── */
    var walkPhase = moving ? time * 5.5 : 0;
    var fx = facing || 1;
    var legShifts = {
      1: { x: moving ? Math.sin(walkPhase) * 3 * (-fx) : 0,
           y: moving ? Math.cos(walkPhase) * 3.5 : 0 },
      2: { x: moving ? Math.sin(walkPhase + Math.PI) * 3 * (-fx) : 0,
           y: moving ? Math.cos(walkPhase + Math.PI) * 3.5 : 0 },
      3: { x: moving ? Math.sin(walkPhase + Math.PI) * 3 * (-fx) : 0,
           y: moving ? Math.cos(walkPhase + Math.PI) * 3.5 : 0 },
      4: { x: moving ? Math.sin(walkPhase) * 3 * (-fx) : 0,
           y: moving ? Math.cos(walkPhase) * 3.5 : 0 },
    };

    function drawLeg(num, img) {
      if (!img || img.naturalWidth <= 0) return;
      g.save();
      g.translate(legShifts[num].x, legShifts[num].y);
      g.drawImage(img, left, top, width, height);
      g.restore();
    }

    /* ── layer order (back → front): leg02, leg04, chassis, leg01, leg03, turret ── */

    drawLeg(2, artSet.leg02);
    drawLeg(4, artSet.leg04);

    /* chassis */
    if (artSet.chassis.naturalWidth > 0) {
      g.save();
      if (wreck) { g.translate(Math.sin(time * 24) * (1 - wreckT) * 2.5, wreckT * 5); g.rotate(-wreckT * 0.035); }
      g.drawImage(artSet.chassis, left, top, width, height);
      g.restore();
    } else {
      g.drawImage(artSet.full, left, top, width, height);
    }

    drawLeg(1, artSet.leg01);
    drawLeg(3, artSet.leg03);

    /* turret — flipped for facing */
    if (artSet.turret.naturalWidth > 0) {
      g.save();
      if (facing < 0) g.scale(-1, 1);
      var rec       = enemy ? Math.max(0, enemy.recoil || 0) : 0;
      var recoilX   = rec * 0.5;
      var turretVibX = !moving && !wreck ? Math.sin(time * 24) * 1.5 : 0;
      var turretVibY = !moving && !wreck ? Math.cos(time * 28) * 1.0 : 0;
      g.translate(-recoilX + turretVibX, turretVibY - Math.sin(rec * 0.3) * 2);
      if (wreck) g.rotate(-wreckT * 0.42);
      g.drawImage(artSet.turret, left, top, width, height);
      /* eye glow */
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.3 + Math.sin(time * 6) * 0.12;
      g.fillStyle = '#ff3322';
      g.beginPath();
      g.arc(left + width * 0.82, top + height * 0.32, 5, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 0.12 + Math.sin(time * 4) * 0.06;
      g.beginPath();
      g.arc(left + width * 0.82, top + height * 0.32, 10, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    g.filter = 'none';
    g.restore();
  }

  /* ── draw destroyed art (for corpses and permanent wrecks) ── */

  function drawDestroyed(g, artSet, facing) {
    artSet = artSet || defaultArt;
    if (!artSet.destroyed || artSet.destroyed.naturalWidth <= 0) return;
    if (facing > 0) g.scale(-1, 1);
    g.drawImage(artSet.destroyed, -76, -60, 152, 60);
  }

  /* ── public API ─────────────────────────────────────────── */

  window.SpiderTank = {
    art:        defaultArt,
    createArtSet: createArtSet,
    draw:       draw,
    drawDestroyed: drawDestroyed,
  };

})();
