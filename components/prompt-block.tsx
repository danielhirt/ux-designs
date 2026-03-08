"use client";

import { useState } from "react";

export function PromptBlock({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available or permission denied — silent fail
    }
  }

  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0a0b] flex flex-col overflow-hidden shadow-xl h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
            <path d="m9 18 6-6-6-6"/>
          </svg>
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.1em]">
            Prompt
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
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Copied
            </span>
          ) : "Copy"}
        </button>
      </div>
      <div className="p-5 flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/[0.05] scrollbar-track-transparent">
        <p className="text-[13px] leading-[1.6] text-white/50 font-mono whitespace-pre-wrap selection:bg-white/10">
          {prompt}
        </p>
      </div>
      
      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-white/[0.05] bg-white/[0.01]">
        <div className="flex items-center gap-1.5 text-[10px] text-white/20">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V12"/><path d="M12 8h.01"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
          <span>Use this prompt to regenerate or iterate on the design</span>
        </div>
      </div>
    </div>
  );
}
