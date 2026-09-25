# Driftseed architecture

This guide covers how the game is organised, how to change it, and the rules that keep it fast.

## Layout and build

```
src/index.html        page template (HUD, dock, sheets); /*@styles*/ and /*@game*/ get filled in
src/styles.css        all CSS
src/game/NN-name.js   game modules, concatenated in filename order into one IIFE
tools/build.mjs       builds index.html; parses the bundle so a syntax error fails the build
tools/smoke.mjs       headless play-through test (uses window.DS from 95-debug.js)
index.html            GENERATED. It's committed so the game stays a single file you can open or host anywhere
```

- **Work loop:** edit `src/…`, run `npm run build`, then `npm test`. CI runs `npm run check`, which fails if `index.html` is stale or the code doesn't parse.
- **Shared scope:** every module shares one function scope, as if it were one big file.
  - A module can call any function from another module. Function declarations are hoisted.
  - Top-level `const` and `let` values must be defined in an earlier-numbered module before any code that runs at load time uses them. The number prefix sets load order, so keep it meaningful.
- **Debug API:** add `?debug` to the URL to get `window.DS`. It provides state snapshots, teleporting, setting the hour, giving items, entering houses and more.

## Module map

| Module | What lives there |
|---|---|
| 00-core | three.js check, curved-world vertex shader, tiny utilities (`clamp`, `hash`, `mulberry`, `K`) |
| 10-data | **Data registries:** `CROPS`, `VARIANTS`, `BUILD`, `BIOMES`, `FISH`, `BUGS`, `PLANTS`, `FINDS`, `MATS`/`CONSUM`, rods, cans, house tiers, level curve |
| 22-toolicons | Tool icons painted as shaded vector illustrations (`paintIcon`); they override the sprite versions in `ICON` |
| 20-state, 21-sprites | Save state (`S`, `freshState`, `load`, `save`); UI icons (`SPR`, `ICON`). Sprites are small character grids that `sprite()` upgrades when drawn: Scale2x smoothing, rim light and shade, a tinted outline, painted at 3× |
| 30-render | Renderer, pixel post-pass, geometry helpers (`P`, `PG` gradient parts, `merge`, `M`), shared materials, lights, sea, sky |
| 31-ground | Painted ground textures (grass, path, sand, cliff) and `worldMat`, which maps them in world space so tiles join up without seams. Dirt paths are painted into the grass from a blurred mask (`setPathMask`), so their edges curve instead of following tiles |
| 40–44 world | Island generation (`genIslands`); trees (`treeParts`, `canopy`, gradient leaf `card`s); grass tufts (off by default, see `GRASS_DENS`); rivers and waterfalls (`carveRivers`); terrain meshes with rounded corners (`buildIsland`, `rtileGeo`); island culling |
| 45-crops | Soil and crop models (`cropParts`) |
| 50-objects | Decor, house and bin models (`objGroup`, `houseGroup`, `roof`) |
| 55-town | Town layout (`layoutTown`): plaza, paths, buildings, lamps, trees, flower species, gathering |
| 56-interiors | Enterable rooms: separate `roomScene`, furniture (`furn`), room tapping |
| 59-museum | The walk-in museum (`buildMuseum`): fish tanks, butterfly garden, bug terrariums and a centrepiece, all filled from `S.alm`; Professor Hoot the curator; the outdoor showcase (`refreshMuseumShow`) |
| 57-villagers | Species, personalities, models (`npcModel`), routines, chat, wishes, friendship |
| 58-crafting | `RECIPES`, crafting, consumables |
| 61-player | Player looks (`LOOKS`, `applyLook`, `setLook`): the bunny or any `npcModel` species, in fur and outfit colours saved as `S.look`. The body is always `villager.children[0]`. |
| 60–64 | Ambient life (villager, boat, gulls, particles); time of day and offline simulation; synth audio |
| 71-tools | Tool bar and held tools (`TOOLS`, `equip`); `toolTap` decides what a tap does with the equipped tool; `actAt` walks up, faces the tile and swings |
| 70–80 | UI helpers and items; farming actions (`tillAt`, `waterAt`, `tendAt`, `useFixed`) and drag-farming; finds, weeds, wild plants, bugs and crows; fishing; sailing and fast travel; orders |
| 82-sheets | The bottom bar's menu (`showApps`) and bottom sheets: Pockets (inventory and crafting), shop, seeds, orders, Islandex, chart, settings |
| 84-input | Tap, drag, pinch and picking (`pick`, `onTap`) |
| 86–87 | New-game setup; atmosphere (foam, footprints, sky events, motes, music) |
| 90-main | Main loop (`frame`) and boot |
| 95-debug | `window.DS` (only with `?debug`) |

## Core concepts

- **Tiles:** the world is a tile grid keyed by `K(x,z)`.
  - `landMap` holds each tile's type (grass, sand, s1/s2 shallows, river, bridge).
  - `lvlMap` holds cliff tiers, and `islMap` holds which island a tile belongs to.
  - `topY(x,z)` gives a tile's surface height (a sand tile's centre height). `surfY(x,z)` gives the height at any point, following the beach slope. Use it for things that move across sand.
  - Beaches slope into the sea: `shapeBeach` gives each sand tile four corner heights (`SAND_CH`) from distance to open water, and the sand shader bends the tile top to match.
  - Rendering hides the grid with rounded corners and smooth colour noise, but the logic stays tile-based.
- **State:** everything saved lives in `S`. Add a new field to `freshState()`, and `load()` backfills it for old saves. Things that can be regenerated from the world seed, like terrain, the town and villagers, are rebuilt on load, not saved.
- **Registries first:** most content is a data entry plus, at most, one model function. Prefer adding data over adding special cases.

## Adding things

| To add | Do this |
|---|---|
| A crop | Entry in `CROPS` (10-data) → icon in `SPR` (21-sprites) → a `case` in `cropParts` (45-crops) |
| A fish | Entry in `FISH`. Icons and Islandex are automatic. Use `hab:'river'` for river fish. Keys must be unique across the table. |
| A bug or wild plant | Entry in `BUGS`/`PLANTS` (a model `kind` is already handled in `bugGroup`/`plantGroup`, 74-life) |
| Decor | Entry in `BUILD` (add `craft:true` for craft-only) → `case` in `objGroup` + tap height in `OBJ_H` (50-objects). The thumbnail is generated automatically. |
| A recipe | Push onto `RECIPES` (58-crafting). Inputs are item keys: `m:` material, `c:` crop (any variant), `f:`/`b:`/`p:`/`g:` catch and finds. |
| A villager species or personality | `SPECIES` / `PERS` + a `case` in `npcModel` (57-villagers) |
| A room with its own camera | Return `follow:true` (and optionally `tick`, `title`) from the room builder; `updateRoom` follows the player and runs `tick` each frame. Props with `info` run it when tapped. |
| Furniture | A `case` in `furn` + a `put()` in `buildRoom` (56-interiors) |
| A flower species | `FLOWER_SP` + `FLOWER_H` + a `case` in `flowerHead` (55-town) |
| Ground detail | Draw it in a `patternTex` in 31-ground. Don't add geometry. |
| A palm type | A `case` in `treeParts` calling `palmParts` with options, and add it to `PALMS` (41-trees). Beaches get palms from `palmSpots`. |
| A biome | `BIOMES` entry (colours, trees, names) + any new tree kinds in `treeParts` |
| A tool | Entry in `TOOLS` + icon in `SPR` + held model in `HELD_PARTS` + a case in `toolTap` (and in `paintMode` for drag) (71-tools) |
| A player look | Entry in `LOOKS` (61-player), plus a `case` in `npcModel` if it's a new species |
| A sheet tab | A branch in `renderSheet` + data-attribute handlers in the `#sheetBody` click listener (82-sheets) |

## Performance rules

- **Terrain is baked:** each island's tiles become one mesh per material (`makeBake` in 44-terrain). Faces nobody can see are dropped: bottoms, cliff tops under the grass slab, and sides against an equally tall neighbour. Tile colours go in vertex colours and beach slopes in the vertices. Don't add per-tile instanced batches back.
- **Level of detail:** `merge()` swaps small parts to lighter shapes automatically (`lodGeo`). Tree meshes have a far twin (`addVeg`/`lowParts`), and town flowers have one too (`FLORA_LO`). `cullIslands` swaps them by zoom and distance, hides wild plants far away, and only lets islands near the sun's shadow box cast shadows.
- **Measure:** with `?debug`, `DS.perf()` gives draw calls, triangles and per-system timings, `DS.tris()` the heaviest objects and `DS.calls()` draw calls by owner. For reference, zoomed all the way out it's about 360 calls and about 1M triangles.
- **Merge static things:** build models from parts with `P()` and merge them into one mesh with `M()`.
- **Instance repeated things:** grass, flowers, tiles and terrain use `InstancedMesh`. Never create one mesh per tile.
- **Texture, don't model:** ground detail (grass pattern, path pebbles, sand speckle, cliff strata) comes from the `31-ground` textures, not geometry. Trees are a core blob plus a few gradient leaf cards (`PG`), not many separate puffs.
- **Share geometry and materials:** use `BOX`, `ICO2`, `vcMat`, `rtileGeo(mask)` and the other shared ones. Don't create materials per object.
- **Culling:** every island's meshes live in `isl.group`. `cullIslands()` hides groups that are out of view, which removes their draw calls and shadow casting. Put new per-island meshes in that group.
- **No allocation in `frame()`:** reuse the scratch objects (`_m`, `_v`, `_q`, `_c`, `_pv`). Throttle anything that doesn't need to run every frame, like the HUD, which updates every 0.5 s.
- **Incremental updates:** `refreshHomeGrass` only rewrites tiles whose hidden state changed, and `objAt` uses an index. Follow the same pattern for new per-tile systems.
- **No automatic resolution changes:** a frame-rate-based pixel scaler was tried and removed. Backgrounding the app and brief hitches kept pushing it up, so the game got more and more pixelated. Pixel size is the player's setting only.

## Gotchas

- **Taps go through tools:** a tap on open ground only walks. Actions come from the equipped tool (`S.tool`), and debris names the tool that clears it (`DEBRIS_TOOL`). Buildings, NPCs and placed decor respond whatever you hold.
- **Rivers are not sea:** boats must use `seaBlocked(x,z)` (land or river), never `isLand`. Rivers cross islands, so treating them as water lets routes cut straight through a town.

- **One-line functions and comments:** a lot of code is packed onto single lines, so use `/* … */` for inline comments there. A `//` comments out the rest of the line.
- **World curve:** the curved-world shader bends everything by distance from the camera. That includes thumbnail and room cameras, so keep special cameras close to their subject. For picking and screen positions, use `toScreen`, `waterPoint` and `roomPoint`, which account for the curve.
- **World-space textures:** `worldMat` samples by world position, so instanced tiles share one continuous pattern. Its colour is multiplied by the instance colour, so keep tile colours fairly light.
- **Transparency:** grass blades (when enabled) don't write depth, so the outline pass doesn't ink every blade. Flowers do, because they must hide what's behind them.
