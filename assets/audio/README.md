# Authored music tracks

Place the three MP3 files in this folder using these exact case-sensitive names:

- `Star_Map_Overture.mp3` — cinematic intro, main menu, character selection, and galactic map
- `Sandbyte_Ambush.mp3` — Desert Level 1, including its combat sections
- `Star_Map01.mp3` — orbital time-rift bonus level

The files are optional. If a file is missing or fails to decode, the existing procedural WebAudio soundtrack starts automatically. Browser autoplay rules may delay music until the first key press or pointer interaction.

For the complete campaign, always launch `index.html`. It is a persistent audio shell: the HTML screens run inside one iframe while the soundtrack and WebAudio/SFX engines remain in the top document. This prevents Safari from discarding audio permission during navigation between the intro, menu, map, Level 1, and space level.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).
