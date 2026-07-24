# Next-phase handoff

Updated: 2026-07-23

Start future chats by reading, in order:

1. `README.md`
2. `docs/current-runtime-status.md`
3. `docs/world-story-bible.md`
4. `docs/entity-modularization.md`
5. this handoff

## Current priorities

1. Build the complete interactive tutorial behind `tutorial.html`.
2. Convert remaining fallback enemies and props to authored modular PNGs.
3. Add data-driven dialogue triggers and character-specific hero lines.
4. Separate the 26,000-pixel mission encounter table into authored sectors.
5. Add automated collision and campaign-flow tests.
6. Profile long-session particle and image memory in Safari.
7. Define Mission 02 gameplay, local civilization, boss ideology and visual palette using the story bible.

## Narrative implementation state

- A coherent Scientific Frontier Corps versus Atavist Dominion story bible exists.
- A fixed procedural story-text cinematic slide follows the credit slide.
- Localized portrait dialogue is active at Level 1 milestones.
- Player, enemy transmissions and boss arrival lines are queued and non-blocking.
- All future dialogue must preserve the rule that the Corps protects local agency rather than imposing culture.

## Technical cautions

- Launch through `index.html` to preserve Safari audio activation.
- Keep `file://` fallbacks where practical, but test primary behavior through HTTP.
- Preserve fixed-step simulation and nearest-neighbor rendering.
- Do not reintroduce large per-frame array allocations.
- Keep authored PNG fallbacks until modular replacements are validated.
- Update `docs/current-runtime-status.md` and this handoff after every major phase.
