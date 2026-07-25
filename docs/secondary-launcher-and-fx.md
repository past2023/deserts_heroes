# Shoulder launcher, guided upgrade and procedural FX

## Player secondary weapon

The L/X action now fires from the launcher visible beside the player's head instead of creating a grenade near the player's hand.

The player-art manifest has an independent `launcher` socket for:

- idle and horizontal run;
- jump;
- crouch;
- idle/run/jump while aiming upward.

Normal poses launch forward on a ballistic arc. Holding Up uses the 123 px sky-aim artwork and launches vertically from the left vertical shoulder barrel. Socket coordinates mirror automatically when facing left.

## Guided-missile upgrade

The cyan `T` pickup loads exactly 10 guided missiles into the shoulder launcher.

- Guided missiles have priority over grenades.
- Each L/X press consumes one missile.
- A missile continuously chooses or reacquires the best valid enemy or boss target.
- Guidance prefers targets in its forward hemisphere but can perform a visible U-turn.
- Speed increases during flight and steering is turn-rate-limited, avoiding instant snapping.
- Missiles include a cyan engine bloom, smoke/exhaust trail and target-lock ring.
- After missile 10, L/X automatically returns to the player's existing grenade stock.
- Recollecting a `T` pickup reloads the guided stock to 10.
- The upgrade persists through a normal life respawn.

### Availability

- Arcade Mission: one guaranteed pickup is spawned from the progressive encounter table at world X 3230. It does not expire before collection.
- Survival: a guaranteed pickup appears at wave 3.
- It can also appear as a less-common destructible-crate or POW reward and in survival reward pools.

## HUD

While guided missiles are loaded, the secondary HUD displays `GUIDED x N` in cyan and also shows the grenade reserve. At zero guided missiles, the HUD automatically switches back to `GRENADE x N`.

## Canvas FX pass

The internal renderer now supports typed procedural particles:

- directional spark streaks;
- additive weapon glows;
- expanding shock rings;
- layered translucent smoke;
- embers;
- rotating explosion debris;
- radial explosion flashes.

Weapon presentation was separated by type:

- pistol: compact white/yellow impulse and bright tracer;
- heavy machine gun: long hot tracer and tight repeated muzzle flash;
- spread: wider cool-white blast and brighter pellets;
- rocket: fins, engine bloom, update-driven smoke and exhaust sparks;
- flame: layered additive flame body and trailing embers;
- grenade launcher: pressure ring, directional muzzle sparks, smoke and rotating projectile;
- guided missile: cyan launch flash, engine bloom, steering trail and target indicator;
- enemy rounds: red additive glow with a hot center.

Particle simulation remains capped to protect browser performance during large explosions.

## Procedural audio pass

WebAudio remains asset-free. Weapon sounds now combine multiple synthesized layers instead of a single oscillator/noise burst. Added dedicated sounds for:

- grenade launcher;
- guided-missile launch;
- guided upgrade ready/lock confirmation.

A reusable two-second noise buffer removes repeated noise-buffer allocations. A gentle dynamics compressor now controls overlapping automatic fire and explosions without hard clipping.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, more realistic oily black critical smog for both ally tanks, left-end reactor flame/smog and additional crash-smoke damage on BigShip03 with incorrect right-side glow lights removed, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a brighter final boss jackpot.
