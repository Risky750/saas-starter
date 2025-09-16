export type RegisterState = {
  name: string;
  businessName: string;
  phoneNumber: string;
  email: string;
  setField: (field: keyof RegisterState, value: string) => void;
  reset: () => void;
}