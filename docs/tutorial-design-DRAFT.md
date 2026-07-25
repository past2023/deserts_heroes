# Tutorial — Frontier Training Annex — Draft Design (Next Phase)
Updated: 2026-07-23
Status: Ready for implementation after ENGINE_AUDIT_READY.md

## Goal
Teach 100% of mechanics required for Mission 01 in <5 minutes, without pausing simulation, using same engine as main game. Transfer reward to Level 1 to make it feel worth playing.

## Map Layout — 5200 px
Use same GROUND=470, same terrain modules, but simpler:

```
[0 ---- 600: Movement] [600-1300 Combat] [1300-2000 Secondary] [2000-2800 Platforms] [2800-3600 Vehicle] [3600-4300 Hazards] [4300-5200 Final Exam]
```

Platforms: 6 teaching platforms, 2 fragile (red bar visible teaching break).
Props: 1 barrel chain demo (explicit "bait enemies" in teleprompter).

## 7 Lessons (each = portal of dialogue + checklist)

### 1. Move, Look, Breathe
Trigger x=150. Dialogue: "Juan P — first duty is to observe."
Check: player moved 200px, jumped once. Coyote visualization: small ghost under feet when coyoteT>0 (draw faint cyan rect).

### 2. Pistol, Knife, Rescue
Spawn: 1 soldier (idle) + POW behind. Pickup: mg at end.
Teach: J/Z shoot, auto knife when close (<22px). Hit confirmation white core.
Check: kill 1 enemy (or knife).

### 3. Shoulder Launcher
Pickup: grenades (3) then homing T (5 missiles for tutorial only).
Teach: L/X uses launcher from head socket. Grenade arc vs guided lock (orange diamond indicator).
Check: hit crate with grenade.

### 4. Platforms & Drop
Room with moving platform (amp 18 speed 0.75) + fragile platform + Down+Jump to drop.
Check: land on fragile until it triggers (breakT), then drop to ground.

### 5. Tank — Chiron-Class Assault
Slug spawn at 2850, x=2850. Same allied tank art.
Teach: mount proximity, Fire = coaxial laser, Up+Fire anti-air, Secondary = shell, 3 armor, crushes infantry, eject.
Check: mount + destroy 2 dummy targets using alt fires.

### 6. Lava & Lasers
One lava gap 80px wide (Level.lavaGaps.push) + one laser wall (warning 1.2s then active 1.6s cycle).
Teach: watch pulse, time jump, double jump as safety, jetpack if available (give 1 jetpack pickup here).
Check: cross both without death.

### 7. Final Exam — Dune Breach
Small wave: 2 soldiers + 1 grenadier, 1 pow, 1 barrel. No boss.
Reward: score 1000 + extra life + 5 homing + 30 mg ammo transferred via sessionStorage `dh_tutorial_reward`.
Set `localStorage dh_tutorial_done=1`.

## Data-Driven Triggers (to implement)
`assets/data/tutorial_triggers.json`:
```json
[
  {"x":150,"id":"move","req":"moveLoop","dialogue":"tutorial.move","hint":"A/D or ← → + Space"},
  {"x":650,"id":"combat","spawn":{"type":"soldier","x":850},"pickup":{"type":"mg","x":1200}},
  {"x":1350,"id":"launcher","pickup":{"type":"grenades","x":1400},"pickup2":{"type":"homing","x":1650}},
  {"x":2050,"id":"platforms","platforms":[{"x":2150,"baseY":380,"w":150,"fragile":false},{"x":2420,"baseY":330,"w":140,"fragile":true}]},
  {"x":2850,"id":"tank","slug":{"x":2950}},
  {"x":3650,"id":"hazards","lava":{"x":3750,"w":80},"laser":{"x":4000,"platformX":3980,"warn":1.2,"active":1.6}},
  {"x":4350,"id":"exam","wave":["soldier","soldier","grenadier"],"props":["barrel01"],"pow":4400}
]
```

## Dialogue Keys (to add to i18n.js)
- tutorial.move, tutorial.combat, tutorial.knife, tutorial.launcher, tutorial.homing, tutorial.platforms, tutorial.drop, tutorial.fragile, tutorial.tank, tutorial.tankFire, tutorial.hazards, tutorial.exam, tutorial.complete

Localized EN/ES/FR placeholders required per story bible rule.

## Asset Loader Impact
Tutorial needs no new art. Reuses existing. Only needs optional arrow indicator (reuse portal arrow).

## Implementation Steps

1. Create `js/tutorial-level.js` (IIFE, like level.js) exporting `TutorialLevel` with W=5200, platforms, spawns, lavaGaps, energyLasers, draw methods wrapping Level.drawBackground.
2. Create `tutorial.html` real game shell (copy level1.html script order + include tutorial-level.js before entities.js + flag `window.IS_TUTORIAL=true`)
3. Extend `js/game.js` to detect `IS_TUTORIAL`: if true, set Level = TutorialLevel alias, disable boss trigger, on win transfer reward and redirect to galactic-map.
4. Add reward reading in level1.html start: if sessionStorage `dh_tutorial_reward` exists, apply to player.
5. Update galactic map to show completion checkmark if `dh_tutorial_done`.
6. Test.

## Risks
- Mixing tutorial Level override might break main level if global Level overwritten. Solution: tutorial-level.js defines separate global `TutorialLevel`, game.js swaps reference only when IS_TUTORIAL.
- Safari audio: must still go through index.html iframe shell. Ensure tutorial.html is loaded via same shell.

## Success Metrics
- New player can finish without reading external manual.
- 0 regressions in Mission 01 (run arcade once).
- file:// works.

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, critical black smog for both ally tanks, and pixel-art casino coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed, including smaller mid-fight boss coin drops and a large final boss jackpot.
