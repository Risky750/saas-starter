
export type Interval = "monthly" | "quarterly";

export type Plan = {
  id: string;              
  name: string;            
  monthly: number;       
  quarterly: number;       
  features: string[];      
  popular?: boolean;       
  accent?: string;         
};
