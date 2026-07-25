# Authored music tracks

Place the three MP3 files in this folder using these exact case-sensitive names:

- `Star_Map_Overture.mp3` — cinematic intro, main menu, character selection, and galactic map
- `Sandbyte_Ambush.mp3` — Desert Level 1, including its combat sections
- `Star_Map01.mp3` — orbital time-rift bonus level

The files are optional. If a file is missing or fails to decode, the existing procedural WebAudio soundtrack starts automatically. Browser autoplay rules may delay music until the first key press or pointer interaction.

For the complete campaign, always launch `index.html`. It is a persistent audio shell: the HTML screens run inside one iframe while the soundtrack and WebAudio/SFX engines remain in the top document. This prevents Safari from discarding audio permission during navigation between the intro, menu, map, Level 1, and space level.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, critical black smog for both ally tanks, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a large final boss jackpot.
