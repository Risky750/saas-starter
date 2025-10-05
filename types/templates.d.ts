export type Template = {
  id: string;
  title: string;
  category: string;
  images: string[];
};

export type TemplateId = string;

export type TemplateStore = {
  selectedId: TemplateId | null;
  selectedPreview: string | null;
  category: "website" | "portfolio";
  setSelectedId: (id: TemplateId | null) => void;
  setSelectedPreview: (url: string | null) => void;
  setCategory: (category: "website" | "portfolio") => void;
};
