// POW rescue and pickup lifecycle/rendering.
(function () {
  const PICKUP_INFO = Object.freeze({
    mg: { letter:'H', color:'#ffd76a', files:['Heavy_machine_gun.png'], w:72, h:27 },
    spread: { letter:'S', color:'#7ad0ff', files:['Spread_weapon.png'], w:62, h:30 },
    rocket: { letter:'R', color:'#ff8a6a', files:['Rocket_weapon.png','missile_weapon.png'], w:75, h:25 },
    flame: { letter:'F', color:'#ff7a2a', files:['Flame_shot.png'], w:70, h:27 },
    grenades: { letter:'G', color:'#9aff8a', files:['Grenade_refill_pack.png'], w:38, h:35 },
    homing: { letter:'T', color:'#68efff', files:['Guided_missile_pod.png'], w:56, h:31 },
    jetpack: { letter:'J', color:'#ffb347', files:['jet_pack.png'], w:38, h:40 },
    heart: { letter:'+', color:'#ff4d68', files:['heart_icon.png'], w:36, h:33 },
  });
  const pickupImages = {};
  for (const type in PICKUP_INFO) {
    pickupImages[type] = [];
    for (const file of PICKUP_INFO[type].files) {
      const image = new Image(); image.decoding = 'async';
      image.src = 'assets/pickups/' + file; pickupImages[type].push(image);
    }
  }

  const prisonerArt = [];
  for (let variant=1; variant<=2; variant++) {
    const parts={};
    const names=variant===1?['full','hand_down','leg02','leg01','torso','head','hand_up']:['full','hand_down','leg02','leg01','torso','hand_up'];
    for(const name of names){const image=new Image();image.src='assets/pows/prisoner0'+variant+'/'+name+'.png';parts[name]=image}
    prisonerArt.push(parts);
  }

  function drawPrisoner(g,pow,sx,bounce){
    const parts=prisonerArt[pow.variant||0],sourceW=(pow.variant||0)===0?166:164,sourceH=(pow.variant||0)===0?337:330,scale=.3;
    if(!parts||!parts.full.naturalWidth)return false;
    const phase=pow.t*(pow.state==='free'?9:2.5);
    g.save();g.translate(Math.round(sx),Math.round(pow.y-bounce));if(pow.facing<0)g.scale(-1,1);
    const layer=function(img,px,py,angle,ox,oy){if(!img||!img.naturalWidth)return;g.save();g.translate((px-sourceW/2)*scale+(ox||0),(py-sourceH)*scale+(oy||0));if(angle)g.rotate(angle);g.drawImage(img,-px*scale,-py*scale,sourceW*scale,sourceH*scale);g.restore()};
    if(pow.state==='tied'){
      // Tied: full.png shows complete body with both hands naturally down = 2 hands down.
      layer(parts.full,sourceW*.5,sourceH*.5,0,0,0);
    } else {
      // Free: draw torso+legs+head+hand_up only (no hand_down, no full).
      // hand_up provides 1 raised hand; the other arm is omitted giving clean 1-hand-up pose.
      const stride=Math.sin(phase)*.08;
      layer(parts.leg02,sourceW*.34,sourceH*.62,-stride,0,0);
      layer(parts.leg01,sourceW*.61,sourceH*.62,stride,0,0);
      layer(parts.torso,sourceW*.5,sourceH*.38,Math.sin(phase*.45)*.015,0,0);
      if(parts.head)layer(parts.head,sourceW*.42,sourceH*.2,Math.sin(phase*.35)*.04,0,-1);
      layer(parts.hand_up,sourceW*.68,sourceH*.29,-0.25+Math.sin(phase)*.28,0,-3);
    }
    g.restore();return true;
  }

  function compactAlive(list) {
    let write = 0;
    for (let read = 0; read < list.length; read++) {
      if (!list[read].dead) list[write++] = list[read];
    }
    list.length = write;
  }

  function spawnPow(x) {
    G.pows.push({ x:x, y:Level.GROUND, state:'tied', t:0, facing:-1, variant:Math.random()<.5?0:1 });
  }

  function updatePows(dt) {
    const player = G.player;
    for (const pow of G.pows) {
      pow.t += dt;
      if (pow.state === 'tied') {
        if (!player.dead && Math.abs(player.x - pow.x) < 30 && Math.abs(player.y - pow.y) < 60) {
          pow.state = 'free';
          pow.t = 0;
          SFX.pow();
          EntityScore.add(500, pow.x, pow.y - 70);
          const gifts = ['mg', 'spread', 'rocket', 'flame', 'grenades', 'grenades', 'homing', 'jetpack'];
          spawnPickup(pow.x + 30, gifts[Math.floor(Math.random() * gifts.length)]);
        }
      } else {
        if (pow.t > 1.2) { pow.x -= 140 * dt; pow.facing = -1; }
        if (pow.t > 5) pow.dead = true;
      }
    }
    compactAlive(G.pows);
  }

  function drawPows(g, camX) {
    for (const pow of G.pows) {
      const sx = pow.x - camX;
      if (sx < -80 || sx > 1040) continue;
      const sprite = pow.state === 'tied' ? Sprites.powTied : Sprites.powFree;
      const bounce = pow.state === 'free' && pow.t < 1.2 ? Math.abs(Math.sin(pow.t * 8)) * 8 : 0;
      if(!drawPrisoner(g,pow,sx,bounce)) Sprites.draw(g, sprite, sx, pow.y - bounce, pow.facing);
      if (pow.state === 'tied' && Math.floor(pow.t * 2) % 2 === 0) {
        g.fillStyle = '#fff';
        g.font = 'bold 7px "Press Start 2P", "Courier New", monospace';
        g.textAlign = 'center';
        g.fillText(I18n.t('entity.help'), sx, pow.y - 48);
      }
    }
  }

  function spawnPickup(x, type, fixedY) {
    if (!PICKUP_INFO[type]) {
      console.warn('[Collectibles] Unknown pickup type:', type);
      return;
    }
    G.pickups.push({ x:x, y:fixedY !== undefined ? fixedY : Level.GROUND-200, vy:0, type:type, t:0, landed:fixedY !== undefined,
      variant:Math.floor(Math.random()*Math.max(1,pickupImages[type].length)) });
  }

  function updatePickups(dt) {
    const player = G.player;
    for (const pickup of G.pickups) {
      pickup.t += dt;
      if (!pickup.landed) {
        pickup.vy += 1200 * dt;
        pickup.y += pickup.vy * dt;
        if (pickup.y >= Level.GROUND) {
          pickup.y = Level.GROUND;
          pickup.landed = true;
        }
      }
      if (pickup.type !== 'homing' && pickup.type !== 'jetpack' && pickup.type !== 'heart' && pickup.t > 14) pickup.dead = true;
      if (!player.dead && Math.abs(player.x - pickup.x) < 28 &&
          Math.abs((player.y - 24) - (pickup.y - 14)) < 44) {
        pickup.dead = true;
        SFX.pickup();
        if (pickup.type === 'heart') {
          G.lives = Math.min(5, G.lives + 1);
          player.hudPulse = 0.8;
          EntityScore.add(1000, pickup.x, pickup.y - 50);
          G.scorePops.push({ x:pickup.x, y:pickup.y-68, labelKey:'pickup.life', t:0 });
        } else if (pickup.type === 'grenades') {
          player.grenades = Math.min(99, player.grenades + 6);
          player.secondaryPulse = 0.45;
          EntityScore.add(200, pickup.x, pickup.y - 50);
        } else if (pickup.type === 'jetpack') {
          player.jetpackT = 10;
          G.jetpackNoticeT = 3.6;
          player.vy = -180;
          player.onGround = false;
          player.secondaryPulse = 0.8;
          EntityScore.add(750, pickup.x, pickup.y - 50);
          G.scorePops.push({ x: pickup.x, y: pickup.y - 74, labelKey: 'pickup.jetpack', t: 0 });
        } else if (pickup.type === 'homing') {
          player.homingMissiles = 10;
          player.secondaryPulse = 0.8;
          EntityScore.add(500, pickup.x, pickup.y - 50);
          G.scorePops.push({ x: pickup.x, y: pickup.y - 74, labelKey: 'pickup.guided', t: 0 });
          SFX.guidedReady();
        } else {
          player.weapon = pickup.type;
          player.ammo = Characters.specialAmmo(player.characterId, Entities.WEAPONS[pickup.type].ammo);
          player.hudPulse = 0.6;
          EntityScore.add(200, pickup.x, pickup.y - 50);
        }
      }
    }
    compactAlive(G.pickups);
  }

  function drawPickups(g, camX) {
    for (const pickup of G.pickups) {
      if (pickup.type !== 'homing' && pickup.type !== 'jetpack' && pickup.type !== 'heart' && pickup.t > 10 && Math.floor(pickup.t * 8) % 2 === 0) continue;
      const info = PICKUP_INFO[pickup.type];
      const bob = pickup.landed ? Math.sin(pickup.t * 4) * 3 : 0;
      const sx = pickup.x - camX;
      const images = pickupImages[pickup.type];
      const image = images && images[pickup.variant % Math.max(1, images.length)];
      const floatY = pickup.y - 9 - bob - Math.sin(pickup.t * 2.2) * 2;
      if (image && image.naturalWidth > 0) {
        g.save(); g.imageSmoothingEnabled = false;
        // Canvas shadow follows the PNG alpha silhouette rather than a box.
        g.shadowColor = info.color; g.shadowBlur = 10 + Math.sin(pickup.t * 5) * 3;
        g.globalAlpha = 0.9;
        g.drawImage(image, Math.round(sx - info.w / 2), Math.round(floatY - info.h), info.w, info.h);
        g.shadowBlur = 0; g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.2;
        g.drawImage(image, Math.round(sx - info.w / 2), Math.round(floatY - info.h), info.w, info.h);
        g.restore();
      } else {
        Sprites.drawCrate(g, sx, pickup.y - bob, info.letter, info.color);
      }
    }
  }

  window.EntityCollectibles = Object.freeze({
    spawnPow: spawnPow,
    updatePows: updatePows,
    drawPows: drawPows,
    spawnPickup: spawnPickup,
    updatePickups: updatePickups,
    drawPickups: drawPickups,
  });
})();
