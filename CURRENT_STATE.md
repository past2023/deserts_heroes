# Desert's Heroes — Current Game State
**Date:** 2026-07-25  
**Branch:** `arena/019f9a46-deserts-heroes`  
**PR:** #9

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
- Terrain, sky, mountains, dunes parallax layers plus 2x `bigship03.png` ship-platform section moved farther from the opening skirmish, with `bigship03_refe.png` reference-extracted invisible platforms, enemies/pickups only on ship decks, reactor lights and black smoke
- Level 1 platform routes carry more visible rewards while ground prop loot is reduced
- Lava gaps use a fresh non-parallax molten animation: slow surface waves, fire plumes, embers, smoke, bubbles and clean unboxed cutaway edges
- 6 enemy types, POW rescues, weapon pickups
- Portal trigger, boss fight at end
- Mission intro with supplied PNG rocket-board fly-in and a fixed-world opening UFO that only rises vertically with no horizontal self/parallax drift

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
| observer | 2 | Hovering Soldier06 drone with stronger tank-piercing red laser |
| heli | 10 | Attack helicopter |
| gunship | 36 | Miniboss gunship |
| tank | 14 | Armored vehicle |

### Boss
- Armored fortress, 70 HP
- Phase 2 at 60% HP (armor explodes, mortar rain)
- 3-cannon salvos, MG bursts, infantry reinforcement spawn

### Other Entities
- Slugs: Ally tanks (drivable), ally_tank02 drill variant, wheel/chain dust, tank02 top-left exhaust smoke, black critical-smoke plumes on both ally tank types at 1 HP, and pixel-art coin-jackpot awards for destroyed enemy vehicles/boss, with mid-fight boss coin drops and a brighter final boss jackpot
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

### Recently Fixed
- Tutorial platforms now match the white-on-black reference rectangles from `assets/tutorial/*_refe.png`.
- Tutorial floating fire FX were removed/repositioned to real flame art only.
- `tutorial_foreground01.png` was removed from runtime drawing; `pilar02.png` is used as optional center-level foreground accent.
- Ally Tank 02 laser origin was moved to the center of the drill tip.
- Loading screens use a simple retro pixel loading bar without visible glyph text instead of English-only status labels.
- Tutorial/Level 1 pickups were shifted toward upper platform exploration, enemy hit-taunt dialogue was added, Soldier06 laser shots now damage ally tanks, Level 1 lava was rebuilt without parallax drift or black boxed cutaway lines, the opening UFO is fixed in world space and only rises vertically, and destroyed helicopters/tanks/gunships/boss trigger pixel-art coin-jackpot award animation with casino-style SFX, including mid-fight boss drops and a brighter final jackpot.

### Known Bugs
- No level2-level6 content beyond galactic map nodes
- Survival mode balanced but untested extensively

### Planned Features
- Level 2-6 mission maps
- More enemy types and boss variants
- Additional POW types
- Full soundtrack integration
- Leaderboards / achievements

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, critical black smog for both ally tanks, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a brighter final boss jackpot.
