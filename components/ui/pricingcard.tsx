'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePlanStore } from '../../app/stores/planStores';

export default function PriceCards() {
  const naira = '\u20A6';
  const router = useRouter();
  const { plans, selected, setPlans, selectPlan } = usePlanStore();

  /* 1.  Fetch plans from backend once */
  useEffect(() => {
    if (plans.length) return;
    fetch('/api/plans')
      .then((r) => r.json())
      .then(setPlans);
  }, [plans.length, setPlans]);

  /* 2.  Send selected plan → backend → redirect */
  const pick = async (plan: typeof plans[0]) => {
    const res = await fetch('/api/select-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: plan.id }),
    });
    if (!res.ok) return;
    selectPlan(plan);            // local cache
    router.push('/register');    // or /checkout
  };

  if (!plans.length) return null; // or spinner

  return (
    <section className="min-h-screen bg-[#F4EFEA] px-4 py-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <Card
            key={p.id}
            className={`relative flex flex-col p-6 rounded-2xl shadow-lg border ${
              p.popular
                ? 'border-[#FF1E27] ring-2 ring-[#FF1E27]/30'
                : 'border-gray-200'
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF1E27] text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most popular
              </span>
            )}

            <h3 className="text-xl font-bold text-[#7D141D]">{p.title}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-extrabold">
                {naira}{p.price.toLocaleString()}
              </span>
              <span className="text-sm text-[#7D141D]/70"> / once</span>
            </div>

            <ul className="mb-6 space-y-2 text-sm text-[#7D141D]/80">
              {p.perks.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-[#FF1E27]">✓</span> {item}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => pick(p)}
              className="mt-auto w-full rounded-full bg-[#7D141D] text-white hover:bg-[#FF1E27] transition"
            >
              {p.cta}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}