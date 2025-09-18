"use client";

import React, { useEffect, useState } from 'react';
import Register from '@/components/form/detailsform';
import { useSearchParams } from 'next/navigation';
import { useCheckoutStore } from '@/app/stores/checkoutStore';
import { useTemplateStore } from '@/app/stores/templateStore';
import { usePricingStore } from '@/app/stores/pricingStore';
import type { Plan as PricePlan } from '@/types/pricing';
import { Loader2, AlertTriangle } from 'lucide-react';
import CheckoutCta from '@/components/checkout/CheckoutCta';

interface Plan {
  id: string;
  title: string;
  price: number;
}

const PLAN_LOOKUP: Record<string, Plan> = {
  basic: { id: 'basic', title: 'Basic',  price: 3500 },
  pro:   { id: 'pro',   title: 'Pro',    price: 5000 },
};

export default function CheckoutClient() {
  const params = useSearchParams();
  // Prefer persisted store values; fall back to URL params for compatibility
  const { templateId: storedTemplateId, planId: storedPlanId, setChoice } = useCheckoutStore();
  const { selectedId, setSelectedId, selectedPreview } = useTemplateStore();
  const { planId: pricingPlanId, plans, interval } = usePricingStore();

  const urlTemplate = params.get('template') ?? '';
  const urlPlan = params.get('plan') ?? '';

  const templateId = storedTemplateId || urlTemplate || selectedId || '';
  const planId = storedPlanId || urlPlan || pricingPlanId || '';

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    // If URL provided values (older flows), persist them into the store
    if ((urlTemplate || urlPlan) && (!storedTemplateId || !storedPlanId)) {
      setChoice(urlTemplate || storedTemplateId || '', urlPlan || storedPlanId || '');
      if (urlTemplate && urlTemplate !== selectedId) {
        setSelectedId(urlTemplate as any);
      }
    }
    // no-op otherwise — store already holds the truth
  }, [urlTemplate, urlPlan]);

  // Prefer plans from pricing store (if populated), otherwise use local lookup
  const planFromStore = ((plans as unknown) as PricePlan[])?.find((p) => p.id === planId) ?? null;

  const displayTitle = planFromStore ? planFromStore.name : (PLAN_LOOKUP[planId]?.title ?? null);
  const displayPriceNumber = planFromStore
    ? (interval === 'year' ? planFromStore.yearly : planFromStore.monthly)
    : (PLAN_LOOKUP[planId]?.price ?? null);

  // Format currency (default to Naira symbol for this app)
  const formatPrice = (n?: number) => {
    if (n == null) return '';
    // show thousands with k (e.g., 3500 -> 3.5k) for compactness
    if (n >= 1000) return `₦${(n / 1000).toLocaleString()}k`;
    return `₦${n.toLocaleString()}`;
  };

  return (
    <>
      <div className="w-full h-screen max-w-4xl grid md:grid-cols-2 gap-6">

        <section className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-lg h-screen">
          <h2 className="text-xl font-bold mb-4">Your details</h2>
          <Register />
        </section>

        <aside className="bg-white rounded-2xl shadow-xl p-6 flex flex-col h-screen">
          <h3 className="text-lg font-semibold mb-3">Order summary</h3>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Template</p>
            <div className="flex items-center gap-3">
              {selectedPreview ? (
                <img src={selectedPreview} alt="selected template preview" className="w-20 h-12 object-cover rounded-md" />
              ) : (
                <div className="w-20 h-12 bg-gray-100 rounded-md grid place-items-center text-xs text-gray-500">No preview</div>
              )}
              <p className="font-medium capitalize">
                {templateId ? templateId.replace(/[-_]/g, ' ') : 'None selected'}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium">
              {displayTitle
                ? `${displayTitle} — ${formatPrice(displayPriceNumber ?? undefined)}`
                : 'None selected'}
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="mt-auto">
            <CheckoutCta />
          </div>
        </aside>
      </div>
    </>
  );
}
