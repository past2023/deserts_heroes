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
