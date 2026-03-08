"use client";

import { useState, useRef, useEffect } from "react";

const BREAKPOINTS = [
  { id: "mobile", label: "Mobile", width: 375, icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  )},
  { id: "tablet", label: "Tablet", width: 768, icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  )},
  { id: "desktop", label: "Desktop", width: 1280, icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  )},
] as const;

export function PreviewFrame({
  src,
  title,
  source,
}: {
  src: string;
  title: string;
  source?: string;
}) {
  const [activeBreakpoint, setActiveBreakpoint] = useState<typeof BREAKPOINTS[number]["id"]>("desktop");
  const [key, setKey] = useState(0); // For refreshing
  const [isCopied, setIsCopied] = useState(false);
  const [isHtmlCopied, setIsHtmlCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const bp = BREAKPOINTS.find(b => b.id === activeBreakpoint) || BREAKPOINTS[2];

  const handleRefresh = () => setKey(prev => prev + 1);
  
  const handleCopyLink = async () => {
    const fullUrl = window.location.origin + src;
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

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

  const handleOpenNewTab = () => {
    window.open(src, "_blank");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Only refresh if not typing in an input
        if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          handleRefresh();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Integrated Header/Toolbar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] p-1 rounded-xl">
          {BREAKPOINTS.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBreakpoint(b.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                activeBreakpoint === b.id
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
              }`}
              title={b.label}
            >
              {b.icon}
              <span className="hidden sm:inline">{b.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-white/30">
            <span>{bp.width}px</span>
          </div>
          
          <div className="h-4 w-px bg-white/[0.08] mx-1 hidden sm:block" />

          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
              title="Refresh"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
            </button>
            <button
              onClick={handleOpenNewTab}
              className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
              title="Open in new tab"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </button>
            <button
              onClick={handleCopyLink}
              className={`p-2 rounded-lg transition-all ${
                isCopied ? "text-emerald-400" : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
              }`}
              title="Copy component URL"
            >
              {isCopied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              )}
            </button>
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
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 rounded-2xl border border-white/[0.08] bg-[#0a0a0b] overflow-hidden shadow-2xl group">
        {/* Subtle grid background for the "stage" */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div
          className="mx-auto h-full transition-[width] duration-500 cubic-bezier(0.4, 0, 0.2, 1) relative"
          style={{ width: `${bp.width}px`, maxWidth: "100%" }}
        >
          {/* Status bar (fake) or just a clean edge */}
          <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.05] z-10" />
          
          <iframe
            key={key}
            ref={iframeRef}
            src={src}
            title={title}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-none bg-white relative z-0"
          />
          
          {/* Drag handles (visual only for now, could be functional later) */}
          <div className="absolute inset-y-0 -right-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-8 rounded-full bg-white/[0.1]" />
          </div>
          <div className="absolute inset-y-0 -left-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-8 rounded-full bg-white/[0.1]" />
          </div>
        </div>
      </div>
      
      {/* Viewport Info / Footer */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-white/20">
        <span>Resizes to match viewport</span>
        <div className="w-1 h-1 rounded-full bg-white/10" />
        <span>Press <kbd className="font-sans px-1 py-0.5 rounded bg-white/5 border border-white/10">R</kbd> to refresh</span>
      </div>
    </div>
  );
}
