# Localization and advanced procedural fire FX

## Game identity

The visible and browser title is now **Desert's Heroes**. Language-neutral identity data remains in `js/content.js`.

## GUI localization

`js/i18n.js` is the dedicated GUI-text module. It contains complete dictionaries for:

- English (`en`)
- Spanish (`es`)
- French (`fr`)

The selected language applies immediately and exclusively to menus, instructions, pause UI, HUD labels, mission banners, game-over/victory screens, settings, control names, contextual prompts, weapon names and pickup messages.

Language is selected under **Settings → General → Language** using Left/Right or Enter. The setting is persisted in `localStorage` as `dh_language`; English is the default. The HTML `lang` attribute changes with the selection.

Settings now use a clipped scrolling viewport so the added language row and all command bindings remain reachable at 960 × 540.

## Fire FX renderer

`js/combat-fx.js` is an asset-free Canvas renderer for authored procedural muzzle flashes and projectiles. It adds:

- directional multi-lobed muzzle cones;
- per-weapon color palettes;
- radial muzzle bloom;
- hot white cores;
- split flash rays;
- expanding pressure crescents;
- gradient motion trails;
- projectile heads, fins, rails and energy rings;
- deterministic animated flicker instead of unstable random drawing.

### Player weapon identities

- Pistol: compact gold/orange flash and bright dart tracer.
- Heavy machine gun: narrow long flash and extended hot tracer.
- Spread: broad cyan-white split flash and cool multi-rail pellets.
- Rocket: orange backblast, shaded body, nose cone, fins and animated exhaust.
- Flame: layered white/yellow/orange/red elliptical fire volume.
- Grenade launcher: wide pressure flash and warm smoke/sparks.
- Guided launcher: cyan/blue flash layered with existing seeker exhaust and lock UI.
- Vehicle and fortress cannons: oversized pressure cone and heavy flash rays.

### Enemy fire identities

- Rifle soldiers: red-orange darts.
- Sandbag turrets: magenta/violet rail bolts.
- Helicopters: green/teal projectiles.
- Gunship: cyan orbital energy shots.
- Final fortress: heavy violet/pink bolts.

Every enemy family has matching muzzle colors, projectile geometry, trail particles and impact colors. Gameplay collision dimensions remain unchanged.

## Premium arcade impact pass

A second FX pass takes inspiration from the high-energy readability of modern pixel run-and-gun games such as Mighty Goose without copying its assets or code:

- saturated radial impact bloom;
- hard white four-point contact cores;
- concentric hit-confirmation rings;
- 7–16 long procedural impact rays;
- per-weapon and per-enemy ray palettes;
- oversized boss/explosion bursts;
- restrained screen-space flash on explosions;
- existing hit-stop and shake synchronized with the new visuals;
- a layered cyan/white/gold melee sweep with leading-edge glints;
- fatal enemy hits eject a restrained set of rotating armor fragments.

The effect is intentionally strongest for spread shots, energy enemies, bosses and large explosions. Routine automatic fire remains smaller so sustained combat stays readable.

## HUD presentation pass

The gameplay HUD now uses generated beveled plates rather than floating text alone:

- dark translucent gradient panels;
- weapon-colored borders and top highlights;
- white corner brackets that remain readable over explosions;
- segmented ammunition, combo and boss bars;
- dedicated score/lives panels;
- weapon-specific bottom-deck accent colors;
- framed mission and wave announcements.

All panels are drawn in Canvas and all wording remains supplied by `js/i18n.js`.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes: Ally Tank 01 critical smoke 2x larger and denser, BigShip03 right-end reactors correctly positioned, yellow coins replaced by 2D pixel-art blue diamonds (particles and HUD score icon), portal level updated with normal weapon shooting/upward aim and 2x larger enemy hitboxes, and big boss tank chat portrait.
