import fs from "fs";
import path from "path";

export interface ComponentMeta {
  title: string;
  slug: string;
  prompt: string;
  tags: string[];
  date: string;
  description: string;
  htmlFile: string;
}

const REGISTRY_DIR = path.join(process.cwd(), "registry");

let _cache: ComponentMeta[] | null = null;

export function getAllComponents(): ComponentMeta[] {
  if (_cache) return _cache;

  const entries = fs.readdirSync(REGISTRY_DIR, { withFileTypes: true });
  const components: ComponentMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const metaPath = path.join(REGISTRY_DIR, entry.name, "meta.json");
    if (!fs.existsSync(metaPath)) continue;

    const raw = fs.readFileSync(metaPath, "utf-8");
    const meta = JSON.parse(raw);

    if (!meta.title || !meta.slug || !meta.prompt || !Array.isArray(meta.tags)) {
      console.warn(`Invalid meta.json in ${entry.name}, skipping`);
      continue;
    }

    // Find the HTML file in the directory
    const files = fs.readdirSync(path.join(REGISTRY_DIR, entry.name));
    const htmlFile = files.find((f) => f.endsWith(".html"));
    if (!htmlFile) continue;

    components.push({
      ...meta,
      htmlFile,
    });
  }

  _cache = components.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return _cache;
}

export function getComponent(slug: string): ComponentMeta | undefined {
  const components = getAllComponents();
  return components.find((c) => c.slug === slug);
}

export function getAllTags(): string[] {
  const components = getAllComponents();
  const tags = new Set<string>();
  for (const c of components) {
    for (const tag of c.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

export function getComponentSource(slug: string): string | null {
  const component = getComponent(slug);
  if (!component) return null;
  const htmlPath = path.join(REGISTRY_DIR, slug, component.htmlFile);
  if (!fs.existsSync(htmlPath)) return null;
  return fs.readFileSync(htmlPath, "utf-8");
}
