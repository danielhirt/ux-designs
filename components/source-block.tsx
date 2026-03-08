"use client";

import { useState, useMemo } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-markup";

const COLLAPSED_LINES = 20;

export function SourceBlock({ source }: { source: string }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const lineCount = source.split("\n").length;
  const isLong = lineCount > COLLAPSED_LINES;
  const displaySource = !expanded && isLong
    ? source.split("\n").slice(0, COLLAPSED_LINES).join("\n")
    : source;

  const highlighted = useMemo(
    () => Prism.highlight(displaySource, Prism.languages.markup, "markup"),
    [displaySource]
  );

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
          <span className="text-[10px] text-white/20">{lineCount} lines</span>
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

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-white/[0.05] scrollbar-track-transparent h-full">
          <pre className="p-5 m-0 text-[13px] leading-[1.6] language-markup" tabIndex={0}>
            <code
              className="language-markup"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </div>

        {isLong && !expanded && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-20 bg-gradient-to-t from-[#0a0a0b] to-transparent pointer-events-none" />
            <div className="bg-[#0a0a0b] px-5 pb-4 pt-1 flex justify-center">
              <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/60 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                Show all {lineCount} lines
              </button>
            </div>
          </div>
        )}

        {isLong && expanded && (
          <div className="sticky bottom-0 bg-[#0a0a0b]/90 backdrop-blur-sm px-5 py-2 flex justify-center border-t border-white/[0.04]">
            <button
              onClick={() => setExpanded(false)}
              className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/60 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              Collapse
            </button>
          </div>
        )}
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
