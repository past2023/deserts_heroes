# Entity modularization

## Goal

Reduce the responsibility of `js/entities.js` without a disruptive engine rewrite or loss of direct `file://` browser support.

## First extraction

Three low-coupling systems have been moved behind focused global modules:

| Module | Responsibility |
|---|---|
| `js/entity-utils.js` | Allocation-conscious array lifecycle helpers |
| `js/entity-score.js` | Score mutation, floating score update, and rendering |
| `js/entity-collectibles.js` | POW rescue behavior, pickups, rewards, and pickup rendering |
| `js/entity-warnings.js` | Mortar warning lifecycle and rendering |
| `js/entity-props.js` | Crates, explosive barrels, loot, hitboxes, and prop rendering |

`Entities` remains a compatibility facade, so existing calls from `game.js` continue to work. This makes the migration incremental and keeps gameplay risk low.

## Performance changes

Entity update loops now compact active arrays in place instead of creating replacement arrays with `Array.prototype.filter()` every simulation step. This covers slugs, enemies, player bullets, enemy bullets, grenades, particles, flashes, corpses, props, POWs, pickups, warnings, and score popups. Boss reinforcement counting also avoids allocating a temporary filtered array. These changes reduce short-lived allocations and eventual garbage-collection pressure during heavy combat.

The modules expose frozen public APIs and validate unknown pickup and prop types at their boundaries. The prop module receives its explosion dependency explicitly during initialization, avoiding a hidden cyclic dependency.

## Script order

The focused modules load after `level.js` and before `entities.js`. They only access runtime globals from function bodies, after the complete game has initialized.

## Recommended extraction order

1. Destructibles and damage contracts
2. Projectile and ballistic systems
3. Enemy definitions and behavior strategies
4. Boss controller and attack phases
5. Allied vehicle controller
6. Player controller, weapons, and animation state
7. Particle simulation/rendering

Before extracting destructibles, introduce a small shared combat service for damage, explosions, random helpers, overlap tests, and rewards. This avoids replacing one monolith with modules that depend on each other cyclically.

## Architecture direction

Keep the fixed-step loop and Canvas renderer. Move toward explicit services and data-driven definitions incrementally. ES modules can be considered later, but native module loading would remove the project's current no-server `file://` behavior in many browsers. A build system should only be introduced when its testing and asset-pipeline value outweighs that distribution constraint.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, more realistic oily black critical smog for both ally tanks, left-end reactor flame/smog and additional crash-smoke damage on BigShip03 with incorrect right-side glow lights removed, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a brighter final boss jackpot.
