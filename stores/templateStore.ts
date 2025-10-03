import { create } from "zustand";
import { TemplateStore } from "types/templates";

// Plain, non-persistent store
export const useTemplateStore = create<TemplateStore>((set) => ({
  selectedId: null,
  selectedPreview: null,
  setSelectedId: (id) => set({ selectedId: id }),
  setSelectedPreview: (url) => set({ selectedPreview: url }),
}));