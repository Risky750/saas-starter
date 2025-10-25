export type RegisterState = {
  name: string;
  // Either email or phone may be provided. Validation happens server-side.
  email?: string;
  phone?: string;

}