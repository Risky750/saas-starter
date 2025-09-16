import { create } from "zustand";
import { TemplateStore, TemplateId } from "types/templates";


export const useTemplateStore = create<TemplateStore >((set) => ({
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
}));