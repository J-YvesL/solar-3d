# 06 — Interactions & UI Specification

## Picking (`three/Picker.ts`)

- Raycast on **`pointerup`**, and only if the pointer moved less than 5 px since `pointerdown` (so orbit-dragging never selects).
- `THREE.Raycaster` against the array of body meshes only (keep a flat `pickables: Mesh[]` list — never raycast the whole scene; orbit lines, starfield and rings must not be pickable).
- Hit → `bodyId = mesh.userData.bodyId` → emit `onBodySelected(bodyId)`.
- No hit **while focused** → emit `onSelectionCleared()` (click empty space = exit focus).
- No hit while in system view → do nothing.
- In system view, moons are hidden and therefore not pickable; in focused view the focused planet's moons are pickable.
- Touch: `pointerup` covers tap automatically (Pointer Events). Don't add separate touch handlers.

### Hover (desktop only)

On `pointermove` (throttled to one raycast per frame max): if over a pickable body, set `canvas.style.cursor = "pointer"` and bump the material (`material.emissive.setHex(0x222222)` — only if the material is a `MeshStandardMaterial`; the sun uses `MeshBasicMaterial`, which has no emissive: cursor change only); restore (`0x000000`, cursor `default`) when leaving. Skip hover logic entirely on touch-only devices (`matchMedia("(hover: none)")`).

## Selection state machine (React, `App.tsx`)

```
        ┌──────────┐  fetch+textures OK   ┌────────────┐
        │ loading  │ ───────────────────▶ │   system   │ ◀───────────┐
        └──────────┘                      └────────────┘             │
              │ fetch/textures fail            │ onBodySelected(id)  │ Escape / Back /
              ▼                                ▼                     │ onSelectionCleared
        ┌──────────┐  Retry button        ┌────────────┐             │
        │  error   │ ─────▶ loading       │  focused   │ ────────────┘
        └──────────┘                      │ (bodyId)   │ ─┐
                                          └────────────┘  │ onBodySelected(otherId)
                                                ▲─────────┘ (re-focus, incl. moons)
```

- `selectedBodyId: string | null` is the single source of truth, owned by React.
- Entering focused: effect calls `scene.focusBody(id, layout)`. Leaving: `scene.resetView()`.
- Selecting another body while focused (e.g. clicking a moon): just call `focusBody(newId, layout)` again — the CameraDirector animates from wherever it is. Focusing a **moon** keeps its planet's moonsGroup visible and shows the moon's info panel.
- Clicking the **sun** focuses it like a planet (no moons to show).
- Escape key listener: `window.addEventListener("keydown", …)` in a React effect, active only when focused.

## Layout & responsiveness

Single breakpoint rule, defined once in `react/useLayout.ts`:

```ts
const isVertical = useMediaQuery("(max-width: 768px), (orientation: portrait)");
const layout = isVertical ? "vertical" : "horizontal";
```

(`useMediaQuery` = small local hook on `window.matchMedia` + change listener.)

- The canvas **always** fills the viewport (`position: fixed; inset: 0`). The InfoPanel overlays it (the 3D never resizes when the panel opens; the view-offset trick from doc 05 does the framing).
- If `layout` changes while focused (rotation, window resize across the breakpoint), an effect calls `scene.setFocusLayout(layout)` and the panel re-renders on the other half.

### Focused view, horizontal (desktop)

```css
.info-panel { position: fixed; top: 0; right: 0; bottom: 0; width: 50vw;
              display: flex; align-items: center; justify-content: center;
              pointer-events: none; }
.info-card  { pointer-events: auto; max-width: 480px; width: 85%;
              max-height: 85vh; overflow-y: auto; }
```

### Focused view, vertical (mobile)

```css
.info-panel { position: fixed; left: 0; right: 0; bottom: 0; height: 50vh;
              display: flex; align-items: flex-start; justify-content: center; }
.info-card  { width: 92%; max-height: 46vh; overflow-y: auto; margin-top: 8px; }
```

Panel mount/unmount animation: fade + 12 px slide (CSS transition, 200 ms). No animation library.

## InfoPanel content (`react/InfoPanel.tsx`)

Card style: `background: rgba(10, 14, 24, 0.82); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; color: #E8EDF4; padding: 24px;`.

Content, top to bottom (all data comes from the `Body` object — no extra fetch):

1. **Name** (h1) + type badge (`star` / `planet` / `moon` — small uppercase chip in the body's `color`).
2. `description` (from `info`).
3. Fact rows (label left, value right; omit a row when the field is null):
   - **Composition** — `info.composition`
   - **Radius** — `radiusKm` formatted `6 371 km`
   - **Orbital period** — humanized: `< 2 days` → `"X hours"`; `< 730 days` → `"X days"`; else `"X years"` (1 decimal, divide by 365.25)
   - **Day length (rotation)** — `rotationPeriodHours` humanized: `< 48 h` → hours, else days (1 decimal)
   - **Distance from parent** — `semiMajorAxisKm` formatted with thin spaces, label "Distance from Sun" for planets / "Distance from <parent name>" for moons
   - **Moons** — for planets with moons: comma-separated names (from `model.childrenOf(id)`)
4. **Fun fact** — `info.funFact`, italic, separated by a thin rule.

Number formatting helper (domain or react util): integer grouping with narrow no-break spaces (`Intl.NumberFormat("en-US")` then replace `,` — or `useGrouping` with `" "`).

## HUD (`react/Hud.tsx`)

- **Back button**: visible only when focused. Fixed top-left, `← Back`, same glassy style as the card, `z-index` above canvas. Click → clear selection.
- **Hint line**: in system view only, fixed bottom-center, small faded text: `Click a planet to explore — drag to rotate, scroll to zoom`.
- **Attribution footer**: fixed bottom-right, 11 px, opacity 0.45: `Textures: Solar System Scope (CC BY 4.0)` linking to `https://www.solarsystemscope.com/textures/`. Always visible (license requirement, doc 08).

## Loading & error screens

- **Loading**: black full-screen, centered pulsing text `Loading the solar system…` (CSS keyframe opacity 0.4→1). Shown until API **and** texture preload both resolve.
- **Error**: black full-screen, centered: `Could not load the solar system.` + the error message (small, gray) + a `Retry` button that re-runs the whole boot sequence.

## Edge cases (must all work)

| Case | Expected behavior |
|---|---|
| Click while camera transition is running | Ignored (SceneManager ignores picks while animating) |
| Escape in system view | Nothing |
| Click a moon in focused view | Re-focus on the moon; panel shows the moon; Back/Escape returns to **system view** (not to the planet — keep it simple) |
| Click the sun | Focus + panel (no moons group, dist = 8·sunRadius) |
| Resize while focused | Canvas resizes, view offset re-applied, panel reflows |
| Orientation change while focused | Layout flips between horizontal/vertical, `setFocusLayout` called |
| Drag to orbit then release over a planet | No selection (5 px movement threshold) |
| Double-click / rapid clicks | No double-focus glitch: focusBody on an already-focused id is a no-op |
| API returns slowly | Loading screen persists; no partial scene |
| One texture file missing | Body falls back to flat color (doc 08); console.warn, no crash |
