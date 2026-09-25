# Driftseed Isle

A tiny 3D pixel-art island farming game. Open `index.html` in any modern browser (works great on iPhone).

- **Tap to walk, tools to act:** tap anywhere to walk there. Pick a tool from the tool bar (hands, shovel, watering can, seeds, axe, net, fishing rod), and a tap walks you over and uses it. The shovel digs soil and breaks rocks, the axe chops trees and stumps for wood, the net catches bugs and the rod fishes. Long-press and drag repeats the tool across tiles. Keys 1–7 switch tools on desktop.
- **Your look:** play as a bunny, cat, fox, dog, bear, frog, duck or penguin, in your choice of fur and outfit colour. Tap the level chip, then **Your look**.
- **Farm:** dig with the shovel, plant with seeds, water with the can, and harvest ripe crops with any tool.
- **25 crops:** turnip, radish, carrot, lettuce, red onion, potato, cabbage, strawberry, wheat, sweet peas, bell pepper, tomato, tulip, sunflower, corn, eggplant, blueberry, pumpkin, lavender, watermelon, moonflower, grapes, peach, starfruit and night-blooming dragon fruit. They unlock as you level up.
- **Farm field:** across a wooden bridge west of home lies a big flat field, overgrown with weeds, twigs, bushes, rocks, stumps and boulders. Tap them to clear the land (stumps and boulders take several hits). Clearing gives wood, stone and fiber, plus the odd old coin or seed packet. A few weeds and twigs creep back each morning.
- **Drag-farming:** press and hold a tile, then drag across others to till, plant, water, tend, harvest or clear a whole row in one motion. The action is chosen from the first tile you touch.
- **Sell:** tap the shipping bin by your home, or open the Bag. One crop sells for 1.5× each day.
- **Rare variants:** crops can ripen as Giant, Moonlit (only at night), Golden, Crystal or Prismatic. Collect them all in the Almanac.
- **Between harvests:** tap the sea to fish (wait for the bobber to plunge, then tap), pick up beach finds and messages in bottles, catch butterflies and moths, pull weeds, shoo crows off your crops, and tend each crop once a day for a growth boost.
- **Orders:** three new requests arrive each morning; finish them all for a bonus and a Mystery Seed.
- **Explore:** board your sailboat at the dock and sail to procedurally generated islands (meadow, tropical, pine, autumn, snowy, volcanic and swamp). Each has its own bugs, wild plants, berries, beach treasures and fish. Use the Sea Chart to navigate; the world curves away at the horizon like a rolling log.
- **Travel:** the islands sit close together, a few seconds' sail apart. Tap any island you've already found on the Sea Chart to travel there instantly. Sail out to discover new ones. At sea, scoop up floating crates, driftwood and bottles, and watch dolphins leap alongside the boat.
- **Islandex:** the main goal: record every fish, bug, plant and find in the archipelago (100+ entries), plus rare crop variants at home.
- **Fishing (Animal Crossing style):** fish shadows swim near every shore and out at sea. Their size hints at the species, and big ones show a fin. Cast near a shadow, wait while it nibbles, then tap the moment the bobber is pulled under. Tap too early and it gets spooked.
- **Islands and rivers:** wild islands are 20% bigger. Five huge Great Isles sit at the edge of the archipelago, with three levels of cliffs. Each has one or two wide rivers that run from an inland pond down to the sea, dropping over waterfalls at each cliff and crossed by wooden bridges. The volcano isle has a river of lava. Larger normal islands have a narrow stream. Your villager walks around rivers and crosses at the bridges. Tap a river to fish for 10 new river fish, including trout, koi, steelhead, arowana and the rare Golden Trout. Your home island can now be expanded twice more.
- **Island style:** bigger islands with cliffs and raised plateaus, rounder trees, in the style of Wild World. Sailing uses real pathfinding, so the boat steers around islands.
- **Painted ground & gradient trees:** grass, paths, sand and cliffs use patterned textures, as in Animal Crossing, not thousands of grass blades, which keeps the polygon count low. Round trees are clusters of drooping leaves shaded light to dark, and pines have layered, gradient boughs. Beaches slope gently down into the water, and four kinds of palm grow on them: coconut, tall leaning, short fan and twin-trunk palms. The villager, boat, fish, houses and rocks are all more detailed.
- **Atmosphere:** waves lapping at every shore, footprints and footsteps in the sand, drifting clouds, the moon and stars, petals, autumn leaves, snow, embers or spores depending on the island, swamp mist, rain that stops mid-day and leaves a rainbow, shooting stars you can wish on (star fragments wash up the next morning), meteor showers, and a gentle music box melody with birdsong by day and crickets at night.
- **Dev tools** (tap your level badge): time-of-day slider, time speed (pause to 60×), weather, shooting stars and meteor showers, skip to morning, extra shells.
- **Build:** buy decor and useful buildings (sprinklers, beehives, lucky clover, windmill), expand the island, and upgrade your tent to a villa.
- **Day/night:** a full day lasts 8 minutes, with sunrise, sunset, lantern light, fireflies and rainy days. Sleep in your home at night to skip ahead.
- **Controls:** drag to spin, pinch to zoom, two fingers to pan. Progress saves on your device.

Built with three.js (r128). Everything is rendered at low resolution, then passed through an outline and dither shader for the pixel look.

## Development

The game is built from `src/` into the single file `index.html`. See [ARCHITECTURE.md](ARCHITECTURE.md) for the module map, conventions and how to add content.

```
npm run build   # src/ → index.html (also fails on syntax errors)
npm test        # build, then a headless play-through (needs Playwright)
npm run check   # CI: is index.html up to date?
```

Open `index.html?debug` to get `window.DS`, a small console API for testing.
