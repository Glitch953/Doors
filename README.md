## Inspiration

We wanted to build something that didn't feel like a Three.js demo — no
spinning cube, no neon grid floor. The idea came from a simple image: a
hallway with doors you can't see behind, each one holding a fragment of
the same memory. "Every door tells a story" became the whole design
brief in five words, and everything — the pacing, the sound, the mirror
reveal — got built in service of that line.

## What it does

DOORS is a first-person, cinematic 3D website. You walk down a hallway
and open five doors, each leading to a fully realized environment: a
bedroom frozen at 06:42, a rain-soaked train platform at night, a
nostalgic childhood room from 2012, an ordinary hotel room whose mirror
shows something it absolutely should not, and finally a quiet room that
ties every earlier scene together. Clicking objects in each scene —
a photograph, a suitcase, a calendar, the mirror — reveals a piece of
the story through environmental detail instead of text dumps or UI
panels.

The biggest moment is Room 404: stand in front of the mirror and it
doesn't reflect the hotel room around you. It shows the hallway from
the very beginning of the experience — colder, dimmer, and not quite
right.

## How we built it

- **React Three Fiber + drei** for the 3D scene graph and helpers
- **GSAP** for every hand-tuned animation: the door swing, the handle
  turn, the camera transitions between scenes
- **Zustand** for a lightweight story-state store tracking which doors
  have been opened and which clues found, so later scenes can react to
  what you've already seen
- **@react-three/postprocessing** for bloom, depth of field, film grain,
  and a vignette — doing a lot of the "cinematic" heavy lifting that
  would otherwise need baked lighting
- A **custom Web Audio synthesis engine** instead of sound files —
  footsteps, the door creak, rain, and room tone are all generated at
  runtime with oscillators and filtered noise, so the project needed
  zero external audio assets to feel alive
- The mirror in Room 404 is a `RenderTexture` portal: a second, smaller
  "ghost" version of the hallway is rendered live into a texture and
  mapped onto the mirror's surface, rather than faking it with a static
  image

## Challenges we ran into

- **Getting movement to feel cinematic, not FPS.** Raw WASD strafing
  broke the mood instantly. We settled on eased forward/back travel
  along a single axis plus a clamped, drag-based look-around — enough
  agency to feel present, not enough to feel like a shooter.
- **The mirror.** Reflecting real geometry in real time is expensive and
  fiddly; rendering an entirely separate "ghost hallway" scene into a
  texture turned out to be both cheaper and narratively stronger, since
  it let us deliberately make it *wrong* rather than just accurate.
- **No asset pipeline.** With no time to source or license 3D models and
  audio, every room is built from primitives — boxes, cylinders, planes
  — and every sound is synthesized. The challenge became making
  restraint look intentional: materials, lighting, and fog carrying the
  realism instead of geometry density.
- **Keeping five separate scenes feeling like one story** rather than
  five disconnected demos, using shared components (a `Furniture.jsx`
  kit, a common `PlayerController`, one `SceneTransition` fade) so the
  whole experience reads as one continuous place.

## What we learned

That atmosphere is mostly a lighting and pacing problem, not a polygon
problem — a low-poly room with the right fog, warm point lights, and a
slow camera can read as more "real" than a high-fidelity scene with flat
lighting. We also learned how far procedural audio can go in a browser
without a single audio file, and how much a single well-placed reveal
(the mirror) can carry an entire experience.

## What's next for DOORS

- Swap in real GLTF models and an HDRI environment for the hallway,
  since the architecture is already set up to drop them into any scene
  file without touching the rest of the app
- Add recorded/foley audio alongside the synthesized layer for texture
- A sixth, hidden door that only appears once all five story clues have
  been found
