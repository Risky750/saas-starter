import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { TemplateStore, TemplateId } from "types/templates";


export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      selectedId: null,
      selectedPreview: null,
      setSelectedId: (id) => set({ selectedId: id }),
      setSelectedPreview: (url) => set({ selectedPreview: url }),
    }),
    {
      name: 'template-storage',
      partialize: (state) => ({ selectedId: state.selectedId, selectedPreview: state.selectedPreview }),
    }
  )
);