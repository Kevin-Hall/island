# The Seaward Keep

A small third-person 3D adventure built from a painting of a wizard walking up a grassy ridge toward a seaside castle.

Open `index.html` in a browser. There is no build step. Three.js (r160) loads from cdnjs.

## How to play

The gulls have scattered the five Star Seals that unlock the Keep's gate. Find all five, then walk up to the gate.

| Action | Keyboard / mouse | Touch |
| --- | --- | --- |
| Walk | WASD or arrow keys | Left joystick |
| Run | Shift | — |
| Jump | Space | Jump button |
| Look around | Drag, scroll to zoom | Drag |
| Chunky or fine pixels | P | Pixels button |
| Sound | M | Sound button |

Seals are hidden on the beaches, the harbor pier, and a small islet you reach by wading across the pale shallows. The stone stairs east of the ridge lead down to the harbor.

## How the look is made

- **Toon shading**: every surface uses a three-step toon ramp with a cool blue fill light, so shadows go bluish like the painting's.
- **Ink outlines**: a post-process pass renders scene normals and depth, then draws dark lines wherever they change sharply (a Laplacian on inverse depth plus normal differences).
- **Pixel texture**: the scene renders at a fraction of screen resolution and is upscaled with nearest-neighbor filtering. This matches the painting's dithered, pixel-painted texture. Press P for a finer version.
- **Sea**: a shader reads a heightmap of the island to paint turquoise shallows, foam, and an inked shoreline.
- **Terrain**: generated from blended ridge, plateau, and beach shapes, with vertex colors for grass, path, sand and rock, and a world-space stipple.

The earlier 2D top-down version is kept in `pixel-2d.html`.
