# Desert's Heroes — three-character roster design

## Recommended direction

Do not give both new characters the same slow/two-hit behavior. That would create two nearly identical choices and make the original one-hit hero feel objectively weak.

Use three clear gameplay roles instead:

| Working role | Main strength | Main weakness | Intended player |
|---|---|---|---|
| Juan P. — Desert Vanguard | Balanced movement and full weapon capacity | One hit per life | Standard run |
| Elena K. — Star Scout | Fastest movement and highest jump | One hit and lower special-ammo capacity | Skilled/aggressive run |
| Sergio H. — Iron Nomad | Two armor points per life | Slowest movement and lowest jump | Defensive/beginner run |

These are the final display names and role identities.

## Proposed exact statistics

| Stat | Juan P. | Elena K. | Sergio H. |
|---|---:|---:|---:|
| Horizontal speed | **270** | **310** | **225** |
| Jump impulse | **-780** | **-840** | **-700** |
| Armor/hits per life | **1** | **1** | **2** |
| Grenades at start | **10** | **8** | **10** |
| Special-weapon ammo multiplier | **1.00** | **0.85** | **1.00** |
| Coyote time | **0.09 s** | **0.12 s** | **0.08 s** |
| Jump input buffer | **0.12 s** | **0.14 s** | **0.11 s** |
| Knockback | Normal | Light | Reduced |
| Gameplay label | BALANCED | AGILE | ARMORED |

### Resulting special-ammo examples

| Weapon | Original | Female Scout | Heavy |
|---|---:|---:|---:|
| Heavy machine gun | 200 | 170 | 200 |
| Spread | 30 | 25 | 30 |
| Rocket | 25 | 21 | 25 |
| Flame | 90 | 76 | 90 |

All characters still use exactly the same weapon pickups, fire buttons, projectile behavior, guided missiles, grenades, knife system and allied tank.

## Why this is better

### Juan P. remains the balanced standard

The existing character keeps the current movement and difficulty. Full weapon capacity makes this the best choice for sustained firepower without changing the familiar gameplay.

### Elena K. is the high-mobility option

The female character should not simply be another slow armored option. The Scout role creates a visually and mechanically distinct choice:

- reaches platforms more easily;
- crosses danger zones faster;
- has slightly more forgiving jump timing;
- remains vulnerable to one fatal hit;
- carries fewer rounds from special-weapon pickups.

This creates a high-mobility, high-risk style without needing double-jump or new animation states.

### Sergio H. supports defensive play

The Heavy can survive one non-fatal hit before death, but slower movement and a lower jump make projectiles and platform routes harder to avoid.

On the first hit:

- armor changes from 2 to 1;
- the character does not enter the death animation;
- a short armor-break flash, sparks and sound play;
- approximately 0.9 seconds of invulnerability begins;
- the combo chain breaks;
- the HUD armor pip changes state.

The second hit plays the normal death/heaven sequence. Armor returns to 2 after respawn.

## Character-select flow

Recommended state flow:

```text
Main Menu
  → select Arcade or Survival
  → Character Select
  → short rocket-board entrance
  → gameplay
```

Character-select controls:

```text
Left / Right: choose character
Enter / Fire: confirm
Escape: return to mode menu
```

The screen should show three compact cards:

1. animated idle preview;
2. character name;
3. role label;
4. Speed, Jump, Armor and Ammo bars;
5. one-line passive description;
6. currently selected card with a bright animated outline.

The selected character should be stored in:

```text
localStorage key: dh_character
```

The last selected character can be preselected next time, but confirmation should still be required before starting a run.

## Score and leaderboard fairness

Because Heavy is more forgiving and Scout moves through the level faster, use separate high scores per mode and character:

```text
Arcade + Original
Arcade + Scout
Arcade + Heavy
Survival + Original
Survival + Scout
Survival + Heavy
```

This is clearer than hidden score multipliers and lets every character have a fair leaderboard.

## PNG requirements for both new characters

Use exactly the same frame canvases, sheet layouts, direction and anchor as the existing player. The person inside the canvas changes; the technical contract does not.

| State | Required PNG size | Frames |
|---|---:|---:|
| Idle animation | **200 × 100** | 2 × 100×100 |
| Run | **400 × 100** | 4 × 100×100 |
| Jump | **100 × 100** | 1 |
| Crouch | **100 × 100** | 1 |
| Idle aim-up | **100 × 123** | 1 |
| Run aim-up | **400 × 123** | 4 × 100×123 |
| Jump aim-up | **100 × 123** | 1 |
| Death/heaven | **800 × 100** | 8 × 100×100 |

Recommended filename pattern:

```text
elena_k_idle_animation.png
elena_k_run.png
elena_k_jump.png
elena_k_crouch.png
elena_k_idle_aimup.png
elena_k_run_aimup.png
elena_k_jump_aimup.png
elena_k_death_animation.png

sergio_h_idle_animation.png
sergio_h_run.png
sergio_h_jump.png
sergio_h_crouch.png
sergio_h_idle_aimup.png
sergio_h_run_aimup.png
sergio_h_jump_aimup.png
sergio_h_death_animation.png
```

## Art alignment rules

- Every frame faces right.
- Feet remain at bottom-center.
- Normal frames remain 100×100.
- Aim-up frames remain 100×123.
- Transparent RGBA or valid indexed transparency.
- No anti-aliasing or white matte.
- Keep muzzle, launcher and melee locations visually close to the current character sockets.
- Do not bake muzzle flashes, bullets, explosions, shadows or hit effects into the PNG.
- Heavy may look wider, but the gameplay hitbox should remain 24×54 for fairness.
- Scout may look slimmer, but should use the same gameplay hitbox.

## Optional later animation

A dedicated non-fatal hurt animation would improve the Heavy character, but it is not required for the first implementation. The engine can initially use white flash, armor sparks, recoil and invulnerability while keeping the normal standing/jump frame.

## Recommended implementation order

1. Approve roles and final names.
2. Add the character-select state and localized text.
3. Refactor player stats into a character-data table.
4. Convert the player PNG manifest into three character sets.
5. Add armor points and non-fatal damage handling.
6. Add separate high scores by character.
7. Import the two new PNG sets.
8. Balance Arcade and Survival with all three characters.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, critical black smog for both ally tanks, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a large final boss jackpot.
