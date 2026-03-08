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
