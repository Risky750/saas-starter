import { create } from "zustand";
import { RegisterState } from "@/types/register";

type RegisterStore = RegisterState & {
  setField: <K extends keyof RegisterState>(field: K, value: RegisterState[K]) => void;
};

export const useRegisterStore = create<RegisterStore>((set) => ({
  name: "",
  email: "",
  setField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    }))
}));
