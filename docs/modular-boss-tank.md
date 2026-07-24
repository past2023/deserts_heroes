# Modular Boss Tank 01

## Source files

- `full.png` — 650×386 complete static fallback/reference
- `chassis.png` — 649×386 lower base and chassis
- `pieces.png` — 649×386 transparent canvas containing four movable modules in source-space positions

## Runtime

The boss is displayed at 50% source scale, approximately 325×193 logical pixels. Its physics hitbox is 300×190 and remains independent from visual animation.

The engine draws the chassis first, then source-crops and animates four modules:

1. Main upper weapon stack — recoil translation
2. Small scout turret — slow aim/idle rotation
3. Central drive module — suspension movement
4. Rear reactor — reduced suspension movement and procedural cyan glow

Additional engine effects include cannon ignition, reactor pulsing, white hit silhouette, critical warning, smoke, fire, internal destruction bursts, screen shake, and staged final explosion.

The complete `full.png` is used automatically if either modular image is unavailable.

## Why modular vehicle art is valuable

Separate pieces are an effective production method for large mechanical enemies. They provide movement, recoil, suspension, turret tracking, damage reactions, and phase changes without requiring a full-frame sheet for every combination. They also reduce texture duplication.

The main limitation is pivot metadata: future handoffs should include a JSON manifest listing each piece rectangle, pivot, parent, socket, and allowed motion. This prevents crop coordinates and pivots from living in rendering code and makes replacement art safer.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).
