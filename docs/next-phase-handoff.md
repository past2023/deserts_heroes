# Next-phase handoff

Updated: 2026-07-25

Start future chats by reading, in order:

1. `README.md`
2. `docs/current-runtime-status.md`
3. `docs/world-story-bible.md`
4. `docs/entity-modularization.md`
5. this handoff

## Current priorities

1. Do a full in-browser visual QA pass for Level 1 opening ships, BigShip03 platform readability, non-parallax lava, critical tank smog, and tutorial malfunction FX.
2. Convert remaining fallback enemies and props to authored modular PNGs.
3. Add data-driven dialogue triggers and character-specific hero lines.
4. Separate the 26,000-pixel mission encounter table into authored sectors.
5. Add automated collision and campaign-flow tests.
6. Profile long-session particle and image memory in Safari.
7. Define Mission 02 gameplay, local civilization, boss ideology and visual palette using the story bible.

## Narrative implementation state

- A coherent Scientific Frontier Corps versus Atavist Dominion story bible exists.
- A fixed procedural story-text cinematic slide follows the credit slide.
- Localized portrait dialogue is active at Level 1 milestones and enemy taunts can appear when the player or ally tank is hit.
- Player, enemy transmissions and boss arrival lines are queued and non-blocking.
- All future dialogue must preserve the rule that the Corps protects local agency rather than imposing culture.

## Latest implementation notes

- Character select is a carousel in `js/game.js`; keep text inside the bottom dossier at 960×540.
- Tutorial platforms come from white reference rectangles in `assets/tutorial/*_refe.png`.
- Tutorial foreground uses `pilar01.png` seams and `pilar02.png` center accents with smoke/electric crawls; `tutorial_foreground01.png` is not drawn.
- Tutorial screens use fast malfunctioning CRT-style FX and two normal Soldier06 observers spawn at different heights, use stronger tank-piercing red lasers, and can be destroyed by the player. Tutorial pickups now reward upper-platform exploration.
- Ally Tank 02 laser origin is tuned in `js/entities.js` to the visible drill tip; both ally tanks use wheel/chain dust and both emit black smog in critical mode. Tank02 has top-left exhaust smoke.
- Level 1 includes the rising `enemy_ship01` vista on a very distant parallax plane and a farther daylight 2x `bigship03.png` ship/platform section in the palm/cactus layer; platforms come from `bigship03_refe.png` and include enemies/pickups only on ship decks. Lava gaps use the new non-parallax fire/smoke/bubble animation and platform routes hold more rewards than the ground.
- Loading pages use a simple retro pixel loading bar without visible glyph text instead of English status labels.

## Technical cautions

- Launch through `index.html` to preserve Safari audio activation.
- Keep `file://` fallbacks where practical, but test primary behavior through HTTP.
- Preserve fixed-step simulation and nearest-neighbor rendering.
- Do not reintroduce large per-frame array allocations.
- Keep authored PNG fallbacks until modular replacements are validated.
- Update `docs/current-runtime-status.md` and this handoff after every major phase.
