# HTML Source Exposure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expose the generated HTML source code for copying/embedding — both as a quick-copy button in the preview toolbar and as a full syntax-highlighted source panel alongside the prompt.

**Architecture:** Add a `getComponentSource()` function to read raw HTML at build time and pass it down as a prop. Create a new `SourceBlock` client component with Prism.js syntax highlighting (CDN). Add a "Copy HTML" button to the preview frame toolbar. Rearrange the detail page bottom section to show prompt and source side by side at `lg:` breakpoints.

**Tech Stack:** Prism.js (CDN — prism-core + prism-markup + prism-tomorrow theme), Next.js server component data passing, React client components.

---

### Task 1: Add `getComponentSource()` to lib

**Files:**
- Modify: `lib/components.ts`

**Step 1: Add the function**

Add after `getAllTags()`:

```typescript
export function getComponentSource(slug: string): string | null {
  const component = getComponent(slug);
  if (!component) return null;
  const htmlPath = path.join(REGISTRY_DIR, slug, component.htmlFile);
  if (!fs.existsSync(htmlPath)) return null;
  return fs.readFileSync(htmlPath, "utf-8");
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add lib/components.ts
git commit -m "feat: add getComponentSource to read raw HTML from registry"
```

---

### Task 2: Create `SourceBlock` component

**Files:**
- Create: `components/source-block.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";

export function SourceBlock({ source }: { source: string }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // @ts-expect-error Prism loaded via CDN
    if (typeof window !== "undefined" && window.Prism && codeRef.current) {
      // @ts-expect-error Prism loaded via CDN
      window.Prism.highlightElement(codeRef.current);
    }
  }, [source]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — silent fail
    }
  }

  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0a0b] flex flex-col overflow-hidden shadow-xl h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.1em]">
            Source
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 border ${
            copied
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-white/[0.05] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1] hover:border-white/20"
          }`}
        >
          {copied ? (
            <span className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied
            </span>
          ) : "Copy"}
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/[0.05] scrollbar-track-transparent">
        <pre className="p-5 m-0 text-[13px] leading-[1.6]">
          <code ref={codeRef} className="language-markup">
            {source}
          </code>
        </pre>
      </div>
      <div className="px-5 py-3 border-t border-white/[0.05] bg-white/[0.01]">
        <div className="flex items-center gap-1.5 text-[10px] text-white/20">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V12"/><path d="M12 8h.01"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
          <span>Self-contained HTML — copy and paste to use anywhere</span>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/source-block.tsx
git commit -m "feat: add SourceBlock component with Prism.js syntax highlighting"
```

---

### Task 3: Add Prism.js CDN to layout

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Add Prism CDN scripts and theme**

Add Prism CSS and JS via `<Script>` and `<link>` tags. Add a `<link>` for the Tomorrow Night theme in the `<head>`, and `<Script>` tags for prism-core and prism-markup.

In `layout.tsx`, import `Script` from `next/script` and add after `{children}`:

```tsx
import Script from "next/script";
```

Inside the `<body>` tag, after `{children}`:

```tsx
<Script
  src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"
  strategy="beforeInteractive"
/>
<Script
  src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js"
  strategy="beforeInteractive"
/>
```

In the `<head>` section (or via `metadata` if using the `links` pattern), add the theme stylesheet. Since Next.js App Router doesn't have a `<head>` component, use the root layout's `<html>` return to include a `<link>` tag in `<head>`:

The simplest approach: add to `app/globals.css` a small set of Prism overrides instead of loading the full theme CDN, OR load the theme via a `<link>` in the layout.

**Recommended approach:** Load theme CSS via `<link>` in layout:

```tsx
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
/>
```

Add this inside the `<html>` return, before `<body>`. Then add Prism overrides in `globals.css` to remove the default background (we use our own dark bg):

```css
/* Prism overrides — use our own dark background */
pre[class*="language-"],
code[class*="language-"] {
  background: transparent;
  text-shadow: none;
}
```

**Step 2: Verify dev server renders without errors**

Run: `npm run dev`
Expected: No console errors, Prism loads

**Step 3: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: add Prism.js CDN for syntax highlighting"
```

---

### Task 4: Add "Copy HTML" button to preview frame toolbar

**Files:**
- Modify: `components/preview-frame.tsx`

**Step 1: Add `source` prop and copy handler**

Update the component props to accept `source?: string`. Add a copy-HTML handler and state:

```tsx
export function PreviewFrame({
  src,
  title,
  source,
}: {
  src: string;
  title: string;
  source?: string;
}) {
```

Add state and handler alongside existing `isCopied`:

```tsx
const [isHtmlCopied, setIsHtmlCopied] = useState(false);

const handleCopyHtml = async () => {
  if (!source) return;
  try {
    await navigator.clipboard.writeText(source);
    setIsHtmlCopied(true);
    setTimeout(() => setIsHtmlCopied(false), 2000);
  } catch {
    // silent fail
  }
};
```

**Step 2: Add the button to the toolbar**

Insert a new button after the "Copy component URL" button (before the closing `</div>` of the button group), with a `</>` code icon:

```tsx
{source && (
  <button
    onClick={handleCopyHtml}
    className={`p-2 rounded-lg transition-all ${
      isHtmlCopied ? "text-emerald-400" : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
    }`}
    title="Copy HTML source"
  >
    {isHtmlCopied ? (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ) : (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    )}
  </button>
)}
```

**Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add components/preview-frame.tsx
git commit -m "feat: add Copy HTML button to preview frame toolbar"
```

---

### Task 5: Wire up detail page — side-by-side layout

**Files:**
- Modify: `app/[slug]/page.tsx`

**Step 1: Import new components and read source**

Add imports:

```tsx
import { getAllComponents, getComponent, getComponentSource } from "@/lib/components";
import { SourceBlock } from "@/components/source-block";
```

Read source in the page function, after getting `component`:

```tsx
const source = getComponentSource(slug);
```

**Step 2: Pass source to PreviewFrame**

```tsx
<PreviewFrame src={iframeSrc} title={component.title} source={source ?? undefined} />
```

**Step 3: Replace the bottom section with side-by-side layout**

Replace the current prompt-only section:

```tsx
{/* Prompt + Source side by side */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <PromptBlock prompt={component.prompt} />
  {source && <SourceBlock source={source} />}
</div>
```

Remove the `max-w-4xl mx-auto w-full` wrapper — the grid handles width now.

**Step 4: Verify the page renders correctly**

Run: `npm run dev`
Navigate to `/golden-ring-nav`
Expected: Preview with copy-HTML button in toolbar, prompt and source blocks side by side below

**Step 5: Commit**

```bash
git add app/[slug]/page.tsx
git commit -m "feat: wire up HTML source exposure on detail page"
```

---

### Task 6: Visual polish and verify

**Files:**
- Potentially: `components/prompt-block.tsx`, `components/source-block.tsx`, `app/globals.css`

**Step 1: Check visual consistency**

- Both blocks should have matching heights at `lg:` (the `h-full` on SourceBlock + grid alignment handles this)
- Prism theme colors should look natural against the `#0a0a0b` background
- Scrollbars should match between prompt and source blocks
- Copy buttons should have identical styling and feedback

**Step 2: Test interactions**

- Copy HTML from toolbar button — verify full HTML is in clipboard
- Copy from source block button — verify same
- Copy prompt — verify prompt text is in clipboard
- Breakpoint switching — verify preview still works
- Theme/responsive — verify side-by-side stacks on mobile

**Step 3: Final commit**

```bash
git add -u
git commit -m "polish: visual consistency between prompt and source blocks"
```
