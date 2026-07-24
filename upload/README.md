# Upload folder for new assets

Use this folder to upload new files from chat when the direct chat upload does not work.

## How to use
1. Upload your clean tutorial mids and reference images with green lines here via GitHub web UI or git:
   - `tutorial_mid06.png` / `tutorial_mid06b.png`
   - `tutorial_mid07.png` / `tutorial_mid07b.png`
   - `tutorial_mid08.png` / `tutorial_mid08b.png`
   - `pilar01.png`
   - `tutorial_mid01_refe.png` ... `tutorial_mid08_refe.png` (with pure #00FF00 green lines for auto platform extraction)

2. After upload, the game will auto-detect files in priority order:
   - First tries `assets/tutorial/XXX`
   - Then falls back to `upload/XXX`

3. For platform auto-extraction, place your green-line references here. The engine will scan for bright green #00FF00 lines and convert them to invisible platforms (upper edge = walkable).

## Current state
- v4 platforms are estimated from screenshots. Replace with your final versions.
- New modules order is 01,02,03,04,06,07,08,05 (8 total, W=11008)
- Pilar is drawn at each seam to hide gaps.

After uploading, tell me to sync from upload/ to assets/tutorial/
