# Component Library — Design Document

**Date:** 2026-03-08
**Status:** Approved
**Stack:** Next.js 15 (App Router), Tailwind CSS 4, Geist/Geist Mono fonts
**Deploy:** Vercel

---

## Purpose

A shareable, public component library with live previews and the prompts used to generate each component. Convention-driven — adding a component means dropping an HTML file and a `meta.json` into a folder.

---

## Project Structure

```
ux-designs/
├── app/
│   ├── layout.tsx              # Root layout — dark theme, fonts, global styles
│   ├── page.tsx                # Gallery grid — all components
│   └── [slug]/
│       └── page.tsx            # Component detail — preview + prompt
├── components/
│   ├── gallery-card.tsx        # Card for the grid view
│   ├── preview-frame.tsx       # iframe wrapper with loading state
│   ├── prompt-block.tsx        # Prompt display with copy button
│   └── tag-filter.tsx          # Client-side tag filtering
├── lib/
│   └── components.ts           # Reads registry/ at build time, returns typed data
├── registry/
│   └── golden-ring-nav/
│       ├── golden-ring-nav.html
│       └── meta.json
├── public/
│   └── registry/               # Build step copies HTML files here for iframe serving
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Content Pipeline

### Registry folder convention

Each component is a folder in `registry/` containing:

1. **An HTML file** — the standalone component
2. **`meta.json`** — metadata

```json
{
  "title": "Golden Ring Navigation",
  "slug": "golden-ring-nav",
  "prompt": "Create a floating navigation toolbar...",
  "tags": ["navigation", "glassmorphism", "animation", "css"],
  "date": "2026-03-08",
  "description": "Floating nav toolbar with a spinning gold conic-gradient active indicator ring"
}
```

### Build-time data loading

`lib/components.ts` reads all `registry/*/meta.json` files using `fs` at build time. Returns a typed array. No database, no API.

### iframe serving

A prebuild script copies `registry/**/*.html` to `public/registry/` so iframes can load them as static assets.

```
"prebuild": "cp -r registry/ public/registry/"
"build": "npm run prebuild && next build"
"dev": "npm run prebuild && next dev"
```

---

## Pages & Routing

### Gallery page (`/`)

- Grid of cards, one per component
- Each card: scaled-down iframe thumbnail (live preview, non-interactive), title, tags as pills, date
- Client-side tag filter bar at the top
- No pagination initially

### Detail page (`/[slug]`)

- Two-panel layout (side-by-side desktop, stacked mobile)
- **Left/top:** Full iframe of the component with responsive breakpoint toggles (mobile/tablet/desktop)
- **Right/bottom:** Full prompt text in a styled block with copy button, plus tags and date
- Back link to gallery

---

## Thumbnail Previews

Render the same iframe inside a fixed container, CSS-scaled down:

```css
.thumbnail-frame {
  width: 360px;
  height: 240px;
  overflow: hidden;
  border-radius: 12px;
}
.thumbnail-frame iframe {
  width: 1280px;
  height: 800px;
  transform: scale(0.28);
  transform-origin: top left;
  pointer-events: none;
}
```

Live miniature preview — no screenshots to maintain.

---

## iframe Security

- Same-origin static files, no CORS issues
- `sandbox="allow-scripts allow-same-origin"` prevents navigation/DOM access to host

---

## Visual Design

### Philosophy

Museum aesthetic — quiet, dark, receding. The components are the art; the frame stays invisible. No film grain, no glow on the app shell.

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0a0a0b` | Page background |
| Surface | `rgba(255,255,255,0.04)` | Cards |
| Surface hover | `rgba(255,255,255,0.06)` | Card hover |
| Border | `rgba(255,255,255,0.08)` | Single pixel borders |
| Text primary | `#f2f2f7` | Headings, titles |
| Text secondary | `rgba(255,255,255,0.5)` | Metadata, labels |
| Tag bg | `rgba(255,255,255,0.12)` | Tag pills |

No strong accent color — the components provide the color.

### Typography

| Role | Font | Size |
|------|------|------|
| UI text | Geist (via next/font) | 14px semibold (titles), 14px medium (cards) |
| Prompt block | Geist Mono | 13px regular |
| Tags | Geist | 11px |

### Components

- **Cards:** `backdrop-filter: blur(12px)`, `rounded-xl`, subtle border, no shadow. Hover lifts opacity.
- **Tag pills:** `rounded-full`, `bg-white/8`, `text-white/60`, 11px
- **Prompt block:** `bg-white/[0.03]`, `rounded-lg`, `border border-white/[0.06]`, scrollable, sticky copy button top-right
- **iframe container:** `rounded-lg`, `overflow: hidden`, thin border, dark fallback background

### Motion

Minimal. Card hover opacity at `0.2s ease`. No decorative animations on the app shell.

---

## Dependencies

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS 4 |
| Fonts | Geist + Geist Mono (next/font) |
| Clipboard | `navigator.clipboard.writeText` (native) |
| Deploy | Vercel |

No other dependencies. No state library, no UI library, no syntax highlighter.
