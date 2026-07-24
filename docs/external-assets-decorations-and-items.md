# External Asset Production — Decorations, Backgrounds, Props and Items

## Purpose

This document defines every non-character, non-enemy and non-vehicle external asset used to build the worlds of **Desert's Heroes**. It covers parallax panoramas, vegetation, terrain decorations, destructibles, platforms, prisoners, weapon pickups, HUD icons, file naming, pivots, animation and technical validation.

## Global rendering contract

```text
Logical viewport: 960 × 540
Mission world width: 26000
Ground baseline: Y 470
Rendering: HTML5 Canvas
Pixel-art filtering: nearest-neighbour
Background-photo/panorama downscaling: high-quality smoothing only when specified
Color space: sRGB
```

General PNG rules:

- Use RGBA or indexed PNG with a valid transparent palette entry.
- Do not leave a white or colored matte around transparent pixels.
- Pixel-art edges should normally use alpha 0 or 255.
- Do not bake UI labels, localized text, muzzle flashes, explosions or screen effects into world assets.
- Keep a consistent upper-left/front light direction.
- Place ground-object pivots at bottom-center.
- Keep the canvas dimensions stable for every frame of an animated object.
- Use lowercase snake-case filenames.

# 1. Parallax background layers

## Exact active layer stack

| Draw order | Layer | File | Source size | Parallax | Runtime behavior |
|---:|---|---|---:|---:|---|
| 1 | Sky | `sky01.png` | **1160 × 540** | 0.03 | native 1:1, no repeat |
| 2 | Mountains | `mountain01.png` | **2156 × 540** | 0.18 | native 1:1, no repeat |
| 3 | Dunes | `dune02.png` | **6807 × 576** | 0.45 | 58% scale → 3948×334, no visible repeat |
| 4 | Vegetation | individual PNGs | varied | 1.00 | seeded world positions |
| 5 | Ground/platforms | generated today | modular future assets | 1.00 | gameplay collision layer |

The viewport is 960 px wide and camera travel is 6640 px. Exact no-repeat width is:

```text
required displayed width = 960 + (6640 × parallax)
```

## Sky — active

```text
File: sky01.png
Source: 1160 × 540
Parallax: 0.03
Alpha: fully opaque
Draw scale: 1.0
```

Art rules:

- Cover the complete 1160×540 canvas.
- Keep mountains, dunes and foreground vegetation out of this file.
- Clouds and sun may be included because this is the final active sky layer.
- Avoid important features within 8 px of either horizontal edge.
- The engine clamps at both ends; no repeated tile enters the viewport.

## Mountains — active

```text
File: mountain01.png
Source: 2156 × 540
Parallax: 0.18
Alpha: transparent above mountain silhouette
Draw scale: 1.0
Gameplay ground overlay begins: Y 470
```

Art rules:

- Keep distant forms lower-contrast than gameplay entities.
- Use cooler/desaturated shadows than the dune layer.
- The lower 70 px can contain artwork because gameplay ground covers it.
- Do not include near vegetation or interactive objects.

## Dunes — active

```text
File: dune02.png
Source: 6807 × 576
Parallax: 0.45
Render scale: 0.58
Runtime size: about 3948 × 334
World ground alignment: image bottom near Y 470
```

Art rules:

- Keep transparent sky above the dune silhouette.
- Place the baseline at source Y 576.
- The current non-transparent artwork begins around source Y 270.
- High-quality smoothing is permitted because this large panorama is downscaled.
- Do not include palms, cacti, gameplay props or buildings.

## Future planets/worlds

Use sequential environment IDs:

```text
sky02.png
mountain02.png
dune03.png
```

If a new planet uses the same parallax values, retain the exact sizes above. If a parallax factor changes, calculate a new no-repeat width before producing final art.

# 2. Active vegetation assets

All vegetation uses a bottom-center pivot, deterministic placement, optional horizontal mirroring and a generated contact shadow.

| File | Source canvas | Current base display scale | Approx. base display size |
|---|---:|---:|---:|
| `palm01.png` | **251 × 200** | 0.90 | 226×180 |
| `palm02.png` | **154 × 200** | 0.84 | 129×168 |
| `palm03.png` | **79 × 100** | 1.15 | 91×115 |
| `palm04.png` | **78 × 200** | 0.80 | 62×160 |
| `deco_palm01.png` | **311 × 150** | 0.66 | 205×99 |
| `cactus01.png` | **48 × 100** | 1.00 | 48×100 |
| `cactus02.png` | **87 × 180** | 0.84 | 73×151 |
| `cactus03.png` | **73 × 180** | 0.90 | 66×162 |
| `cactus04.png` | **81 × 180** | 0.84 | 68×151 |
| `cactus05.png` | **52 × 190** | 0.84 | 44×160 |
| `cactus06.png` | **60 × 50** | 1.18 | 71×59 |

Vegetation rules:

- Transparent canvas with visible roots/sand base touching the bottom row.
- No baked contact shadow; the engine generates one.
- Avoid bright outlines that compete with projectiles.
- Keep most vegetation behind player/enemy contrast values.
- If animated sway is added later, use 4 frames with an identical canvas and fixed root pivot.
- A mirrored plant must still look plausible; avoid one-direction text or symbols.

Recommended future naming:

```text
palm05.png
cactus07.png
alien_plant01.png
alien_plant02.png
world02_deco01.png
```

# 3. Ground-decoration size tiers

Use standardized transparent canvases so the content pipeline can place decorations without per-object code.

| Tier | Canvas | Use |
|---|---:|---|
| Small | **32 × 32** | bones, shell casings, tiny stones, dry grass |
| Medium | **64 × 64** | skulls, shrubs, medium rocks, signs |
| Large | **128 × 128** | rock clusters, dead trees, machinery debris |
| Extra large | **256 × 192** | non-interactive wrecks and landmark props |

Naming:

```text
deco_rock01.png
deco_rock02.png
deco_grass01.png
deco_skull01.png
deco_bones01.png
deco_wreck01.png
```

Rules:

- Bottom-center pivot.
- No collision unless separately declared as an interactive prop.
- No baked shadow.
- Keep transparent padding consistent within each size tier.
- Decorative silhouettes should not resemble enemies or pickups.

# 4. Destructible gameplay props

The current generated crates and barrels are smaller prototypes. External art should use the following final canvases; gameplay hitboxes will be updated when the PNGs arrive.

## Wooden supply crate

```text
Frame canvas: 64 × 64
Pivot: (32,62)
Recommended hitbox: 52 × 48
```

Required sheets:

| File | Frames | Sheet size | Use |
|---|---:|---:|---|
| `prop_crate_idle.png` | 2 | 128×64 | subtle highlight/strap movement |
| `prop_crate_hit.png` | 2 | 128×64 | quick compression/jolt |
| `prop_crate_break.png` | 8 | 512×64 | wooden collapse; engine adds debris/FX |

## Explosive barrel

```text
Frame canvas: 48 × 64
Pivot: (24,62)
Recommended hitbox: 38 × 54
```

Required sheets:

| File | Frames | Sheet size | Use |
|---|---:|---:|---|
| `prop_barrel_idle.png` | 4 | 192×64 | warning-light or heat shimmer animation |
| `prop_barrel_hit.png` | 2 | 96×64 | jolt/flash |
| `prop_barrel_rupture.png` | 6 | 288×64 | physical rupture; engine adds explosion |

Do not bake fireballs, shock rings or smoke into destructible sheets.

## Sandbag emplacement

```text
File: prop_sandbags01.png
Canvas: 128 × 72
Pivot: (64,70)
Recommended cover hitbox: 112 × 48
```

Optional destruction:

```text
prop_sandbags_break.png
6 frames × 128×72
Sheet: 768×72
```

# 5. Ground modules, platforms and terrain tiles

## Active modular ground

```text
ground_desert_01.png  512×128
ground_desert_02.png  512×128
ground_desert_03.png  512×128
```

The engine selects a deterministic 16-module sequence to cover the 26000 px world. Module Y 0 maps to the collision baseline at world Y 470. Repeats are limited and the lava cutaway has a lower weight. Full runtime and seam-validation notes are in `assets/terrain/README.md`.

## Future platform modular system

Recommended modular tile system:

```text
Base tile: 64 × 64
Half tile: 32 × 64 or 64 × 32
Platform end caps: 32 × 64
```

Suggested files:

```text
terrain_desert_top01.png
terrain_desert_fill01.png
platform_metal_middle.png
platform_metal_left.png
platform_metal_right.png
platform_support01.png
```

Technical rules:

- Horizontal edges must tile perfectly.
- Top collision line must be supplied in asset notes.
- No transparent seam between middle segments.
- Keep foreground collision edges brighter than background art.
- Platform art must not change collision geometry frame-to-frame.

# 6. Prisoner/rescue NPC assets

Prisoners are gameplay NPCs but belong to the item/reward pipeline rather than enemy AI.

```text
Frame canvas: 100 × 100
Pivot: bottom-center (50,100)
Hit/proximity area: 40 × 70
```

Recommended states:

| File | Frames | Sheet size | FPS |
|---|---:|---:|---:|
| `pow_tied_idle.png` | 4 | 400×100 | 4 |
| `pow_rescue.png` | 6 | 600×100 | event-driven |
| `pow_free_cheer.png` | 6 | 600×100 | 8 |
| `pow_run_away.png` | 6 | 600×100 | 10 |

Do not bake `HELP!` text into the art; it is localized by `js/i18n.js`.

# 7. Weapon and resource pickups

Current pickup types:

| ID | HUD letter | Meaning |
|---|---|---|
| `mg` | H | Heavy machine gun |
| `spread` | S | Spread weapon |
| `rocket` | R | Rocket weapon |
| `flame` | F | Flame shot |
| `grenades` | G | Grenade refill |
| `homing` | T | Ten guided missiles |

## Pickup container

```text
Frame canvas: 64 × 64
Pivot: (32,62)
Collection area: about 56 × 56
```

Recommended files:

```text
pickup_mg.png
pickup_spread.png
pickup_rocket.png
pickup_flame.png
pickup_grenades.png
pickup_homing.png
```

Each pickup may be either:

- one static 64×64 PNG; or
- four 64×64 frames in a 256×64 sheet at 8 fps.

Pickup rules:

- Use a strong silhouette and one dominant color.
- Keep the identifying icon readable at 32 px display scale.
- Do not bake localized weapon names into the image.
- A single letter may be used only if it remains universal across supported languages.
- No glow should be baked; the engine generates pulsing rings and additive highlights.

# 8. HUD item icons

If dedicated HUD icons are produced:

```text
Icon canvas: 32 × 32
Optional high-detail icon: 48 × 48
```

Suggested names:

```text
icon_weapon_pistol.png
icon_weapon_mg.png
icon_weapon_spread.png
icon_weapon_rocket.png
icon_weapon_flame.png
icon_grenade.png
icon_guided_missile.png
icon_armor.png
icon_life.png
```

HUD rules:

- Transparent background.
- No panel border; panels are generated by Canvas.
- No numbers or text baked in.
- Use a 1–2 px near-black outline and a bright inner highlight.
- Verify readability over both bright sky and dark boss scenes.

# 9. File organization

```text
assets/
  scenery/
    sky01.png
    mountain01.png
    dune02.png
    palm01.png ...
    cactus01.png ...
  terrain/
    ground_desert_01.png
    ground_desert_02.png
    ground_desert_03.png
  decorations/
    small/
    medium/
    large/
    landmarks/
  props/
    crates/
    barrels/
    sandbags/
    platforms/
  pickups/
    weapons/
    resources/
  npcs/
    pow/
  ui/
    icons/
```

# 10. Delivery notes file

Every external-asset delivery should include `asset-notes.txt` or Markdown containing:

- source canvas size;
- frame count and grid layout;
- pivot coordinate;
- collision recommendation;
- animation FPS;
- event frame, if any;
- whether horizontal mirroring is permitted;
- intentional semi-transparent pixels;
- socket coordinates for interactive items.

# 11. QA checklist

- [ ] Exact required dimensions.
- [ ] Correct PNG alpha.
- [ ] No white edge halo.
- [ ] Bottom-center pivot is stable.
- [ ] Parallax width covers the complete camera journey.
- [ ] Tiled art has no seam.
- [ ] No localized text is baked into art.
- [ ] No internal FX are duplicated in PNGs.
- [ ] Pickup identity remains clear at gameplay size.
- [ ] Interactive props have documented hitboxes.
- [ ] File names use lowercase snake case.
- [ ] Assets remain readable against the active desert palette.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).
