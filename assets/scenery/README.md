# Desert scenery PNG assets

## Active modular parallax stack

Level 1 now renders this background stack:

1. Procedural vertical sky gradient using `sky01_color.png` as its color reference
2. Repeating transparent `clouds01.png` module at 7% parallax with slow drift
3. Repeating transparent `mountain01.png` module at 18% parallax
4. Repeating transparent `dune02.png` module at 45% parallax and 58% scale
5. Seeded palm/cactus vegetation at full camera speed
6. Modular gameplay ground and platforms

The background coverage is no longer calculated from one level-specific panorama. Mountains and dunes repeat for any level width, allowing `Level.W` to be changed without producing an empty background.

## Day-to-night progression

The sky is generated every frame from six gradient stops sampled from `sky01_color.png`. The colors blend toward a dark blue-violet night palette according to normalized mission progress.

- Four rapid transitions occur near 18%, 40%, 62%, and 84% mission progress.
- The sequence is day → night → day → night → day.
- Each blend occupies only 2.4% of the normalized mission, creating a dramatic but smooth change.
- A restrained moon glow appears during both night intervals.
- Clouds, mountains and dunes receive a shared blue atmospheric grade so they remain visually unified.

Progress uses the camera focus position divided by `Level.W`; therefore the transition timing automatically adapts when the level becomes longer or shorter.

## Modular source assets

### Clouds — `clouds01.png`

- Source size: **362 × 173 px**
- Transparent repeat module
- Native logical scale
- Parallax: **0.07** plus slow time-based drift
- Rendered between the procedural sky and mountains

### Mountains — `mountain01.png`

- Source size: **1080 × 540 px**
- Transparent seamless module
- Native logical scale
- Parallax: **0.18**

### Dunes — `dune02.png`

- Source size: **1704 × 576 px**
- Transparent seamless module
- Render scale: **0.58**
- Display tile width: approximately **988 px**
- Parallax: **0.45**

Long legacy panorama variants remain in the directory as source/reference material but are no longer required by the active renderer.

## Vegetation

The previous palm and cactus set has been removed. Active transparent assets are now:

- `deco_cactus01.png` through `deco_cactus11.png`
- `deco_palm001.png` through `deco_palm004.png`
- `deco001.png` and `deco002.png`

Every decoration renders at its exact native source dimensions with no random scaling. Placement, mirroring, opacity and contact shadows remain deterministic across the mission.

## Runtime metadata

```javascript
Level.skySpec       // procedural/color-reference metadata
Level.mountainSpec  // modular mountain metadata
Level.duneSpec      // modular dune metadata
Level.nightAmount(cameraX, viewportWidth)
```

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).
