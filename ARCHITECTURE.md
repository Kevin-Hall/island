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
| 00-core | three.js check, the long-lens camera (`LENS`) and curved-world vertex shader (the world drops away with distance from the camera by `CURVE`; JS mirrors are `curveDropFor`/`curveY`/`horizonA` in 30-render; materials with the `NO_CURVE` define stay unbent), tiny utilities (`clamp`, `hash`, `mulberry`, `K`) |
| 10-data | **Data registries:** `CROPS`, `VARIANTS`, `BUILD`, `BIOMES`, `FISH`, `BUGS`, `PLANTS`, `FINDS`, `MATS`/`CONSUM`, rods, cans, house tiers, level curve |
| 22-toolicons | Tool icons painted as shaded vector illustrations (`paintIcon`); they override the sprite versions in `ICON` |
| 11-dex, 22b-dexart | More of the Islandex (~290 entries): extra fish, bugs, plants and finds added to the 10-data tables. Entries can be tied to `sea` (seasons, on your island), `hr` (hours), `rain`/`dry`; `dexOk(e,isl)` is checked wherever things spawn. Finds with `tpl` get a templated icon and model in their own colours (22b-dexart, `tplParts`); `forage` ones turn up at home via `FORAGE_EXTRA` in `forageSpawn` |
| 20-state, 21-sprites | Save state (`S`, `freshState`, `load`, `save`); UI icons (`SPR`, `ICON`). Sprites are small character grids that `sprite()` upgrades when drawn: Scale2x smoothing, rim light and shade, a tinted outline, painted at 3× |
| 30-render | Renderer, pixel post-pass, geometry helpers (`P`, `PG` gradient parts, `merge`, `M`; smooth-shaded shapes `SPH`, `SCONE`, `STRUNK`, `SCYL` keep their rounded normals, everything else is flat-shaded), shared materials, lights, sea, sky |
| 31-ground | Painted ground textures (grass, path, sand, cliff) and `worldMat`, which maps them in world space so tiles join up without seams. Dirt paths are painted into the grass from a blurred mask (`setPathMask`), so their edges curve instead of following tiles |
| 40–44 world | Island generation (`genIslands`); your island's coastline (`townQ`, shaped by `S.home`), style (`HOME_STYLES`, `applyHomeStyle`) and real seasons (`season`, `SEASON_GRASS`, `seasonCheck`); a wild island has no separate farm field (`farmQ`); the farm field's shape (`farmQ`), which grows with island expansions as far as neighbouring islands allow (`farmGrowMax`); trees and bushes (`treeParts`; `canopy` is a soft rounded crown, `bushClump` a round bush, `dots` flowers and `fruit`; palms still use gradient leaf `card`s); grass blades (`updateNearGrass`: a pooled clump mesh around the camera; whole-island blades off by default, see `GRASS_DENS`); rivers and waterfalls (`carveRivers`); terrain meshes with rounded corners (`buildIsland`, `rtileGeo`); island culling |
| 45-crops | Soil (tilled tiles join into beds) and crop models (`cropParts`). All plain crop meshes are baked into one batched mesh that sways in its shader (`bakeCrop`, `flushCrops`); a rare harvest's fruit (golden, crystal, moonlit, prismatic) is baked into one batch per variant material (`VBM`), so a whole field of legendary crops is five draw calls |
| 50-objects | Decor, house and bin models (`objGroup`, `houseGroup`, `roof`) |
| 50b-furniture | Furniture and garden pieces (`furnParts`, called from `objGroup`): picnic table, parasol, garden chair, rose arbor, street lamp, fountain, decking, outdoor rug, brick paving, hammock, mailbox, market stall, topiary, bird bath, stone urn, picket fence, sundial, garden swing. Painted pieces take a colour from their id |
| 53-wild | The wild island: seasonal wild trees (`wildTreeParts`, `TREE_COLS`, `bareTree`; drawn near/far by `treeLOD` in 74-life), `genWild` (forests, thickets, rocky ground and meadows as clearable debris, incl. the `tree` kind), `heartSpot` (where the heart stood in saves from before you planted it yourself), and paths that wear in where you walk (`wearPaths`, `S.paths`) |
| 54-heart | The Island Heart: `HEART_UNLOCKS` (what each level brings), `unlocked`, `built`, `grantKits` (building kits), `nextGoal`/`goalTap` (the goal under your level), the tree (`heartTreeParts`: on a wild island `seedTreeParts`, your driftseed growing from seedling to great tree at `S.heartAt`; on a classic island `ancientTreeParts`), construction plots (`plotParts`), the level-up card, `rebuildHome`, and the morning when placed buildings finish and neighbours move in (`morningMoveIn`). Only for wild islands (`S.scratch`) |
| 55-town | Town layout (`layoutTown`): plaza, paths, civic buildings (hall, shop with sign, museum, harbour café), villager homes in their owner's style (`homeStyle`: boathouse on stilts, thatched round cottage, brick workshop, hill burrow, lookout, keeper's cottage), the lighthouse and its night beam, lamps, trees, flowers, benches and café seats | Fires (`campfireParts`, `addFire`, `updateFires`): flames sway in `flameMat`'s shader, sit small by day with a thread of smoke, and grow into a bonfire at dusk (or while you rest by one or have just lit it) with a ground glow (`firePoolMat`) and one shared `fireLight` in the fire nearest the camera.
| 56-interiors | Enterable rooms: separate `roomScene`, furniture (`furn`), room tapping |
| 59-museum | The walk-in museum (`buildMuseum`): fish tanks, butterfly garden, bug terrariums and a centrepiece, all filled from `S.alm`; Grandpa Tully the sea-turtle curator; the outdoor showcase (`refreshMuseumShow`) |
| 57-villagers | Species (`SPECIES` names and colours, `BODY` build, snout, ears and tail), personalities (`PERS`: sailor, dreamer, tinkerer, homebody, explorer, scholar) and what they wear (`STYLE`), models (`npcModel` with outfits and headwear), faces (`setFace`: blink, happy, talk), routines, chat, wishes, friendship |
| 57-routines | Villager daily routines (`chooseActivity`, `startActivity`, `actTick`): hobbies at real spots with held props, bench sitting, pair chats. Also memory: `logEvent` fills `S.log`, and `memoryLine`, `neighbourLine` and `activityLine` feed chat |
| 58-crafting | `RECIPES`, crafting, consumables; `syncObjs` builds placed decor, merging still pieces (fences, paths, hedges…) into one mesh |
| 61-player | Player looks (`LOOKS`, `applyLook`, `setLook`): the bunny or any `npcModel` species, in fur and outfit colours saved as `S.look`. The body is always `villager.children[0]`. |
| 60–64 | Ambient life (villager, boat, gulls, particles); time of day, which follows the device clock (`gameNow`, `realHour`, `dayKeyAt`, `setHour`; `S.toff` is the dev offset), real-time crop growth (`GROW_SLOW`) and offline catch-up (`simulate`); synth audio |
| 71-tools | Tool bar and held tools (`TOOLS`, `equip`); `toolTap` decides what a tap does with the equipped tool; `actAt` walks up, faces the tile and swings |
| 71b-toolfx | What tools leave behind: holes that open with each shovel stab and fill back in after a couple of minutes (`holeAt`, `digStab`), flung earth (`dirtFlick`), wood chips (`chips`), and felled trees that shudder, topple away from you, thump and bounce (`fellTree`, `updateFalls`). Tool swings themselves are keyframed in `TOOL_ANIM` (71-tools): `swingTool(onHit)` runs the effect at the strike, and `poseLean` leans the body into it |
| 70–80 | UI helpers and items; farming actions (`tillAt`, `waterAt`, `tendAt`, `useFixed`) and drag-farming; finds, weeds, wild plants, bugs and crows; fishing; sailing and fast travel; orders |
| 75-critters | Ambient animals (not saved, not catchable): birds, rabbits, squirrels, frogs, crabs, bees and the odd deer. `CRIT` sets how many of each by time of day (`critWant` adds the season), `critHabitat` where each lives, `spawnCritter` keeps them coming around you, and `updateCritters` wanders them and makes each flee its own way. Seasonal wild bushes are `bushParts` in 74-life |
| 89b-dream | Dev: the **Dream Island** (Settings → Dream island), a usual-sized home island (fixed seed, scale 1.4) at max level and laid out by hand on the grid: villa and brick patio, a walled flower garden, a brick plaza round the Island Heart, Main Street (shop, café, museum, hall), Cottage Row with fenced front gardens, an orchard and a decked tea garden by the pond, a two-field farm across the river with a row per crop in its legendary forms, a lake boardwalk, a beach lounge round a bonfire and a cliff-top lookout. `loadDream` backs up your save and reloads; `layDream` lays it all out once the land exists. Temporary: "Restore my save" brings your island back |
| 89-acornfield (layout) | Dev: the hand-laid Acornfield island (Settings → Acornfield island), `scale` 2.6 (about ten times a usual home island's area). `loadAcornfield` backs up your save, sets a fixed seed and an island preset in `S.home` (`preset`, `scale`, `dockX`, `fire`, `tent`), and places the civic buildings and cottages (neighbour builds with a `roof` colour, drawn by `cottage` in 55-town); after the reload `layAcornfield` lays the path network, the square, gardens, farm, flower beds, campsite, lamps and the woods on the real land. `homeScale()` (40-world) lets the rest of the engine (island radius, neighbour spacing, cliffs, beach, dock search, lighthouse, flower density) follow a bigger home island |
| 77-forage | Foraging: extra FINDS (mushroom, acorn, pinecone, berries, clover4, apple, clam, geode, oldcoin, truffle; dig spots and bubbles are non-enumerable), their sprites and models (`forageParts`), `forageSpawn` (by habitat, at dawn and through the day), `shakeTree`/`rustleBush` (tap a wild tree or bush without the axe), `digSpot` |
| 78b-seaguide | Finding your way at sea: `seaMarks` pins a marker to each of the nearest islands (name and distance once charted, ??? for rumours), clamped to the screen edge with an arrow when off-screen; tapping one sets course (`sailToIsland`). The chart lists the nearest rumours with a heading and a Set sail button. Boats cruise faster on long stretches, and islands are sighted from further off (`checkDiscovery`) |
| 79-voyage | The long-term loop: driftseeds wash ashore (`spawnDriftseed`); each wild island has a withered heart tree (`pickHeart`, `buildHeart`); planting 3 driftseeds restores the island (`S.restore`, `islandBiome` fades the grass until then), and a resident moves in with a daily trade (`residentTalk`, `tradeOf`). Tides (`updateTides`, `tideY`, `lowTide`) move the sea and uncover tide-pool finds |
| 79b-heartbeat | The island's heartbeat: tides run on absolute island time (`tideAt(t)`, `tideNow`, 79-voyage), so they drift ~50 min a day; the HUD tide pill counts down (`tideHUD`, `tideNext`), and when it turns `tideTurn` sweeps a wave across the screen and opens tide pools with finds only there (hermit crabs, anemones, starfish, pearls, the rare seahorse). Overnight the sea leaves gifts (`seaGifts`, from `dawn`), sleep and long absences end with a morning report (`morningCard`), and the diary lists tomorrow (`tomorrowLines`). Chance rewards: golden fish shadows (`goldFish`, short bite window, bonus), shiny forage (`shiny`, double). `buzz` is a haptic tap |
| 80b-trader | Marlo's boat: on a wild island the trader moors at your dock 8am–6pm (`updateTrader` sails it in and out; `traderTap` walks you down). The stall (`openSheet('trader')`) sells a daily stock (`traderStock`: seed packs, bait, decor you then place, a rod or can upgrade, a treasure map that buries something rare, a curio for the Islandex) and buys what you carry. The crate by your tent is the other way to sell (`crateTap`, `toCrate`); `collectCrate` pays out at dawn. Selling only happens in those places (`sheet.ctx`), and the menu's Shop button is hidden on a wild island |
| 81-journal | The day's structure: `JR_TASKS` (four little tasks a day, `jrMake`; actions report with `jrNote(k)`, pickups through `jrGain` from `gain`), the HUD chip and card (`jrChip`, `jrOpen`), task stamps and flying shells (`stamp`, `flyShells`), the first-discovery card (`reveal`, replaces the old “New in your Islandex” toasts), the bedtime diary (`S.today`, `showDiary`, shown by `sleep`), resting by the campfire (`campfire`, `fireTap`, `restByFire`) and the title screen for returning players (`showTitle`; skipped with `?debug` unless `&title`) |
| 82-sheets | The bottom bar's menu (`showApps`) and bottom sheets: Pockets (inventory and crafting), shop, seeds, orders, Islandex, chart, settings |
| 73-settle | Settling (a new game opens with the driftseed: you plant it first, and `tentBeside` pitches your tent next to the sprout): blueprints you place (`startBlueprint`, `bpOk`, `bpPlace`) for your tent (placing it plays the pitching moment, `pitchTent`/`updatePitch`: the camera leans in, pegs knock in as the canvas rises on a spring, the bonfire catches, then you name the island) and each kit, naming the island, and planting your driftseed (the `seed` blueprint, `seedOk`, `plantSeed`), which becomes the Island Heart |
| 84-input | Tap, drag, pinch and picking (`pick`, `onTap`) |
| 85-arrival | New game: drifting past islands (`islandCandidate`, `buildCandidate` builds the whole world and describes it), the flyover render loop (`arrivalFrame`), then landfall (`bootGame(true)`) |
| 86–87 | New-game setup; atmosphere (foam, footprints, sky events, motes, music) |
| 87b-ambience | Ambience and the small rewards of gathering: `say` (the caption over your head; `toast` sends every non-rare message here), the gathering streak (`streakBump`, pays out every 5), finds flying into the bag (`flyItem`), wildlife stirred up as you walk (`stirWildlife`), leaping fish that leave a shadow to cast at (`fishJump`), flocks passing over, morning mist and sunbeams through the trees (`updateRays`: one instanced draw of crossed planes, each beam pinned to a gap between trees and slanted along the sun, fading in and out rather than moving), and a soundscape that follows where you stand (`senseEnv`, wind/leaves/river/surf beds, the odd woodpecker, owl or frog) |
| 88-showcase | Dev **Showcase farm** (`loadShowcase`, `layShowcaseFarm`): backs up the save to `SAVE_KEY+'-real'`, maxes progress, lays out a planned late-game farm and reloads; `restoreRealSave` undoes it |
| 90-main | Main loop (`frame`) and boot (`bootGame`; a brand-new game arrives by sea first) |
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
| A bug or wild plant | Entry in `BUGS`/`PLANTS` (optionally with `sea`, `hr`, `rain`/`dry`; see 11-dex) (a model `kind` is already handled in `bugGroup`/`plantGroup`, 74-life) |
| Decor | Entry in `BUILD` (add `craft:true` for craft-only) → `case` in `objGroup` + tap height in `OBJ_H` (50-objects). The thumbnail is generated automatically. |
| A recipe | Push onto `RECIPES` (58-crafting). Inputs are item keys: `m:` material, `c:` crop (any variant), `f:`/`b:`/`p:`/`g:` catch and finds. |
| A villager species | `SPECIES` (names, colours) + `BODY` (build, head, ears, snout, tail): the model is assembled from those (57-villagers) |
| A villager activity | A case in `chooseActivity` (where, how long, prop) + `actTick` (pose and effects) + `ACT_LINES` (57-routines) |
| Something villagers remember | `logEvent('type',{name})` where it happens + a `MEM_TPL` entry with per-personality reactions (57-routines) |
| A personality | `PERS` (label, sign-offs, lines, hobby) + `STYLE` (outfits, accessories) + `ROOM_STYLE` and furniture in `buildRoom` (56-interiors) |
| A room with its own camera | Return `follow:true` (and optionally `tick`, `title`) from the room builder; `updateRoom` follows the player and runs `tick` each frame. Props with `info` run it when tapped. |
| Furniture | A `case` in `furn` + a `put()` in `buildRoom` (56-interiors) |
| A flower species | `FLOWER_SP` + `FLOWER_H` + a `case` in `flowerHead` (55-town) |
| Ground detail | Draw it in a `patternTex` in 31-ground. Don't add geometry. |
| A palm type | A `case` in `treeParts` calling `palmParts` with options, and add it to `PALMS` (41-trees). Beaches get palms from `palmSpots`. |
| A biome | `BIOMES` entry (colours, trees, names) + any new tree kinds in `treeParts` |
| A tool (e.g. the hoe) | Entry in `TOOLS` + icon in `SPR` + held model in `HELD_PARTS` + a case in `toolTap` (and in `paintMode` for drag) (71-tools) |
| A player look | Entry in `LOOKS` (61-player), plus a `case` in `npcModel` if it's a new species |
| A home style | A case in `homeStyle` keyed by personality (55-town); `planVillagers` (57-villagers) decides who lives where |
| A café drink | An entry in `CAFE` (56-interiors) and a check with `buffOn(k)` where it applies |
| A sheet tab | A branch in `renderSheet` + data-attribute handlers in the `#sheetBody` click listener (82-sheets) |

## Performance rules

- **Terrain is baked:** each island's tiles become one mesh per material (`makeBake` in 44-terrain). Faces nobody can see are dropped: bottoms, cliff tops under the grass slab, and sides against an equally tall neighbour. Tile colours go in vertex colours and beach slopes in the vertices. Don't add per-tile instanced batches back.
- **Far islands:** past a short distance an island draws only its terrain, water and trees (meshes tagged `userData.core`, plus `isl.veg`); everything else in its group (`isl.detail`) is hidden by `cullIslands`. Sky clouds outside the narrow view are skipped, and the shadow map is 1024².
- **Decor batching:** `syncObjs` merges still decor by material (plain, glowing) and all lamp glows into one instanced batch, so a busy island costs a handful of draw calls.
- **Debris range:** trees, bushes and rocks are instanced per variant, and `debLOD` (74-life) only draws those within `lodR` of the camera (trees further than bushes, both widening as you zoom out). Bushes cast no real shadow, only their blob.
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
