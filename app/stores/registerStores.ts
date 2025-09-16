import { create } from "zustand";
import { RegisterState } from "types/register";

const initialState: RegisterState = {
  name: "",
  businessName: "",
  phoneNumber: "",
  email: "",
  setField: () => {},
  reset: () => {},
};

export const useRegisterStore = create<RegisterState>()((set) => ({
  ...initialState,
  setField: (field, value) => set({ [field]: value }),
  reset: () => set(initialState),
}));