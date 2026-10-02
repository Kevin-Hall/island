`sprite.glb` (Sprite, the green-sweater kid): made by the game's owner from a picture with Meshy AI, rigged and
animated there (a Mixamo skeleton with Walking, Running and two stunt clips), then slimmed by `tools/glbslim.mjs`
(same mesh, rig and clips; the base colour shrunk to a 1024px JPEG; normal and metal/roughness maps and material
extensions dropped, since the game's toon shading only reads colour): 15 MB to 2.5 MB. It has no Idle clip, so the
game makes one from the walk (`idleFrom`).
The game lists characters in `CHARS` (src/game/61b-characters.js) and loads one only when it's needed. Rigged ones
(Idle, Walk and Run clips, renamed through `clips`) animate; `tools/gltf2glb.mjs` repacks an embedded `.gltf` as `.glb`.
