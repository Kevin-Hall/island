`kid.glb` (the Campfire Kid): made by the game's owner from a picture with Meshy AI, then slimmed by
`tools/glbslim.mjs` (same mesh; the 4096px base colour shrunk to a 1024px JPEG; normal and metal/roughness maps
dropped, since the game's toon shading only reads colour): 30 MB to 0.9 MB. A static model: no rig or clips yet.
The game lists characters in `CHARS` (src/game/61b-characters.js) and loads one only when it's needed. Rigged ones
(Idle, Walk and Run clips) animate; `tools/gltf2glb.mjs` repacks an embedded `.gltf` as `.glb`.
