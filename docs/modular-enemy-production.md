# Modular enemy production

## Enemy Tank 01

Source canvas: 362×181. Runtime display: approximately 152×76.

- `full.png`: complete fallback/reference
- `chassis.png`: static hull
- `pieces.png`: independent turret and tread/suspension module

Runtime animation applies suspension vibration to the lower module, recoil to the turret, cyan engine glow, white hit silhouette, critical fire/smoke, and modular wreck rendering.

## Burning Robot Soldier 01

Source canvas: 155×232. Runtime display: 62×93.

Layers retain identical canvas dimensions and source-space alignment:

- `legs.png`
- `hands.png`
- `torso.png`
- `head.png`
- `fire.png`
- `full.png` fallback

The engine animates leg motion, torso vibration, arm counter-motion, head movement, flame flicker, orange light, embers, and smoke. Keeping every layer on the same transparent canvas makes registration reliable; pivot metadata should accompany future modular characters for more advanced joint animation.

## Enemy Soldier 02

Source canvas: 200×174. Runtime display: 100×87. This modular ranged unit replaces the grenadier presentation.

- Independent legs, torso, hands, head, and gun
- Walking counter-motion and head tracking
- Gun recoil when attacking
- Every component separates along a different fatal-explosion arc
- Full PNG fallback

## Enemy Soldier 03

Source canvas: 182×103. Runtime display: approximately 100×57. This close-range saw unit replaces the knife attacker presentation.

- Independent chassis, wheel, and saw
- High-speed procedural wheel rotation
- Faster independent saw rotation
- Contact sparks near the blade
- Wheel, chassis, and saw separate during destruction
- Full PNG fallback

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, critical black smog for both ally tanks, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a large final boss jackpot.
