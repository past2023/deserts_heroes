# Desert ground modules

Three external 512×128 ground modules are active:

```text
ground_desert_01.png
ground_desert_02.png
ground_desert_03.png
```

Runtime contract:

```text
Module size: 512×128
World top/collision: module Y 0 = world Y 470
World width: 7600
Required modules: 15, plus one safety module
Camera speed: 1.0
Filtering: nearest-neighbour
```

The module sequence is generated once from a fixed seed and remains identical for every run. Immediate repeats are avoided. The lava-cutaway module (`ground_desert_02`) has lower selection weight and cannot appear twice consecutively.

The old rectangle ground texture and small generated rock/grass/skull decorations remain only as a loading fallback. They are hidden when all three PNG modules are available.

## Edge validation

All modules have valid opaque 512×128 canvases. `ground_desert_02` and `ground_desert_03` have exactly matching outer edge columns. `ground_desert_01` differs slightly at its outer edge colors (about 2.5 average RGB levels against the other modules), so it is visually close but not mathematically identical.

If a one-pixel seam becomes visible during gameplay, copy a common 2–4 px seam strip to both edges of all three source files. Do not resize or blur the modules.

## Art rules for future modules

```text
ground_desert_04.png
ground_desert_05.png
```

- Preserve 512×128 dimensions.
- Keep the top collision surface at Y 0.
- Match the shared left/right edge colors and structure.
- Do not change collision height based on painted rocks or lava.
- Avoid unique objects crossing module boundaries.
- Keep major interactive hazards as separate entities, not painted-only ground details.
- Use a shared upper metal/sand lip so all combinations remain readable.

The sequence metadata is exposed as `Level.groundSpec`.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes: Ally Tank 01 critical smoke 2x larger and denser, BigShip03 right-end reactors correctly positioned, yellow coins replaced by 2D pixel-art blue diamonds (particles and HUD score icon), portal level updated with normal weapon shooting/upward aim and 2x larger enemy hitboxes, and big boss tank chat portrait.
