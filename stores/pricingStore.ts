import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plan, Interval } from "@/types/pricing";

type PricingState = {
  plans: Plan[];          
  interval: Interval;
  planId: string | null;
  setPlans: (list: Plan[]) => void;
  setInterval: (i: Interval) => void;
  setPlanId: (id: string | null) => void;
};

export const usePricingStore = create<PricingState>()(
  persist(
    (set) => ({
      plans: [],
      interval: "quarterly",
      planId: null,
      setPlans: (plans) => set({ plans }),
      setInterval: (interval) => set({ interval }),
      setPlanId: (planId) => set({ planId }),
    }),
    {
      name: "pricing-storage",
      partialize: ({ interval, planId }) => ({ interval, planId }), // only these survive reload
    }
  )
);