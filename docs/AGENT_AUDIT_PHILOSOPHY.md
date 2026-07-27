# AI Auditor Framework: Game Design Philosophy for Desert's Heroes

## Purpose
This document establishes the core design philosophy, player psychology constraints, and game feel benchmarks for "Desert's Heroes" (Vanilla JS / HTML5 Canvas). Any AI agent auditing this codebase, level configurations, or asset structures must evaluate changes and review code quality using this specific framework.

The overarching goal is to balance **Appeal** (attracting players via unique fantasy/aesthetics) and **Engagement** (retaining players via mechanical depth and rewarding game loops).

---

## 1. The "Toy Factor" Benchmark (Micro-Engagement)
Every core interaction must be intrinsically satisfying in an empty room, completely independent of objectives or enemy counts.

### Audit Criteria for Agent:
* **Feedback Systems:** When a weapon fires, verify that the engine triggers tiered responses: a camera matrix offset (screen shake) scaled to the gun's power, canvas-rendered muzzle flashes, projectile tracers, and dedicated audio synthesis triggers.
* **Item Collection Mechanics:** Loot systems (like the blue diamond casino coins) must not immediately update score variables statically. They must possess dynamic physical arcs, floor/platform collision bouncing, and a linear interpolation (Lerp) pull toward the player hurtbox when inside a specific radius (~80px). Collection sound effects must utilize rising pitch shifts to activate positive psychological reward loops.
* **Rule for Code Modification:** Never optimize out purely visual/audio game feel lines (e.g., entity debris particles, bullet casings) for raw performance unless the frame rate drops below 60fps on a standard canvas buffer.

---

## 2. "Interesting Decisions" Design Principle (Macro-Engagement)
Avoid "artificial difficulty" (e.g., merely boosting enemy HP modifiers or cutting level timers). Difficulty must emerge from rapid, competing mental choices forced upon the player.

### Audit Criteria for Agent:
* **Risk vs. Reward Layouts:** In level maps, inspect the spatial arrangement of high-value pick-ups (Weapon crates, POW hostages). They must not sit in entirely safe corridors. Ensure they are placed near structural hazards, within overlapping enemy fire zones, or on destructible paths to force the player to run a split-second mental cost-benefit calculation.
* **Strategic Enemy Mixes:** Audit enemy placement mixes to prevent the player from relying solely on the infinite baseline pistol. The level configuration must feature combinations of enemy types that actively resist uniform tactics (e.g., positioning a frontal-shielded infantry unit underneath a high-angle sandbag turret to force an alternation between arced grenade trajectories and up-aiming movement).

---

## 3. Dynamic Roster & Level Pacing (Replaces Rigid Limits)
There is no hard limit on the total number of enemy types in the codebase. More enemies are great for variety, but they must be deployed strategically based on **level theme, fun, and player pacing**.

### Audit Criteria for Agent:
* **The "Gradual Introduction" Rule:** Do not introduce all enemy types at the very beginning of a level. Introduce 2 to 3 base types first, let the player master them, and then introduce advanced threats (like the `space_fighter` portal units) later in the level to surprise the player and escalate the fun.
* **Mechanical Roles over Visual Variations:** When a new enemy type is introduced (e.g., changing from 8 types to 9+), verify that it offers a unique mechanical behavior or movement pattern (e.g., an aerial fighter that maneuvers differently than a standard helicopter). Do not add new enemy classes if an existing class with customized stats can fulfill the same gameplay role.
* **Wave Choreography Analysis:** When auditing enemy spawning configurations (coordinate triggers or camera boundary triggers), flag sections with flat pacing. The level flow must follow a wave cadence: High-intensity skirmish $\rightarrow$ Brief decompression zone with interactive terrain (e.g., chain-reacting explosive barrels) $\rightarrow$ Mid-tier vehicle mini-boss $\rightarrow$ Respite area $\rightarrow$ Main base boss fortress.

---

## 4. The Creative Contrast Rule (Core Appeal)
"Desert's Heroes" relies on a distinct theme: a retro military sand-and-steel shooter **fused with** reality-warping sci-fi, portal space rifts, and high-tech alien aesthetics.

### Audit Criteria for Agent:
* **Thematic Integrity:** Review environmental canvas draws and UI screens to ensure this contrast remains razor-sharp. The Character Selection Carousel must explicitly project distinct sci-fi roles through its metadata descriptions and idle frame speeds (e.g., Elena K. as an agile high-tech scout vs. Sergio H. as an armored heavy juggernaut).
* **Visual Synergy:** Ensure that hyper-tech elements (like portal fighters and space lasers) use contrasting neon or bright procedural color palettes compared to the muted rust, dust, and steel configurations of the terrestrial military units and tanks.

---

## 5. Automated Audit Prompts For the Agent
When tasked with reviewing code updates or debugging engine physics, you must cross-reference your modifications with this prompt checklist:
1. *Did this change diminish or remove any visual/tactile 'juice' from the main gameplay loop?*
2. *Does this enemy/obstacle placement provide a fair visual telegraph (warning flash, line guide) 0.5-1.0 seconds before active frame collision?*
3. *Am I introducing code for an unreleased stage before resolving pacing bugs inside the 26,000px vertical slice level?*
4. *Are character physics variations (e.g., Elena's jump buffer or coyote time values) distinct enough to feel mechanically unique in hands-on play?*
