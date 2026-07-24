# Tutorial — Frontier Training Annex — Implementation Complete
Date: 2026-07-23
Status: Playable

## Assets integrated

- **Back:** `assets/tutorial/tutorial_back01.png` 2400x448, tiled at parallax 0.12 behind lab
- **Mid modular:** `tutorial_mid01b-05b.png` each 1376x768 @ 0.78 scale, world-locked at x = moduleIndex*1376, y = GROUND - 599 + 92
- **Front:** `tutorial_foreground01.png` 724x768 extreme foreground, tiled with parallax 1.18 at bottom
- **Procedural layer 0:** blue neon pulse — dark gradient #071425→#102f52 + radial glow 380px pulsing sin(1.15 time) + faint cyan scanlines
- **Ally Tank 02:** `assets/vehicles/ally_tank02/` — full/chassis/wheels/gunturret/drill point, 400x274, drawAllyTank02 with bob, wheel spin via tread, turret recoil, drill spin 0.35 rad/frame, exhaust smoke particles, occupied glow
- **Observer Drone (soldier06):** `assets/enemies/soldier06/` — modular head/torso/legs/laser_camera + full, hover bob sin(1.8), patrol ±160px, laser burst with red flash additive, cyan eye glow, death explosion with cyan debris

## 4-Layer Parallax implementation (`js/tutorial-level.js`)

```
0: drawProceduralNeon() — base gradient + lighter radial + scanlines
1: drawTiled(back01, parallax 0.12, y=12)
2: for each mid: screenX = worldX - camX (parallax 1.0), draw scaled, then lights FX
3: drawGround + platforms + drawTiled(fore, parallax 1.18, y=VH-768+140)
```

## Lights FX (internal engine, no external deps)

- **Lamps:** 20 orange positions extracted from artwork (x,y, radius 20-34, pulse 1.1-2.0). Drawn with lighter radial gradient #ff9a2a + white core 3px, intensity = base + sin(pulse)*0.22
- **Screens:** cyan #4af1ff / green #4aff88 positions, additive rect + radial glow 22-44px, scanline jitter sin(time*12)
- **Fire:** 6 fire spots, flame tongue drawn via two triangles #ffe28a + #ff6a18, outer glow radial, ember particles pushed to G.particles (kind ember, vx -60..60, vy -130..-60)
- **Ground wash:** additive ellipses on ground beneath lamps 58x10 alpha 0.12

Red soft indicator: platforms draw red line alpha 0.18 + sin(time) *0.06 at y+12 to hint walkable

## Platform layout (soft red areas -> walkable)

15 platforms across 5 modules, amp 6-13, speed 0.5-0.8, 4 fragile (breakT 1.45s, red bar). Coordinates approximate catwalks in supplied PNGs.

```
mid01: 320/382 w170, 720/340 w380 upper right, 80/308 w170 fragile
mid02: 1440/360 w180, 1680/300 w260, 2080/335 w320, 1950/412 w145 fragile
mid03: 2830/335 w240, 3220/382 w190 fragile, 3630/350 w260, 3920/410 w135
mid04: 4280/395 w195, 4680/340 w240, 5080/388 w190 fragile, 5400/350 w180
mid05: 5620/400 w170, 5950/340 w220, 6320/380 w180 fragile
```

## Gameplay loop (fun + educational)

- W = 6880 + 800 exit = 7680
- Spawns: soldier@850, pow@1320, observer@1920, soldier@2280, grenadier@2620, observer@3150, knife@3600, soldier@4100, observer@4450, bazooka@4880, exam soldier+grenadier @5400/5660
- Props: barrel01@1050, barrel02@2650, crate@3680, barrel@4920, crate@5480 (teaches chain explosion)
- High pickups: mg@600, grenades@1850, homing@2420, heart@3350, jetpack@4550, heart@5900 + extra homing@2300 jet@3100
- Slug: ally_tank02 @3050

Tutorial has normal combat: all weapons work, tank crushes infantry, double jump, coyote, drop-through.

## Dialogues (localized EN/ES/FR/RU in i18n.js)

Milestones at x: 250 move, 700 jump, 950 shoot, 1450 grenade, 1950 observer, 2400 platform, 3000 tank, 4000 tankfire, 4700 combo, 5600 exit, board@ SURF_X.

Uses Dialogue.say('player', key, time) non-blocking queued portrait transmissions preserved.

## Exit surfboard

- SURFBOARD_X = W - 260 = 7420
- When player x > SURF_X-40, surfboard object spawned at SURF_X, y = GROUND-190, idle with prompt BOARD label
- When x > SURF_X-20 and onGround: t.exitTriggered=true, board vx+=580*dt, vy-=40*dt, player attached x=board.x, y=board.y-6, inv=999
- Exhaust particles (smoke/spark) each 0.035s like intro
- After 1.8s: localStorage dh_tutorial_done=1, sessionStorage dh_tutorial_reward={score+1000, weapon mg 80, grenades 6, homing 5, armor max, lives}, redirect to galactic-map.html?mode=arcade&character=...&tutorialComplete=1

Galactic map detects tutorialComplete and shows checkmark ✓ on T node, and keeps reward for Level 1 transfer.

Mission 01 startGame checks sessionStorage dh_tutorial_reward and applies to player if character matches, plus Dialogue say tutorial.complete.

## Integration details

- `js/entities.js`: added soldier06Art loader, allyTank02Art, observer type spawn, hitbox, kill explosion, update (hover, patrol, spark, laser shot with CombatFX), drawSoldier06 modular layers, corpse handling, slug type ally_tank02 with drawAllyTank02.
- `js/game.js`: added IS_TUTORIAL detection, effectiveMode tutorial, G.tutorial state, handleSpawns extended for ally_tank02, updateTutorial() + drawTutorialBoard(), exit surf logic, banner skip, reward merge.
- `js/tutorial-level.js`: new level module with same API as Level (resetPlatforms, updatePlatforms, drawBackground, drawGround, nightAmount, etc) for compatibility.
- `tutorial.html`: standalone 960x540 canvas, loads tutorial-level as Level, IS_TUTORIAL=true, auto-starts via game.js timeout if no autostart param.
- `js/galactic-map.js`: detects tutorialComplete, sets unlocked, shows checkmark, cleans URL after 4s.
- `js/i18n.js`: 12 new keys x4 languages.

## How to run

```
python3 -m http.server 8000
open http://localhost:8000/index.html  -> intro -> galactic map -> select T (tutorial)
or directly http://localhost:8000/tutorial.html?autostart=1&mode=tutorial&character=juan_p
```

File:// also works due to no ES modules.

## Visual Polish

- Neon pulse uses lighter composite to avoid washing mid art
- Fire uses two-triangle flame + outer radial + ember particle spawn
- Tank drill glows orange when occupied, spins 0.35 rad/frame
- Observer laser camera red flash via lighter + shadowBlur before shot
- Extreme foreground tiled gives depth feeling of looking out of trench

## Future improvements (not blocking)

- Auto-detect red walkable areas via image processing to generate platforms.json instead of hardcoded
- Add second foreground variant for variety
- Add tutorial-specific boss (drill tank malfunction)
- Save tutorial progress (per-objective) in localStorage

Implementation by Technical Director: kept 60Hz fixed step, file:// compatibility, procedural fallback, no deps, no build.
