import Link from "next/link";
import TemplatesClient from "@/components/templates/TemplatesClient";
import fs from "fs";
import path from "path";
import type { Template } from "@/types/templates";

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;

function humanize(str: string) {
  return str
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

export default function FashionTemplatesPage() {
  // Fashion designers templates come from public/templates/fashion
  const base = path.join(process.cwd(), "public", "templates", "fashion");
  const templates: Template[] = [];

  if (fs.existsSync(base)) {
    fs.readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .forEach((d) => {
        const folder = path.join(base, d.name);
        const shots = fs.readdirSync(folder).filter((f) => IMAGE_EXT.test(f)).map((f) => `/templates/fashion/${d.name}/${f}`);
        if (shots.length) {
          templates.push({ id: `fashion/${d.name}`, title: humanize(d.name), category: "portfolio", images: shots });
        }
      });

    fs.readdirSync(base).filter((f) => IMAGE_EXT.test(f)).forEach((file) => {
      const name = path.parse(file).name;
      templates.push({ id: `fashion/${name}`, title: humanize(name), category: "portfolio", images: [`/templates/fashion/${file}`] });
    });
  }

  return (
    <div className="bg-[#f5f2f0] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extraboldtext-[#7D141D]">Fashion Designer Templates</h1>
            <p className="text-sm text-[#6e5659] mt-1">Showcase collections and lookbooks with these templates.</p>
          </div>

        
        </div>

        <div>
          <TemplatesClient
            templatesByCategory={{ portfolio: templates, website: templates }}
            showCustomDesign={false}
            showCategoryToggle={true}
          />
            <Link href="/templates" className="text-md text-[#7D141D] font-semibold hover:underline">
            Browse other templates
          </Link>
        </div>
      </div>
    </div>
  );
}
