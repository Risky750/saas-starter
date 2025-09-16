export type templates = {
  id: string;
  title: string;
  desc: string;
  preview: string;
};
export type TemplateId = "portfolio" | "website";   // ← single literal value

export type TemplateStore = {
  selectedId: TemplateId | null;                   // ← allow “nothing picked”
  setSelectedId: (id: TemplateId | null) => void;  // ← can clear too
};

import { PortfolioPreview, WebsitePreview } from "@/components/previews";

export const templates = [
  {
    id: "portfolio",
    title: "Portfolio",
    desc: "Single-page portfolio for designers & developers.",
    preview: PortfolioPreview,
  },
  {
    id: "website",
    title: "Website",
    desc: "Multi-page business / startup site with blog & contact.",
    preview: WebsitePreview,
  },
] as const;