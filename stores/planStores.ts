import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Plan, Interval } from "@/types/pricing";

type PricingState = {
  plans: Plan[]; // all plans (seeded in PricingPage)
  interval: Interval; // "monthly" | "quarterly"
  selectedPlan: Plan | null;
  setPlans: (plans: Plan[]) => void;
  setInterval: (interval: Interval) => void;
  selectPlan: (plan: Plan | null) => void;
  reset: () => void;
};

export const usePricingStore = create<PricingState>()(
  persist(
    (set) => ({
      plans: [],
      interval: "quarterly",
      selectedPlan: null,
      setPlans: (plans) => set({ plans }),
      setInterval: (interval) => set({ interval }),
      selectPlan: (plan) => set({ selectedPlan: plan }),
      reset: () => set({ selectedPlan: null, interval: "quarterly" }),
    }),
    {
      name: "pricing-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        interval: state.interval,
        selectedPlan: state.selectedPlan,
      }),
    }
  )
);
