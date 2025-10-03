import TemplatesClient from "@/components/templates/TemplatesClient";
import fs from "fs";
import path from "path";
import { Template } from "types/templates";

export default function TemplatesPage() {
  const base = path.join(process.cwd(), "public", "templates");
  const out: Record<string, Template[]> = {};

  for (const cat of ["website", "portfolio"]) {
    const dir = path.join(base, cat);
    if (!fs.existsSync(dir)) continue; // folder missing = shrug

    const templates: Template[] = [];

    // 1. sub-dirs = templates
    fs.readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .forEach((d) => {
        const shots = fs
          .readdirSync(path.join(dir, d.name))
          .filter((f) => /.(png|jpe?g|webp|gif)$/i.test(f))
          .map((f) => `/templates/${cat}/${d.name}/${f}`);

        templates.push({
          id: `${cat}/${d.name}`,
          title: d.name.replace(/[-_]/g, " "),
          images: shots,
        });
      });

    // 2. loose files = one-shot templates
    fs.readdirSync(dir)
      .filter((f) => /.(png|jpe?g|webp|gif)$/i.test(f))
      .forEach((file) => {
        const name = path.parse(file).name;
        templates.push({
          id: `${cat}/${name}`,
          title: name.replace(/[-_]/g, " "),
          images: [`/templates/${cat}/${file}`],
        });
      });

    out[cat] = templates;
  }

  return <TemplatesClient templatesByCategory={out} />;
}