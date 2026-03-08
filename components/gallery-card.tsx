import Link from "next/link";
import { ComponentMeta } from "@/lib/components";

export function GalleryCard({ component }: { component: ComponentMeta }) {
  const iframeSrc = `/registry/${component.slug}/${component.htmlFile}`;

  return (
    <Link href={`/${component.slug}`} className="group block">
      <article className="rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm transition-colors duration-200 hover:bg-white/[0.06] overflow-hidden">
        {/* Thumbnail preview */}
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

        {/* Info */}
        <div className="p-4 space-y-2">
          <h2 className="text-sm font-medium text-[#f2f2f7]">
            {component.title}
          </h2>
          <p className="text-xs text-white/50 line-clamp-2">
            {component.description}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[11px] text-white/30">{component.date}</span>
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
      </article>
    </Link>
  );
}
