// checkoutStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useTemplateStore } from "./templateStore";
import { usePricingStore } from "./pricingStore";

type Interval = "monthly" | "quarterly";

type CheckoutState = {
  templateId: string;
  planId: string;
  interval: Interval;
  domainAdded: boolean;
  total: number | null;

  // Actions
  setChoice: (templateId: string, planId: string, interval?: Interval) => void;
  setInterval: (interval: Interval) => void;
  setDomainAdded: (v: boolean) => void;
  setTotal: (n: number | null) => void;
  clear: () => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      templateId: "",
      planId: "",
      interval: "monthly",
      domainAdded: false,
      total: null,

      setChoice: (templateId, planId, interval) => {
        useTemplateStore.getState().setSelectedId(templateId);
        usePricingStore.getState().setPlanId(planId);

        set({
          templateId,
          planId,
          interval: interval || "monthly",
          domainAdded: interval === "quarterly", // quarterly gets domain by default
        });
      },

      setInterval: (interval) => {
        set({ interval });
        // Optional: auto-add domain for quarterly
        if (interval === "quarterly") set({ domainAdded: true });
      },

      setDomainAdded: (v) => set({ domainAdded: v }),
      setTotal: (n) => set({ total: n }),
      // clear persisted checkout state
      clear: () => set({ templateId: '', planId: '', interval: 'monthly', domainAdded: false, total: null }),
    }),
    {
      name: "checkout-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Snapshot hook for easy access
export const useCheckoutSnapshot = () => ({
  templateId: useCheckoutStore((s) => s.templateId),
  planId: useCheckoutStore((s) => s.planId),
  interval: useCheckoutStore((s) => s.interval),
  domainAdded: useCheckoutStore((s) => s.domainAdded),
  total: useCheckoutStore((s) => s.total),
});
