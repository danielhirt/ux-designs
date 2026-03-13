# Foundation Dither Sphere — Design Spec

## Overview

A standalone HTML component for the UX Designs gallery: a prediction sphere rendered entirely through Bayer matrix ordered dithering, suspended in a dark void as dithered probability streams converge toward it. Inspired by Foundation's psychohistory visualizations — Hari Seldon's vault projections where holographic particle fields dissolve into mathematical noise.

Amber-gold primary palette with cold blue tones threaded through the mathematical elements. Ambient animation only, no mouse interaction.

## Registry Entry

- **Slug:** `foundation-dither-sphere`
- **Tags:** `dither`, `animation`, `canvas`, `sci-fi`, `generative`
- **File:** `registry/foundation-dither-sphere/foundation-dither-sphere.html`

## Visual Composition

### The Sphere (center stage)

- Occupies ~40% of viewport height, centered in canvas
- Built pixel-by-pixel through an **8x8 Bayer threshold matrix**
- 3D volume achieved via normal-based diffuse + specular lighting — all expressed purely through dither density (on/off pixels, no gradients)
- Light source positioned upper-left to create natural highlight/shadow distribution
- Specular highlight near the top-left creates a bright concentration of dither pixels
- Shadow falloff toward bottom-right reduces dither density to near-zero, sphere dissolving into the void at its edges

### Data Streams (5-7 streams)

- Curved particle trails spiraling inward from canvas edges toward the sphere
- Each stream follows a unique spiral path (parametric curve with angular offset)
- **Color transition along path:** outer portions rendered in blue (`rgb(70, 130, 255)`) representing raw incoming data, transitioning to amber-gold (`rgb(220, 170, 60)`) as they approach the sphere — suggesting data being processed into prediction
- Streams are also Bayer-dithered — the entire scene shares the same dithering language
- Particle density increases near the sphere (convergence)
- Streams enter the sphere and disappear (absorbed, not reflected)

### Background

- Near-black base: `#08060a`
- Subtle radial glow behind the sphere in warm amber (`rgba(180, 120, 40, ~0.03-0.06)`), bleeding softly into the void
- No hard edges or geometric backgrounds — void is the context

### Floating Mathematical Notation

- Sparse dithered mathematical symbols (∑, ψ, ∂, ∫, Ω, ∇, π, λ) scattered in the space around the sphere
- Very low opacity (0.05-0.15), some in blue, some in amber
- Drift slowly with barely perceptible movement
- Fade in and out over long cycles (15-30s)
- Purpose: contextual atmosphere, not decoration — should never compete with the sphere

## Color System

| Role | Color | Usage |
|------|-------|-------|
| Amber highlight | `rgb(220, 170, 60)` | Sphere highlights, inner stream segments |
| Deep gold | `rgb(180, 120, 40)` | Sphere midtones, background glow |
| Math blue | `rgb(70, 130, 255)` | Outer stream segments, some notation |
| Cold accent | `rgb(100, 160, 220)` | Transitional tones where blue meets gold |
| Background | `#08060a` | Canvas fill |

**Spatial color rule:** Blue dominates the periphery (incoming raw data). Amber-gold dominates the sphere and its immediate vicinity (computed knowledge). The transition between them occurs along the data stream paths.

## Animation

All ambient, running on `requestAnimationFrame`. No user interaction.

### Stream Flow
- Particles advance along curved paths toward the sphere at a steady rate
- When a particle reaches the sphere surface, it recycles back to its origin point at the canvas edge
- Creates continuous, hypnotic convergence effect
- Speed: moderate — not frantic, not glacial. ~15-20 seconds for a full traversal

### Sphere Breathing
- Subtle radius oscillation: ±2-3% on a slow sine wave (~8 second cycle)
- Because the dither is recalculated each frame, the pixel pattern naturally shifts as the threshold boundaries change — this creates an organic shimmer without any artificial noise

### Dither Crawl
- A slow offset applied to the Bayer matrix coordinate lookup (shifting the x,y index by a sub-pixel amount over time)
- Creates a gentle shimmer across the entire sphere surface
- The grid structure of the Bayer pattern remains recognizable but alive
- Cycle: ~12 seconds for one full matrix offset cycle

### Notation Drift
- Mathematical symbols float with barely perceptible translational movement (~0.5px/s)
- Opacity fades in/out on staggered sine waves (15-30s periods per symbol)
- Some symbols may gently rotate

## Technical Approach

### Rendering: Canvas 2D with ImageData

- **Why Canvas 2D:** Bayer dithering requires per-pixel threshold comparison — Canvas 2D with `ImageData` direct pixel buffer manipulation is the most efficient approach. No WebGL overhead needed.
- **Why not CSS/SVG:** Dithering is inherently a raster operation. Thousands of individual dots can't be efficiently expressed as DOM elements.

### Render Pipeline (per frame)

1. Clear canvas to background color
2. Draw background radial glow (simple radial gradient, pre-dithered or smooth — it's behind everything)
3. Calculate sphere parameters (current radius with breathing offset, light direction)
4. For each pixel in sphere bounding box:
   - Compute 3D normal from sphere equation
   - Calculate diffuse + specular lighting value (0-1)
   - Apply color based on position (amber-gold with blue variance)
   - Compare against Bayer threshold (with crawl offset) — draw pixel or skip
5. For each data stream:
   - Advance particle positions along parametric curves
   - For each particle, apply Bayer threshold — draw or skip
   - Apply blue→amber color transition based on distance to sphere
6. For each notation symbol:
   - Update position (drift) and opacity (fade cycle)
   - Render at current opacity (canvas `globalAlpha`)

### Performance Considerations

- **ImageData buffer:** Write pixels directly to an `ImageData` object and `putImageData` once per frame, rather than thousands of `fillRect` calls
- **Sphere bounding box:** Only iterate pixels within the sphere's bounding rectangle + margin, not the full canvas
- **Notation rendering:** Use `fillText` for math symbols — only 8-12 of them, negligible cost
- **Target:** 60fps on modern hardware. The sphere is the main cost (~150-200px diameter = ~30,000 pixel comparisons per frame). With ImageData buffer this should be well within budget.

### Responsive Scaling

- Canvas element fills the iframe viewport (`width: 100vw; height: 100vh`)
- Canvas resolution set to match `devicePixelRatio` for crisp pixels on retina displays
- Sphere size, stream lengths, and notation positions are computed relative to canvas dimensions — not hardcoded pixel values
- The dither pixel size stays at 1 device pixel (or 2 CSS pixels on retina) to maintain the fine-grained Bayer texture

### File Structure

Single self-contained HTML file:

```
registry/foundation-dither-sphere/
├── meta.json
└── foundation-dither-sphere.html
```

No external dependencies. All CSS inline in `<style>`, all JS inline in `<script>`.

## Quality Bar

What separates a great version from a mediocre one:

1. **Sphere reads as volumetric** — the dither density must convincingly convey 3D curvature, highlight, and shadow. Not a flat circle of dots.
2. **Streams feel purposeful** — they carry information, converge with intent. Not random particle spray.
3. **Blue-to-amber transition is a phase change** — raw data becoming knowledge, not just a color lerp.
4. **Animation is hypnotic, not distracting** — slow enough to stare at, fast enough to notice. The breathing and crawl should feel alive but calm.
5. **The Bayer grid is the aesthetic** — the ordered pattern should be visible and celebrated, not hidden. The mathematical regularity IS the Foundation reference.

## Out of Scope

- Mouse/touch interaction
- Audio
- WebGL / Three.js
- External font loading (math symbols use system monospace)
- Multiple scenes or transitions
- Text content / headings / UI elements — this is a pure visual piece
