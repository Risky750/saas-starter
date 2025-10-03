// checkoutStore.ts
import { create } from "zustand";
import { useTemplateStore } from "./templateStore";
import { usePricingStore } from "./pricingStore";

type CheckoutState = {
  setChoice: (templateId: string, planId: string, interval?: "monthly" | "quarterly") => void;
  total: number | null;
  setTotal: (n: number | null) => void;
  domainAdded: boolean;
  setDomainAdded: (v: boolean) => void;
};

export const useCheckoutStore = create<CheckoutState>(() => ({
  setChoice: (templateId, planId, interval) => {
    useTemplateStore.getState().setSelectedId(templateId);
    usePricingStore.getState().setPlanId(planId);

    (useCheckoutStore as any).setState({
      domainAdded: interval === "quarterly",
    });
  },
  total: null,
  setTotal: (n) => {
    (useCheckoutStore as any).setState({ total: n });
  },
  domainAdded: false,
  setDomainAdded: (v) => {
    (useCheckoutStore as any).setState({ domainAdded: v });
  },
}));

export const useCheckoutSnapshot = () => ({
  templateId: useTemplateStore((s) => s.selectedId) ?? "",
  planId: usePricingStore((s) => s.planId) ?? "",
  total: useCheckoutStore((s) => s.total) ?? null,
  domainAdded: useCheckoutStore((s) => s.domainAdded) ?? false,
});
