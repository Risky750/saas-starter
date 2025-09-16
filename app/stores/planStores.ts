import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Plan = {
  id: string;
  title: string;
  price: number;
  perks: string[];
  cta: string;
  popular?: boolean;
};

type PlanState = {
  plans: Plan[];          // seeded from /api/plans
  selected: Plan | null;  // what the user picked
  setPlans: (p: Plan[]) => void;
  selectPlan: (p: Plan) => void;
};

export const usePlanStore = create<PlanState>()(
  devtools(
    persist(
      (set) => ({
        plans: [],
        selected: null,
        setPlans: (plans) => set({ plans }),
        selectPlan: (plan) => set({ selected: plan }),
      }),
      { name: 'plan-storage' }
    )
  )
);