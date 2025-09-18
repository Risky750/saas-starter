import { create } from "zustand";
import { persist } from 'zustand/middleware';
import type { Plan, Interval } from "@/types/pricing";

interface PricingState {
  plans: Plan[];           // runtime list
  interval: Interval;
  planId: string | null;   // any string
  setPlans: (p: Plan[]) => void;
  setInterval: (i: Interval) => void;
  setPlan: (id: string) => void;
}

export const usePricingStore = create<PricingState>()(
  persist(
    (set) => ({
      plans: [],
      interval: "month",
      planId: null,
      setPlans: (p) => set({ plans: p }),
      setInterval: (i) => set({ interval: i }),
      setPlan: (id) => set({ planId: id }),
    }),
    {
      name: 'pricing-storage',
      partialize: (state) => ({ planId: state.planId, interval: state.interval }),
    }
  )
);