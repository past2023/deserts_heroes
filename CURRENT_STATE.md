# Desert's Heroes — Current Game State
**Date:** 2026-07-27  
**Branch:** `arena/019f9a46-deserts-heroes`  
**PR:** #9

---

## 1. Project Overview

Desert's Heroes is a 2D side-scrolling pixel-art run-and-gun game with a sci-fi desert setting.  
It features: a cinematic intro, a galactic mission map, a tutorial level, a full arcade level (Level 1), a high-speed train level (Level 2), a survival mode, and a portal level.

**Rendering:** Canvas 2D, 960×540, pixel-art (`image-rendering: pixelated`).  
**Font:** Press Start 2P (`assets/fonts/PressStart2P-Regular.ttf`) with Courier New fallback, 0.65x scaled canvas sizes.  
**Audio:** Procedural WebAudio (SFX + music) + optional authored MP3 soundtrack.  
**Localization:** i18n system (en, es, fr, ru).

---

## 2. HTML Pages & Navigation Flow

| Page | File | Purpose |
|------|------|---------|
| Shell | `index.html` | Iframe shell, persistent audio, hosts intro.html |
| Intro | `intro.html` | Full cinematic (credit slide → story slide → 4 slides → level1) |
| Menu / Game | `level1.html` | Main menu, character select, level1 arcade, survival |
| Tutorial | `tutorial.html` | 8-module tutorial level with onboarding |
| Galactic Map | `galactic-map.html` | Mission selection between tutorial and level1+ |
| Portal | `portal-level.html` | Time-rift bonus level |
| Level 2 | `level2.html` | High-speed desert railway train level |

**Navigation flow:**
```
index.html → intro.html → level1.html (menu)
                              ├── character select → galactic-map.html
                              │     ├── tutorial.html
                              │     └── level1.html (autostart)
                              ├── survival mode (direct start)
                              ├── settings
                              └── help

level2.html (standalone, loaded from galactic-map or level1 portal)
portal-level.html (arcade bonus level)
```

---

## 3. Audio System

**`js/music-tracks.js`** — Authored MP3 soundtrack bridge:
- `overture` → `assets/audio/Star_Map_Overture.mp3` (menu/intro)
- `level1` → `assets/audio/Sandbyte_Ambush.mp3` (arcade level)
- `space` → `assets/audio/Star_Map01.mp3` (space levels)
- `reverie` → `assets/audio/Star_Map_Reverie.mp3` (**tutorial**)
- `symphony` → `assets/audio/Star_Map_Symphony.mp3` (**galactic map**)

**`js/audio.js`** — WebAudio fallback with procedural soundtrack:
- Two tracks: `gameplay` and `boss`
- Procedural drums, bass, lead, arpeggios
- SFX: pistol, mg, spread, rocket, flame, explosions, etc.
- Volume control with localStorage persistence

---

## 4. Intro Cinematic (`js/intro-cinematic.js`)

5-slide animated intro with parallax layers (7.4s each) + story text (11.5s) = ~48.5s total.

**Slide order (shuffled):**
1. **Credit slide** — Galaxy background, "PATRICIO SALFATE PRESENTS"
2. **Story slide** — Starfield background, typewriter text (3 lines, multi-language)
3.–6. **Illustrated slides** (random order):
   - Slide 1: Desert (sky/mountains/dunes) + ship flyover + sand wind
   - Slide 2: Space (stars/planet/asteroids) + ship + logo title
   - Slide 3: Desert flyover (supersonic streaks, ship)
   - Slide 4: Battlefield (tank, fire sources, smoke columns, sand wind streaks, heat wave distortion, 42 ground particles)

**Key art assets:** `assets/intro/slide1_*.png`, `slide2_*.png`, `slide3_*.png`, `slide4_*.png`, `intro_ship*.png`

---

## 5. Galactic Map (`js/galactic-map.js`)

Animated data-driven campaign map with:
- 7 mission nodes: Tutorial + 6 numbered missions
- Planet images, asteroids, satellite decor
- Ship that moves to selected node
- Route path with animated dash offset
- Tutorial completion tracking (✓ badge)
- Unlock system via `localStorage.dh_unlocked_mission`

---

## 6. Game Engine (`js/game.js`)

### States
| State | Purpose |
|-------|---------|
| `menu` | Main menu with arcade/survival/settings/help |
| `characterselect` | Character selection with animated card UI |
| `play` | Active gameplay |
| `paused` | Pause menu overlay |
| `gameover` | Death screen |
| `win` | Victory screen |
| `help` | Controls help screen |

### Character Select Screen
- Carousel layout based on `upload/player_select_screen_design_ideas01.png`
- Large selected pilot panel centered, previous/next pilots in smaller side panels
- Bottom dossier panel contains Name, Class, Description and two-column stats
- Animated layered star/meteor background with subtle scanlines
- Animated stat bars pulse/fill without the old moving white scanner block
- Controls: ← → to switch, Enter to confirm, Esc to return

### Characters (`js/characters.js`)
| ID | Name | Speed | Jump | Armor | Accent |
|----|------|-------|------|-------|--------|
| `juan_p` | JUAN P. | 270 | -780 | 1 | `#ff9a38` |
| `elena_k` | ELENA K. | 310 | -840 | 1 | `#72e7ff` |
| `sergio_h` | SERGIO H. | 225 | -700 | 2 | `#ff4d58` |

### Gameplay Modes
- **Arcade:** Single-player run through level1 with boss fight at end
- **Survival:** Arena-based wave mode with escalating enemies, kill streak multipliers, score milestones, wave clear FX, day/night cycle, chat system, timed platforms
- **Tutorial:** 8-module training level with guided milestones

### Camera
- **Horizontal:** Lerp to `player.x - 0.38*VW`, clamped to `[0, Level.W-VW]`. Locked at `Level.W-VW` during boss fight. Fixed at `ARENA_X=350` in survival mode.
- **Vertical (`G.camY`):** When player.y < 0.38*VH, camera follows upward (lerp dt×5) to reveal ship rooftops. Clamped to `[-260, 0]`. Applied via `g.translate(0, -camY)` in `drawWorld()` inner save block — background stays fixed, ground+entities shift. Resets to 0 on mode transitions.

### Tutorial (`js/game.js` updateTutorial)
- 10 milestone hints (move, jump, shoot, grenade, observer, platform, tank, tankfire, combo, exit)
- Surfboard auto-mount at end: visible from ~module 5, auto-board when within 85px
- Transitions to galactic-map on completion with reward

---

## 7. Tutorial Level (`js/tutorial-level.js`)

8 modules, each 1376px wide (total 11008px). MID_BASE_Y = -150, GROUND = 470.

| Mod | Mid Art | Reference File | Platforms |
|-----|---------|----------------|-----------|
| 0 | `mid01b.png` | `mid01_refe.png` | 10 |
| 1 | `mid02b.png` | `mid02_refe.png` | 5 |
| 2 | `mid03b.png` | `mid03_refe.png` | 11 |
| 3 | `mid04b.png` | `mid04_refe.png` | 10 |
| 4 | `mid06b.png` | `mid06_refe.png` | 8 |
| 5 | `mid07b.png` | `mid07_refe.png` | 7 |
| 6 | `mid08b.png` | `mid08_refe.png` | 8 |
| 7 | `mid05b.png` | `mid05_refe.png` | 3 |

**Platforms:** Invisible platforms defined via `addP(modIdx, lx, ly, lw)` — extracted from white-on-black reference rectangles. Each rectangle top edge is walkable Y.

**Extreme foreground:** `pilar01.png` hides module seams. `tutorial_foreground01.png` is no longer drawn. Optional/generated `pilar02.png` appears as a center-level foreground accent if present.

**Light FX:** Lamps, fires, robot eyes and electric sparks are positioned per module after checking mid PNG pixel art. Floating fire FX removed; only art-backed flames remain. Computer-screen FX now use fast malfunctioning CRT-style flicker, jitter, scanlines and dropouts.

**Extra tutorial atmosphere:** Tutorial rewards are now concentrated on upper invisible platforms so players are encouraged to climb and search. Two normal Soldier06 observers spawn at different tutorial heights, fire a stronger tank-piercing red laser, and can be destroyed by the player; `pilar02.png` emits smoke and electric crawls. Small electric sparks can occur throughout the annex, while heavier cyan/blue data-rain stays limited to modules 0, 2, 4, 6.

---

## 8. Level 1 (`js/level.js`)

Main arcade level with:
- Terrain, sky, mountains, dunes parallax layers plus 2x `bigship03.png` ship-platform section moved farther from the opening skirmish, with `bigship03_refe.png` reference-extracted invisible platforms, enemies/pickups only on ship decks, left-end reactor flame/smog, and several realistic crash-smoke vents; incorrect right-side engine glow lamps are removed
- `bigship04.png` floating ship section (1408×737 at 0.96× scale) after BigShip03, with bottom on GROUND, 3 reference-extracted deck levels (top y≈-49, mid y≈126, bottom y≈290), enemies/pickups on decks, two left-side reactor nozzles with flame/smog FX, and 6 smoke sources along the hull
- Level 1 platform routes carry more visible rewards while ground prop loot is reduced
- Lava gaps use a fresh non-parallax molten animation: slow surface waves, fire plumes, embers, smoke, bubbles and clean unboxed cutaway edges
- 6 enemy types, POW rescues, weapon pickups
- Portal gate uses beacon light FX (radial gradient glow + rotating arc stroke + white core) replacing old ellipse rings
- Boss fight at end
- Mission intro with supplied PNG rocket-board fly-in and a fixed-world opening UFO that only rises vertically with no horizontal self/parallax drift

---

## 9. Level 2 — Iron Storm (`js/train-level.js`)

High-speed desert railway level where the player runs on train rooftops.

**Entry:** `level2.html` loads `js/train-level.js` as `window.TrainLevel` via `window.IS_PORTAL = true`.

### Train System
- **13 train PNGs** in `assets/trains/`: 3 motors (motor01, motor02, motor03) + 11 wagons (vagon01–vagon11)
- **Deterministic layout** (seeded RNG 2026): motor02 at start → random wagons → motor01 at end
- **All segments scaled 0.95x** (`TRAIN_SCALE = 0.95`) from their user-corrected native PNG sizes
- **GROUND = 375**, roof at 30% from top of each segment (`ROOF_RATIO = 0.30`)
- **Train offset:** starts at x = -400 (`TRAIN_X_OFFSET = -400`) so player (spawning at x=120) lands on motor02 roof

### Electrification Masts
- 6 mast PNGs (`railway_electrification_mast01-06.png`) at 0.80x scale
- **Time-based scrolling** (`MAST_SPEED = 600`), always moving even when player is stationary
- Spaced 350px apart (`MAST_SPACING = 350`), Y offset varied per mast
- Positioned 90px below ground line

### Visual FX
- **Black smoke** from motor sources (3 puffs per motor) and random wagon seams (8 particles per source, dark grays #0a0a0c/#151518/#1e1c1a)
- **Electric sparks** — 12 periodic flash points with blue-white glow (#a0d8ff/#60b8ff), `lighter` composite mode
- **Speed lines** — 50 horizontal streaks, `lighter` composite, various lengths/speeds
- **Dust particles** — 35 ambient sand particles near ground level
- **Background parallax** shifted 70px lower (`PARALLAX_Y_ADJ = 70`): clouds 0.03, mountains 0.18, dunes 0.45 at 0.58x scale

### Gameplay
- **12,800px** level width
- 24 enemy spawns (soldiers, grenadiers, knife chargers, bazookas, turrets, helicopters) starting at x=1200
- 3 weapon pickups (mg, grenades, spread) embedded in spawn list
- 10 high pickups (grenades, mg, heart, homing, rocket, flame) above roof level
- Exit portal at x=12,400 with beacon FX (radial gradient + rotating arc + white core + portal art)
- No lava, no boss, no platforms, no surfboard, no night cycle

---

## 10. Entities (`js/entities.js`)

### Player
- Movement, jumping, crouching, aim-up
- Weapons: pistol, mg, spread, rocket, flame
- Secondary: grenades, homing missiles
- Jetpack, vehicle mounting (ally tanks)
- Death/respawn with spirit animation

### Enemies
| Type | HP | Description |
|------|----|-------------|
| soldier | 1 | Rifle infantry |
| grenadier | 1 | Grenade-thrower |
| knife | 1 | Fast melee charger |
| bazooka | 2 | Rocket launcher |
| turret | 4 | Fixed MG bunker |
| observer | 2 | Hovering Soldier06 drone with stronger tank-piercing red laser |
| heli | 10 | Attack helicopter |
| gunship | 36 | Miniboss gunship |
| tank | 14 | Armored vehicle |
| space_fighter | 6 | Hover/chase/fan-fire space enemy (portal level, `enemies_ship01/02.png`) |

### Boss
- Armored fortress, 70 HP
- Phase 2 at 60% HP (armor explodes, mortar rain)
- 3-cannon salvos, MG bursts, infantry reinforcement spawn

### Other Entities
- Slugs: Ally tanks (drivable), ally_tank02 drill variant, wheel/chain dust, tank02 top-left exhaust smoke, more realistic oily black critical-smoke plumes on both ally tank types at 1 HP, and pixel-art coin-jackpot awards for destroyed enemy vehicles/boss, with mid-fight boss coin drops and a brighter final boss jackpot
- POWs: Tied prisoners (2 hands down) → rescued → 1 hand up → drop weapon
- Pickups: Weapons, grenades, homing, jetpack, heart
- Props: Barrels, crates, mines, decor

---

## 11. Art Assets

| Category | Path | Format |
|----------|------|--------|
| Characters | `assets/characters/{id}/*.png` | Modular (torso/legs/head/hands) |
| Player | `assets/player/*.png` | Full frames + modular |
| Enemies | `assets/enemies/soldier{01-06}/*.png` | Modular body parts |
| Vehicles | `assets/vehicles/{ally_tank,enemy_tank,boss_tank}/*.png` | Modular |
| Trains | `assets/trains/*.png` | 3 motors, 11 wagons, 6 masts |
| Tutorial | `assets/tutorial/*.png` | 1376×768 module backgrounds |
| Intro | `assets/intro/slide*.png` | 1020-1200×540 layers |
| Map | `assets/map/**/*.png` | Planets, decor |
| Props | `assets/props/*.png` | Decor items |
| Platforms | `assets/platforms/*.png` | floating_platform.png |
| UI | `assets/ui/*.png` | Logo, dialogue faces |

---

## 12. Known Issues / Next Steps

### Recently Fixed
- **Coin-to-life system** — Animated coin sprite sheet (`coins_ani01.png`, 84×12px, 6 frames) with spin animation. `G.coins` counter, `G.COINS_PER_LIFE = 50`. Collecting 50 coins grants an extra life (max 5), screen flash, "EXTRA LIFE!" popup, and congrats scorePop. All heart pickups removed from level1, portal-level, train-level, and tutorial. Coin HUD replaced with yellow progress bar + mini heart/coin icons (no numbers).
- **Chat sound effects** — `SFX.chatBeep()` (4 repeating robot beeps, ~0.8s) and `SFX.enemyChatBeep()` (3 gritty cycles with noise, ~0.66s). `SFX.coinLife()` (ascending arpeggio). Beeps play once when story dialogue starts in Level 1/2 (`js/dialogue.js`), once per survival chat message, and once on coin-to-life reward. Volume tuned for combat mix (0.12/0.11 effective after gain chain).
- **Safari glow fix** — All `shadowBlur` values reduced across `entity-score.js` (12→4), `game.js` survival score pulse (10+pulse×22→4+pulse×8), wave banner (8→4), `level.js` portal (18+pulse×12→6+pulse×4), `portal-level.js` portal (24+pulse×12→8+pulse×4), `train-level.js` portal (18+pulse×12→6+pulse×4), `intro-cinematic.js` logo (18×alpha→6×alpha). Safari renders shadowBlur denser/larger than Chrome.
- **Vertical camera disabled in tutorial** — `TutorialLevel` defines `disableCamY:true`. Camera code in `game.js` resets `camY=0` when flag is set. Prevents items/enemies sliding off-screen when player jumps in tutorial.
- **Respawn at ground level** — `respawn()` in `entities.js` now sets `p.y = Level.GROUND, p.onGround = true` instead of `p.y = -40`. Player no longer falls from above screen.
- **Tutorial→survival navigation fix** — When exiting tutorial to main menu and choosing survival, redirects to `level1.html?autostart=1&mode=survival` instead of restarting tutorial. Prevents `window.IS_TUTORIAL` from overriding all modes to 'tutorial'.
- **Dune02 lowered** — Offset changed from `GROUND - tileH + 6` to `GROUND - tileH + 55` in both `level.js` and `train-level.js`. Night tint fill extended from `GROUND + 6` to `GROUND + 60`.
- **test-chat.html** — Diagnostic page for testing chat SFX in isolation (keys 1-5, mute toggle, auto-trigger chat).
- **Level 2 train level** — Full implementation: train segments (motor02→wagons→motor01) at 0.95x scale, GROUND=375, player spawns on roof at x=120, electrification masts (6 types, time-based scrolling), black smoke + electric sparks FX, speed lines, dust particles, parallax background shifted 70px lower, 24 enemy spawns, exit portal at x=12400.
- Tutorial platforms now match the white-on-black reference rectangles from `assets/tutorial/*_refe.png`.
- Tutorial floating fire FX were removed/repositioned to real flame art only.
- `tutorial_foreground01.png` was removed from runtime drawing; `pilar02.png` is used as optional center-level foreground accent.
- Ally Tank 02 laser origin was moved to the center of the drill tip.
- Loading screens use a simple retro pixel loading bar without visible glyph text instead of English-only status labels.
- Tutorial/Level 1 pickups were shifted toward upper platform exploration, enemy hit-taunt dialogue was added, Soldier06 laser shots now damage ally tanks, Level 1 lava was rebuilt without parallax drift or black boxed cutaway lines, the opening UFO is fixed in world space and only rises vertically, and destroyed helicopters/tanks/gunships/boss trigger pixel-art coin-jackpot award animation with casino-style SFX, including mid-fight boss drops and a brighter final jackpot.
- **Press Start 2P font** installed across all HTML pages and 28 canvas `g.font` sites (10 JS files). Canvas sizes scaled 0.65x. `@font-face` + `document.fonts.load()` preload. Courier New preserved as fallback.
- **Portal beacon FX** — Level 1 and portal-level exit portals now use the tutorial beacon light effect (radial gradient glow + rotating arc stroke + white core) replacing old ellipse ring FX.
- **Settings submenu** — binding help text `'[Tab=2  Bksp=clear]'` moved right (x=820) and column gap widened to prevent overlap with Press Start 2P.
- **Intro tank slide** — sand particles increased 24→42, `drawSandWind()` wind streaks added, heat wave distortion FX added.
- **Center-screen info text** — removed `hudPanel()` background boxes from wave banner, jetpack notice, boss warning, and boss taunt. Text now renders with shadow only.
- **Tutorial FX positions** — all fire entries moved y+8 across modules 0,1,2,4,6. Module 3 electric FX only (robotEye removed, moved lower y:400). Module 5 lamps repositioned (red higher y:410, yellow lower y:510, added yellow above red y:385, right lamp up y:380).

### Known Bugs
- Level 3-6 content not yet implemented beyond galactic map nodes
- Survival mode balanced but untested extensively

### Planned Features
- Level 3-6 mission maps
- More enemy types and boss variants
- Additional POW types
- Full soundtrack integration
- Leaderboards / achievements

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
