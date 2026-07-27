# Current runtime status

Updated: 2026-07-27

This document is the current source of truth when older production handoff notes describe an earlier prototype state.

## Campaign flow

`index.html` is the required persistent Safari/Chrome audio shell. It hosts `intro.html`, the main menu and character selection in `level1.html`, `galactic-map.html`, the 8-module tutorial, Level 1, Level 2 (Iron Storm train level), the portal time-rift bonus level, and survival mode.

Campaign map choices currently available:

- Tutorial — `tutorial.html`, full 8-module training annex with reward transfer into Level 1
- Mission 01 — the 26,000-pixel desert mission (`level1.html`)
- Mission 02 — Iron Storm, high-speed desert railway (`level2.html`)
- Missions 03–06 — visible locked future nodes

## Presentation

- Five-slide randomized cinematic with a fixed generated credit slide
- Authored soundtrack router with procedural fallback
- Optional 1990s TV filter
- Four rapid day/night changes with a detailed nearest-neighbor cratered pixel moon
- Modular sky, cloud, mountain, dune and terrain rendering
- Animated lava gaps with a non-parallax molten surface, flame plumes, bubbles, embers, smoke, heat glow, clean unboxed cutaway edges and allied-tank damage
- Native sand platforms between mountains and dunes, plus a delayed daylight 2x `bigship03.png` ship-platform section in the palm/cactus gameplay layer with invisible platforms extracted from `bigship03_refe.png`, enemies/pickups on upper decks, left-end reactor flame/smog, extra crash-smoke vents, and removed incorrect right-side glows
- Static nearest-plane antenna bunkers
- Pixel-quantized iris and portal transitions
- Loading overlays use a simple retro pixel loading bar without visible glyph text instead of English-only status labels
- All game text uses Press Start 2P font (`assets/fonts/PressStart2P-Regular.ttf`) with Courier New fallback; canvas sizes scaled 0.65x; `@font-face` + `document.fonts.load()` preload in all HTML files
- Level 1 and portal-level exit portals use beacon light FX (radial gradient glow + rotating arc stroke + white core) replacing old ellipse ring FX
- Center-screen gameplay info text (wave banner, jetpack notice, boss warning/taunt) renders without background box panels
- Vertical camera follow (`G.camY`) triggers when player jumps above upper 38% of viewport, smoothly follows upward to reveal ship rooftops, clamped to [-260, 0], background stays fixed. Disabled in tutorial level via `disableCamY:true`.
- Player respawns at ground level (`p.y = Level.GROUND, p.onGround = true`) instead of above screen.
- Dune02 parallax layer lowered (+55 offset from GROUND) in Level 1 and Level 2. Night tint fill extended to GROUND + 60.
- Level 1 opening vista draws `enemy_ship01` rising vertically from the dune layer as a fixed-world object with no horizontal self/parallax drift, with tight motor vibration, three lower reactor glows, smoke puffs and heavy falling sand; the BigShip03 platform section appears farther from the opening skirmish in daylight, followed by a floating `bigship04.png` (1408×737 at 0.96× scale matching BigShip03) at x=8500, bottom on GROUND, with 3 reference-extracted deck levels (top y≈-49, mid y≈126, bottom y≈290), enemies/pickups on decks, and two left-side reactor nozzles with flame/smog FX plus 6 hull smoke sources

## Level 2 — Iron Storm

High-speed desert railway level implemented in `js/train-level.js`, loaded via `level2.html`.

- **Train:** Continuous train across 12,800px; motor02 at start, ~10-12 randomly-selected wagons (deterministic seed 2026), motor01 at end
- **Scale:** All segments at 0.95x from user-corrected native PNG sizes (`TRAIN_SCALE = 0.95`)
- **GROUND = 375**, roof at 30% from top of each segment; train starts at x=-400 (`TRAIN_X_OFFSET = -400`) so player spawns on motor02
- **13 train PNGs** in `assets/trains/`: motor01, motor02, motor03, vagon01–vagon11
- **6 electrification mast PNGs** (`railway_electrification_mast01-06.png`), 0.80x scale, time-based scrolling at `MAST_SPEED = 600` (always moving), 350px spacing, positioned 90px below ground
- **Visual FX:** Black smoke from motors + random wagons (8 dark puffs per source), electric sparks (12 blue-white flash points with `lighter` composite), 50 speed lines, 35 dust particles, parallax background shifted 70px lower
- **Enemies:** 24 spawns (soldiers, grenadiers, knife chargers, bazookas, turrets, helicopters) starting at x=1200; 3 weapon pickups (mg, grenades, spread) in spawn list; 10 high pickups above roof level
- **Exit portal** at x=12,400 with beacon FX (radial gradient + rotating arc + white core + portal art)

## Gameplay

- Three selectable heroes with an adjusted animated carousel selection screen, smaller pilot panels, higher bottom dossier, wrapped descriptions, and pulsing pixel stat bars
- Double jump and ten-second jet pack
- Arcade and Survival modes
- 26,000-pixel Level 1 with calm exploration spaces and enemy territories
- 12,800-pixel Level 2 high-speed railway with continuous train rooftop combat
- Floating, moving and timed-destructible platforms
- Lava gaps, lethal energy walls and proximity mines
- POW rescue rewards and five-hit hidden-item props
- Allied driveable tank and persistent vehicle wrecks
- Time-rift orbital platform bonus level with transferable rewards

### Survival mode
- Arena-based wave mode with escalating enemies
- Kill streak system: multipliers up to x5.75 based on kills within 2.2s (`comboKill()` in entities.js)
- Score milestones at 5K/10K/25K/50K/100K with screen flash + particle burst
- Wave clear FX (expanding yellow ring), arena edge glow (scales with wave), bigger centered score display
- Chat system with enemy/ally dialogue portraits (soldier01-05 full.png, face_expresion01.png)
- Timed platforms using floating_platform.png (10-18s lifetime)
- Day/night cycle (sinusoidal darkening)
- Desert weather enhanced for survival: 2x sand rate, faster gust timers, longer particle trails

## Active enemy art

- Burning modular Robot Soldier 01
- Modular Soldier 02
- Modular wheel/saw Soldier 03
- Bunker-mounted Soldier 04
- Modular armored Soldier 05
- Modular enemy tank
- Small and twin-rotor helicopter PNGs
- Modular final fortress tank
- Three supplied orbital enemy PNGs

## Galactic map

The map uses supplied tutorial/planet PNGs, asteroid clusters and satellite art. The route/node constellation gently zooms in/out, foreground asteroids pass at 2x scale, and planet aspect ratios are preserved while they rotate. The starfield moves, galaxy arms use pixel blocks, route dots animate, meteors cross occasionally, energy particles drift, and a small supplied spacecraft follows selection. Tutorial and Mission 01 are selectable.

## Pickups

Authored PNG pickups replace generated crates for heavy machine gun, spread, rocket/missile variants, flame shot, grenades, guided missiles, jet pack and extra life. Icons float and receive alpha-silhouette glow. Tutorial and Level 1 rewards are now biased toward upper/platform routes, with reduced ground prop item density.

## Coins and lives

Collectible coins use an animated sprite sheet (`assets/pickups/coins_ani01.png`, 84×12px, 6 frames) with a spin animation. `G.coins` counts collected coins; every 50 (`G.COINS_PER_LIFE`) grants an extra life (max 5). Coin-to-life triggers a red screen flash, "EXTRA LIFE!" popup, congrats scorePop, and `SFX.coinLife()` ascending arpeggio. All heart pickups have been removed from Level 1, portal-level, train-level, and tutorial. The HUD displays a yellow coin progress bar with mini pixel heart and coin icons (no numbers).

## Chat and dialogue SFX

Three procedural SFX added to `js/audio.js`: `SFX.chatBeep()` (4 quick alternating robot beeps, ~0.8s), `SFX.enemyChatBeep()` (3 gritty sawtooth+noise cycles, ~0.66s), and `SFX.coinLife()` (ascending arpeggio). The story dialogue system (`js/dialogue.js`) plays a one-shot beep when each dialogue line starts — `chatBeep` for player, `enemyChatBeep` for enemies/boss. Survival chat messages play the corresponding beep once per new message. Volume is tuned for combat mix (0.12/0.11 effective after gain chain).

## Safari compatibility

All `shadowBlur` values across scorePop text, survival score pulse, wave banner, portal glow, and intro logo glow have been reduced ~60% for Safari, which renders shadowBlur denser and larger than Chrome. Affected files: `entity-score.js`, `game.js`, `level.js`, `portal-level.js`, `train-level.js`, `intro-cinematic.js`.

## Tutorial runtime

`tutorial.html` contains the 8-module Frontier Training Annex. Invisible platforms are generated from white-on-black reference rectangles, `pilar01.png` hides module seams, and `pilar02.png` is used as a center-level extreme-foreground accent. The old `tutorial_foreground01.png` layer is no longer drawn. Tutorial light FX were rechecked against the mid PNG art: lamps/screens are placed on visible art, fire FX only appear on illustrated flames, all computer screens use fast malfunctioning CRT/TV flicker, pilar02 emits smoke/electric crawls, two normal Soldier06 observers spawn at different heights, fire stronger tank-piercing red lasers, taunt on player hits and can be destroyed by the player, small sparks appear throughout the annex, and heavier data-spark rain is limited to selected modules for pacing. The tutorial level disables vertical camera follow (`disableCamY:true` in `TutorialLevel`) so items and enemies stay in position when the player jumps. Exiting the tutorial to the main menu and choosing survival now correctly redirects to `level1.html` instead of relaunching the tutorial.

Ally Tank 02 uses the drill variant art, fires its main cyan laser from the visible drill tip, emits top-left exhaust smoke, and uses chain/wheel dust like the main ally tank. Both ally tank types emit black smog when in critical 1-HP mode.

## Background depth props

Updated sand platforms render at 50% native size between mountains and dunes. They rise slowly and shed procedural falling-sand particles. Updated antenna bunkers remain static at 50% size in the nearest parallax plane.

## Story and dialogue

The current canon is defined in `docs/world-story-bible.md`: Scientific Frontier Corps explorer-soldiers defend the right of isolated planets to choose their own future against the knowledge-destroying Atavist Dominion. An 11.5-second centered procedural story-text slide follows the cinematic credit slide. Level 1 queues localized compact teleprompter transmissions from the selected hero, enemy forces and the fortress boss, including enemy taunts when the player or ally tank is hit. Destroyed helicopters, tanks and gunships spawn pixel-art coin-jackpot award animation with casino-style chimes; the boss also drops smaller coin bursts during the fight and a brighter final jackpot on destruction. Player transmissions use the supplied 12-expression face sheet with aspect-preserved portrait framing, scanlines, chromatic split, jitter, dropout effects, and larger bold white text.

Two supplied modular prisoner sets now replace generated POW visuals. Their `hand_down` layer renders first, with independent legs, torso, head where supplied, raised hand and escape animation.

## Architecture

The game preserves 960×540 Canvas 2D, fixed 60 Hz simulation, direct browser compatibility and procedural fallbacks. Entity scoring, collectibles, props, warnings, weather, foreground decoration, dialogue, music routing, retro filtering and map logic are separate modules. Both portal and train levels use a level-definition architecture: `window.PortalLevel` and `window.TrainLevel` export definition objects that plug into the shared `game.js` + `entities.js` engine. See `docs/entity-modularization.md` and `docs/next-phase-handoff.md` for continuation.

---

## Current implementation sync — 2026-07-27

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes:
- **Coin-to-life system** (`js/entities.js`, `js/game.js`, `js/entity-score.js`, `js/entity-collectibles.js`): Animated coin sprite sheet (coins_ani01.png, 6 frames), `G.coins` counter, `G.COINS_PER_LIFE=50`, coin HUD progress bar, all heart pickups removed, coinLife SFX.
- **Chat SFX** (`js/audio.js`, `js/dialogue.js`, `js/game.js`): `chatBeep` (4 repeating beeps), `enemyChatBeep` (3 gritty cycles), `coinLife` (ascending arpeggio). Beeps in story dialogue (one-shot on start), survival chat, and coin-to-life reward.
- **Safari glow fix** (`js/entity-score.js`, `js/game.js`, `js/level.js`, `js/portal-level.js`, `js/train-level.js`, `js/intro-cinematic.js`): All shadowBlur values reduced ~60% for cross-browser consistency.
- **Tutorial vertical camera disabled** (`js/tutorial-level.js`, `js/game.js`): `disableCamY:true` flag, camera resets to 0.
- **Respawn ground level** (`js/entities.js`): `p.y=Level.GROUND, p.onGround=true` instead of `p.y=-40`.
- **Tutorial→survival fix** (`js/game.js`): Redirects to `level1.html?autostart=1` when mode changes from tutorial.
- **Dune02 lowered + night tint** (`js/level.js`, `js/train-level.js`): +55 offset, +60 fill.
- **Level 2 train level** (`js/train-level.js`, `level2.html`): 0.95x scaled train segments, GROUND=375, 6 mast types, black smoke + electric sparks FX, speed lines, dust, parallax +70px lower, 24 enemy spawns, exit portal beacon FX.
- Survival kill streak multipliers (up to x5.75), score milestones (5K/10K/25K/50K/100K), wave clear FX, arena edge glow, bigger score display, wave banner, chat system with enemy/ally portraits, timed platforms (floating_platform.png), day/night cycle.
- Press Start 2P font system across all HTML/JS (28 canvas sites, 10 files, Courier New fallback).
- Portal beacon FX (radial gradient + rotating arc) replacing ellipse rings in Level 1 and portal level.
- Settings submenu binding help text repositioned for Press Start 2P readability.
- Intro tank slide: 42 ground particles, drawSandWind() wind streaks, heat wave distortion FX.
- Center-screen info text boxes removed (wave banner, jetpack notice, boss warning/taunt).
- Tutorial FX positions corrected per PNG pixel scanning: all fires y+8, Module 3 electric-only, Module 5 lamps repositioned.
- Space fighter enemy type (enemies_ship01/02.png) in portal level (16 enemies total).
- Pixel alien loading font (pixel-font.js) with canvas-based 5x5 bitmap glyphs.
