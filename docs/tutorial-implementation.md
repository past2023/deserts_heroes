# Tutorial — Frontier Training Annex — Implementation Complete
Date: 2026-07-25
Status: Playable / visually polished

## Assets integrated

- **Back:** `assets/tutorial/tutorial_back01.png` 2400x448, tiled at parallax 0.12 behind lab
- **Mid modular:** `tutorial_mid01b`, `02b`, `03b`, `04b`, `06b`, `07b`, `08b`, `05b`, each 1376x768 @ 1.0 scale, world-locked at x = moduleIndex*1376, y = MID_BASE_Y (-150)
- **Extreme foreground seams:** `pilar01.png` at module boundaries
- **Extreme foreground accents:** optional `pilar02.png` in center modules (assets path with upload fallback)
- **Removed front layer:** `tutorial_foreground01.png` is no longer drawn at runtime
- **Procedural layer 0:** blue neon pulse — dark gradient #071425→#102f52 + radial glow 380px pulsing sin(1.15 time) + faint cyan scanlines
- **Ally Tank 02:** `assets/vehicles/ally_tank02/` — full/chassis/wheels/gunturret/drill point, 400x274, drawAllyTank02 with bob, wheel spin via tread, turret recoil, drill spin 0.35 rad/frame, exhaust smoke particles, occupied glow
- **Observer Drone (soldier06):** `assets/enemies/soldier06/` — modular head/torso/legs/laser_camera + full, hover bob sin(1.8), patrol ±160px, laser burst with red flash additive, cyan eye glow, death explosion with cyan debris

## 4-Layer Parallax implementation (`js/tutorial-level.js`)

```
0: drawProceduralNeon() — base gradient + lighter radial + scanlines
1: drawTiled(back01, parallax 0.12, y=12)
2: for each mid: screenX = worldX - camX (parallax 1.0), draw scaled, then lights FX
3: drawGround + platforms + drawExtremeForeground(pilar01 seams + optional pilar02 center accents)
```

## Lights FX (internal engine, no external deps)

Light FX were rechecked against the actual module PNG pixels:

- **Lamps:** orange/yellow radial glows placed on visible bulbs and wall lights.
- **Screens:** cyan/green additive computer panels placed on visible monitor art.
- **Fire:** only art-backed flames receive fire FX; floating fire FX were removed. Current fire FX are in modules 0, 2, 4, and 6 where the artwork shows flame sources.
- **Robot/electric:** robot eye and electric spark FX remain in module 3 where the art supports them.
- **Particle rain:** cyan/blue falling data sparks run only on modules 0, 2, 4, and 6 instead of every tutorial section.

Fire uses two-triangle flame tongues plus radial glow and occasional ember particles. Screen/lamp FX use `lighter` composite and conservative intensity so the mid art is not washed out.

## Platform layout

Invisible platforms are now extracted from white-on-black reference rectangles in `assets/tutorial/tutorial_midXX_refe.png`. Each connected white rectangle becomes one `addP(modIdx, lx, ly, lw)` call and its top edge is the walkable Y.

Current counts: mid01=10, mid02=5, mid03=11, mid04=10, mid06=8, mid07=7, mid08=8, mid05=3.

## Gameplay loop (fun + educational)

- W = 8 * 1376 = 11008
- Spawns include soldiers, POW, observer drones, knife, grenadiers and bazooka troops across the full 8-module annex
- Props and pickups are distributed across early, middle and late tutorial modules
- High pickups teach optional routes: mg, grenades, homing, hearts, and jet pack
- Slug: ally_tank02 @2850

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
- Tank drill glows orange when occupied; Ally Tank 02 laser originates from the visible drill tip
- Observer laser camera red flash via lighter + shadowBlur before shot
- `pilar01.png` seam pillars and optional `pilar02.png` center accents give depth without the removed `tutorial_foreground01.png` layer

## Future improvements (not blocking)

- Auto-detect red walkable areas via image processing to generate platforms.json instead of hardcoded
- Replace generated/fallback `pilar02.png` with final authored art if a bespoke file is supplied
- Add tutorial-specific boss (drill tank malfunction)
- Save tutorial progress (per-objective) in localStorage

Implementation by Technical Director: kept 60Hz fixed step, file:// compatibility, procedural fallback, no deps, no build.
