# Current runtime status

Updated: 2026-07-25

This document is the current source of truth when older production handoff notes describe an earlier prototype state.

## Campaign flow

`index.html` is the required persistent Safari/Chrome audio shell. It hosts `intro.html`, the main menu and character selection in `level1.html`, `galactic-map.html`, the tutorial placeholder, Level 1, and the orbital time-rift bonus level.

Campaign map choices currently available:

- Tutorial — `tutorial.html`, placeholder link into Level 1
- Mission 01 — the 26,000-pixel desert mission
- Missions 02–06 — visible locked future nodes

## Presentation

- Five-slide randomized cinematic with a fixed generated credit slide
- Authored soundtrack router with procedural fallback
- Optional 1990s TV filter
- Four rapid day/night changes with a detailed nearest-neighbor cratered pixel moon
- Modular sky, cloud, mountain, dune and terrain rendering
- Animated lava gaps with molten currents, surface ribbons, bubbles, sparks, heat glow and allied-tank damage
- Native sand platforms between mountains and dunes
- Static nearest-plane antenna bunkers
- Pixel-quantized iris and portal transitions
- Loading overlays use animated alien/pixel glyph strings instead of English-only status labels
- Level 1 opening vista draws the uploaded enemy_ship01 rising slowly behind the dune layer with falling sand particles

## Gameplay

- Three selectable heroes with an adjusted animated carousel selection screen, smaller pilot panels, higher bottom dossier, wrapped descriptions, and pulsing pixel stat bars
- Double jump and ten-second jet pack
- Arcade and Survival modes
- 26,000-pixel Level 1 with calm exploration spaces and enemy territories
- Floating, moving and timed-destructible platforms
- Lava gaps, lethal energy walls and proximity mines
- POW rescue rewards and five-hit hidden-item props
- Allied driveable tank and persistent vehicle wrecks
- Time-rift orbital platform bonus level with transferable rewards

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

The map uses supplied tutorial/planet PNGs, asteroid clusters and satellite art. Planet aspect ratios are preserved while they rotate. The starfield moves, galaxy arms use pixel blocks, route dots animate, meteors cross occasionally, energy particles drift, and a small supplied spacecraft follows selection. Tutorial and Mission 01 are selectable.

## Pickups

Authored PNG pickups replace generated crates for heavy machine gun, spread, rocket/missile variants, flame shot, grenades, guided missiles, jet pack and extra life. Icons float and receive alpha-silhouette glow. Four persistent heart pickups are positioned on optional high-platform routes.

## Tutorial runtime

`tutorial.html` contains the 8-module Frontier Training Annex. Invisible platforms are generated from white-on-black reference rectangles, `pilar01.png` hides module seams, and `pilar02.png` is used as an optional center-level extreme-foreground accent. The old `tutorial_foreground01.png` layer is no longer drawn. Tutorial light FX were rechecked against the mid PNG art: lamps/screens are placed on visible art, fire FX only appear on illustrated flames, and data-spark rain is limited to selected modules for pacing.

Ally Tank 02 uses the drill variant art and fires its main cyan laser from the visible drill tip.

## Background depth props

Updated sand platforms render at 50% native size between mountains and dunes. They rise slowly and shed procedural falling-sand particles. Updated antenna bunkers remain static at 50% size in the nearest parallax plane.

## Story and dialogue

The current canon is defined in `docs/world-story-bible.md`: Scientific Frontier Corps explorer-soldiers defend the right of isolated planets to choose their own future against the knowledge-destroying Atavist Dominion. An 11.5-second centered procedural story-text slide follows the cinematic credit slide. Level 1 queues localized compact teleprompter transmissions from the selected hero, enemy forces and the fortress boss. Player transmissions use the supplied 12-expression face sheet with aspect-preserved portrait framing, scanlines, chromatic split, jitter, dropout effects, and larger bold white text.

Two supplied modular prisoner sets now replace generated POW visuals. Their `hand_down` layer renders first, with independent legs, torso, head where supplied, raised hand and escape animation.

## Architecture

The game preserves 960×540 Canvas 2D, fixed 60 Hz simulation, direct browser compatibility and procedural fallbacks. Entity scoring, collectibles, props, warnings, weather, foreground decoration, dialogue, music routing, retro filtering and map logic are separate modules. See `docs/entity-modularization.md` and `docs/next-phase-handoff.md` for continuation.
