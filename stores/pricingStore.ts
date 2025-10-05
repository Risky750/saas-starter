"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Plan, Interval } from "@/types/pricing";

type PricingState = {
  plans: Plan[];
  interval: Interval; // "monthly" | "quarterly"
  planId: string | null;
  setPlans: (plans: Plan[]) => void;
  setInterval: (interval: Interval) => void;
  setPlanId: (planId: string | null) => void;
};

export const usePricingStore = create<PricingState>()(
  persist(
    (set) => ({
      plans: [],
      interval: "monthly", // default
      planId: null,
      setPlans: (plans) => set({ plans }),
      setInterval: (interval) => set({ interval }),
      setPlanId: (planId) => set({ planId }),
    }),
    {
      name: "pricing-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys, not everything (fixes the type issues you had earlier)
      partialize: (state) => ({
        interval: state.interval,
        planId: state.planId,
      }),
    }
  )
);
