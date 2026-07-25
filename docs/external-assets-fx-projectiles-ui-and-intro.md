# External Asset Production — Intro Surfboard, Projectiles, FX and UI

## Purpose

This document completes the external-asset inventory for graphics that are currently generated internally by Canvas rather than loaded from PNG files. It covers the rocket surfboard, projectiles, combat effects, warnings, particles, HUD icons, menu graphics and rules for elements that must remain generated because they contain localized or dynamic data.

This is a conversion specification, not a requirement to replace every procedural effect. **Desert's Heroes** should use a hybrid pipeline:

- external PNGs for authored silhouettes and frame animation;
- procedural Canvas for scalable glow, rays, smoke variation, screen flashes, localized text and responsive panels;
- procedural WebAudio for sound.

# 1. Rocket surfboard intro vehicle

The rocket surfboard is currently drawn entirely by `Sprites.drawRocketBoard` in `js/sprites.js`. It is not part of the allied tank sheet.

## Recommended external canvas

```text
Asset ID: intro_rocket_board
Frame canvas: 160 × 64
Direction: faces right
World pivot: (80,32)
Rider foot/deck socket: (80,26)
Upper engine socket: (29,24)
Lower engine socket: (29,37)
Nose point: about (138,32)
```

The world pivot replaces the current procedural `(x,y)` board center. The rider’s feet attach six pixels above the center, matching the existing intro alignment.

## Minimum delivery option

One static transparent image:

```text
assets/intro/intro_rocket_board.png
160 × 64
```

## Recommended animated delivery

| File | Frames | Sheet size | FPS/use |
|---|---:|---:|---|
| `intro_rocket_board_hover.png` | 4 | 640×64 | 8 fps loop |
| `intro_rocket_board_boost.png` | 4 | 640×64 | 12 fps while entering/departing |
| `intro_rocket_board_turn.png` | 4 | 640×64 | optional future turn |
| `intro_rocket_board_damage.png` | 4 | 640×64 | optional future gameplay use |

Surfboard art rules:

- Board only—do not include Juan, Elena or Sergio in the board PNG.
- Do not bake exhaust fire, smoke, glow, screen shake or contact shadow.
- Keep the deck socket fixed in every frame.
- Keep both engine sockets fixed through hover animation.
- Use an original desert-space military design.
- Leave at least 6 transparent pixels around fins and nose.
- Source faces right; engine mirrors if a future left-facing entrance is added.

The engine should continue generating twin exhaust cones, sparks and smoke from the engine sockets.

## Standalone film-intro spaceship and parallax

The root cinematic uses a separate spacecraft, not the player’s rocket surfboard:

```text
intro_ship.png — optional 192×96 transparent PNG, right-facing, center pivot
```

The current generated fallback ship includes twin engine pods, swept wings, an armored orange/ivory fuselage, cyan canopy, navigation lights, panel seams, fins and animated exhaust.

Active cinematic layers:

```text
slide1_sky.png          1020×540
slide1_mountains.png    1080×463
slide1_dunes.png        1200×540
slide2_stars.png        1020×540
slide2_planet.png       1080×463
slide2_asteroids.png    1200×540
```

Full composition and safe-area rules are in `assets/intro/README.md`. Sand wind, moving foreground stars, title zoom, fades and circular iris-out remain generated.

# 2. Player and vehicle projectiles

Projectiles are currently generated with Canvas shapes in `js/combat-fx.js` and `js/entities.js`. External projectile PNGs are optional but can add authored detail.

## Recommended projectile specifications

| Projectile | Frame canvas | Suggested frames | Sheet size | Pivot |
|---|---:|---:|---:|---:|
| Pistol tracer | 32×16 | 4 | 128×16 | center `(16,8)` |
| Heavy MG tracer | 40×16 | 4 | 160×16 | center `(20,8)` |
| Spread pellet | 24×24 | 4 | 96×24 | center `(12,12)` |
| Tank coaxial laser | 48×24 | 4 | 192×24 | center `(24,12)` |
| Player rocket | 48×24 | 4 | 192×24 | center `(24,12)` |
| Flame core | 64×64 | 6 | 384×64 | center `(32,32)` |
| Shoulder grenade | 24×24 | 4 | 96×24 | center `(12,12)` |
| Guided missile | 48×32 | 4 | 192×32 | center `(24,16)` |
| Allied tank shell | 32×24 | 4 | 128×24 | center `(16,12)` |

Suggested filenames:

```text
projectile_pistol.png
projectile_mg.png
projectile_spread.png
projectile_tank_laser.png
projectile_rocket.png
projectile_flame.png
projectile_grenade.png
projectile_guided_missile.png
projectile_tank_shell.png
```

Projectile rules:

- Every source projectile points right.
- Pivot remains at the center so the engine can rotate it to velocity.
- Do not include a long smoke trail in the frame.
- A small engine flame attached to a rocket is allowed; variable smoke remains procedural.
- Do not include impact effects.
- Collision remains data-driven and may be smaller than the visible glow.
- Use additive procedural glow around the PNG rather than semi-transparent blur baked into the source.

# 3. Enemy projectiles

Current enemy projectile families have different generated colors and shapes. External replacements should preserve these identities.

| Family | Frame canvas | Frames | Visual identity |
|---|---:|---:|---|
| Rifle bullet | 32×16 | 4 | red-orange dart |
| Turret energy bolt | 40×20 | 4 | magenta/violet rail bolt |
| Helicopter shot | 32×20 | 4 | green/teal projectile |
| Gunship orb | 40×40 | 6 | cyan rotating energy core |
| Fortress bolt | 48×24 | 4 | heavy violet/pink shot |
| Bazooka rocket | 48×24 | 4 | dark body, red exhaust |
| Enemy grenade | 24×24 | 4 | warm dark-red spin |
| Falling bomb | 24×32 | 4 | heavy dark casing |
| Mortar shell | 32×24 | 4 | dark armored shell |

Suggested filenames:

```text
projectile_enemy_rifle.png
projectile_enemy_turret.png
projectile_enemy_heli.png
projectile_enemy_gunship.png
projectile_enemy_fortress.png
projectile_enemy_rocket.png
projectile_enemy_grenade.png
projectile_enemy_bomb.png
projectile_enemy_mortar.png
```

Keep faction color differences strong enough to identify threats instantly against sky, mountain and dune backgrounds.

# 4. Muzzle flashes

Muzzle flashes are currently procedural multi-lobed cones with weapon-specific gradients. If external overlays are produced, keep procedural bloom/rays and use PNGs only for the hard pixel-art core.

| FX | Frame canvas | Frames | Sheet size |
|---|---:|---:|---:|
| Pistol flash | 48×48 | 6 | 288×48 |
| MG flash | 64×48 | 6 | 384×48 |
| Spread flash | 96×80 | 6 | 576×80 |
| Tank laser flash | 80×64 | 6 | 480×64 |
| Rocket backblast | 96×80 | 6 | 576×80 |
| Cannon flash | 128×96 | 8 | 1024×96 |
| Enemy rifle flash | 48×48 | 6 | 288×48 |
| Enemy energy flash | 80×64 | 6 | 480×64 |
| Boss cannon flash | 160×112 | 8 | 1280×112 |

Naming:

```text
fx_muzzle_pistol.png
fx_muzzle_mg.png
fx_muzzle_spread.png
fx_muzzle_tank_laser.png
fx_muzzle_rocket.png
fx_muzzle_cannon.png
fx_muzzle_enemy_rifle.png
fx_muzzle_enemy_energy.png
fx_muzzle_boss_cannon.png
```

Rules:

- Source direction points right.
- Pivot is the left-center of each frame.
- Do not include smoke beyond the frame.
- Hard white/yellow/cyan pixel core is external; large soft glow remains procedural.
- Keep first and last frames nearly transparent for smooth one-shot playback.

# 5. Impact and melee FX

## Impact sprites

| Effect | Frame canvas | Frames | Use |
|---|---:|---:|---|
| Physical bullet impact | 64×64 | 6 | pistol/MG |
| Energy impact | 80×80 | 6 | spread, tank laser, enemy energy |
| Heavy armor impact | 96×96 | 8 | tanks/boss |
| Knife/melee contact | 96×96 | 6 | close attack |

Files:

```text
fx_impact_physical.png
fx_impact_energy.png
fx_impact_armor.png
fx_impact_melee.png
```

The engine should retain procedural hit rings, long action rays, hit-stop, white silhouette flash and screen shake around these external cores.

## Melee sweep

```text
File: fx_melee_sweep.png
Frame canvas: 128 × 96
Frames: 6
Sheet: 768 × 96
Pivot: (28,48)
Direction: sweeps toward the right
```

Do not include the player body in the melee sweep.

# 6. Explosions

Explosions currently combine radial flashes, rings, sparks, debris and smoke. A professional hybrid system should use external pixel-art fire cores with generated variation around them.

| Explosion | Frame canvas | Frames | Grid/sheet |
|---|---:|---:|---:|
| Small hit explosion | 96×96 | 8 | 768×96 |
| Standard explosion | 160×160 | 10 | 1600×160 |
| Large vehicle explosion | 256×256 | 12 | 1536×512, 6×2 |
| Boss explosion core | 320×320 | 16 | 1280×1280, 4×4 |

Files:

```text
fx_explosion_small.png
fx_explosion_standard.png
fx_explosion_vehicle.png
fx_explosion_boss.png
```

Do not bake full-screen white flashes, camera shake, smoke clouds or long shockwave rays into these sheets.

# 7. Smoke, dust, sparks and debris

These particles are currently procedural and benefit from runtime variation. External sprites should be small reusable shape libraries rather than complete fixed effects.

## Smoke

```text
fx_smoke_small.png   32×32 cells, 6 frames, 192×32
fx_smoke_large.png   64×64 cells, 8 frames, 512×64
```

## Dust

```text
fx_dust_step.png     32×24 cells, 6 frames, 192×24
fx_dust_land.png     64×32 cells, 8 frames, 512×32
fx_dust_vehicle.png  96×48 cells, 8 frames, 768×48
```

## Sparks and glints

```text
fx_spark01.png       16×16
fx_spark02.png       16×16
fx_energy_glint.png  24×24, 4 frames, 96×24
fx_casing.png        12×8, 4 rotational frames, 48×8
```

## Debris libraries

```text
debris_wood01.png    16×16
debris_metal01.png   16×16
debris_armor01.png   24×24
debris_sandbag01.png 16×16
debris_rock01.png    24×24
```

Runtime code should continue controlling velocity, gravity, rotation, tint, lifespan and count.

# 8. Targeting and warning graphics

## Guided-missile lock

```text
File: fx_target_lock.png
Frame canvas: 48 × 48
Frames: 6
Sheet: 288 × 48
Pivot: center
```

Keep lock color neutral/white if runtime tinting is desired.

## Mortar warning

```text
File: fx_mortar_warning.png
Frame canvas: 64 × 64
Frames: 8
Sheet: 512 × 64
Pivot: ground-center (32,60)
```

Do not include warning text; use shape, pulse and exclamation icon only.

## Interaction prompt marker

```text
File: icon_interact_vehicle.png
Canvas: 32 × 32
```

Localized `TANK READY!` or equivalent text remains internal.

# 9. Character death/heaven FX

The character body/spirit frames are already external in each character’s 800×100 death sheet. These surrounding graphics remain generated today:

- initial suit explosion;
- armor fragments;
- ascension rings;
- vertical light beam;
- halo;
- four-point spirit particles;
- final screen fade.

Optional external overlays:

```text
fx_heaven_halo.png       64×32, 4 frames, 256×32
fx_heaven_spirit.png     24×24, 6 frames, 144×24
fx_death_suit_burst.png  96×96, 8 frames, 768×96
```

The vertical beam should remain procedural so it scales to the current screen and spirit position.

# 10. HUD and menu external graphics

## Elements that may become PNG assets

```text
logo_deserts_heroes.png       recommended 600×180
icon_character_juan.png       32×32
icon_character_elena.png      32×32
icon_character_sergio.png     32×32
icon_weapon_*.png             32×32
icon_grenade.png              32×32
icon_guided_missile.png       32×32
icon_armor.png                32×32
icon_life.png                 32×32
icon_pause.png                32×32
cursor_select.png             32×32, 4 frames optional
```

The three 400×400 character portraits are already external.

## Elements that must remain generated/dynamic

Do not create fixed-language PNGs for:

- score and high-score numbers;
- ammo counts;
- character names, roles and bios;
- mission/wave text;
- Settings labels;
- control-binding names;
- localized prompts;
- boss names;
- combo count;
- character-stat bars;
- responsive panel sizes.

These elements change by language, resolution, settings and gameplay state. Panel backgrounds may use optional 9-slice art later, but text and values must remain Canvas-rendered.

## Optional 9-slice UI kit

If external panel art is desired:

```text
ui_panel_small_9slice.png   48×48, 12 px corners
ui_panel_large_9slice.png   72×72, 18 px corners
ui_button_9slice.png        48×48, 12 px corners
ui_selected_glow.png        64×64, tintable
```

Supply a diagram documenting the fixed corner size and stretchable center.

# 11. Internal fallback graphics inventory

The project’s generated fallback graphics are now fully categorized:

| Internal graphic | External specification location |
|---|---|
| Generated player fallback | character asset documentation |
| Generated infantry | `external-assets-enemies.md` |
| Generated tanks/helicopters/boss | `external-assets-vehicles.md` |
| Rocket surfboard | this document, section 1 |
| Sky/mountains/dunes | `external-assets-decorations-and-items.md` |
| Procedural palms/cacti fallback | decoration document |
| Crates/barrels/sandbags | decoration document |
| POWs and pickups | decoration document |
| Bullets/rockets/grenades/bombs | this document |
| Muzzle flashes and impacts | this document |
| Explosions/smoke/sparks/debris | this document |
| Warning and target markers | this document |
| Character death/heaven overlays | this document |
| HUD icons and panels | this document |
| Localized text and dynamic values | must remain generated |

# 12. Folder structure

```text
assets/
  intro/
    intro_rocket_board.png
  projectiles/
    player/
    enemy/
    vehicle/
  fx/
    muzzle/
    impact/
    explosion/
    smoke/
    dust/
    particles/
    targeting/
    heaven/
  ui/
    logo/
    icons/
    panels/
```

# 13. Delivery and QA

Every FX/projectile delivery must include:

- exact frame cell size;
- frame count and layout;
- pivot;
- source direction;
- intended FPS;
- event/use description;
- whether runtime tinting is allowed;
- whether additive blending is expected;
- any intentional semi-transparent pixels.

QA checklist:

- [ ] Exact canvas and sheet dimensions.
- [ ] Correct pivot through every frame.
- [ ] No white matte around alpha.
- [ ] Projectile points right.
- [ ] Effect does not contain player/enemy body art.
- [ ] No duplicate screen flash, smoke trail or localized text.
- [ ] Animation reads at native 960×540 gameplay scale.
- [ ] Bright FX remain readable without hiding enemy attacks.
- [ ] Large sheets remain below 4096 px per dimension where practical.
- [ ] Files use lowercase snake case.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, more realistic oily black critical smog for both ally tanks, left-end reactor flame/smog and additional crash-smoke damage on BigShip03 with incorrect right-side glow lights removed, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a brighter final boss jackpot.
