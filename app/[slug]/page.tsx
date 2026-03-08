import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllComponents, getComponent, getComponentSource } from "@/lib/components";
import { PreviewFrame } from "@/components/preview-frame";
import { PromptBlock } from "@/components/prompt-block";
import { SourceBlock } from "@/components/source-block";

export async function generateStaticParams() {
  const components = getAllComponents();
  return components.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
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

  const source = getComponentSource(slug);
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

      {/* Stacked layout */}
      <div className="flex flex-col gap-12">
        {/* Preview */}
        <div className="h-[600px] lg:h-[800px] flex flex-col">
          <PreviewFrame src={iframeSrc} title={component.title} source={source ?? undefined} />
        </div>

        {/* Prompt + Source side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PromptBlock prompt={component.prompt} />
          {source && <SourceBlock source={source} />}
        </div>
      </div>
    </main>
  );
}
