# DOORS

### Every door tells a story.

A cinematic 3D web experience built for a hackathon: a hallway with five
doors, each opening into a different realistic environment that reveals
part of one connected story.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview
```

## Controls

- **W / S** or **Up / Down arrows** — walk forward / back
- **Click + drag** (mouse or touch) — look around
- **Click a door** (when close enough to glow) — open it
- **Click objects in a scene** (photograph, clock, suitcase, calendar,
  mirror) — reveal a story clue
- **Esc** or the **BACK** button — return to the hallway from any scene

## What's inside

- `src/systems/StoryState.js` — the single Zustand store: which doors have
  been visited, which clues have been found.
- `src/systems/AudioSystem.js` — a small Web Audio synthesis engine.
  **The project ships with zero binary audio assets** — footsteps, the
  door handle, the door swing, rain, and room tone are all generated at
  runtime, so there's nothing to source or download to hear the scene.
  Audio only starts after the ENTER button (a real user gesture), per
  browser autoplay rules.
- `src/components/` — the reusable pieces: `Corridor` (the hallway),
  `Door` (hover glow, handle turn, swing-open animation), `PlayerController`
  (eased forward/back travel + clamped mouse-look, never a raw FPS strafe),
  `SceneTransition` (the fade that hides every cut), `LoadingScreen`,
  `EndingOverlay`, `AudioManager`, and `Furniture.jsx` (shared room
  primitives: bed, table, lamp, window, rug, room shell, dust motes).
- `src/scenes/` — the five destinations:
  - **MorningScene** (`06:42`) — a bedroom frozen at the door's own time,
    with a photograph clue.
  - **TrainScene** (`LAST TRAIN`) — a rain-soaked platform at night, with
    an abandoned suitcase clue.
  - **ChildhoodScene** (`2012`) — a nostalgic bedroom; its photograph
    connects back to Scene 1 once you've seen both.
  - **Room404Scene** (`ROOM 404`) — an ordinary hotel room whose mirror
    does *not* reflect the room. It shows the opening hallway instead —
    colder, and slightly wrong — rendered live into the mirror's surface
    via `@react-three/drei`'s `RenderTexture` portal.
  - **HomeScene** (`HOME`) — the quiet final room. A photograph on the
    table ties the whole story together, then the experience closes with
    the three closing lines and a way back to the hallway.

## Notes on scope

Every door and every interactive object is fully wired — there are no
placeholder buttons and no dead ends. Geometry is built from primitives
(boxes, cylinders, planes) rather than imported 3D models, per the "no
external assets required" rule in the brief: materials, lighting,
fog, dust particles, and postprocessing (bloom, depth of field, film
grain, vignette) carry the atmosphere instead. Postprocessing is
skipped automatically on touch/coarse-pointer devices to keep mobile
smooth.

If you want to swap in real GLTF models, HDRI environments, or recorded
audio later, the structure is built to drop them in: replace the
primitive geometry inside any `scenes/*.jsx` file, or swap the
synthesized calls in `AudioSystem.js` for `<audio>`/Howler playback
without touching any other file.
