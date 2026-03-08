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
