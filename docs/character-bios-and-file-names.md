# Desert's Heroes — final character names, bios and PNG filenames

## Retro-future story premise

From launch fortresses hidden in the great desert, the **Sandstar Expedition** crosses forgotten planets, artificial moons and lost colony worlds. Its soldiers combine old military hardware with experimental cosmic technology while searching for ancient star routes—and discovering why entire civilizations vanished beyond the dunes.

### Short select-screen premise

**English**  
`DESERT SOLDIERS. DISTANT WORLDS. ONE LOST STAR ROAD.`

**Spanish**  
`SOLDADOS DEL DESIERTO. MUNDOS LEJANOS. UNA RUTA ESTELAR PERDIDA.`

**French**  
`SOLDATS DU DÉSERT. MONDES LOINTAINS. UNE ROUTE STELLAIRE PERDUE.`

# Character 1 — Juan P.

```text
Display name: JUAN P.
Character ID: juan_p
Role: DESERT VANGUARD / BALANCED
```

## English bio

**Veteran of the Red Dune Guard and leader of the Sandstar Expedition. Juan is disciplined, adaptable, and trained to carry any weapon across any world.**

Short card version:

`Veteran expedition leader. Balanced movement and full weapon capacity.`

## Spanish bio

**Veterano de la Guardia de las Dunas Rojas y líder de la Expedición Estrella de Arena. Juan es disciplinado, adaptable y está entrenado para usar cualquier arma en cualquier mundo.**

Short card version:

`Líder veterano. Movimiento equilibrado y capacidad completa de armas.`

## French bio

**Vétéran de la Garde des Dunes Rouges et chef de l’Expédition Étoile des Sables. Juan est discipliné, adaptable et entraîné à utiliser toutes les armes sur tous les mondes.**

Short card version:

`Chef vétéran. Mobilité équilibrée et capacité d’armes complète.`

## Gameplay identity

```text
Speed: 270
Jump: -780
Armor: 1 hit per life
Starting grenades: 10
Special ammo: 100%
Style: balanced / standard difficulty
```

## Required Juan P. files

Directory:

```text
assets/characters/juan_p/
```

Files:

```text
juan_p_idle_animation.png   3600×200   18 frames of 200×200
juan_p_run.png              4000×200   20 frames of 200×200
juan_p_jump.png              200×200    1 frame
juan_p_crouch.png            200×200    1 frame
juan_p_idle_aimup.png        200×282    1 frame
juan_p_run_aimup.png        4000×282   20 frames of 200×282
juan_p_jump_aimup.png        200×282    1 frame
juan_p_death_animation.png  2600×200   13 frames of 200×200
```

Juan’s high-resolution cells currently render at 100×100 and 100×141. The manifest can later switch to native 200×200 and 200×282 without replacing the source files.

# Character 2 — Elena K.

```text
Display name: ELENA K.
Character ID: elena_k
Role: STAR SCOUT / AGILE
```

## English bio

**Cosmonaut, pathfinder, and cartographer of alien ruins. Elena crosses hostile worlds at full speed, trading armor and ammunition for unmatched mobility.**

Short card version:

`Cosmic scout. Fastest movement and jump, but reduced special ammunition.`

## Spanish bio

**Cosmonauta, exploradora y cartógrafa de ruinas alienígenas. Elena recorre mundos hostiles a máxima velocidad, sacrificando blindaje y munición por una movilidad incomparable.**

Short card version:

`Exploradora cósmica. Máxima velocidad y salto, pero menos munición especial.`

## French bio

**Cosmonaute, éclaireuse et cartographe des ruines extraterrestres. Elena traverse les mondes hostiles à pleine vitesse, sacrifiant blindage et munitions pour une mobilité inégalée.**

Short card version:

`Éclaireuse cosmique. Vitesse et saut maximums, mais moins de munitions spéciales.`

## Gameplay identity

```text
Speed: 310
Jump: -840
Armor: 1 hit per life
Starting grenades: 8
Special ammo: 85%
Coyote time: 0.12 seconds
Style: fast / high risk
```

## Required Elena K. files

Directory:

```text
assets/characters/elena_k/
```

Files:

```text
elena_k_idle_animation.png   200×100   2 frames of 100×100
elena_k_run.png              400×100   4 frames of 100×100
elena_k_jump.png             100×100   1 frame
elena_k_crouch.png           100×100   1 frame
elena_k_idle_aimup.png       100×123   1 frame
elena_k_run_aimup.png        400×123   4 frames of 100×123
elena_k_jump_aimup.png       100×123   1 frame
elena_k_death_animation.png  800×100   8 frames of 100×100
```

# Character 3 — Sergio H.

```text
Display name: SERGIO H.
Character ID: sergio_h
Role: IRON NOMAD / ARMORED
```

## English bio

**Heavy infantryman and field engineer of the Desert Launch Corps. Sergio’s reinforced pressure armor can absorb the first impact and keep advancing.**

Short card version:

`Armored field engineer. Survives one hit, but runs and jumps more slowly.`

## Spanish bio

**Soldado pesado e ingeniero de campo del Cuerpo de Lanzamiento del Desierto. La armadura presurizada reforzada de Sergio puede absorber el primer impacto y seguir avanzando.**

Short card version:

`Ingeniero blindado. Resiste un impacto, pero corre y salta más despacio.`

## French bio

**Fantassin lourd et ingénieur de terrain du Corps de Lancement du Désert. L’armure pressurisée renforcée de Sergio peut absorber le premier impact et poursuivre l’avancée.**

Short card version:

`Ingénieur blindé. Résiste à un impact, mais court et saute plus lentement.`

## Gameplay identity

```text
Speed: 225
Jump: -700
Armor: 2 hits per life
Starting grenades: 10
Special ammo: 100%
Coyote time: 0.08 seconds
Style: defensive / beginner-friendly
```

## Required Sergio H. files

Directory:

```text
assets/characters/sergio_h/
```

Files:

```text
sergio_h_idle_animation.png   200×100   2 frames of 100×100
sergio_h_run.png              400×100   4 frames of 100×100
sergio_h_jump.png             100×100   1 frame
sergio_h_crouch.png           100×100   1 frame
sergio_h_idle_aimup.png       100×123   1 frame
sergio_h_run_aimup.png        400×123   4 frames of 100×123
sergio_h_jump_aimup.png       100×123   1 frame
sergio_h_death_animation.png  800×100   8 frames of 100×100
```

# Optional select-screen portraits

The selection screen can animate each character’s idle sheet, so portraits are not required. If dedicated portraits are created later, use:

```text
assets/characters/juan_p/juan_p_portrait.png      160×160
assets/characters/elena_k/elena_k_portrait.png    160×160
assets/characters/sergio_h/sergio_h_portrait.png  160×160
```

Portrait rules:

- transparent 160×160 canvas;
- head and upper torso;
- character faces slightly right;
- no text or UI frame baked in;
- same upper-left desert sunlight used by gameplay sprites;
- original insignia and suit design.

# Full required folder structure

```text
assets/
  characters/
    juan_p/
      juan_p_idle_animation.png
      juan_p_run.png
      juan_p_jump.png
      juan_p_crouch.png
      juan_p_idle_aimup.png
      juan_p_run_aimup.png
      juan_p_jump_aimup.png
      juan_p_death_animation.png
    elena_k/
      elena_k_idle_animation.png
      elena_k_run.png
      elena_k_jump.png
      elena_k_crouch.png
      elena_k_idle_aimup.png
      elena_k_run_aimup.png
      elena_k_jump_aimup.png
      elena_k_death_animation.png
    sergio_h/
      sergio_h_idle_animation.png
      sergio_h_run.png
      sergio_h_jump.png
      sergio_h_crouch.png
      sergio_h_idle_aimup.png
      sergio_h_run_aimup.png
      sergio_h_jump_aimup.png
      sergio_h_death_animation.png
```

Required gameplay PNG total:

```text
8 files per character
3 characters
24 required character PNG files
```

Optional portrait total:

```text
3 optional PNG files
```

# Select-screen text keys

When implementation begins, use these localization keys:

```text
characterSelect.title
characterSelect.confirm
characterSelect.back
characterSelect.speed
characterSelect.jump
characterSelect.armor
characterSelect.ammo
characterSelect.storyPremise

character.juanP.name
character.juanP.role
character.juanP.bio
character.juanP.shortBio

character.elenaK.name
character.elenaK.role
character.elenaK.bio
character.elenaK.shortBio

character.sergioH.name
character.sergioH.role
character.sergioH.bio
character.sergioH.shortBio
```

# Art consistency rules

- All source characters face right.
- Feet stay at bottom-center.
- Use exactly the listed frame and sheet dimensions.
- Keep the gameplay hitbox identical for all three characters.
- Keep muzzle, shoulder launcher and melee positions near Juan’s existing sockets.
- Do not bake muzzle flashes, bullets, explosions, shadows or GUI into character PNGs.
- Elena may have a slimmer silhouette and Sergio a heavier suit, but both remain centered in the same technical canvases.

## Documentation synchronization

Runtime systems have advanced beyond some historical specifications in this file. For a new chat or production phase, read `docs/current-runtime-status.md`, `docs/world-story-bible.md`, and `docs/next-phase-handoff.md` (synchronized 2026-07-23).

---

## Current implementation sync — 2026-07-25

Current branch/PR: `arena/019f9a46-deserts-heroes` / PR #9. Latest runtime state includes upper-platform reward placement in Tutorial and Level 1, stronger tank-piercing Soldier06 lasers with enemy taunts, fixed-world vertical-only opening UFO rise, delayed BigShip03 ship-platform rewards, non-parallax lava with fire/smoke/bubbles and clean cutaway edges, critical black smog for both ally tanks, and casino-style coin award bursts when helicopters, enemy vehicles, gunships, or the fortress boss are destroyed.
