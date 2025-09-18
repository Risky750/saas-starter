export type templates = {
  id: string;
  title: string;
  desc: string;
  preview: string;
};
export type TemplateId = string;   // allow dynamic template ids (from public folder)

export type TemplateStore = {
  selectedId: TemplateId | null;                   // ← allow “nothing picked”
  selectedPreview?: string | null;                 // optional preview image URL
  setSelectedId: (id: TemplateId | null) => void;  // ← can clear too
  setSelectedPreview?: (url: string | null) => void;
};

