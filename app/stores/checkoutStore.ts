import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTemplateStore } from './templateStore';
import { usePricingStore } from './pricingStore';

type CheckoutState = {
  templateId: string;
  planId   : string;
  setChoice: (t: string, p: string) => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      templateId: useTemplateStore.getState().selectedId ?? '',
      planId    : usePricingStore.getState().planId ?? '',
      setChoice : (t, p) => set({ templateId: t, planId: p }),
    }),
    {
      name: 'checkout-storage',
      partialize: (s) => ({ templateId: s.templateId, planId: s.planId }),
    }
  )
);