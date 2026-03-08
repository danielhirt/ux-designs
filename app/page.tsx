import { Suspense } from "react";
import { getAllComponents, getAllTags } from "@/lib/components";
import { GalleryCard } from "@/components/gallery-card";
import { TagFilter } from "@/components/tag-filter";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const allComponents = getAllComponents();
  const tags = getAllTags();

  const filtered = tag
    ? allComponents.filter((c) => c.tags.includes(tag))
    : allComponents;

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-lg font-semibold tracking-tight mb-1">
          UX Designs
        </h1>
        <p className="text-sm text-white/40">
          Component library with live previews and prompts
        </p>
      </header>

      <Suspense fallback={null}>
        <div className="mb-8">
          <TagFilter tags={tags} />
        </div>
      </Suspense>

      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        }}
      >
        {filtered.map((component) => (
          <GalleryCard key={component.slug} component={component} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-white/30 text-center py-20">
          No components match this filter.
        </p>
      )}
    </main>
  );
}
