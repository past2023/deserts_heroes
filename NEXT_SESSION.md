# Desert's Heroes — Project Handoff for Next Session

## Session Context
You are continuing work on `past2023/deserts_heroes`. Current Arena work is on branch `arena/019f9a46-deserts-heroes` with PR #9. Start by reading `CURRENT_STATE.md`, this file, and the open PR context.

## Overview
Desert's Heroes is a 2D side-scrolling pixel-art run-and-gun game (960×540 canvas, JavaScript, no frameworks). It has: intro cinematic, galactic mission map, tutorial level (8 modules), arcade level1, **Level 2 train level**, survival mode, portal level.

**Key files:**
- `js/game.js` — Main engine, states, HUD, character select
- `js/tutorial-level.js` — Tutorial world platforms + lights
- `js/entities.js` — Player, enemies, boss, bullets, particles (monolith, 3600+ LOC)
- `js/train-level.js` — Level 2: Iron Storm (high-speed desert railway)
- `js/intro-cinematic.js` — Cinematic intro
- `js/galactic-map.js` — Mission selection map
- `js/music-tracks.js` — Authored MP3 soundtrack bridge
- `js/audio.js` — Procedural WebAudio fallback
- `js/pixel-font.js` — Canvas-based alien pixel font for loading screens
- `js/level.js` — Level 1 terrain, parallax, lava, platforms
- `js/portal-level.js` — Portal level definition (window.PortalLevel)
- `js/entity-score.js` — Score popup system
- `js/desert-weather.js` — Ambient sand/gust system
- `js/i18n.js` — Localization
- `js/settings.js` — Settings submenu
- `js/characters.js` — Character stat definitions
- `js/sprites.js` — Sprite rendering utilities
- `js/input.js` — Keyboard input handling

**HTML pages:** `index.html`(shell) → `intro.html` → `level1.html`(menu+game) → `tutorial.html` / `galactic-map.html` / `portal-level.html` / `level2.html`

**Level definitions architecture:** Both `portal-level.js` and `train-level.js` export level definition objects (`window.PortalLevel`, `window.TrainLevel`) that plug into the shared `game.js` + `entities.js` engine via `window.Level`.

---

## ✅ Level 2: Iron Storm — Current State

`js/train-level.js` implements the Level 2 high-speed desert railway. The player runs on train rooftops as the train tears through the desert. The entire level is one continuous train.

### Train System
- 13 train PNGs in `assets/trains/`: 3 motors (motor01, motor02, motor03) + 11 wagons (vagon01–vagon11)
- Deterministic seeded RNG (seed 2026) builds the train: motor02 at start → ~10-12 random wagons → motor01 at end
- **All segments scaled 0.95x** (`TRAIN_SCALE = 0.95`) from user-corrected native PNG sizes
- **GROUND = 375**, roof alignment at 30% from top of each segment (`ROOF_RATIO = 0.30`)
- **Train offset:** starts at x = -400 (`TRAIN_X_OFFSET = -400`) so the player (spawning at x=120) lands on motor02 roof
- Each segment's drawY = GROUND - roofOff, so the roof surface aligns with GROUND

### Electrification Masts
- 6 mast PNGs (`railway_electrification_mast01-06.png`) at 0.80x scale
- Time-based scrolling (`MAST_SPEED = 600`), always moving regardless of player movement
- 350px spacing, 200 pre-computed entries with varied Y offset
- Drawn at GROUND - mastHeight + 90 + offset

### Visual FX
- **Black smoke:** 3 sources per motor wagon, 1 source per ~50% of random wagons; 8 puff particles per source; dark grays (#0a0a0c, #151518, #1e1c1a); wobble + drift
- **Electric sparks:** 12 periodic flash points, blue-white (#a0d8ff, #60b8ff), `lighter` composite mode
- **Speed lines:** 50 horizontal streaks at various speeds (900–2700), `lighter` composite
- **Dust:** 35 ambient sand particles near GROUND level
- **Background parallax** shifted 70px lower (`PARALLAX_Y_ADJ = 70`): clouds 0.03, mountains 0.18, dunes 0.45 at 0.58x scale

### Gameplay
- 12,800px level width
- 24 enemy spawns: soldiers, grenadiers, knife chargers, bazookas, turrets, helicopters
- 3 weapon pickups embedded in spawn list (mg at x=5800, grenades at x=9500, spread at x=11500)
- 10 high pickups above roof level (grenades, mg, hearts, homing, rocket, flame)
- Exit portal at x=12,400 with beacon FX
- No lava, no boss, no platforms, no surfboard, no night cycle

### Key Constants
```
VW = 960, VH = 540
W = 12800
GROUND = 375
ROOF_RATIO = 0.30
PARALLAX_Y_ADJ = 70
TRAIN_X_OFFSET = -400
TRAIN_SCALE = 0.95
MAST_SPACING = 350
MAST_SPEED = 600
MAST_SCALE = 0.80
PORTAL_EXIT_X = 12400
```

---

## ✅ Survival Mode — Current State

Survival mode is arena-based with escalating waves. Key systems in `game.js`:

- **Kill streak system** (`comboKill()` in entities.js): Multipliers up to x5.75 based on kills within 2.2s window
- **Score milestones** (5K/10K/25K/50K/100K): Screen flash + particle burst
- **Wave clear FX:** Expanding yellow ring
- **Arena edge glow:** Red edge glow, intensity scales with wave
- **Bigger score display:** Centered, pulse glow
- **Wave banner:** Center-screen with orange glow
- **Chat system:** Enemy/ally dialogue with portraits (soldier01-05 full.png, face_expresion01.png)
- **Timed platforms:** floating_platform.png, 10-18s lifetime
- **Day/night cycle:** Sinusoidal darkening
- **Desert weather enhanced:** 2x sand rate, faster gust timers, longer particle trails

---

## ✅ Tutorial Platforms / FX Status

Tutorial invisible platforms have been re-extracted from the new white-on-black reference images in `assets/tutorial/tutorial_midXX_refe.png`. Each white rectangle now maps directly to one `addP(modIdx, x, y, w)` platform using the rectangle top edge as walkable Y.

| Module | Art | Reference | Platforms |
|---|---|---|---:|
| 0 | `tutorial_mid01b.png` | `tutorial_mid01_refe.png` | 10 |
| 1 | `tutorial_mid02b.png` | `tutorial_mid02_refe.png` | 5 |
| 2 | `tutorial_mid03b.png` | `tutorial_mid03_refe.png` | 11 |
| 3 | `tutorial_mid04b.png` | `tutorial_mid04_refe.png` | 10 |
| 4 | `tutorial_mid06b.png` | `tutorial_mid06_refe.png` | 8 |
| 5 | `tutorial_mid07b.png` | `tutorial_mid07_refe.png` | 7 |
| 6 | `tutorial_mid08b.png` | `tutorial_mid08_refe.png` | 8 |
| 7 | `tutorial_mid05b.png` | `tutorial_mid05_refe.png` | 3 |

Extreme foreground: `tutorial_foreground01.png` is no longer drawn. `pilar01.png` hides seams. `pilar02.png` is a center-level foreground accent with smoke/electric crawls.

---

## ✅ Tutorial Light/Fire/Particle FX

- Lamps/screens placed on visible art positions
- Floating fire FX removed; only art-backed flames remain
- All computer screens use fast malfunctioning CRT/TV flicker
- Ambient data-spark rain in modules 0, 2, 4, 6; small sparks everywhere
- Two Soldier06 observers spawn at different heights, fire tank-piercing red lasers, can be destroyed
- Tutorial pickups concentrated on upper invisible platforms

---

## 🎨 Player Select Screen

`js/game.js` `drawCharacterSelect()` is a carousel:
- Center selected pilot panel with previous/next side panels
- Animated star/meteor background
- Bottom dossier box for Name, Class, Description, and stats
- Stat bars animate/pulse without the white moving scan box
- Controls: ← → to switch, Enter to confirm, Esc to return

---

## 🎵 Audio
Authored MP3 tracks in `assets/audio/`:
- `Star_Map_Overture.mp3` — Menu/intro
- `Sandbyte_Ambush.mp3` — Level 1 gameplay
- `Star_Map01.mp3` — Space levels
- `Star_Map_Reverie.mp3` — Tutorial
- `Star_Map_Symphony.mp3` — Galactic map

Register new tracks in `js/music-tracks.js` `files` object, then call `MusicTracks.play('trackname')`.

---

## Other To-Dos
- Level 3-6 mission implementations
- Survival mode balancing
- Achievement/leaderboard system
- Full soundtrack composition

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
