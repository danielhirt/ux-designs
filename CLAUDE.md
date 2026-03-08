# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (runs copy-registry.sh first via predev hook)
npm run build        # Production build (runs copy-registry.sh first via prebuild hook)
npm run lint         # ESLint with next/core-web-vitals + typescript configs
```

No test runner is configured.

## Architecture

This is a **component gallery** — a Next.js 16 app that showcases standalone HTML UI components. Each component is a self-contained HTML file served via iframe.

### Two-tier system

1. **Registry** (`registry/{slug}/`) — Source of truth for components. Each folder contains:
   - `meta.json` — title, slug, prompt, tags, date, description
   - `{slug}.html` — Standalone HTML file (embedded CSS + JS, no external dependencies)

2. **App Router** (`app/`) — Gallery UI that reads from the registry:
   - `/` — Gallery grid with tag-based filtering
   - `/[slug]` — Detail page with responsive preview frame + prompt panel

### Data flow

`registry/` → `scripts/copy-registry.sh` → `public/registry/` → served as iframe `src`

`lib/components.ts` scans `registry/` directories, parses `meta.json` files, and caches results in memory. All pages use `generateStaticParams()` for static generation.

## Adding a new component

1. Create `registry/{slug}/meta.json` with required fields: `title`, `slug`, `prompt`, `tags` (array), `date`, `description`
2. Create `registry/{slug}/{slug}.html` — must be fully standalone (all CSS/JS inline)
3. The predev/prebuild hook copies HTML to `public/registry/` automatically
4. The gallery and detail pages pick it up via the filesystem scanner in `lib/components.ts`

## Styling

- **Tailwind v4** — `@import "tailwindcss"` with `@theme` block in `globals.css`, no `tailwind.config.js`
- **Dark-first** — `#0a0a0b` background, `#f2f2f7` text, white opacity helpers (`bg-white/[0.08]`, `border-white/[0.06]`)
- **Glassmorphism** — `backdrop-blur`, translucent backgrounds, borders over shadows
- **Fonts** — Geist Sans (body) and Geist Mono (code), loaded via `geist` package in `layout.tsx`
- **Path alias** — `@/*` maps to project root (e.g., `@/lib/components`, `@/components/gallery-card`)

## Key files

- `lib/components.ts` — Registry scanner, `ComponentMeta` interface, in-memory cache
- `components/preview-frame.tsx` — Client component: breakpoint-responsive iframe viewer (375/768/1280)
- `components/prompt-block.tsx` — Client component: prompt display with clipboard copy
- `components/tag-filter.tsx` — Client component: URL search param-based tag filtering
- `scripts/copy-registry.sh` — Copies `registry/*/**.html` to `public/registry/` for iframe serving
