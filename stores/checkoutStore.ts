// checkoutStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useTemplateStore } from "./templateStore";
import { usePricingStore } from "./pricingStore";

type CheckoutState = {
  setChoice: (templateId: string, planId: string, interval?: "monthly" | "quarterly") => void;
  total: number | null;
  setTotal: (n: number | null) => void;
  domainAdded: boolean;
  setDomainAdded: (v: boolean) => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      setChoice: (templateId, planId, interval) => {
        useTemplateStore.getState().setSelectedId(templateId);
        usePricingStore.getState().setPlanId(planId);

        set({
          domainAdded: interval === "quarterly",
        });
      },
      total: null,
      setTotal: (n) => set({ total: n }),
      domainAdded: false,
      setDomainAdded: (v) => set({ domainAdded: v }),
    }),
    {
      name: "checkout-storage",
      storage: createJSONStorage(() => localStorage), // ✅ correct for Zustand v4
    }
  )
);

export const useCheckoutSnapshot = () => ({
  templateId: useTemplateStore((s) => s.selectedId) ?? "",
  planId: usePricingStore((s) => s.planId) ?? "",
  total: useCheckoutStore((s) => s.total) ?? null,
  domainAdded: useCheckoutStore((s) => s.domainAdded) ?? false,
});
