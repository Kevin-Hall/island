# The Seaward Keep

A small pixel-art adventure based on a painting of a wizard walking up a grassy ridge toward a seaside castle.

Open `index.html` in a browser. There is no build step and there are no dependencies.

## How to play

The gulls have scattered the five Star Seals that unlock the Keep's gate. Find all five and return to the gate.

| Action | Keyboard | Touch |
| --- | --- | --- |
| Walk | WASD or arrow keys | Left joystick |
| Talk, read, or cast a spark | Space, Enter, E, or Z | ✦ button |
| Toggle sound | M | Sound button |

- Talk to Old Brannoc by the rowboat and Isolde on the pier for hints.
- Sparks defeat crabs (which sometimes drop hearts) and burn through bramble.
- You can wade through the pale shallows southwest of the beach.

## How it's built

Everything is in `index.html`: canvas rendering, WebAudio music and sound effects, and the DOM UI.

- The island terrain is generated per pixel from blended ellipses and value noise, then painted once into an offscreen canvas with ink coastlines, foam, and grass shading.
- Sprites are hand-authored character grids or drawn procedurally. The Keep is one vector drawing that is reused for the in-world castle and for the title and ending scenes.
