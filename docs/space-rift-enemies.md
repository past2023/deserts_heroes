# Time-rift enemy specifications

All dimensions are logical Canvas pixels at the 960×540 gameplay resolution. Future PNG replacements should face right, use transparent RGBA, and retain the listed visual boxes and centered pivots.

## Rift Scout

- Visual size: **48×26 px** including side emitters
- Core body: 36×26 px
- Collision envelope: approximately 48×40 px
- Health: 2
- Role: fast, lightweight patrol drone
- Silhouette: violet rectangular hull, magenta cockpit, cyan side thrusters
- Future animation: 4 idle/hover frames at 8 fps; 2 hit frames; 6 destruction frames

## Phase Orb

- Visual size: **30×30 px**
- Collision envelope: approximately 40×40 px
- Health: 3
- Role: compact alien energy organism or autonomous dimensional probe
- Silhouette: additive pink sphere with white energy core
- Future animation: 6 pulsing frames at 10 fps; 3 phase-shift frames; 8 burst frames

## Orbital Sentry

- Visual size: **30×42 px**
- Collision envelope: approximately 40×50 px
- Health: 4
- Role: durable mechanical guard stationed around scientific relic routes
- Silhouette: steel vertical chassis, red sensor band, lower stabilizer
- Future animation: 4 hover frames at 6 fps; 4 firing frames; 2 hit frames; 8 destruction frames

## Art direction

These enemies represent the first time-rift faction: a mixture of abandoned machines and dimensional life. Their cyan, violet, and magenta effects contrast with the warm desert faction while remaining readable against the dark starfield.

## Supplied production PNGs now active

- `Rift_Scout.png`: 48×26, rendered 1:1 with cyan silhouette glow.
- `Phase_Orb.png`: 30×30, rendered 1:1 with a pulsing magenta energy halo.
- `Orbital_Sentry.png`: 30×42, rendered 1:1 with cyan machinery glow.
- `enemies_ship01.png`: 458×160 source, used as a distant decorative interceptor.
- `enemies_ship02.png`: 472×226 source, used as a distant decorative dimensional ship.

The two large ships are non-interactive parallax decorations. They replace the earlier procedural background craft, move at independent depths, and cannot collide with or be damaged by the player.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, critical black smog for both ally tanks, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a brighter final boss jackpot.
