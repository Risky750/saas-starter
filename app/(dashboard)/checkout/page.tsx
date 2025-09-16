'use client';

import React, { useEffect, useState } from 'react';
import Register from '@/components/form/detailsform';
import { useSearchParams } from 'next/navigation';
import { useCheckoutStore } from '@/app/stores/checkoutStore';
import { useTemplateStore } from '@/app/stores/templateStore';
import { Loader2, AlertTriangle } from 'lucide-react';

interface Plan {
  id: string;
  title: string;
  price: number;
}

const PLAN_LOOKUP: Record<string, Plan> = {
  basic: { id: 'basic', title: 'Basic',  price: 3500 },
  pro:   { id: 'pro',   title: 'Pro',    price: 5000 },
};

export default function CheckoutPage() {
  const params = useSearchParams();
  const templateId = params.get('template') ?? '';
  const planId     = params.get('plan') ?? '';

  const { setChoice }            = useCheckoutStore();
  const { selectedId, setSelectedId } = useTemplateStore();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (templateId || planId) {
      setChoice(templateId, planId);
      if (
        templateId &&
        templateId !== selectedId &&
        (templateId === 'portfolio' || templateId === 'website')
      ) {
        setSelectedId(templateId as any);
      }
    }
    // no-op
  }, [templateId, planId]);

  const plan = PLAN_LOOKUP[planId] ?? null;

  return (
    <main className="min-h-screen bg-[#F4EFEA] text-[#7D141D] flex items-start justify-center p-8 overflow-hidden">
      <div className="w-full h-screen max-w-4xl grid md:grid-cols-2 gap-6">

        <section className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-lg h-screen">
          <h2 className="text-xl font-bold mb-4">Your details</h2>
          <Register />
        </section>

        <aside className="bg-white rounded-2xl shadow-xl p-6 flex flex-col h-screen">
          <h3 className="text-lg font-semibold mb-3">Order summary</h3>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Template</p>
            <p className="font-medium capitalize">
              {templateId || 'None selected'}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium">
              {plan
                ? `${plan.title} — ₦${(plan.price / 1000).toLocaleString()}k`
                : 'None selected'}
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <p className="mt-auto text-sm text-muted-foreground">Use the form on the left to save your details. When ready you can Register & pay from the form which will also create a checkout session for the selected plan.</p>
        </aside>
      </div>
    </main>
  );
}