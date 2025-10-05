import { create } from "zustand";
import type { TemplateId, TemplateStore } from "@/types/templates";

export const useTemplateStore = create<TemplateStore>((set) => ({
  selectedId: null,
  selectedPreview: null,
  category: "website",

  setSelectedId: (id: TemplateId | null) => set({ selectedId: id }),
  setSelectedPreview: (url: string | null) => set({ selectedPreview: url }),
  setCategory: (category: "website" | "portfolio") => set({ category }),
}));
