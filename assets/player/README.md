# Legacy Juan P. source-art directory

The original `player_*.png` files are retained here as source/history. Runtime character loading now uses the renamed copies in `assets/characters/juan_p/` through `js/character-assets.js`, alongside Elena K. and Sergio H.

## Imported files

| File | Layout | Gameplay state |
|---|---:|---|
| `player_idle_animation.png` | 200 × 100, two 100 × 100 frames | Animated idle |
| `player_run.png` | 400 × 100, four 100 × 100 frames | Run |
| `player_jump.png` | 100 × 100 | Jump |
| `player_crouch.png` | 100 × 100 | Crouch |
| `player_idle.png` | 100 × 100 | Static reference body |
| `player_death_animation.png` | 800 × 100, eight 100 × 100 frames | Impact, collapse and spirit ascent |
| `player_idle_aimup.png` | 100 × 123 | Idle and aim upward |
| `player_run_aimup.png` | 400 × 123, four 100 × 123 frames | Run and aim upward |
| `player_jump_aimup.png` | 100 × 123 | Jump and aim upward |

The sheet definitions, frame rates, source dimensions and gameplay attachment points are configured in `js/character-assets.js`.

## Runtime behavior

- Every frame uses its transparent RGBA pixels directly.
- Art faces right and is mirrored by Canvas when the player faces left.
- Frames are anchored at bottom-center, keeping the feet on the gameplay baseline.
- Normal poses render at their native 100 × 100 size.
- Sky-aim poses render at their native 100 × 123 size without moving the feet.
- Multi-frame PNGs are sliced in memory when loaded; no extra frame files are generated.
- White damage flashes are generated from the PNG alpha mask in memory.
- Visual size does not alter the existing 24 × 54 gameplay hitbox.
- If an image fails to load, that state safely uses the original generated Canvas player.

## Attachment points

The manifest defines `sockets.muzzle`, `sockets.launcher`, and `sockets.melee` for every combat pose. The launcher socket is calibrated to the second weapon beside the character's head. Socket coordinates are offsets from the feet/pivot:

- Positive `x` points right in the source art and mirrors automatically when facing left.
- Negative `y` moves upward from the ground.
- Upward-aim muzzle sockets are calibrated separately for the 123 px frames.

These values can be fine-tuned in `js/character-assets.js` after gameplay review without editing entity or weapon code.

## Future player art

The engine still needs dedicated art for the following optional improvements:

- knife attack;
- grenade throw;
- non-fatal hurt reaction;
- landing transition;
- enter/exit vehicle;
- victory animation;
- weapon-specific firing poses.

The death sheet uses authored non-uniform timing: impact frames advance quickly, the collapsed frame holds, and spirit frames 5–7 rise independently while the body remains on the ground.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, more realistic oily black critical smog for both ally tanks, left-end reactor flame/smog and additional crash-smoke damage on BigShip03 with incorrect right-side glow lights removed, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a brighter final boss jackpot.
