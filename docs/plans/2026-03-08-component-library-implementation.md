# Component Library Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Next.js 15 static site that serves as a public component library with live iframe previews and prompt text, starting with the golden-ring-nav component.

**Architecture:** Convention-driven static generation. Components live in `registry/<name>/` folders with an HTML file and `meta.json`. A build-time data layer reads the registry via `fs`. HTML files are copied to `public/` for iframe serving. Two pages: gallery grid (`/`) and detail view (`/[slug]`).

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS 4, Geist + Geist Mono (next/font), TypeScript

**Design doc:** `docs/plans/2026-03-08-component-library-design.md`

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `tailwind.config.ts`, `app/globals.css`
- Preserve: `docs/`, `golden-ring-nav.html` (will be moved in Task 2)

**Step 1: Initialize the project**

Run from `/home/daniel/Development/ux-designs`:

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*" --use-npm --eslint
```

When prompted, accept defaults. Since the directory isn't empty, it should still scaffold around existing files. If it refuses, use `--yes` or scaffold in a temp dir and move files.

**Step 2: Verify it runs**

```bash
npm run dev
```

Open `http://localhost:3000` — should see the default Next.js page.
Kill the dev server after confirming.

**Step 3: Clean up scaffolded defaults**

Remove default content from `app/page.tsx` — replace with a placeholder:

```tsx
export default function Home() {
  return <main><h1>Component Library</h1></main>;
}
```

Remove any default CSS from `app/globals.css` except the Tailwind imports. For Tailwind v4, the file should contain:

```css
@import "tailwindcss";
```

**Step 4: Install Geist fonts**

```bash
npm install geist
```

**Step 5: Configure fonts in layout**

Update `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "UX Designs",
  description: "Component library with live previews and prompts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-[#0a0a0b] text-[#f2f2f7] font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

**Step 6: Configure Tailwind**

Update `tailwind.config.ts` to extend with font families:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 7: Verify fonts and dark background**

```bash
npm run dev
```

Confirm the page loads with dark background (#0a0a0b) and Geist font. Kill dev server.

**Step 8: Commit**

```bash
git init
echo "node_modules/\n.next/\npublic/registry/" > .gitignore
git add -A
git commit -m "feat: scaffold Next.js 15 project with Tailwind 4 and Geist fonts"
```

---

### Task 2: Set Up Registry with Golden Ring Nav

**Files:**
- Create: `registry/golden-ring-nav/meta.json`
- Move: `golden-ring-nav.html` → `registry/golden-ring-nav/golden-ring-nav.html`

**Step 1: Create registry directory and move the component**

```bash
mkdir -p registry/golden-ring-nav
mv golden-ring-nav.html registry/golden-ring-nav/golden-ring-nav.html
```

**Step 2: Create meta.json**

Create `registry/golden-ring-nav/meta.json`:

```json
{
  "title": "Golden Ring Navigation",
  "slug": "golden-ring-nav",
  "prompt": "Create a floating navigation toolbar centered on screen. Dark background, glassmorphism toolbar with blur and subtle border. Core feature - Golden active indicator ring: A sliding highlight around the active button built with 4 CSS layers: Glow - blurred warm gold (#e8af48) behind the ring, opacity: 0.15 Clip container - overflow: hidden, border-radius: 18px - this clips the gradient Rotating conic-gradient - sized 200% and offset -50% so it spins from center. Rotates 4.5s linear infinite. The gradient must be heavily gold-dominant: 70% of the gradient = gold tones (#533517 dark bronze → #c49746 warm gold → #feeaa5 light gold) 2 narrow white hotspots (#ffffff, each only ~3% wide) simulating studio light reflections Between each white hotspot, a very thin (~1.5% each) hint of #ffc0cb pink and blue for subtle chromatic iridescence - these must stay minimal, the ring should read as GOLD not rainbow The pattern repeats twice across 360° for symmetry Inner plate - inset: 2px covers the center, only 2px of spinning gold ring visible. Background matches toolbar. The indicator slides between buttons with bouncy overshoot easing (cubic-bezier(0.34, 1.2, 0.64, 1)). 3 nav buttons (Home, Search, User) with thin stroke icons, separated by subtle dividers. Plus a dark/light theme toggle - sun/moon icons crossfade with rotate+scale. On toggle click, the button bounces up to 1.25× scale then springs back. Add film grain noise overlay and radial ambient glow.",
  "tags": ["navigation", "glassmorphism", "animation", "css"],
  "date": "2026-03-08",
  "description": "Floating nav toolbar with a spinning gold conic-gradient active indicator ring, theme toggle, and film grain overlay"
}
```

**Step 3: Commit**

```bash
git add registry/
git commit -m "feat: create registry with golden-ring-nav component"
```

---

### Task 3: Build Data Layer

**Files:**
- Create: `lib/components.ts`

**Step 1: Create the data module**

Create `lib/components.ts`:

```ts
import fs from "fs";
import path from "path";

export interface ComponentMeta {
  title: string;
  slug: string;
  prompt: string;
  tags: string[];
  date: string;
  description: string;
  htmlFile: string;
}

const REGISTRY_DIR = path.join(process.cwd(), "registry");

export function getAllComponents(): ComponentMeta[] {
  const entries = fs.readdirSync(REGISTRY_DIR, { withFileTypes: true });
  const components: ComponentMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const metaPath = path.join(REGISTRY_DIR, entry.name, "meta.json");
    if (!fs.existsSync(metaPath)) continue;

    const raw = fs.readFileSync(metaPath, "utf-8");
    const meta = JSON.parse(raw);

    // Find the HTML file in the directory
    const files = fs.readdirSync(path.join(REGISTRY_DIR, entry.name));
    const htmlFile = files.find((f) => f.endsWith(".html"));
    if (!htmlFile) continue;

    components.push({
      ...meta,
      htmlFile,
    });
  }

  return components.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getComponent(slug: string): ComponentMeta | undefined {
  const components = getAllComponents();
  return components.find((c) => c.slug === slug);
}

export function getAllTags(): string[] {
  const components = getAllComponents();
  const tags = new Set<string>();
  for (const c of components) {
    for (const tag of c.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}
```

**Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: No errors. If there are unrelated scaffold errors, fix those first.

**Step 3: Commit**

```bash
git add lib/
git commit -m "feat: add build-time data layer for reading registry"
```

---

### Task 4: Prebuild Script for iframe Serving

**Files:**
- Modify: `package.json` (scripts section)
- Create: `scripts/copy-registry.sh`

**Step 1: Create the copy script**

Create `scripts/copy-registry.sh`:

```bash
#!/bin/bash
# Copy HTML files from registry/ to public/registry/ for iframe serving
rm -rf public/registry
mkdir -p public/registry

for dir in registry/*/; do
  name=$(basename "$dir")
  mkdir -p "public/registry/$name"
  cp "$dir"*.html "public/registry/$name/" 2>/dev/null || true
done

echo "Copied registry HTML files to public/registry/"
```

```bash
chmod +x scripts/copy-registry.sh
```

**Step 2: Update package.json scripts**

Add the prebuild script to `package.json`. Find the `"scripts"` section and update:

```json
{
  "scripts": {
    "prebuild": "bash scripts/copy-registry.sh",
    "predev": "bash scripts/copy-registry.sh",
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Step 3: Verify the copy works**

```bash
npm run predev
ls public/registry/golden-ring-nav/
```

Expected: `golden-ring-nav.html` exists in `public/registry/golden-ring-nav/`.

**Step 4: Verify iframe loads**

```bash
npm run dev
```

Open `http://localhost:3000/registry/golden-ring-nav/golden-ring-nav.html` directly in browser. Should see the golden ring nav component rendered standalone. Kill dev server.

**Step 5: Commit**

```bash
git add scripts/ package.json
git commit -m "feat: add prebuild script to copy registry HTML to public/"
```

---

### Task 5: Gallery Card Component

**Files:**
- Create: `components/gallery-card.tsx`

**Step 1: Build the card component**

Create `components/gallery-card.tsx`:

```tsx
import Link from "next/link";
import { ComponentMeta } from "@/lib/components";

export function GalleryCard({ component }: { component: ComponentMeta }) {
  const iframeSrc = `/registry/${component.slug}/${component.htmlFile}`;

  return (
    <Link href={`/${component.slug}`} className="group block">
      <article className="rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm transition-colors duration-200 hover:bg-white/[0.06] overflow-hidden">
        {/* Thumbnail preview */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#0a0a0b] border-b border-white/[0.06]">
          <iframe
            src={iframeSrc}
            title={component.title}
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
            tabIndex={-1}
            className="pointer-events-none origin-top-left"
            style={{
              width: "1280px",
              height: "800px",
              transform: "scale(var(--thumb-scale))",
              border: "none",
            }}
          />
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h2 className="text-sm font-medium text-[#f2f2f7]">
            {component.title}
          </h2>
          <p className="text-xs text-white/50 line-clamp-2">
            {component.description}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {component.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.08] text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
```

**Step 2: Commit**

```bash
git add components/
git commit -m "feat: add gallery card component with iframe thumbnail"
```

---

### Task 6: Tag Filter Component

**Files:**
- Create: `components/tag-filter.tsx`

**Step 1: Build the tag filter**

Create `components/tag-filter.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function TagFilter({ tags }: { tags: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  const setTag = useCallback(
    (tag: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tag) {
        params.set("tag", tag);
      } else {
        params.delete("tag");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setTag(null)}
        className={`text-[11px] px-3 py-1 rounded-full border transition-colors duration-200 ${
          !activeTag
            ? "bg-white/[0.12] border-white/[0.16] text-white/80"
            : "bg-transparent border-white/[0.08] text-white/40 hover:text-white/60"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => setTag(activeTag === tag ? null : tag)}
          className={`text-[11px] px-3 py-1 rounded-full border transition-colors duration-200 ${
            activeTag === tag
              ? "bg-white/[0.12] border-white/[0.16] text-white/80"
              : "bg-transparent border-white/[0.08] text-white/40 hover:text-white/60"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/tag-filter.tsx
git commit -m "feat: add client-side tag filter component"
```

---

### Task 7: Gallery Page

**Files:**
- Modify: `app/page.tsx`

**Step 1: Build the gallery page**

Replace `app/page.tsx`:

```tsx
import { Suspense } from "react";
import { getAllComponents, getAllTags } from "@/lib/components";
import { GalleryCard } from "@/components/gallery-card";
import { TagFilter } from "@/components/tag-filter";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const allComponents = getAllComponents();
  const tags = getAllTags();

  const filtered = tag
    ? allComponents.filter((c) => c.tags.includes(tag))
    : allComponents;

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-lg font-semibold tracking-tight mb-1">
          UX Designs
        </h1>
        <p className="text-sm text-white/40">
          Component library with live previews and prompts
        </p>
      </header>

      <Suspense fallback={null}>
        <div className="mb-8">
          <TagFilter tags={tags} />
        </div>
      </Suspense>

      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        }}
      >
        {filtered.map((component) => (
          <GalleryCard key={component.slug} component={component} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-white/30 text-center py-20">
          No components match this filter.
        </p>
      )}
    </main>
  );
}
```

**Step 2: Handle thumbnail scaling with CSS variable**

Add to `app/globals.css` after the Tailwind import:

```css
@import "tailwindcss";

:root {
  --thumb-scale: 0.28;
}
```

**Step 3: Verify the gallery**

```bash
npm run dev
```

Open `http://localhost:3000`. Should see:
- Dark background
- "UX Designs" header
- Tag filter with "All", "navigation", "glassmorphism", "animation", "css"
- One card for Golden Ring Navigation with a live iframe thumbnail
- Clicking a tag filters (with only one component, non-matching tags show empty state)

Kill dev server.

**Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: build gallery page with grid and tag filtering"
```

---

### Task 8: Preview Frame Component

**Files:**
- Create: `components/preview-frame.tsx`

**Step 1: Build the preview frame with breakpoint toggles**

Create `components/preview-frame.tsx`:

```tsx
"use client";

import { useState } from "react";

const BREAKPOINTS = [
  { label: "Mobile", width: 375, icon: "phone" },
  { label: "Tablet", width: 768, icon: "tablet" },
  { label: "Desktop", width: 1280, icon: "desktop" },
] as const;

export function PreviewFrame({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [activeBreakpoint, setActiveBreakpoint] = useState(2); // Desktop default
  const bp = BREAKPOINTS[activeBreakpoint];

  return (
    <div className="space-y-3">
      {/* Breakpoint toggles */}
      <div className="flex items-center gap-1">
        {BREAKPOINTS.map((b, i) => (
          <button
            key={b.label}
            onClick={() => setActiveBreakpoint(i)}
            className={`text-[11px] px-3 py-1.5 rounded-lg transition-colors duration-200 ${
              i === activeBreakpoint
                ? "bg-white/[0.1] text-white/80"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* iframe container */}
      <div className="relative rounded-lg border border-white/[0.08] bg-[#0a0a0b] overflow-hidden">
        <div
          className="mx-auto transition-[width] duration-300 ease-out"
          style={{ width: `${bp.width}px`, maxWidth: "100%" }}
        >
          <div className="relative w-full" style={{ paddingBottom: "62.5%" }}>
            <iframe
              src={src}
              title={title}
              sandbox="allow-scripts allow-same-origin"
              className="absolute inset-0 w-full h-full border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/preview-frame.tsx
git commit -m "feat: add preview frame with responsive breakpoint toggles"
```

---

### Task 9: Prompt Block Component

**Files:**
- Create: `components/prompt-block.tsx`

**Step 1: Build the prompt block with copy button**

Create `components/prompt-block.tsx`:

```tsx
"use client";

import { useState } from "react";

export function PromptBlock({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative rounded-lg border border-white/[0.06] bg-white/[0.03]">
      <div className="sticky top-0 flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="text-[11px] text-white/30 uppercase tracking-wider">
          Prompt
        </span>
        <button
          onClick={handleCopy}
          className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.06] text-white/50 hover:text-white/70 transition-colors duration-200"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="p-4 max-h-[60vh] overflow-y-auto">
        <p className="text-[13px] leading-relaxed text-white/60 font-mono whitespace-pre-wrap">
          {prompt}
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/prompt-block.tsx
git commit -m "feat: add prompt block component with copy to clipboard"
```

---

### Task 10: Detail Page

**Files:**
- Create: `app/[slug]/page.tsx`

**Step 1: Build the detail page**

Create `app/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllComponents, getComponent } from "@/lib/components";
import { PreviewFrame } from "@/components/preview-frame";
import { PromptBlock } from "@/components/prompt-block";

export async function generateStaticParams() {
  const components = getAllComponents();
  return components.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) return {};
  return {
    title: `${component.title} — UX Designs`,
    description: component.description,
  };
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) notFound();

  const iframeSrc = `/registry/${component.slug}/${component.htmlFile}`;

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/60 transition-colors duration-200 mb-8"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Title + meta */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold tracking-tight mb-2">
          {component.title}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-white/30">{component.date}</span>
          <div className="flex flex-wrap gap-1.5">
            {component.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.08] text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Preview */}
        <PreviewFrame src={iframeSrc} title={component.title} />

        {/* Prompt */}
        <PromptBlock prompt={component.prompt} />
      </div>
    </main>
  );
}
```

**Step 2: Verify the detail page**

```bash
npm run dev
```

Open `http://localhost:3000`. Click the Golden Ring Navigation card. Should see:
- Back link to gallery
- Title, date, tags
- Live iframe preview with Mobile/Tablet/Desktop toggles
- Prompt block with copy button on the right (or below on mobile)
- Clicking "Copy" copies the prompt text
- Breakpoint toggles resize the iframe container

Kill dev server.

**Step 3: Commit**

```bash
git add app/\[slug\]/
git commit -m "feat: build detail page with preview and prompt panels"
```

---

### Task 11: Responsive Polish and Final Styling

**Files:**
- Modify: `app/globals.css`
- Modify: `components/gallery-card.tsx` (thumbnail scaling fix)
- Modify: `app/layout.tsx` (if needed)

**Step 1: Add global styles for scrollbar and selection**

Update `app/globals.css`:

```css
@import "tailwindcss";

:root {
  --thumb-scale: 0.28;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Selection */
::selection {
  background: rgba(255, 255, 255, 0.15);
}
```

**Step 2: Fix gallery card thumbnail container**

The iframe thumbnail needs a container that calculates `--thumb-scale` dynamically based on the card width. Update the thumbnail div in `components/gallery-card.tsx` so the iframe scale is relative to the container:

Replace the thumbnail `<div>` section with:

```tsx
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#0a0a0b] border-b border-white/[0.06]">
          <div className="absolute inset-0">
            <iframe
              src={iframeSrc}
              title={component.title}
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
              tabIndex={-1}
              className="pointer-events-none origin-top-left w-[1280px] h-[800px] border-none"
              style={{
                transform: `scale(var(--thumb-scale))`,
              }}
            />
          </div>
        </div>
```

**Step 3: Verify responsive layout**

```bash
npm run dev
```

Check at different viewport sizes:
- Desktop (1200px+): Gallery shows 2-3 columns, detail page is side-by-side
- Tablet (768px): Gallery shows 2 columns, detail stacks
- Mobile (375px): Gallery shows 1 column, detail stacks, everything readable

Kill dev server.

**Step 4: Build and verify static export works**

```bash
npm run build
```

Expected: Build succeeds with static pages generated for `/` and `/golden-ring-nav`.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add responsive polish, scrollbar styling, thumbnail fixes"
```

---

### Task 12: Add .gitignore Entry and Final Verification

**Files:**
- Modify: `.gitignore`

**Step 1: Ensure public/registry/ is gitignored**

Verify `.gitignore` includes:

```
node_modules/
.next/
public/registry/
```

The `public/registry/` folder is generated by the prebuild script — it should not be committed.

**Step 2: Full build verification**

```bash
npm run build && npm run start
```

Open `http://localhost:3000` and verify:
- [ ] Gallery loads with golden-ring-nav card
- [ ] Thumbnail shows live iframe preview
- [ ] Tag filter works (clicking tags filters cards)
- [ ] Clicking card navigates to `/golden-ring-nav`
- [ ] Detail page shows full preview with breakpoint toggles
- [ ] Prompt block displays full text
- [ ] Copy button copies prompt to clipboard
- [ ] Back link returns to gallery
- [ ] Mobile/tablet layouts are correct

Kill the server.

**Step 3: Final commit**

```bash
git add .gitignore
git commit -m "chore: finalize gitignore and verify build"
```

---

## Adding a New Component (Reference)

To add a new component after implementation:

```bash
mkdir registry/my-component
# Add my-component.html
# Add meta.json with title, slug, prompt, tags, date, description
git add registry/my-component/
git commit -m "feat: add my-component to registry"
git push  # Vercel auto-deploys
```

No code changes needed. The data layer picks it up automatically.
