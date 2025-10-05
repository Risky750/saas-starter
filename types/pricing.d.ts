
export type Interval = "monthly" | "quarterly";

export type Plan = {
  id: string;              // unique identifier
  name: string;            // plan name (e.g., Standard, Premium)
  monthly: number;         // monthly price
  quarterly: number;       // quarterly price
  features: string[];      
  popular?: boolean;       
  accent?: string;         
};
