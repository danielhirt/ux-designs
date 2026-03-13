# Foundation Dither Sphere Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone HTML component featuring a Bayer-dithered prediction sphere with converging data streams, inspired by Foundation's psychohistory visualizations.

**Architecture:** Single self-contained HTML file using Canvas 2D with ImageData buffer for per-pixel Bayer matrix dithering. All rendering layers (background glow, sphere, data streams, floating notation) composited in a single `requestAnimationFrame` loop. No external dependencies.

**Tech Stack:** HTML5 Canvas 2D, vanilla JavaScript, inline CSS

**Spec:** `docs/superpowers/specs/2026-03-13-foundation-dither-sphere-design.md`

---

## Chunk 1: Scaffold and Static Sphere

### Task 1: Create registry entry

**Files:**
- Create: `registry/foundation-dither-sphere/meta.json`

- [ ] **Step 1: Create meta.json**

```json
{
  "title": "Foundation Dither Sphere",
  "slug": "foundation-dither-sphere",
  "prompt": "A psychohistory-inspired prediction sphere rendered entirely through 8x8 Bayer matrix ordered dithering. Amber-gold sphere with cold blue data streams converging inward, evoking Hari Seldon's vault projections from Foundation. Pure Canvas 2D, ambient animation with breathing radius, dither crawl, and flowing particle streams. Dark void background with sparse floating mathematical notation.",
  "tags": ["dither", "animation", "canvas", "sci-fi", "generative"],
  "date": "2026-03-13",
  "description": "A Bayer-dithered prediction sphere with converging data streams, inspired by Foundation's psychohistory visualizations."
}
```

- [ ] **Step 2: Commit**

```bash
git add registry/foundation-dither-sphere/meta.json
git commit -m "feat: add foundation-dither-sphere registry entry"
```

### Task 2: HTML scaffold with canvas setup

**Files:**
- Create: `registry/foundation-dither-sphere/foundation-dither-sphere.html`

- [ ] **Step 1: Create the HTML file with canvas, styles, and render loop skeleton**

The HTML file needs:
- `<!DOCTYPE html>` with full `<html>`, `<head>`, `<body>`
- `<style>`: `margin: 0; overflow: hidden; background: #08060a;` on body, canvas fills viewport via `width: 100vw; height: 100vh; display: block;`
- `<canvas id="c"></canvas>`
- `<script>` block with:
  - Canvas setup: get context, set `canvas.width = canvas.clientWidth`, `canvas.height = canvas.clientHeight` (1:1 CSS pixel ratio — do NOT use `devicePixelRatio`)
  - Resize handler: update canvas dimensions on `window.resize`, recalculate derived values
  - The 8x8 Bayer threshold matrix as a flat array (64 values from the spec, each divided by 64):

```javascript
const BAYER = [
  0,32,8,40,2,34,10,42,
  48,16,56,24,50,18,58,26,
  12,44,4,36,14,46,6,38,
  60,28,52,20,62,30,54,22,
  3,35,11,43,1,33,9,41,
  51,19,59,27,49,17,57,25,
  15,47,7,39,13,45,5,37,
  63,31,55,23,61,29,53,21
].map(v => v / 64);
```

  - `getBayerThreshold(x, y)` helper: `return BAYER[(y % 8) * 8 + (x % 8)]`
  - Empty `render(time)` function called via `requestAnimationFrame`
  - `ImageData` object created once (`ctx.createImageData(w, h)`), reused each frame
  - Helper to set pixel in ImageData buffer:

```javascript
function setPixel(data, x, y, r, g, b, a) {
  const i = (y * canvas.width + x) * 4;
  data[i]     = r;      // 0-255
  data[i + 1] = g;      // 0-255
  data[i + 2] = b;      // 0-255
  data[i + 3] = a * 255; // a is 0-1, ImageData expects 0-255
}
```

- [ ] **Step 2: Verify canvas renders** — open in browser, confirm black `#08060a` background fills the viewport with no scrollbars or margins.

- [ ] **Step 3: Commit**

```bash
git add registry/foundation-dither-sphere/foundation-dither-sphere.html
git commit -m "feat: scaffold foundation-dither-sphere with canvas and Bayer matrix"
```

### Task 3: Render static dithered sphere

**Files:**
- Modify: `registry/foundation-dither-sphere/foundation-dither-sphere.html`

- [ ] **Step 1: Implement sphere rendering function**

Add a `renderSphere(imageData, cx, cy, radius, crawlOffset)` function:

1. Compute sphere bounding box: `x0 = cx - radius`, `x1 = cx + radius`, clamped to canvas bounds
2. For each pixel `(x, y)` in the bounding box:
   - Compute distance from center: `dx = x - cx`, `dy = y - cy`, `dist = sqrt(dx*dx + dy*dy)`
   - Skip if `dist > radius` (outside sphere)
   - Compute 3D surface normal: `nx = dx/radius`, `ny = dy/radius`, `nz = sqrt(max(0, 1 - nx*nx - ny*ny))`
   - Compute diffuse lighting: `diffuse = max(0, nx * -0.4 + ny * -0.5 + nz * 0.75)` (light from upper-left)
   - Compute specular: `spec = pow(max(0, reflect dot view), 32)` using half-vector or simplified Blinn-Phong. A simpler approach: `spec = pow(max(0, nz * 0.8 + nx * -0.3 + ny * -0.3), 40) * 0.6`
   - Compute luminance: `lum = diffuse * 0.65 + spec * 0.5` clamped to [0, 1]
   - Apply Bayer threshold: `threshold = getBayerThreshold(x + crawlOffset, y + crawlOffset)`. If `lum > threshold`, draw the pixel; otherwise skip
   - Color: mix amber and blue based on position. Use `distRatio = dist / radius`. Core is amber `(220, 170, 60)`, with blue `(70, 130, 255)` blended in via a sine wave: `blueMix = max(0, sin(distRatio * PI * 1.5)) * 0.25`. Interpolate RGB channels.
   - Alpha: `0.6 + lum * 0.4`
   - Write pixel to ImageData buffer via `setPixel`

2. Call `renderSphere` from `render()` with sphere centered at `(w/2, h/2)`, radius = `min(w, h) * 0.2`

- [ ] **Step 2: Verify sphere renders** — open in browser. Confirm:
  - Sphere appears centered, amber-gold dominant with blue threading
  - Bayer grid pattern is clearly visible (ordered, not random)
  - 3D volume reads convincingly (bright upper-left, dark lower-right)
  - Sphere dissolves into void at shadow edges

- [ ] **Step 3: Iterate on sphere quality**

This is the critical step. The sphere must read as volumetric. Tune:
- Diffuse/specular balance — if too flat, increase specular power; if too harsh, soften diffuse
- Blue mix amount and distribution — should feel like veins of cold data, not a uniform tint
- Edge falloff — the dither should thin out naturally at the sphere's shadow edge, not cut off abruptly. Consider multiplying luminance by a smooth edge falloff: `edge = smoothstep(0.85, 1.0, distRatio)`, `lum *= (1 - edge)`
- Bayer threshold sensitivity — if the sphere looks too sparse or too dense, scale the luminance range

- [ ] **Step 4: Commit**

```bash
git add registry/foundation-dither-sphere/foundation-dither-sphere.html
git commit -m "feat: render static Bayer-dithered sphere with 3D lighting"
```

## Chunk 2: Background Glow and Data Streams

### Task 4: Add background radial glow

**Files:**
- Modify: `registry/foundation-dither-sphere/foundation-dither-sphere.html`

- [ ] **Step 1: Add dithered background glow**

Before `putImageData` in `render()`, draw a smooth radial gradient glow using `ctx.createRadialGradient`:

```javascript
function renderGlow(ctx, cx, cy, radius) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.2);
  grad.addColorStop(0, 'rgba(180, 120, 40, 0.06)');
  grad.addColorStop(0.5, 'rgba(180, 120, 40, 0.02)');
  grad.addColorStop(1, 'rgba(180, 120, 40, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(cx - radius * 2.2, cy - radius * 2.2, radius * 4.4, radius * 4.4);
}
```

Call this BEFORE `putImageData` — draw glow to canvas first, then overlay the dithered ImageData on top. Alternatively, draw glow AFTER `putImageData` with a compositing mode. The simplest approach: draw glow after `putImageData` using `ctx.globalCompositeOperation = 'lighter'`, then reset to `'source-over'`.

This avoids per-pixel iteration for a barely-perceptible glow (the pixel approach would iterate ~500K pixels per frame for a subtle effect).

- [ ] **Step 2: Verify** — glow should be barely perceptible. If it's obvious, reduce intensity. It should only be noticeable when comparing with/without.

- [ ] **Step 3: Commit**

```bash
git add registry/foundation-dither-sphere/foundation-dither-sphere.html
git commit -m "feat: add subtle dithered background glow"
```

### Task 5: Implement data streams

**Files:**
- Modify: `registry/foundation-dither-sphere/foundation-dither-sphere.html`

- [ ] **Step 1: Define stream data structure and initialization**

Add stream setup code:

```javascript
const STREAM_COUNT = 6;
const PARTICLES_PER_STREAM = 60;

function initStreams(cx, cy, sphereRadius, canvasSize) {
  const streams = [];
  const maxRadius = Math.max(canvasSize.w, canvasSize.h) * 0.5;
  for (let s = 0; s < STREAM_COUNT; s++) {
    const baseAngle = (s / STREAM_COUNT) * Math.PI * 2;
    const particles = [];
    for (let p = 0; p < PARTICLES_PER_STREAM; p++) {
      // t goes from 0 (edge) to 1 (sphere surface)
      particles.push({ t: p / PARTICLES_PER_STREAM });
    }
    streams.push({ baseAngle, particles, maxRadius });
  }
  return streams;
}
```

- [ ] **Step 2: Implement stream particle position calculation**

Add function to compute particle position from its `t` parameter:

```javascript
function getStreamParticlePos(stream, t, cx, cy, sphereRadius, time) {
  // Archimedean spiral: radius decreases linearly from maxRadius to sphereRadius
  const r = stream.maxRadius * (1 - t) + sphereRadius * t;
  // Angular position: base angle + rotation that increases as t increases (tighter spiral near center)
  const angle = stream.baseAngle + t * Math.PI * 2.5;
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
    t: t  // keep t for color interpolation
  };
}
```

- [ ] **Step 3: Render streams with Bayer dithering and color transition**

Add `renderStreams(imageData, streams, cx, cy, sphereRadius, time)`:

1. For each stream, for each particle:
   - Compute position via `getStreamParticlePos`
   - Skip if outside canvas bounds
   - Compute color via two-segment lerp through the cold accent: blue `(70, 130, 255)` at t=0 → cold accent `(100, 160, 220)` at t=0.5 → amber `(220, 170, 60)` at t=1. This prevents the muddy gray-green that a direct blue→amber lerp produces.
   - Particle size: 2-3 pixels (draw a small cluster, e.g., 2x2 or 3x3 block)
   - For each pixel in the particle block, apply Bayer threshold against a luminance value (e.g., `0.3 + t * 0.4`)
   - Write passing pixels to ImageData buffer
2. Call from `render()` after sphere

- [ ] **Step 4: Verify streams render** — confirm 6 spiral arms converging toward the sphere, blue at edges transitioning to amber near the sphere. Bayer pattern should be visible on the streams too.

- [ ] **Step 5: Iterate on stream quality**

Tune:
- Spiral tightness (the `* 2.5` multiplier on angle) — should feel like orbiting paths, not straight lines
- Particle size — too small and they vanish, too large and they look blobby
- Color transition curve — consider easing (e.g., `t * t` for a late shift to amber) so the blue-to-gold moment feels like a phase change, not a gradient
- Density near sphere — particles should cluster more tightly as they approach. Consider using `t * t` for spacing instead of linear.

- [ ] **Step 6: Commit**

```bash
git add registry/foundation-dither-sphere/foundation-dither-sphere.html
git commit -m "feat: add converging data streams with blue-to-amber transition"
```

## Chunk 3: Animation and Floating Notation

### Task 6: Animate the scene

**Files:**
- Modify: `registry/foundation-dither-sphere/foundation-dither-sphere.html`

- [ ] **Step 1: Add sphere breathing animation**

In `render(time)`:
- Convert `time` (ms) to seconds: `const t = time / 1000`
- Breathing radius: `const breathingRadius = baseRadius * (1 + Math.sin(t * Math.PI * 2 / 8) * 0.025)` (±2.5%, 8s cycle)
- Pass `breathingRadius` to `renderSphere` instead of `baseRadius`

- [ ] **Step 2: Add dither crawl**

- Compute crawl offset as a float: `const crawlOffset = (t % 12) / 12 * 8` (0.0 to 8.0 over 12 seconds)
- In `getBayerThreshold`, interpolate between adjacent thresholds for sub-pixel shimmer:

```javascript
function getBayerThresholdSmooth(x, y, offset) {
  const sx = x + offset;
  const fx = Math.floor(sx);
  const frac = sx - fx;
  const t0 = BAYER[((y & 7) << 3) + (fx & 7)];
  const t1 = BAYER[((y & 7) << 3) + ((fx + 1) & 7)];
  return t0 + (t1 - t0) * frac;
}
```

This produces a smooth shimmer rather than jerky 1.5-second snaps between grid positions. The Bayer grid structure remains recognizable but alive.

**Important:** Update `renderSphere` (from Task 3) to call `getBayerThresholdSmooth(x, y, crawlOffset)` instead of `getBayerThreshold(x + crawlOffset, y + crawlOffset)`. The smooth variant takes the offset as a separate parameter and handles interpolation internally. Also update any Bayer threshold calls in `renderStreams`.

- [ ] **Step 3: Animate stream particles**

In `render(time)`:
- For each stream, for each particle:
  - Advance `t`: `particle.t += deltaTime / traversalTime` where `traversalTime = 17` (seconds)
  - When `particle.t >= 1`, recycle: `particle.t -= 1` (wraps back to edge)
- This creates continuous inward flow
- Need `deltaTime`: track `lastTime`, compute `deltaTime = (time - lastTime) / 1000`, update `lastTime`

- [ ] **Step 4: Clear and redraw each frame**

In `render(time)`:
1. Fill ImageData buffer with background color `(8, 6, 10, 255)` for all pixels
2. Render sphere to ImageData (with breathing radius and crawl offset)
3. Render streams to ImageData (with updated particle positions)
4. `ctx.putImageData(imageData, 0, 0)` — single draw call
5. Render background glow via `ctx` radial gradient with `globalCompositeOperation = 'lighter'`, then reset to `'source-over'` (must come AFTER putImageData, otherwise it gets overwritten)
6. Render notation via `ctx.fillText` (also after putImageData)
7. `requestAnimationFrame(render)`

- [ ] **Step 5: Verify animation** — confirm:
  - Sphere gently breathes (radius oscillates)
  - Dither pattern shimmers (crawl offset visible as subtle grid shift)
  - Streams flow continuously inward, recycling at edge
  - 60fps performance (check via dev tools)

- [ ] **Step 6: Commit**

```bash
git add registry/foundation-dither-sphere/foundation-dither-sphere.html
git commit -m "feat: add breathing, dither crawl, and stream flow animation"
```

### Task 7: Add floating mathematical notation

**Files:**
- Modify: `registry/foundation-dither-sphere/foundation-dither-sphere.html`

- [ ] **Step 1: Define notation symbols and their state**

```javascript
const SYMBOLS = ['∑', 'ψ', '∂', '∫', 'Ω', '∇', 'π', 'λ'];

function initNotation(w, h, cx, cy, sphereRadius) {
  return SYMBOLS.map((char, i) => {
    // Place in a ring around the sphere, outside stream zone
    const angle = (i / SYMBOLS.length) * Math.PI * 2 + 0.4;
    const dist = sphereRadius * 2 + Math.random() * sphereRadius;
    return {
      char,
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 0.5,  // ~0.5 px/s drift
      vy: (Math.random() - 0.5) * 0.5,
      fadePeriod: 15 + Math.random() * 15,  // 15-30s
      fadeOffset: Math.random() * Math.PI * 2,
      isBlue: i % 3 === 0  // some blue, mostly amber
    };
  });
}
```

- [ ] **Step 2: Render notation with canvas fillText**

After `putImageData`, use `ctx.fillText` to draw notation (these layer on top of the ImageData):

```javascript
function renderNotation(ctx, notation, time, dt) {
  const t = time / 1000;
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const sym of notation) {
    // Update position (drift) — dt is deltaTime in seconds, passed from render()
    sym.x += sym.vx * dt;
    sym.y += sym.vy * dt;

    // Fade cycle
    const opacity = (Math.sin(t * Math.PI * 2 / sym.fadePeriod + sym.fadeOffset) * 0.5 + 0.5) * 0.12;

    const color = sym.isBlue ? '70, 130, 255' : '220, 170, 60';
    ctx.fillStyle = `rgba(${color}, ${opacity})`;
    ctx.fillText(sym.char, sym.x, sym.y);
  }
}
```

- [ ] **Step 3: Verify notation** — symbols should be barely visible, drifting slowly, fading in and out. They must NOT compete with the sphere. If they're noticeable on first glance, reduce max opacity.

- [ ] **Step 4: Commit**

```bash
git add registry/foundation-dither-sphere/foundation-dither-sphere.html
git commit -m "feat: add floating mathematical notation with drift and fade"
```

## Chunk 4: Polish and Ship

### Task 8: Add prefers-reduced-motion support

**Files:**
- Modify: `registry/foundation-dither-sphere/foundation-dither-sphere.html`

- [ ] **Step 1: Implement reduced motion check**

At the top of the script, before the animation loop:

```javascript
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduceMotion = motionQuery.matches;
motionQuery.addEventListener('change', (e) => { reduceMotion = e.matches; });
```

In `render()`:
- If `reduceMotion`, render one static frame (sphere at base radius, streams at initial positions, crawl offset = 0, notation at initial opacity) and do NOT call `requestAnimationFrame` again
- On change from reduce→normal, restart the loop

- [ ] **Step 2: Commit**

```bash
git add registry/foundation-dither-sphere/foundation-dither-sphere.html
git commit -m "feat: respect prefers-reduced-motion with static fallback"
```

### Task 9: Resize handling and edge cases

**Files:**
- Modify: `registry/foundation-dither-sphere/foundation-dither-sphere.html`

- [ ] **Step 1: Implement resize handler**

```javascript
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(handleResize, 200);
});

function handleResize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w;
  canvas.height = h;
  imageData = ctx.createImageData(w, h);

  // Recalculate derived values
  const cx = w / 2;
  const cy = h / 2;
  const newRadius = Math.min(w, h) * 0.2;
  const newMaxRadius = Math.max(w, h) * 0.5;

  // Update stream geometry WITHOUT resetting particle t values
  for (const stream of streams) {
    stream.maxRadius = newMaxRadius;
    // particles keep their current t — no visual pop
  }

  // Rescale notation positions proportionally
  for (const sym of notation) {
    sym.x = cx + (sym.x - oldCx) * (w / oldW);
    sym.y = cy + (sym.y - oldCy) * (h / oldH);
  }

  // Update stored dimensions for next resize
  oldW = w; oldH = h; oldCx = cx; oldCy = cy;
  baseRadius = newRadius;
}
```

Note: `oldW`, `oldH`, `oldCx`, `oldCy` must be initialized alongside the canvas setup. The debounce (200ms) prevents expensive ImageData recreation during drag-resizing. Stream particles preserve their `t` values so animation continues smoothly.

- [ ] **Step 2: Verify** — resize the browser window. Canvas should adapt, sphere stays centered and proportional, streams recalculate, no visual glitches.

- [ ] **Step 3: Commit**

```bash
git add registry/foundation-dither-sphere/foundation-dither-sphere.html
git commit -m "feat: add responsive resize handling"
```

### Task 10: Final quality pass

**Files:**
- Modify: `registry/foundation-dither-sphere/foundation-dither-sphere.html`

- [ ] **Step 1: Review against quality bar from spec**

Check each criterion:
1. ✅ Sphere reads as volumetric — 3D curvature via dither density
2. ✅ Streams feel purposeful — converging Archimedean spirals with color phase change
3. ✅ Blue-to-amber transition reads as a phase change, not a lerp
4. ✅ Animation is hypnotic — slow breathing, crawl, and flow
5. ✅ Bayer grid is visible and celebrated — ordered pattern is the aesthetic

If any criterion fails, iterate on it before proceeding.

- [ ] **Step 2: Run in gallery context**

```bash
cd /Users/daniel/Development/ux-designs && npm run dev
```

Open the gallery, navigate to the Foundation Dither Sphere detail page. Verify:
- Preview iframe loads and renders correctly at all three breakpoints (375, 768, 1280)
- Component appears in gallery grid with correct title and description
- Tags are correct and filterable
- Prompt displays correctly on the detail page

- [ ] **Step 3: Final commit**

```bash
git add registry/foundation-dither-sphere/
git commit -m "feat: Foundation dither sphere — complete component"
```
