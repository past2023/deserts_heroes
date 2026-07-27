# Next-phase handoff

Updated: 2026-07-27

Start future chats by reading, in order:

1. `README.md`
2. `docs/current-runtime-status.md`
3. `docs/world-story-bible.md`
4. `docs/entity-modularization.md`
5. this handoff

## Current priorities

1. Iterate on Level 2 train level gameplay: enemy pacing, pickup placement, difficulty curve.
2. Do a full in-browser visual QA pass for Level 1 opening ships, BigShip03/BigShip04 platform readability, vertical camera follow on ship rooftops, non-parallax lava, critical tank smog, and tutorial malfunction FX.
3. Convert remaining fallback enemies and props to authored modular PNGs.
4. Add data-driven dialogue triggers and character-specific hero lines.
5. Separate the 26,000-pixel mission encounter table into authored sectors.
6. Add automated collision and campaign-flow tests.
7. Profile long-session particle and image memory in Safari.
8. Define Mission 03 gameplay, local civilization, boss ideology and visual palette using the story bible.

## Narrative implementation state

- A coherent Scientific Frontier Corps versus Atavist Dominion story bible exists.
- A fixed procedural story-text cinematic slide follows the credit slide.
- Localized portrait dialogue is active at Level 1 milestones and enemy taunts can appear when the player or ally tank is hit.
- Player, enemy transmissions and boss arrival lines are queued and non-blocking.
- All future dialogue must preserve the rule that the Corps protects local agency rather than imposing culture.

## Latest implementation notes

- **Level 2 (`js/train-level.js`):** Train level definition plugged into the shared game.js engine via `window.TrainLevel`. Train built from 13 PNGs (3 motors, 11 wagons) at 0.95x scale, GROUND=375, offset -400px. Player spawns at x=120 on motor02 roof. 6 mast types scroll at MAST_SPEED=600 (time-based). Black smoke + electric sparks + speed lines + dust FX. 24 enemy spawns across 12,800px. Exit portal at x=12400 with beacon FX.
- **Level 2 entry:** `level2.html` sets `window.Level = window.TrainLevel; window.IS_PORTAL = true;` to reuse the game.js engine.
- **Vertical camera follow** (`G.camY` in `js/game.js`): When the player jumps above the upper 38% of the viewport, the camera smoothly follows upward (lerp at dt*5) to reveal ship rooftops and hidden platforms. Clamped to [-260, 0]. Applied via `g.translate(0, -camY)` in `drawWorld()` inner save block — background stays fixed, ground+entities shift. Resets to 0 in survival mode and on mode transitions.
- **Character select** is a carousel in `js/game.js`; keep text inside the bottom dossier at 960×540.
- Tutorial platforms come from white reference rectangles in `assets/tutorial/*_refe.png`.
- Tutorial foreground uses `pilar01.png` seams and `pilar02.png` center accents with smoke/electric crawls; `tutorial_foreground01.png` is not drawn.
- Tutorial screens use fast malfunctioning CRT-style FX and two normal Soldier06 observers spawn at different heights, use stronger tank-piercing red lasers, and can be destroyed by the player. Tutorial pickups now reward upper-platform exploration.
- Ally Tank 02 laser origin is tuned in `js/entities.js` to the visible drill tip; both ally tanks use wheel/chain dust and both emit black smog in critical mode. Tank02 has top-left exhaust smoke.
- Level 1 includes the rising `enemy_ship01` vista fixed in world space with no horizontal self/parallax drift and a farther daylight 2x `bigship03.png` ship/platform section in the palm/cactus layer; platforms come from `bigship03_refe.png` and include enemies/pickups only on ship decks. BigShip03 now uses left-end reactor flame/smog, heavier crash-smoke seams, and no incorrect right-side glow lamps. A second floating ship (`bigship04.png`, 1408×737 at 0.96× scale matching BigShip03) appears after BigShip03 at x=8500, bottom on GROUND, with 3 reference-extracted deck platform levels (top y≈-49, mid y≈126, bottom y≈290), enemies/pickups on decks, and two left-side reactor nozzles with flame/smog FX plus 6 hull smoke sources. Lava gaps use the new non-parallax fire/smoke/bubble animation, platform routes hold more rewards than the ground, and destroyed helicopters/tanks/gunships/boss trigger pixel-art coin-jackpot award animation with casino-style SFX, including smaller boss drops during the fight and a brighter final jackpot.
- Loading pages use a simple retro pixel loading bar without visible glyph text instead of English status labels.

## Technical cautions

- Launch through `index.html` to preserve Safari audio activation.
- Keep `file://` fallbacks where practical, but test primary behavior through HTTP.
- Preserve fixed-step simulation and nearest-neighbor rendering.
- Do not reintroduce large per-frame array allocations.
- Keep authored PNG fallbacks until modular replacements are validated.
- Update `docs/current-runtime-status.md` and this handoff after every major phase.

---

## Current implementation sync — 2026-07-27

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes:
- **Level 2 train level** (`js/train-level.js`, `level2.html`): 0.95x scaled train segments (motor02→random wagons→motor01), GROUND=375, TRAIN_X_OFFSET=-400, 6 mast types at time-based MAST_SPEED=600, black smoke + electric sparks FX, speed lines, dust particles, parallax +70px lower, 24 enemy spawns, exit portal beacon FX.
- Survival kill streak multipliers (up to x5.75), score milestones (5K/10K/25K/50K/100K), wave clear FX, arena edge glow, bigger score display, wave banner, chat system with enemy/ally portraits, timed platforms (floating_platform.png), day/night cycle.
- Press Start 2P font system across all HTML/JS (28 canvas sites, 10 files, Courier New fallback).
- Portal beacon FX (radial gradient + rotating arc) replacing ellipse rings in Level 1 and portal level.
- Settings submenu binding help text repositioned for Press Start 2P readability.
- Intro tank slide: 42 ground particles, drawSandWind() wind streaks, heat wave distortion FX.
- Center-screen info text boxes removed (wave banner, jetpack notice, boss warning/taunt).
- Tutorial FX positions corrected per PNG pixel scanning: all fires y+8, Module 3 electric-only, Module 5 lamps repositioned.
- Space fighter enemy type (enemies_ship01/02.png) in portal level (16 enemies total).
- Blue diamond pixel-art coins replacing gold coins.
- Pixel alien loading font (pixel-font.js) with canvas-based 5x5 bitmap glyphs.
