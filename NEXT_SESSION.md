# Desert's Heroes — Project Handoff for Next Session

## Session Context
You are continuing work on `past2023/deserts_heroes`. Current Arena work is on branch `arena/019f9a46-deserts-heroes` with PR #9. Start by reading `CURRENT_STATE.md`, this file, and the open PR context.

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

## ✅ Tutorial Platforms / FX Status

Tutorial invisible platforms have been re-extracted from the new white-on-black reference images in `assets/tutorial/tutorial_midXX_refe.png`. Each white rectangle now maps directly to one `addP(modIdx, x, y, w)` platform using the rectangle top edge as walkable Y.

Current platform counts:

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

Extreme foreground update:
- `tutorial_foreground01.png` is no longer drawn.
- `pilar01.png` still hides seams at module borders.
- `pilar02.png` is an optional center-level foreground accent, loaded from `assets/tutorial/pilar02.png` with `upload/pilar02.png` fallback.


## ✅ Tutorial Light/Fire/Particle FX

`js/tutorial-level.js` light FX have been rechecked against the mid PNGs:
- Lamps/screens were added to visible art positions.
- Floating fire FX were removed.
- Fire FX are only kept where there is a visible flame in the art.
- Ambient data-spark rain now appears only in selected modules (0, 2, 4, 6), while small malfunction sparks can appear everywhere.
- Two normal Soldier06 observers spawn at different tutorial heights, fire tank-piercing red lasers, taunt when they hurt the player, and can be destroyed by the player. Tutorial pickups are concentrated on upper invisible platforms.
- `pilar02.png` emits foreground smoke/electric crawls.


## 🎨 Player Select Screen

`js/game.js` `drawCharacterSelect()` is now a carousel based on `upload/player_select_screen_design_ideas01.png`:
- Center selected pilot panel with previous/next side panels.
- Animated star/meteor background.
- Bottom dossier box for Name, Class, Description, and stats.
- Stat bars animate/pulse without the white moving scan box.
- `CONCEPT A` label removed.

If adjusting further, keep all text inside the bottom dossier bounds at 960×540.


## 🎵 New Audio
Authored MP3 tracks in `assets/audio/`:
- `Star_Map_Reverie.mp3` — Tutorial level
- `Star_Map_Symphony.mp3` — Galactic map

Register new tracks in `js/music-tracks.js` `files` object, then call `MusicTracks.play('trackname')`.

---

## Other To-Dos
- Level 2-6 mission implementations
- Survival mode balancing
- Achievement/leaderboard system
- Full soundtrack composition

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, critical black smog for both ally tanks, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a large final boss jackpot.
