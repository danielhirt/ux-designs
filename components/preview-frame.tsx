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
