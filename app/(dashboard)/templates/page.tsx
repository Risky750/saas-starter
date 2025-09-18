import TemplatesClient from '@/components/templates/TemplatesClient';
import fs from 'fs';
import path from 'path';

type Template = {
  id: string;
  title: string;
  desc?: string;
  images: string[];
};

export default function TemplatesPage() {
  // server-side: specifically read `public/templates/website` and `public/templates/portfolio`
  const base = path.join(process.cwd(), 'public', 'templates');
  const categories = ['website', 'portfolio'];
  const templatesByCategory: Record<string, Template[]> = {};

  try {
    for (const category of categories) {
      const catDir = path.join(base, category);
      const templatesArr: Template[] = [];
      if (fs.existsSync(catDir)) {
        const entries = fs.readdirSync(catDir, { withFileTypes: true });
        const dirs = entries.filter((d) => d.isDirectory());
        if (dirs.length > 0) {
          for (const d of dirs) {
            const idSegment = d.name;
            const dirPath = path.join(catDir, idSegment);
            const files = fs.readdirSync(dirPath).filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f));
            const images = files.map((f) => `/templates/${encodeURI(category)}/${encodeURI(idSegment)}/${encodeURI(f)}`);
            const id = `${category}/${idSegment}`;
            templatesArr.push({ id, title: idSegment, images });
          }
        } else {
          // no subdirectories: treat files directly in category folder as templates
          const files = entries.filter((e) => e.isFile() && /\.(png|jpe?g|webp|gif|svg)$/i.test(e.name));
          for (const f of files) {
            const name = path.parse(f.name).name;
            const id = `${category}/${name}`;
            templatesArr.push({ id, title: name, images: [`/templates/${encodeURI(category)}/${encodeURI(f.name)}`] });
          }
        }
      }
      templatesByCategory[category] = templatesArr;
    }
  } catch (err) {
    console.error('Error reading templates from public:', err);
  }

  return <TemplatesClient templatesByCategory={templatesByCategory} />;
}
