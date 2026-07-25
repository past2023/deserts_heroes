# Vehicle PNG assets

## Allied assault tank — active

The supplied allied tank has replaced the generated rectangle-based player vehicle.

Source contract:

```text
Frame size: 180 × 120
Direction: faces right
World anchor: bottom-center
Damageable body hitbox: 140 × 82
```

Imported sheets:

| State | Sheet dimensions | Frames | Playback |
|---|---:|---:|---:|
| Idle | 720 × 120 | 4 | 4 fps loop |
| Move | 1440 × 120 | 8 | 12 fps loop |
| Machine-gun fire | 720 × 120 | 4 | 14 fps loop while firing |
| Cannon fire | 1080 × 120 | 6 | 12 fps once |
| Jump/suspension | 720 × 120 | 4 | physics-selected frames |
| Hit | 360 × 120 | 2 | 16 fps once |
| Damage | 720 × 120 | 4 | 4 fps loop at critical armor |
| Destroy | 1800 × 120 | 10 | 12 fps once |

Runtime sockets, measured from the bottom-center pivot for right-facing art:

```text
Top machine gun: (+31, -94)
Main cannon:     (+88, -68)
Rear exhaust:    (-85, -47)
```

Socket X offsets mirror automatically when the tank faces left.

Gameplay integration:

- Native 180 × 120 nearest-neighbour rendering
- Larger mount/contact range matching the new silhouette
- Larger bullet-blocking armor hitbox
- Wider infantry-crush region
- Updated camera-boundary margins
- Authored idle, movement, firing, hit, damage and jump states
- Immediate emergency pilot ejection at zero armor
- Complete 10-frame destruction before entity removal
- Staged internal sparks, smoke and explosions during destruction
- Generated prototype tank retained only as a load-failure fallback

Primary fire is contextual without adding another key:

- Normal Fire launches a rapid cyan coaxial laser from the lower main-cannon socket. It receives limited downward ground-target assistance (maximum about 18°) so it can hit soldiers, turrets and small tanks.
- Up+Fire uses a roof-level vertical muzzle for anti-air fire.
- Secondary continues launching the explosive shell from the main cannon.
- Down+Jump still ejects the player.

The ground-target correction is intentionally limited and is not homing: it only selects a firing angle when a valid ground enemy is already in front of the tank.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, critical black smog for both ally tanks, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a brighter final boss jackpot.
