// Destructible crates and explosive barrels.
// Combat effects are injected once by entities.js to avoid a cyclic module API.
(function () {
  let explode = null;
  const DECORATION_TYPES = ['tonnel', 'sign01', 'door', 'dish', 'sign02',
    'dish02', 'flag', 'barrel01', 'barrel02', 'mil1', 'sign03', 'mine01'];
  const EXPLOSIVE_TYPES = ['tonnel', 'barrel01', 'barrel02', 'mine01'];
  const decorationImages = {};
  for (const type of DECORATION_TYPES) {
    const image = new Image(); image.decoding = 'async';
    image.src = 'assets/props/deco_' + type + '.png'; decorationImages[type] = image;
  }

  function random(a, b) { return a + Math.random() * (b - a); }

  function configure(services) {
    if (!services || typeof services.explode !== 'function') {
      throw new Error('[Props] Missing explosion service');
    }
    explode = services.explode;
  }

  function hiddenLoot() {
    const roll = Math.random();
    if (roll < 0.35) return null;             // score/cache fragment
    if (roll < 0.38) return 'jetpack';        // rare mobility reward
    if (roll < 0.44) return 'homing';         // rare launcher upgrade
    if (roll < 0.69) return 'grenades';
    const weapons = ['mg', 'spread', 'rocket', 'flame'];
    return weapons[Math.floor(Math.random() * weapons.length)];
  }

  function releaseLoot(prop) {
    if (prop.loot) EntityCollectibles.spawnPickup(prop.x, prop.loot);
    else EntityScore.add(100, prop.x, prop.y - 54);
  }

  function spawn(x, type) {
    if (type !== 'barrel' && type !== 'crate' && DECORATION_TYPES.indexOf(type) < 0) {
      console.warn('[Props] Unknown prop type:', type);
      return;
    }
    G.props.push({ x: x, y: Level.GROUND, type: type, hp: 5, maxHp: 5,
      loot: type === 'mine01' ? null : hiddenLoot(), flash: 0, dead: false });
  }

  function hitbox(prop) {
    if (prop.type === 'mine01') return { x: prop.x - 18, y: prop.y - 15, w: 36, h: 15 };
    if (prop.type === 'barrel' || EXPLOSIVE_TYPES.indexOf(prop.type) >= 0) return { x: prop.x - 22, y: prop.y - 58, w: 44, h: 58 };
    if (DECORATION_TYPES.indexOf(prop.type) >= 0)
      return { x: prop.x - 24, y: prop.y - 58, w: 48, h: 58 };
    return { x: prop.x - 15, y: prop.y - 26, w: 30, h: 26 };
  }

  function damage(prop, amount) {
    if (!prop || prop.dead) return false;
    prop.hp -= amount || 1;
    prop.flash = 0.1;
    for (let i = 0; i < 3; i++) G.particles.push({
      kind: 'spark', x: prop.x + random(-14, 14), y: prop.y - random(15, 52),
      vx: random(-100, 100), vy: random(-170, -50), t: 0, life: random(0.12, 0.25),
      color: '#ffd08a', size: random(1.5, 3), grav: 500,
    });
    if (prop.hp <= 0) { destroy(prop); return true; }
    return false;
  }

  function destroy(prop) {
    if (prop.dead) return;
    prop.dead = true;
    if (prop.type === 'barrel' || EXPLOSIVE_TYPES.indexOf(prop.type) >= 0) {
      if (prop.type !== 'mine01') releaseLoot(prop);
      if (!explode) throw new Error('[Props] System used before configuration');
      explode(prop.x, prop.y - 14, 85, true, false, true);
      return;
    }

    const decoration = DECORATION_TYPES.indexOf(prop.type) >= 0;
    SFX.crate();
    for (let i = 0; i < (decoration ? 14 : 9); i++) {
      G.particles.push({
        x: prop.x + random(-12, 12), y: prop.y - random(2, 22),
        vx: random(-160, 160), vy: random(-280, -80),
        t: 0, life: random(0.35, 0.7), color: Math.random() < 0.5 ? '#8a6a3c' : '#5e4626',
        size: random(3, 6), grav: 900,
      });
    }

    if (decoration) {
      releaseLoot(prop);
      return;
    }

    const roll = Math.random();
    if (roll < 0.08) {
      EntityCollectibles.spawnPickup(prop.x, 'homing');
    } else if (roll < 0.28) {
      const gifts = ['mg', 'spread', 'rocket', 'flame'];
      EntityCollectibles.spawnPickup(prop.x, gifts[Math.floor(Math.random() * gifts.length)]);
    } else if (roll < 0.48) {
      EntityCollectibles.spawnPickup(prop.x, 'grenades');
    } else {
      EntityScore.add(100, prop.x, prop.y - 36);
    }
  }

  function update(dt) {
    let write = 0;
    for (let read = 0; read < G.props.length; read++) {
      const prop = G.props[read];
      if (prop.flash > 0) prop.flash = Math.max(0, prop.flash - dt);
      if (!prop.dead) G.props[write++] = prop;
    }
    G.props.length = write;
  }

  function draw(g, camX) {
    for (const prop of G.props) {
      const sx = prop.x - camX;
      if (sx < -60 || sx > 1020) continue;
      if (prop.type === 'barrel') Sprites.drawBarrel(g, sx, prop.y, prop.flash > 0);
      else if (prop.type === 'crate') Sprites.drawWoodCrate(g, sx, prop.y, prop.flash > 0);
      else {
        const image = decorationImages[prop.type];
        if (image && image.naturalWidth > 0) {
          g.save(); g.imageSmoothingEnabled = false;
          const width = prop.type === 'mine01' ? image.naturalWidth : prop.type === 'door' ? 78 : 72;
          const height = prop.type === 'mine01' ? image.naturalHeight : width;
          if (prop.type === 'mine01') {
            const pulse = 0.45 + Math.sin((G.time + prop.x * 0.01) * 8) * 0.22;
            g.globalCompositeOperation = 'lighter'; g.globalAlpha = pulse;
            g.shadowColor = '#ff3028'; g.shadowBlur = 14;
            g.fillStyle = '#ff3028'; g.beginPath();
            g.ellipse(Math.round(sx), Math.round(prop.y - 7), 18 + pulse * 6, 6 + pulse * 2, 0, 0, Math.PI * 2); g.fill();
            g.shadowBlur = 0; g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
          }
          if (prop.flash > 0) g.globalAlpha = 0.62;
          g.drawImage(image, Math.round(sx - width / 2), Math.round(prop.y - height), width, height);
          g.restore();
          if (prop.hp < prop.maxHp) {
            for (let i = 0; i < prop.maxHp; i++) {
              g.fillStyle = i < prop.hp ? '#ffb347' : 'rgba(60,50,45,0.65)';
              g.fillRect(Math.round(sx - 14 + i * 7), Math.round(prop.y - height - 6), 5, 3);
            }
          }
        }
      }
    }
  }

  window.EntityProps = Object.freeze({
    configure: configure,
    spawn: spawn,
    hitbox: hitbox,
    damage: damage,
    destroy: destroy,
    update: update,
    draw: draw,
  });
})();
