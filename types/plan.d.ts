export type Plan = {
  id: string;
  name: string;
  quarterly: number; // clearer than `price`
  monthly: number;
  features: string[];
  cta: string;
  popular?: boolean;
};
export type Interval = "monthly" | "quarterly";
