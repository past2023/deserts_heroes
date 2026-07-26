# Desert's Heroes — browser run & gun

A *Metal Slug*-style run-and-gun base built with **HTML5 Canvas + vanilla JavaScript**.
There are no dependencies or build step. Level art, sound effects and music are generated in code; the main-player renderer now also accepts direct transparent PNG animation frames with generated-art fallbacks.

## How to run

Open `index.html` to launch the persistent game shell. It hosts the cinematic, menu, galactic map, desert mission, and time-rift level while keeping one soundtrack player alive across HTML-page transitions—important for Safari. Press any key or tap/click to enable browser audio and skip the film. Open `level1.html` directly only for gameplay testing; the complete campaign should start from `index.html`.

The shell supports both `file://` and a local/web server. For reliable Safari behavior and deployment testing, use a server such as `python3 -m http.server 8000` and open `http://localhost:8000/`.

## Main-player PNG art

Runtime character art lives in `assets/characters/juan_p/`, `elena_k/`, and `sergio_h/`. Juan now uses 200×200 and 200×282 high-resolution source cells with 18–20 frame loops; they are normalized once at load time to 100×100 and 100×141 for current gameplay. Elena and Sergio retain their current 100px sets. Portraits use 400×400. Sheets, frame rates, display sizes, sockets, and portraits are configured in `js/character-assets.js`.

Missing frames fall back first to Juan P. and then to the generated prototype player, so partial future art updates do not break the game.

## Controls

| Key               | Action                                          |
| ----------------- | ----------------------------------------------- |
| Arrow keys / WASD | Move                                            |
| Down / S          | Crouch (Down + Jump on platforms: drop through) |
| Up / W            | Aim upward                                      |
| Space / K         | Jump                                            |
| J / Z             | Shoot (auto knife at close range)               |
| L / X             | Shoulder launcher: guided missile upgrade, then grenades (tank cannon while riding) |
| Enter             | Start / confirm                                 |
| Esc / P           | Pause (Esc also closes Settings)                |
| M                 | Toggle audio                                    |
| F1                | Toggle God Mode (dev)                           |

### Game controllers

Standard Gamepad API controllers are detected automatically in gameplay, menus, the galactic map, and the space level. Left stick/D-pad moves, south face button jumps/confirms, west face button fires, east/left-shoulder uses the secondary weapon, and Options/Menu pauses. On macOS, a genuine DualShock 4, DualSense, Xbox Wireless Controller, or 8BitDo Pro 2 is recommended; inexpensive PlayStation-style clones work only if macOS/Safari exposes them with a standard mapping.

## Gameplay

* **Three playable explorers**: after choosing Arcade or Survival, select from an animated carousel character-select screen inspired by the supplied concept art: compact center pilot panel, previous/next side panels, raised bottom dossier with wrapped name/class/description, pulsing pixel stat bars, and a layered star/meteor background.
* **Mission entrance**: the selected explorer arrives in a short in-engine cinematic on the supplied PNG rocket surfboard with animated twin reactors while a huge enemy ship rises vertically from the dunes with motor vibration, reactor glow, smoke and falling sand; the rider jumps to the ground as the board accelerates away.
* **Language-neutral loading screens**: mission, tutorial, map, and rift loading overlays use a simple retro pixel loading bar without visible glyph text instead of English status text.
* **Two modes**: *Arcade Mission* (single extended mission ~26,000px with final boss) and *Survival* (endless waves in an arena, separate high score). Mode selected from menu with Up/Down.
* **Enemies**: rifle soldiers, grenadiers, melee attackers, elite bazooka troops, sandbag turrets, helicopters, and tanks.
* **Mini-boss**: Gunship helicopter with HP bar, bullet spreads, and bombing runs.
* **Final boss**: An original armored fortress with arc cannon, machine gun, and infantry reinforcements. It enrages below 35% HP.
* **Chain combo**: close-range kills increase score multiplier (up to x3). Chain breaks if hit.
* **POWs**: rescue bound prisoners for points and weapon crates. Prisoners show 2 hands down while tied, 1 hand raised when liberated (fixed 3-arm bug).
* **Weapons**: Pistol (infinite), Heavy Machine Gun (H), Spread (S), Rocket (R), Flame Shot (F), plus a shoulder-mounted secondary launcher. The launcher fires grenades from the weapon beside the player's head. A cyan **T** upgrade loads 10 target-seeking guided missiles; after the tenth missile it automatically returns to the normal grenade stock.
* **Rideable allied assault tank**: the supplied PNG tank set is active for idle, movement, firing, cannon recoil, jump suspension, hit, critical damage and destruction. Normal Fire uses a lower cyan laser with limited ground-target angle correction; Up+Fire remains anti-air and Secondary fires the shell. Ally tanks now emit wheel/chain dust to feel grounded and black smog when critical; Ally Tank 02 also smokes from top-left exhaust pipes and fires from the drill-tip reference point.
* **Destructibles**: wooden crates (loot: weapons, grenades, points) and red explosive barrels that chain-react and damage everyone — bait enemies near them.
* **Boss phase 2**: below 60% HP the fortress loses its armor plating and starts telegraphed mortar rains (watch the blinking ground markers).
* **Lives**: 3 lives with respawn and temporary invincibility. On a fatal hit, the supplied eight-frame death sequence plays with a compact suit explosion; the collapsed body remains while the spirit rises into a procedural light beam before respawn. Bonus score for remaining lives at the end of the mission. High scores are saved in `localStorage`.
* **Desert scenery**: the corrected palm/cactus set, `bigship03.png` 2x ship-platform section after the fixed-world vertical UFO intro, with reference-extracted invisible platforms, enemies, pickups, reactor lights and smoke, and all three exact no-repeat panoramas are active: `sky01.png` (1160×540 at 3%), `mountain01.png` (2156×540 at 18%), and `dune02.png` (6807×576 at 45%/58% render scale).
* **Modular terrain**: three supplied 512×128 desert ground modules are arranged in a deterministic seeded sequence across the 26,000 px mission. Immediate repeats are avoided and the lava cutaway is intentionally rarer.
* **Game feel**: hit-stop, recoil, animated brass casings, multi-lobed procedural muzzle cones, per-weapon gradient tracers, distinct enemy fire families, hard white impact cores, concentric hit rings, long arcade impact rays, restrained explosion screen flashes, layered smoke/fire, non-parallax flame/smoke/bubble lava pits, pixel-art casino coin awards for destroyed helicopters/vehicles/boss, with mid-fight boss drops and a brighter final jackpot, guided-missile exhaust and lock indicators, screen shake, jump buffering + coyote time, and two full procedural music identities. All combat FX are generated internally with Canvas and WebAudio.
* **Discrete HUD**: compact portrait, weapon, and secondary chips occupy only the top corners; score is a tiny lower-left strip and boss health appears only during the fight. Low-opacity fills, thin weapon-colored edges, small corner marks, and segmented bars preserve the desert view.

## Settings panel

Reach it from the main menu (third entry) or from the in-game pause menu (Esc → SETTINGS). It includes:

* **Language** — English, Spanish, or French. Only the selected language is rendered throughout menus, HUD, mission messages, pickups, pause screens, and settings. The selection is persisted as `dh_language`.
* **Audio** — Master / SFX / Music sliders (hold Left/Right), Mute and Music On toggles. A rhythmic desert-action track is used during normal gameplay and a separate faster, darker track is activated only for the final boss. Expanded procedural cues cover footsteps, brass impacts, hit confirmation, enemy weapon families, missile lock, ammo depletion, boss phase changes, and the full rocket-board entrance. Volumes are persisted in `localStorage` (`ma_audio`).
* **Commands** — every gameplay action (Move, Jump, Fire, Grenade, …) has two rebindable slots. Enter to bind slot 1, Tab for slot 2, Backspace clears slot 2, Esc cancels the capture. Reset button restores defaults. Bindings persisted as `ma_bindings`.
* **Gameplay** — God Mode toggle (also F1 in-game) for development testing: the player and allied tank take no damage; a small `GOD` badge appears in the bottom-right of the HUD when active.

## Code structure

```
index.html             — standalone two-slide cinematic entry point
level1.html            — complete Level 1 game and script loader
js/intro-cinematic.js  — parallax slides, film text, ship motion, skip/redirect
js/content.js           — language-neutral title and gameplay metadata
js/i18n.js              — all GUI text in English, Spanish, and French
js/characters.js        — Juan, Elena and Sergio gameplay profiles
js/character-assets.js  — three-character sheets, portraits and sockets
js/vehicle-assets.js    — allied/enemy vehicle animation manifests and sockets
js/audio.js             — WebAudio synthesis with separate master / sfx / music buses
js/input.js             — keyboard handling, rebindable bindings, key capture
js/settings.js          — settings overlay (audio, commands, gameplay)
js/sprites.js           — PNG loading + generated pixel art + rectangle-based vehicles
js/combat-fx.js         — procedural muzzle, tracer, flame, rocket, and enemy-fire renderer
js/level.js             — terrain, platforms, parallax scenery, spawn table
js/entities.js          — player, enemy AI, bosses, bullets, explosions, POW, pickups
js/game.js              — fixed timestep loop (60 Hz), states, camera, HUD, menus
assets/intro/README.md — exact cinematic layer and spaceship PNG sizes
assets/characters/README.md — active three-character PNG sets and portraits
assets/player/README.md — legacy Juan source-art handoff notes
assets/vehicles/README.md — active tank sheets, states, sockets and behavior
assets/scenery/README.md — vegetation and exact parallax layer specifications
assets/terrain/README.md — active 512×128 modular ground system and seam contract
docs/phase-2-foundation.md — engine review and next-phase plan
docs/secondary-launcher-and-fx.md — guided launcher and procedural FX design
docs/death-sequence.md — death-sheet timing, ascent FX and audio
docs/localization-and-fire-fx.md — languages and procedural fire renderer
docs/intro-audio-and-discrete-hud.md — mission entrance, two-track music and compact HUD
docs/character-roster-design.md — gameplay balance and selection flow
docs/character-bios-and-file-names.md — final bios, localization and filenames
docs/external-assets-production-index.md — master index for external PNG production
docs/external-assets-vehicles.md — complete vehicle art specification
docs/external-assets-decorations-and-items.md — backgrounds, decorations, props and pickups
docs/external-assets-enemies.md — complete infantry enemy art specification
docs/external-assets-fx-projectiles-ui-and-intro.md — surfboard, projectiles, FX and UI conversion specs
```

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-25).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, more realistic oily black critical smog for both ally tanks, left-end reactor flame/smog and additional crash-smoke damage on BigShip03 with incorrect right-side glow lights removed, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a brighter final boss jackpot.
