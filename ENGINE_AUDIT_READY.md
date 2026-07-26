# Desert's Heroes — Engine Audit & Next Phase Readiness
**Date:** 2026-07-23 — Saint Petersburg
**Repository:** https://github.com/past2023/Desert_s_Heroes
**Auditor Role:** Technical Director / Lead Gameplay / Architect / QA / Performance

> Prepared after cloning, reading all `js/*.js` (10,268 lines), `docs/*.md`, campaign flow, and asset manifests.

---

## 1. Executive Summary

Desert's Heroes is no longer a prototype. It's a **commercial-grade foundation** for a Metal Slug-tier browser run & gun with:

- Fixed 60Hz loop, 960x540 Canvas2D, nearest-neighbor art, procedural FX fallback
- Persistent audio shell (`index.html` → iframe) solving Safari autoplay + music continuity
- 3 heroes (Juan P / Elena K / Sergio H) with 200px → 100px normalized PNG sheets, 400px portraits, socket system for muzzle/launcher/melee
- Allied tank (180x120 full set) with armor, crush, eject logic
- 5 modular infantry families (soldier01-05 with torso/head/legs/hands/gun/wheel/saw/bunker parts) + 2 heli sizes, 2 tank chassis, 1 fortress boss (4-piece modular)
- 26,000px Mission 01 with modular ground (3x 512x128 desert tiles, seeded no-repeat), moving/fragile platforms, lava gaps (animated currents/ribbons/bubbles), laser walls, mines, POW rescue (2 prisoner sets), props (barrels that chain-react)
- Arcade + Survival modes, combo x3, jetpack 10s, double jump + coyote + jump buffer, hit-stop, screenshake, brass casings, procedural muzzle/tracers
- Galactic Map with 6 locked nodes + tutorial placeholder, transferable save via `sessionStorage` to time-rift orbital level
- Story bible: Scientific Frontier Corps vs Atavist Dominion — theme: *defending a planet's right to build its own future*, not replacing culture. Dialogue via non-overlapping queued portrait transmissions with scanlines/chromatic split.

**Ready for next phase:** YES. Architecture is stable enough to build Tutorial + Mission 02 without rewrite, but next 2 sprints should complete entity modularization and data-driven configs.

---

## 2. Engine Deep Dive

### 2.1 Core Loop (`js/game.js` 1386 loc)
```js
window.G = { state, mode, characterId, camX, score, lives, combo, player, enemies[], pBullets[], ... }
```
- Single global mutable state. Functional for now but is the #1 scalability risk.
- Fixed timestep loop (implied from entities), `hitStop`, `shake`, `hurtFlash`, `screenFlash` for game feel.
- Camera: lerp to player.x - 0.38*VW, locked at Level.W - VW for boss, fixed at 350 for survival.
- Intro mission cinematic: rocket surfboard arrival (boardActive + exhaust particles, depart accel 620 px/s²).
- Portal transition: `sessionStorage dh_portal_return` preserves score/lives/weapon across `portal-level.html`.

### 2.2 Entities (`js/entities.js` 2999 loc — main monolith)
- Player: profile from `Characters.get()` → speed, jumpVelocity, maxArmor, startingGrenades, jumpBuffer. Coyote time + double jump + jetpack.
- Weapons: `pistol(∞)/mg(200)/spread(30)/rocket(25)/flame(90)` + secondary launcher: grenades + homing T upgrade (10 guided missiles, exhaustive tail exhaust + lock indicator).
- Slugs: ally tank logic (3 armor, crush infantry, block light bullets, eject on 0).
- Enemies: AI in same file — patrol, chase, melee, grenade lob, elite bazooka, turret.
- Boss: fortress with 2 phases (<60% loses plating → mortar warnings, <35% enrage arc + MG + reinforcements).

Recent progress per `docs/entity-modularization.md`:
- Extracted `entity-utils` (in-place array compaction vs filter), `entity-score`, `entity-collectibles`, `entity-warnings`, `entity-props`.
- Good: reduces GC pressure in heavy combat. Still needs combat service.

### 2.3 Level (`js/level.js` 1004 loc)
- W=26000, GROUND=470, LOGICAL 960x540.
- Parallax: SKY 3%, MOUNTAIN 18%, DUNE 45% @ 58% scale, modular tiles, not panorama dimensions.
- Scenery: 17 PNGs (cactus01-11, palm001-004, deco001-2, sky/cloud/mountain/dune). Foreground bunkers 50% size, extreme-foreground sand platforms with falling sand particles.
- Platforms: 50+ one-way, baseY/amp/speed/phase, + fragile (breakT 1.45s red bar).
- Hazards: lavaGaps[], energyLasers[] with state.warning/active, mines (proximity).
- Ground module sequence: deterministic seeded, avoid immediate repeat, lava rarer.

### 2.4 Rendering (`js/sprites.js` 993 loc + `combat-fx.js` 463 + `vehicle-assets.js`)
- `makeCanvas(rows,palette,SCALE)` pixel art generator → fallback while PNG art incomplete.
- PNG pipeline: `CharacterAssetConfig` → canvasOfImage(normalize 200→100), flip, whiteOf flash cache, sockets per pose (idle/run/jump/crouch/up variants). Juan high-res 200x200 18-20 frames @ 10/30 fps.
- Combat FX procedural: multi-lobed cones, gradient tracers per weapon, enemy fire families.

### 2.5 Input & Settings (`js/input.js` 170, `js/settings.js` 298, `js/i18n.js` 502)
- Rebindable bindings (2 slots/action), Gamepad API, pause, God Mode (F1 + HUD badge).
- i18n: en/es/fr, persisted `dh_language`, used for all HUD/teleprompter/pickups/tutorial.
- Audio bus: master → sfx/music + compressor (-14 threshold) for punch. Volumes `ma_audio`. Footsteps variant via stepVariant toggle.

### 2.6 Audio (`js/audio.js` 493 + `js/music-tracks.js` 104)
- WebAudio synthesis: tone() + noise() with filter slides. Persistent engine across iframe via `window.parent.SFX`.
- Tracks: authored MP3s (`Sandbyte_Ambush`, `Star_Map01`, `Star_Map_Overture`) routed by MusicTracks, fallback procedural.
- Separate gameplay vs final boss track, cues for brass, hit confirm (throttled 32ms), casingPing (80ms), missile lock.

### 2.7 Campaign Shell (`index.html`, `intro.html`, `galactic-map.html`, `tutorial.html`)
- `index.html` is NOT game — it's persistent audio router + `postMessage` dh-music protocol. Critical for Safari.
- `intro.html` → 5-slide randomized cinematic + fixed credit + story slide 11.5s, TV filter optional, day/night 4x with cratered moon.
- `galactic-map.html`: planet PNGs preserve aspect, rotate, starfield move, galaxy arms pixel blocks, route dots, meteors, energy particles, spacecraft follows selection. Tutorial + Mission 01 selectable, others locked.
- `tutorial.html` CURRENTLY PLACEHOLDER card linking to Level 1.

### 2.8 Story & Dialogue (`docs/world-story-bible.md`, `js/dialogue.js`)
- Canon: Corps = explorer-scientists first, soldiers second. Dominion destroys schools/archives/grids to force Stone Age. Heroes protect agency.
- Mission 01 narrative beats in `game.js` `updateStoryDialogues()`:
  - 420 heroLanding, 3400 enemyArchive, 7200 heroRuins, 11800 heroLava, 19900 heroPortal, 24400 enemyFinal
- Portrait system: 12-expression face sheet per hero, localized name, teleprompter, never pauses sim, queued.

---

## 3. Philosophy Synthesis (from `docs/world-story-bible.md` + `next-step.md`)

**Game Design Philosophy:**
- Prioritize Fun > Game Feel > Responsiveness > Replayability > Visual > Audio > Performance > Maintainability
- Benchmark: Metal Slug, Contra, Gunstar Heroes, Alien Hominid, Broforce, Huntdown, Blazing Chrome
- "Not preserving prototype, evolving to commercial-grade"
- Game feel first: hit-stop, recoil, screenshake, impact cores, hit rings, long rays, explosion flashes.

**World Philosophy:**
- Optimistic 1950s serial + 1970s painted concept + 1980s industrial hardware.
- Technology looks repaired/modular/physical — tubes, chunky switches, scientific instruments beside weapons.
- Corps does NOT colonize. It restores comms, defends infrastructure, shares science only with consent.
- Enemies are ideological (knowledge suppression) not species-evil.
- Boss dialogue must reveal ideology, not just threaten. Humor relief but no trivializing.

**Technical Philosophy:**
- Vanilla JS, no deps, no build — keep `file://` support for now (lowers barrier, works in Safari).
- Evaluate migrations (ES Modules, TS, Vite, ECS, data-driven JSON, asset pipeline, CI/CD) on Value/Cost ratio, not hype.
- Favor gradual evolution over rewrite.
- No per-frame allocations, favor pooling + culling + in-place compaction (already started).

---

## 4. Architecture Audit — Findings

### Strengths
- Clever audio shell solves real browser pain.
- Procedural fallbacks ensure partial art never breaks game.
- Socket system decouples art from gameplay (muzzle offset independent).
- Fixed timestep = deterministic.
- Story bible coherent and enforceable in dialogue system.

### Technical Debt (ranked)

1. **Monolithic G + entities.js** (2999 loc) — player, enemy AI, boss, bullets, particles all share closure scope. Hard to test.
2. **Script-order dependency** — must maintain exact <script> order in level1.html. One missed file = silent failure.
3. **No central asset loader** — each module `new Image() src=` individually, no preload progress, no error aggregation.
4. **No object pooling** — particles create new objects per bullet casing. Compaction helped but allocation remains.
5. **Hardcoded encounter table** — spawns inside level.js not sectorized (Mission 01 26k px as one array).
6. **Story milestones hardcoded** in game.js array, not data-driven JSON.
7. **No automated tests** — collision, campaign flow untested.
8. **Save system minimal** — only hi-score + character + settings; no slot save for campaign progress.
9. **Performance:** Canvas 2D full-scene redraw each frame; no layer caching for static parallax.
10. **Safari memory:** particle/image memory in long sessions not profiled (handoff flags this).

---

## 5. Ranked Opportunities (Value/Cost)

| Rank | Improvement | Gameplay | Tech | Cost | Long-term | Ratio |
|------|-------------|----------|------|------|-----------|-------|
| 1 | **Interactive Tutorial (`tutorial.html`)** | ★★★★★ New player funnel | ★★★ Reuses engine | M (2-3 days) | Unlocks campaign | **9.5** |
| 2 | **Combat Service + Damage Contracts** (extract from entities.js) | ★★ Consistency | ★★★★★ Unblocks modularization | M | Foundation for ECS | 8.8 |
| 3 | **Data-driven sectors & dialogue JSON** (`assets/data/mission01_sectors.json`, `dialogues.json`) | ★★★★ Pacing control | ★★★★ | M | Required for Mission 02 | 8.5 |
| 4 | **Central Asset Preloader with manifest** | ★★ Loading UX | ★★★★ Safari stability | S-M | Enables all future art | 8.0 |
| 5 | **Centralized Save + Galactic Map unlock state** | ★★★ Progression | ★★★ | S | Campaign | 7.5 |
| 6 | **Projectile Pool + Particle Pool** | ★★ Smoother feel | ★★★★ GC reduction | M | Performance | 7.2 |
| 7 | **Automated collision/campaign tests** (pure JS, no dep) | ★ | ★★★★ QA | S | Regression safety | 7.0 |
| 8 | **ES Modules migration (incremental, keeping file:// fallback via shim)** | ★ | ★★★★ Scalability | L | Long-term | 6.5 but risky now |

**Selected per next-step.md rule (Value / Cost):** #1 Tutorial.

But audit requires readiness before coding — this document is Phase 1-2, next is implementation of #1.

---

## 6. Next Phase Plan — Tutorial Build

**Why now:** Galactic map currently shows locked tutorial; first-time players have no safe space to learn double jump, coyote, crouch-drop, weapons, tank mount, lava, guided missiles. Handoff lists it as Priority 1.

**Design Spec (Frontier Training Annex):**
- Map size 5200px (vs 26000), same engine, reused assets.
- 7 rooms:
  1. Movement & camera (jump buffer, coyote visualization)
  2. Combat basics (pistol → mg pickup, knife auto-range)
  3. Secondary weapons (grenade arc, guided lock T)
  4. Platforms (moving, fragile, drop-through Down+Jump)
  5. Vehicles (allied tank spawn, mount, laser coaxial, shell)
  6. Hazards (lava gap with safe timing, laser wall warning→active)
  7. POW rescue ethics + final exam wave (survival micro)
- Uses existing `Dialogue.say('player', 'tutorial.*')` with localized lines (add keys to i18n).
- Reward: extra life + 5 homing missiles transferred via sessionStorage to Level 1 (like portal-level).
- Completion sets `localStorage dh_tutorial_done=1`, galactic map shows checkmark.

**Technical Approach:**
- New `js/tutorial-level.js` — defines tutorial sectors, teachings, triggers, not new engine.
- Reuse `Level.drawGround/drawBackground` but with shorter W=5200.
- Add `docs/tutorial-design.md` and JSON `assets/data/tutorial_triggers.json`.
- Keep `file://` compatibility: no modules, IIFE like level.js.
- Implement in incremental commit so fallback to placeholder if image missing not break.

**Migration Safety:**
- No changes to `entities.js` core logic; only spawn helpers.
- Add 3 new i18n keys per locale (en/es/fr) → ~21 strings.
- Preserve persistent audio shell.

---

## 7. Long-Term Architecture Assessment

**Should we migrate to ES Modules / Vite / TS now?**

- **No** for immediate next phase. Current script-tag global approach delivers unique value: works from `file://` double-click without server — crucial for itch.io zip distribution and Safari field testing. Losing that would hurt iteration speed.
- **Signal to migrate:** when Mission 02-03 start → encounter tables >50k px, entity files >4000 loc, or we need asset pipeline (texture atlas, sprite pre-packing). At that point, introduce:
  1. `vite` with `legacy` file:// fallback build (copy assets),
  2. ES Modules with dynamic import for galactic map missions,
  3. TypeScript gradually for `G` typing (JSDoc first),
  4. Central `EventBus` + `StateMachine`.
- **Recommended intermediate step (this sprint):** Introduce `js/combat-service.js` (tiny pure object with `overlap(), rnd(), clamp(), applyDamage()`) and `js/asset-loader.js` (promise-based manifest, no external dep). Both can be loaded as IIFE now, easily converted to ES modules later.

**Risk:**
- Premature rewrite = lose Safari file:// guarantee + introduce bundler bugs.
- Gradual extraction = low risk, keeps QA simple.

---

## 8. Readiness Checklist for Next Phase

- [x] Repo cloned, 10k loc analyzed, docs synchronized (23-Jul-2026)
- [x] Campaign flow traced: index.html → intro → menu → character → galactic → tutorial placeholder → level1 → portal-level → return
- [x] Asset inventories verified: 3 heroes PNG, 5 soldiers modular, vehicles, pickups, scenery, terrain
- [x] Audio engine understood: procedural + MP3 router, bus separation, Safari persistence
- [x] Known hazards: G monolith, script order, no pool, hardcoded spawns
- [ ] **NEXT:** Create `assets/data/tutorial_triggers.json` + `js/tutorial-level.js` + `docs/tutorial-design.md`
- [ ] Add i18n tutorial keys in `js/i18n.js`
- [ ] Update `tutorial.html` from placeholder to real level loader (reuse level1.html structure)
- [ ] QA: test file:// and http://localhost:8000, Safari + Chrome + gamepad
- [ ] Profile: check particle count cap (recommend 400 max), image onload fallback counter
- [ ] Update `docs/current-runtime-status.md` + `next-phase-handoff.md` after tutorial lands

---

## 9. Suggested Commands for Local Dev

```bash
# Serve reliably (Safari audio fix)
python3 -m http.server 8000
# open http://localhost:8000/index.html

# Quick audit of huge files
wc -l js/*.js | sort -n
grep -R "TODO\|FIXME\|console.log" js/

# Validate no duplicate global leaks
grep -R "window\." js/ | grep -v "window.G\|window\.\(SFX\|I18n\|Sprites\|Level\|Characters\|CharacterAssetConfig\|VehicleAssetConfig\|GameContent\|MusicTracks\|Input\|Settings\|Dialogue\|Entities\|EntityUtils\|EntityScore\|EntityCollectibles\|EntityWarnings\|EntityProps\)"
```

---

## 10. Closing — Owner Mindset

You built a prototype that already feels like Metal Slug in browser: coyote time, jetpack, tank crush, lava glow, mortar warnings, modular PNGs, queued story transmissions. That's rare.

Mission as Technical Director: **Don't preserve — evolve.** Keep the soul (60Hz fixed step, hit-stop, procedural fallback, file:// friendliness, Corps protects agency) while slicing monoliths into services, data-driving pacing, and finally delivering tutorial that makes new players feel heroic within 90 seconds.

Ready to implement Tutorial (Phase 4). Workspace is prepped — `engine-audit` doc saved, repo intact, script order known.

**Artifacts produced in this readiness session:**
- This file: `ENGINE_AUDIT_READY.md`
- Original repo preserved in `/home/user`
- Next MD plan waiting.

Let's build the Training Annex.

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, more realistic oily black critical smog for both ally tanks, left-end reactor flame/smog and additional crash-smoke damage on BigShip03 with incorrect right-side glow lights removed, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a brighter final boss jackpot.
