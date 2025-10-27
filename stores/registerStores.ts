import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { RegisterState } from "@/types/register";

type RegisterStore = RegisterState & {
  setField: <K extends keyof RegisterState>(field: K, value: RegisterState[K]) => void;
  clear: () => void;
};

export const useRegisterStore = create<RegisterStore>()(
  persist(
    (set) => ({
    name: "",
    email: "",
    setField: (field, value) => set((state) => ({ ...state, [field]: value })),
    clear: () => set({ name: "", email: "" }),
    }),
    {
      name: "register-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
