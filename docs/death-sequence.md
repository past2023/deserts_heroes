# Player death and ascent sequence

## Source artwork

`assets/player/player_death_animation.png` is an 800 × 100 transparent horizontal sheet containing eight 100 × 100 frames.

- Frames 0–3: fatal impact and collapse.
- Frame 4: body lying on the ground.
- Frames 5–7: increasingly luminous spirit poses.

The sheet is sliced directly in Canvas through the `dead` state in `js/character-assets.js`.

## Authored timing

The sequence deliberately does not use a uniform looping animation:

| Time | Presentation |
|---:|---|
| 0.00–0.16 s | Frame 0 and compact suit explosion |
| 0.16–0.33 s | Frame 1 |
| 0.33–0.52 s | Frame 2 |
| 0.52–0.73 s | Frame 3 |
| 0.73–1.12 s | Frame 4 held on the ground |
| 1.12–2.85 s | Body remains while spirit frames 5–7 ascend |
| 2.85 s | Life is consumed and normal respawn begins |

If the player dies in the air or on a raised platform, normal gravity settles the death position while the authored pose progression continues.

## Internal visual effects

The initial fatal impact creates a cosmetic, non-damaging suit explosion:

- radial flash;
- compact pressure ring;
- orange/white directional sparks;
- small rotating armor fragments;
- layered smoke;
- short screen shake.

At the spirit transition, the renderer adds:

- two expanding ascension rings;
- cyan-white central glow;
- a vertical procedural light beam;
- a floating gold halo;
- rising four-point light particles;
- a slightly swaying, accelerating ascent path;
- final fade as the spirit leaves the top of the viewport.

The body continues displaying frame 4 beneath the spirit and fades partially instead of disappearing immediately.

## Internal audio

The sequence uses two new WebAudio cues:

- `deathBurst`: layered filtered noise, a low suit-impact body and a short metallic transient;
- `heavenRise`: an ascending sine sequence, sustained high tone and a quiet filtered-air layer.

No external image effects, audio files or dependencies are used.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).
