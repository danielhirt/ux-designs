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
