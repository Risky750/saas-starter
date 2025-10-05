// /app/(dashboard)/templates/page.tsx
import TemplatesClient from "@/components/templates/TemplatesClient";
import fs from "fs";
import path from "path";
import type { Template } from "@/types/templates";

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;

/**
 * Convert folder/file name to human-readable title
 */
function humanize(str: string) {
  return str
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

export default function TemplatesPage() {
  const base = path.join(process.cwd(), "public", "templates");
  const out: Record<string, Template[]> = {};

  // Categories
  for (const cat of ["website", "portfolio"]) {
    const dir = path.join(base, cat);
    if (!fs.existsSync(dir)) continue;

    const templates: Template[] = [];

    // Subfolders → multi-image templates
    fs.readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .forEach((d) => {
        const folder = path.join(dir, d.name);
        const shots = fs
          .readdirSync(folder)
          .filter((f) => IMAGE_EXT.test(f))
          .sort()
          .map((f) => `/templates/${cat}/${d.name}/${f}`);

        if (shots.length > 0) {
          templates.push({
            id: `${cat}/${d.name}`,
            title: humanize(d.name),
            category: cat,
            images: shots,
          });
        }
      });

    // Loose images → single-image templates
    fs.readdirSync(dir)
      .filter((f) => IMAGE_EXT.test(f))
      .sort()
      .forEach((file) => {
        const name = path.parse(file).name;
        templates.push({
          id: `${cat}/${name}`,
          title: humanize(name),
          category: cat,
          images: [`/templates/${cat}/${file}`],
        });
      });

    out[cat] = templates;
  }

  return <TemplatesClient templatesByCategory={out} />;
}
