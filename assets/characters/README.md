# Playable character assets

Three character sets are active:

- `juan_p` — balanced Desert Vanguard
- `elena_k` — agile Star Scout
- `sergio_h` — armored Iron Nomad

Each directory contains eight gameplay sheets and one 400×400 selection portrait. The supplied portrait named `elena_j_portrait.png` was imported under the correct final character ID as `elena_k_portrait.png`.

## Juan P. high-resolution source set

Juan’s new animation is authored with 200 px-wide cells and many more frames. It is normalized once at load time to the current gameplay size, preserving the option to render at native 200 px in a future higher-resolution mode.

| State | Source sheet | Cells | Current render cell | FPS |
|---|---:|---:|---:|---:|
| Idle | 3600×200 | 18 × 200×200 | 100×100 | 10 |
| Run | 4000×200 | 20 × 200×200 | 100×100 | **30** |
| Jump | 200×200 | 1 | 100×100 | event frame |
| Crouch | 200×200 | 1 | 100×100 | static |
| Idle aim-up | 200×282 | 1 | 100×141 | static |
| Run aim-up | 4000×282 | 20 × 200×282 | 100×141 | **30** |
| Jump aim-up | 200×282 | 1 | 100×141 | event frame |
| Death/heaven | 2600×200 | 13 × 200×200 | 100×100 | 8 |

Juan’s revised 13-frame death sheet uses frames 0–9 for collapse and spirit formation over the body, then frames 10–12 for the separated spirit. The engine holds a faded body on the ground and carries the final spirit frames upward into heaven with halo, particles and light.

Juan’s 20-frame run and run-aim-up loops play at 30 FPS, giving a 0.67-second full cycle instead of the previous 2-second cycle at 10 FPS. Footstep sounds are synchronized to detailed contact frames 0 and 10. This removes the ground-sliding appearance without changing movement speed.

Juan’s gameplay-space sockets were recalibrated after the 50% normalization. Source frames remain untouched on disk; cached right/left/white-flash frames are generated at the smaller gameplay size to avoid unnecessary memory use.

## Elena K. and Sergio H. current sets

```text
{id}_idle_animation.png   200×100, 2 cells
{id}_run.png              400×100, 4 cells
{id}_jump.png             100×100
{id}_crouch.png           100×100
{id}_idle_aimup.png       100×123
{id}_run_aimup.png        400×123, 4 cells
{id}_jump_aimup.png       100×123
{id}_death_animation.png  800×100, 8 cells
{id}_portrait.png         400×400
```

Elena and Sergio remain at the original gameplay resolution until their future high-resolution animation sets are ready.

## Shared runtime rules

All characters use:

- bottom-center anchor;
- 24×54 collision hitbox;
- same weapons and vehicle controls;
- state-specific muzzle, launcher and melee sockets;
- generated muzzle flashes, projectiles, impacts and shadows;
- selection portraits and localized bios.

Missing character frames fall back first to Juan’s corresponding state and then to the generated prototype.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, critical black smog for both ally tanks, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a large final boss jackpot.
