# Desert's Heroes — Current Game State
**Date:** 2026-07-25  
**Branch:** `arena/019f957c-deserts-heroes` (merged to `main`)  
**PR:** #7

---

## 1. Project Overview

Desert's Heroes is a 2D side-scrolling pixel-art run-and-gun game with a sci-fi desert setting.  
It features: a cinematic intro, a galactic mission map, a tutorial level, a full arcade level, a survival mode, and a portal level.

**Rendering:** Canvas 2D, 960×540, pixel-art (`image-rendering: pixelated`).  
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

**Navigation flow:**
```
index.html → intro.html → level1.html (menu)
                              ├── character select → galactic-map.html
                              │     ├── tutorial.html
                              │     └── level1.html (autostart)
                              ├── survival mode (direct start)
                              ├── settings
                              └── help
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
   - Slide 4: Battlefield (tank, smoke columns, fire)

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
- Single centered 880×470 card with glass-morphism background
- Identity section (left 55%): Name (28pt white), Class badge (14pt, diamond bullet), Bio (12pt italic grey)
- Portrait frame below bio
- Stats section (right 40%): 4 color-coded progress bars (SPEED=cyan, JUMP=green, ARMOR=orange, AMMO=red)
- Navigation arrows with pulsing accent glow
- Deep space nebula + twinkling stars background
- Controls: ← → to switch, Enter to confirm, Esc to return

### Characters (`js/characters.js`)
| ID | Name | Speed | Jump | Armor | Accent |
|----|------|-------|------|-------|--------|
| `juan_p` | JUAN P. | 270 | -780 | 1 | `#ff9a38` |
| `elena_k` | ELENA K. | 310 | -840 | 1 | `#72e7ff` |
| `sergio_h` | SERGIO H. | 225 | -700 | 2 | `#ff4d58` |

### Gameplay Modes
- **Arcade:** Single-player run through level1 with boss fight at end
- **Survival:** Arena-based wave mode with escalating enemies
- **Tutorial:** 8-module training level with guided milestones

### Tutorial (`js/game.js` updateTutorial)
- 10 milestone hints (move, jump, shoot, grenade, observer, platform, tank, tankfire, combo, exit)
- Surfboard auto-mount at end: visible from ~module 5, auto-board when within 85px
- Transitions to galactic-map on completion with reward

---

## 7. Tutorial Level (`js/tutorial-level.js`)

8 modules, each 1376px wide (total 11008px). MID_BASE_Y = -150, GROUND = 470.

| Mod | Mid Art | Reference File | Platforms |
|-----|---------|----------------|-----------|
| 0 | `mid01b.png` | `mid01_refe.png` | 11 |
| 1 | `mid02b.png` | `mid02_refe.png` | 5 |
| 2 | `mid03b.png` | `mid03_refe.png` | 11 |
| 3 | `mid04b.png` | `mid04_refe.png` | 11 |
| 4 | `mid06b.png` | `mid06_refe.png` | 9 |
| 5 | `mid07b.png` | `mid07_refe.png` | 5 |
| 6 | `mid08b.png` | `mid08_refe.png` | 10 |
| 7 | `mid05b.png` | `mid05_refe.png` | 2 |

**Platforms:** Invisible platforms defined via `addP(modIdx, lx, ly, lw)` — extracted from refe PNGs with green lines on black.

**Light FX:** Lamps, screens, fires, robot eyes, electric sparks positioned per module.

**Falling particles:** Ambient cyan/blue data-sparks drift down.

---

## 8. Level 1 (`js/level.js`)

Main arcade level with:
- Terrain, sky, mountains, dunes parallax layers
- 6 enemy types, POW rescues, weapon pickups
- Portal trigger, boss fight at end
- Mission intro with rocket-board fly-in

---

## 9. Entities (`js/entities.js`)

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
| observer | 2 | Hovering drone with laser |
| heli | 10 | Attack helicopter |
| gunship | 36 | Miniboss gunship |
| tank | 14 | Armored vehicle |

### Boss
- Armored fortress, 70 HP
- Phase 2 at 60% HP (armor explodes, mortar rain)
- 3-cannon salvos, MG bursts, infantry reinforcement spawn

### Other Entities
- Slugs: Ally tanks (drivable), ally_tank02 drill variant
- POWs: Tied prisoners (2 hands down) → rescued → 1 hand up → drop weapon
- Pickups: Weapons, grenades, homing, jetpack, heart
- Props: Barrels, crates, mines, decor

---

## 10. Art Assets

| Category | Path | Format |
|----------|------|--------|
| Characters | `assets/characters/{id}/*.png` | Modular (torso/legs/head/hands) |
| Player | `assets/player/*.png` | Full frames + modular |
| Enemies | `assets/enemies/soldier{01-06}/*.png` | Modular body parts |
| Vehicles | `assets/vehicles/{ally_tank,enemy_tank,boss_tank}/*.png` | Modular |
| Tutorial | `assets/tutorial/*.png` | 1376×768 module backgrounds |
| Intro | `assets/intro/slide*.png` | 1020-1200×540 layers |
| Map | `assets/map/**/*.png` | Planets, decor |
| Props | `assets/props/*.png` | Decor items |
| UI | `assets/ui/*.png` | Logo, dialogue faces |

---

## 11. Known Issues / Next Steps

### 🔲 Platform Detection (HIGH PRIORITY)
The `_refe.png` files with neon green lines on black were uploaded but the indexed PNG format makes it hard to auto-detect. **Next user should upload simple JPG or PNG with white rectangles on pure black** (1376×768) — one rectangle per platform, positioned at walkable height.

### Lights FX
- Module 5 (mid07b): Fire was removed (art has no fire) ✅
- Module 6 (mid08b): Fire moved to x=1160 ✅
- Other light positions still need verification against actual art

### Known Bugs
- Tutorial invisible platforms still not perfectly matching art (manual addP coordinates approximate)
- No level2-level6 content beyond galactic map nodes
- Survival mode balanced but untested extensively

### Planned Features
- Level 2-6 mission maps
- More enemy types
- Boss variants
- Additional POW types
- Full soundtrack integration
- Leaderboards / achievements
