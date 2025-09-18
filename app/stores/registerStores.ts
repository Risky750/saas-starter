import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { RegisterState } from "types/register";

const initialState: RegisterState = {
  name: "",
  businessName: "",
  phoneNumber: "",
  email: "",
  setField: () => {},
  reset: () => {},
};

export const useRegisterStore = create<RegisterState>()(
  persist(
    (set) => ({
      ...initialState,
      setField: (field, value) => set({ [field]: value }),
      reset: () => set(initialState),
    }),
    {
      name: 'register-storage',
      // persist only non-sensitive fields
      partialize: (s) => ({ name: s.name, businessName: s.businessName }),
    }
  )
);