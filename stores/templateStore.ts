import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TemplateId, TemplateStore } from "@/types/templates";

export const useTemplateStore = create<TemplateStore & { clear: () => void }>()(
  persist(
    (set) => ({
      selectedId: null,
      selectedPreview: null,
      category: "website",

      setSelectedId: (id: TemplateId | null) => set({ selectedId: id }),
      setSelectedPreview: (url: string | null) => set({ selectedPreview: url }),
      setCategory: (category: "website" | "portfolio") => set({ category }),
      clear: () => set({ selectedId: null, selectedPreview: null, category: "website" }),
    }),
    { name: "template-storage", storage: createJSONStorage(() => localStorage) }
  )
);
