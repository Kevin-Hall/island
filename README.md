# Sporeholm

A small, quiet mushroom-breeding game in three.js, all in one `index.html`.
The island is drawn like a pen-and-ink map: paper-toned terraces, ink outlines, stipple and dashed ripples.
The only saturated colour in the world comes from the mushrooms you find and breed.

Open `index.html` in a browser (three.js loads from a CDN). Progress saves in your browser.

## How it plays

1. **Forage.** Four wild strains grow in patches around the island. Picking one gives you the mushroom and 2 spores.
2. **Plant.** Choose spores in the hotbar and click a log bed by the cabin.
3. **Cross.** An empty bed touching two grown mushrooms catches their spores and sprouts a hybrid.
   Hybrids blend hue and inherit cap shape, size, pattern and (rarely) glow, with occasional mutations.
4. **Sell.** Take your basket to the market boat on the pier. The buyer also posts orders, such as "Speckled Orchid Spire", that pay a bonus.
5. **Collect.** The journal (J, or click the cabin) records every strain you have harvested.

Mushrooms grow faster at night and near water. Buy extra log beds and rare glowing spores at the market.

**Controls:** WASD or click to walk · 1–9 hotbar · right-click an empty bed to pick it up · Q/E rotate · scroll zoom · T skips six hours

---

# Sporekeeper (`sporekeeper/index.html`)

A separate prototype: you are the last keeper of a grotto sealed behind a waterfall, breeding mushrooms to rediscover its 120 lost species.
Each discovery brings back part of the grotto: dead stalks recede and glowing flora returns in that colour's zone.

- **Diorama view:** fixed, gently drifting camera, tuned for portrait phones. All UI is HTML over the canvas.
- **Four traits:** cap colour, cap shape, stem and special. A hybrid takes each trait from one parent or the other; colour genes can blend.
- **Conditions gate rarity:** glow shows only under the moonlight lamp, scent only in mist, giants only in peat.
  Crimson × Azure blends to Violet in acidic soil, Crimson × Ivory to Amber in ash, and Azure × Ivory to Cyan in peat.
- **Fungepedia:** 120 species (6 colours × 5 shapes × 4 specials) with rumours hinting at undiscovered ones.
- **Real-time growth:** the first plantings take about a minute, rising toward 6 minutes. Growth continues while the page is closed, and a free wild spore washes into the pool every 3 minutes.
- **Dew** (earned by harvesting) buys plots, soils, the mist machine and the moonlight lamp. Breeding itself never costs anything.

Progress saves in the browser (`localStorage`).
