# Desert's Heroes — Project Handoff for Next Session

## Session Context
You are continuing work on `past2023/deserts_heroes`. The previous session (PR #7, branch `arena/019f957c-deserts-heroes`) has been merged to `main`. Start by cloning/checking out `main`.

## Overview
Desert's Heroes is a 2D side-scrolling pixel-art run-and-gun game (960×540 canvas, JavaScript, no frameworks). It has: intro cinematic, galactic mission map, tutorial level (8 modules), arcade level1, survival mode, portal level.

**Key files:**
- `js/game.js` — Main engine, states, HUD, character select
- `js/tutorial-level.js` — Tutorial world platforms + lights
- `js/entities.js` — Player, enemies, boss, bullets, particles
- `js/intro-cinematic.js` — Cinematic intro
- `js/galactic-map.js` — Mission selection map
- `js/music-tracks.js` — Authored MP3 soundtrack bridge
- `js/audio.js` — Procedural WebAudio fallback

**HTML pages:** `index.html`(shell) → `intro.html` → `level1.html`(menu+game) → `tutorial.html` / `galactic-map.html` / `portal-level.html`

---

## 🔲 HIGH PRIORITY: Fix Tutorial Invisible Platforms

### Problem
Tutorial platforms (`addP()` calls in `js/tutorial-level.js`) don't precisely match the module art. The green-line reference files (`assets/tutorial/tutorial_mid{01-08}_refe.png`) were intended as guides but auto-extraction had issues because the green pixels mixed with art outlines.

### What the user needs to do
Create simple **platform guide images** and upload them to the repo's `upload/` folder (or replace the existing `assets/tutorial/tutorial_mid{XX}_refe.png` files):

**Format:**
- **1376×768 pixels** (same as module art)
- **Pure black background** (#000000)
- **White rectangles** (#FFFFFF) — one rectangle per platform
- Each rectangle's **top edge** = exactly where the player should walk
- No anti-aliasing on the white rectangles (hard pixel edges)
- If using JPG: use maximum quality to avoid compression artifacts
- Keep the file name as `tutorial_mid{01-08}_refe.png` (or just tell us the new names)

### How the detection works
The code scans for pixels where `G > 200 AND R < 40 AND B < 40` on the refe PNG:
1. Finds all green pixels → for each column, records the TOPMOST green pixel
2. Groups adjacent columns where topmost rows differ by ≤4px
3. Groups ≥15px wide become platforms
4. `gameY = -150 + imgRow` (MID_BASE_Y = -150)
5. Module index mapping:
   - Module 0 ← `mid01_refe.png`
   - Module 1 ← `mid02_refe.png`
   - Module 2 ← `mid03_refe.png`
   - Module 3 ← `mid04_refe.png`
   - Module 4 ← `mid06_refe.png`
   - Module 5 ← `mid07_refe.png`
   - Module 6 ← `mid08_refe.png`
   - Module 7 ← `mid05_refe.png`

### Alternative: Manual coordinates
If making images is hard, just tell me the exact platform positions for each module. Example format:
```
Module 0: platforms at img_row=260 from x=100 to x=450, img_row=265 from x=500 to x=800
Module 1: ...
```

---

## 🔥 Fix Light/Fire FX Positions
All lights in `js/tutorial-level.js` `const lights=[...]` need their `x, y` coordinates checked against the actual module art:
- **Module 4** (mid06b): Has screens and fires that need art-matching positions
- **Module 5** (mid07b): ❌ No fire in art — but lamps and screens present
- **Module 6** (mid08b): 🔥 Fire should be at right side (art has fire at ~x=1160)
- **Module 7** (mid05b): Desert exit — minimal FX

Look at `assets/tutorial/tutorial_mid{XX}b.png` and place lights at the actual art locations.

---

## 🎨 Player Select Screen
Already redesigned in `js/game.js` function `drawCharacterSelect()` with:
- Single centered card (880×470) with glass-morphism background
- Identity section (name, class badge with diamond, bio)
- Portrait in frame, stats section with color-coded progress bars
- Deep space nebula background

To adjust: modify the `drawCharacterSelect()` function. The design follows the concept in `upload/player_select_screen_design_ideas01.png`.

---

## 🎵 New Audio
Authored MP3 tracks in `assets/audio/`:
- `Star_Map_Reverie.mp3` — Tutorial level
- `Star_Map_Symphony.mp3` — Galactic map

Register new tracks in `js/music-tracks.js` `files` object, then call `MusicTracks.play('trackname')`.

---

## Other To-Dos
- Level 2-6 mission implementations
- More POW variants
- Survival mode balancing
- Achievement/leaderboard system
- Full soundtrack composition
- Boss variants for later levels
