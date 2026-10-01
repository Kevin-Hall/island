three.js r128 add-ons, copied unmodified from `three@0.128.0/examples/js/` (MIT, © three.js authors) so the
game loads its characters without fetching code at runtime. `tools/build.mjs` inlines every `.js` here before the game.
- `GLTFLoader.js` — loads the player characters (`assets/characters/*.glb`)
- `SkeletonUtils.js` — clones a rigged character (player, the room copy, the editor's model, thumbnails)
