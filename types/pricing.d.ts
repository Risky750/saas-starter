export type Interval = "month" | "year";

export type Plan = {
  id: string;
  name: string;
  monthly: number;
  yearly: number;
  currency: string; // USD, NGN, EUR …
  features: string[];
  popular?: boolean;
  accent?: string;  // tailwind colour class  e.g. "indigo"
};