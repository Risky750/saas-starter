import TemplatesClient from "@/components/templates/TemplatesClient";
import fs from "fs";
import path from "path";
import { Template } from "types/templates";



export default function TemplatesPage() {
  // Point to the folder that actually lives in /public/templates
  const baseDir = path.join(process.cwd(), "public", "templates");
  const categories = ["website", "portfolio"];
  const buckets: Record<string, Template[]> = {};

  // Safely read the disk once per build
  try {
    for (const cat of categories) {
      const catPath = path.join(baseDir, cat);
      if (!fs.existsSync(catPath)) continue;

      const templates: Template[] = [];
      const entries = fs.readdirSync(catPath, { withFileTypes: true });

      // Case 1: sub-folders = individual templates
      const dirs = entries.filter((e) => e.isDirectory());
      if (dirs.length) {
        for (const dir of dirs) {
          const slug = dir.name;
          const dirFullPath = path.join(catPath, slug);
          const screenshots = fs
            .readdirSync(dirFullPath)
            .filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f))
            .map((f) => `/templates/${cat}/${slug}/${f}`);

          templates.push({
            id: `${cat}/${slug}`,
            title: slug.replace(/[-_]/g, " "), // “my-site” → “my site”
            images: screenshots,
          });
        }
      } else {
        // Case 2: flat files = one preview per file
        const files = entries.filter((e) => e.isFile() && /\.(png|jpe?g|webp|gif|svg)$/i.test(e.name));
        for (const file of files) {
          const name = path.parse(file.name).name;
          templates.push({
            id: `${cat}/${name}`,
            title: name.replace(/[-_]/g, " "),
            images: [`/templates/${cat}/${file.name}`],
          });
        }
      }

      buckets[cat] = templates;
    }
  } catch (err) {
    console.error("Could not read template folders:", err);
  }

  // Hand the data to the client component
  return <TemplatesClient templatesByCategory={buckets} />;
}