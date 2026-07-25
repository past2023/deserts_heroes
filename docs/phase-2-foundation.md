# Phase 2 foundation — engine review and content migration

## Status

The GitHub base was copied without replacing its working gameplay. The first migration step is implemented: the supplied transparent main-player PNGs are imported and active, while all existing gameplay and generated-art fallbacks remain available.

The supplied horizontal idle/run sheets are sliced directly in Canvas at load time. Normal frames use 100 × 100 source canvases; sky-aim frames use 100 × 123 source canvases.

## Engine findings

### What is already strong enough to preserve

- Fixed 60 Hz simulation loop with an accumulator.
- Canvas 2D rendering at a fixed 960 × 540 logical resolution.
- Nearest-neighbour presentation through disabled image smoothing and CSS `image-rendering`.
- Responsive player movement, coyote time, jump buffering, recoil, hit-stop and screen shake.
- Existing enemy, boss, weapon, pickup, destructible, POW and vehicle systems.
- Progressive spawn table and a complete playable mission.
- Procedural WebAudio SFX and adaptive procedural music.
- No dependency, server, or build-step requirement; the game still supports `file://`.

### Main technical limits

1. `js/entities.js` is a large shared module with many unrelated entity systems.
2. Story copy and gameplay rules were previously mixed together in `js/game.js`.
3. Level geometry, encounter data and environment drawing all live in `js/level.js`.
4. Most systems mutate the global `G` object directly.
5. Rendering and collision dimensions are implicit constants rather than per-character data.
6. There is no formal asset loading or validation layer.
7. No automated gameplay regression tests exist.

These limits do not prevent the next art/story pass. A full engine rewrite now would create unnecessary regression risk. The recommended path is incremental extraction while preserving the fixed-step gameplay.

## Implemented in this phase

### Direct PNG player rendering

- Added `js/character-assets.js`, a data-driven player animation manifest.
- Added state-based PNG loading for idle, run, jump, crouch, death and upward-aim poses.
- Added support for animated idle frames.
- Added native 100 × 100 normal poses and 100 × 123 sky-aim poses.
- Added automatic horizontal flipping, alpha handling, bottom-centre anchoring and white hit-flash generation.
- Preserved the physics hitbox independently from visual PNG dimensions.
- Added state-by-state generated-sprite fallback when a PNG is missing.
- Added source-size validation warnings.
- Updated the main menu to use the same PNG animation path as gameplay.

### Story/content separation

- Added `js/content.js` as the central location for game title, mission name, boss name and vehicle copy.
- Removed the prototype's story-specific boss label from gameplay code.
- Mission and victory banners now read from content data.

### Asset handoff documentation

- Added `assets/player/README.md` with alpha, orientation, baseline, dimensions, naming and animation requirements.

## Rendering contract

The gameplay position of the player is the point where the feet meet the ground. Every PNG is drawn around a bottom-centre pivot.

```text
normal frame:       100 × 100 px
up-aim frame:       100 × 123 px
source direction:   facing right
alpha:              transparent RGBA
pivot:              x 0.5, y 1.0
physics hitbox:     24 × 54 gameplay units (unchanged)
```

The source and display dimensions currently match. If the art should be authored at 100 px but appear smaller on the 960 × 540 canvas, add `renderWidth` and `renderHeight` to the relevant state in `js/character-assets.js`. This should be decided after viewing the first real frames in motion, not guessed in advance.

## Required art states for the current mechanics

| State | Current default | Canvas |
|---|---:|---:|
| Idle | 2 frames at 2 fps | 100 × 100 |
| Run | 4 frames at 10 fps | 100 × 100 |
| Jump | 1 frame | 100 × 100 |
| Crouch + horizontal fire | 1 frame | 100 × 100 |
| Death / spirit ascent | 8 authored frames with non-uniform timing | 100 × 100 |
| Idle + aim up | 1 frame | 100 × 123 |
| Run + aim up | 4 frames at 10 fps | 100 × 123 |
| Jump + aim up | 1 frame | 100 × 123 |

Recommended later states: knife attack, grenade throw, landing, hurt, weapon-specific fire, enter vehicle, exit vehicle and victory. Those states need explicit gameplay animation events before art is commissioned.

## Recommended next sequence

### 1. Gameplay-review the imported player frames

- Confirm that native 100 px rendering is the desired on-screen scale.
- Review the stable bottom baseline frame by frame.
- Fine-tune muzzle points and knife effect position if needed.
- Verify crouch and standing hitbox readability.
- Test every weapon while standing, moving, jumping and aiming up.
- Commission dedicated melee, grenade and non-fatal hurt frames after the base motion is approved.

### 2. Approve the original story brief

Define in one page:

- final game title;
- player name, role and visual silhouette;
- enemy faction and visual language;
- setting, year/era and technology level;
- mission objective;
- prisoner/rescue-system replacement or story justification;
- vehicle identity;
- miniboss and final boss identities;
- tone, content rating and prohibited themes;
- ending beat and reason for future missions.

Then replace values in `js/content.js` and write the Mission 1 encounter script around that brief.

### 3. Lock a pixel-art style guide

Before producing environment and enemy art, approve:

- master pixel density;
- outline color/value rules;
- lighting direction;
- palette limits;
- character scale relative to the 960 × 540 viewport;
- explosion and projectile palette;
- faction colors;
- background contrast rules so bullets and actors remain readable.

### 4. Convert the rest of the render layer incrementally

Suggested order:

1. main player;
2. standard infantry;
3. projectiles, muzzle flashes and impacts;
4. pickups and props;
5. vehicles;
6. miniboss and boss;
7. tiles, platforms and foreground;
8. parallax backgrounds;
9. HUD and title screens.

Generated Canvas graphics should remain as fallbacks until each group passes gameplay review.

### 5. Add animation events

The next code milestone after the first PNG review should add state events for:

- exact muzzle socket per pose;
- shell-ejection socket;
- melee active frame;
- grenade-release frame;
- footsteps and landing frame;
- invulnerability blink/hit flash;
- death completion.

This prevents effects from floating away from the larger character art and allows sound timing to follow animation rather than arbitrary timers.

## Quality gates for the PNG import

- No visible background matte around transparent pixels.
- No smoothing at integer game scale.
- Feet move no more than one pixel vertically during idle unless intentionally animated.
- Facing-left flip does not move the weapon muzzle or pivot.
- Up-aim frame remains anchored to the same feet position as the 100 × 100 frame.
- Player can stand against platforms without visual sinking.
- Art does not alter collision or weapon damage.
- Missing frames never prevent startup.
- `index.html` runs the cinematic and redirects to `level1.html`; gameplay can also be tested by opening `level1.html` directly.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, more realistic oily black critical smog for both ally tanks, left-end reactor flame/smog and additional crash-smoke damage on BigShip03 with incorrect right-side glow lights removed, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a brighter final boss jackpot.
