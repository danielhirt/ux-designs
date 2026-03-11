# Ferro-Fluid Sphere Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an interactive Three.js ferro-fluid sphere component inspired by No Man's Sky's Anomaly, added to the component gallery registry.

**Architecture:** Single self-contained HTML file using Three.js (r162+) via CDN with ES module importmap. Custom GLSL vertex/fragment shaders handle simplex noise displacement and iridescent fresnel lighting. EffectComposer provides bloom, chromatic aberration, and film grain post-processing.

**Tech Stack:** Three.js (CDN), GLSL shaders, HTML5 Canvas

---

## Chunk 1: Registry Entry + HTML Scaffold

### Task 1: Create meta.json

**Files:**
- Create: `registry/ferro-fluid-sphere/meta.json`

- [ ] **Step 1: Write meta.json**

```json
{
  "title": "Ferro-Fluid Sphere",
  "slug": "ferro-fluid-sphere",
  "prompt": "<the user's full prompt>",
  "tags": ["threejs", "3d", "animation", "interactive", "webgl"],
  "date": "2026-03-10",
  "description": "An otherworldly ferro-fluid sphere with simplex noise displacement, iridescent fresnel edges, mouse-reactive spikes, and cinematic post-processing — inspired by No Man's Sky's Anomaly"
}
```

- [ ] **Step 2: Commit**

```bash
git add registry/ferro-fluid-sphere/meta.json
git commit -m "feat: add ferro-fluid-sphere meta.json"
```

### Task 2: Create HTML file with full implementation

**Files:**
- Create: `registry/ferro-fluid-sphere/ferro-fluid-sphere.html`

The HTML file structure (top to bottom):

1. **DOCTYPE + head** — importmap for three.js + addons CDN
2. **Style block** — full-screen canvas, black background, violet glow overlay, halo ring CSS
3. **HTML body** — canvas + overlay divs (glow, halo)
4. **GLSL vertex shader** — inline `<script type="x-shader/x-vertex">`:
   - 3D simplex noise function (Ashima/webgl-noise port)
   - Two-layer noise: slow large-scale + fast small ripple
   - Power curve for spike peaks (`pow(noise, exponent)`)
   - Mouse influence uniform — attracts displacement toward cursor point
   - Passes fresnel-related varyings (view direction, normal) to fragment shader
5. **GLSL fragment shader** — inline `<script type="x-shader/x-fragment">`:
   - Fresnel term: `pow(1.0 - dot(viewDir, normal), fresnelPower)`
   - Iridescent color: mix purple (#6a0dad) → teal (#00bfa5) based on fresnel
   - Base color near-black, fresnel color on edges/spike tips
   - Metallic reflection from environment map sampling
6. **Main JS module** (`<script type="module">`):
   - **Scene setup:** PerspectiveCamera, WebGLRenderer (antialias, alpha)
   - **Procedural cubemap:** Render 6 faces with gradient (dark center → subtle purple/teal edges)
   - **Geometry:** IcosahedronGeometry(1, 7) — subdivision 7 ≈ 128 segments, ~163K vertices
   - **Material:** ShaderMaterial with custom vertex/fragment, envMap uniform
   - **Particles:** BufferGeometry with ~300 random points, PointsMaterial (tiny, white, low opacity)
   - **Post-processing:** EffectComposer → RenderPass → UnrealBloomPass(threshold:0.7, strength:0.4) → ShaderPass(chromatic aberration) → ShaderPass(film grain)
   - **Mouse handler:** pointermove → normalize to NDC → raycast to sphere plane → pass world point as uniform
   - **Animation loop:**
     - Update time uniforms (slow + fast noise offsets)
     - Rotate sphere Y-axis slowly
     - Camera breathing (sin-based dolly)
     - Rotate halo ring
     - Composer render

- [ ] **Step 3: Write the complete HTML file**

See implementation — all code inline, no external dependencies beyond Three.js CDN.

- [ ] **Step 4: Run copy-registry script and start dev server**

```bash
npm run dev
```

- [ ] **Step 5: Visual verification in browser**

Open `http://localhost:3000/ferro-fluid-sphere` and verify:
- Sphere renders with organic, spiky displacement
- Surface undulates with two noise layers
- Dark metallic core with purple-teal iridescent edges
- Mouse movement attracts spikes
- Particle field visible in background
- Violet glow behind sphere
- Bloom visible on bright edges
- Film grain and chromatic aberration subtle but present

- [ ] **Step 6: Commit**

```bash
git add registry/ferro-fluid-sphere/ferro-fluid-sphere.html
git commit -m "feat: add ferro-fluid sphere Three.js component"
```
