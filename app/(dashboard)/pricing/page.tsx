"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "@/app/stores/checkoutStore";
import { useTemplateStore } from "@/app/stores/templateStore";
import { Plan, Interval } from "@/types/plan";
import { Input } from "@/components/ui/input";
import { usePricingStore } from "@/app/stores/pricingStore";

export default function PriceCards() {
  const router = useRouter();
  const { selectedId } = useTemplateStore();
  const { setChoice } = useCheckoutStore();
  const { setPlans, setInterval: setStoreInterval } = usePricingStore.getState();

  const [interval, setInterval] = useState<Interval>("quarterly");

  const plans: Plan[] = [
    {
      id: "2",
      name: "Standard",
      monthly: 3500,
  quarterly: 3166.66,
  features: [
    "professional Email",
    "Secured Website",
  ],
      popular: false,
      cta: "Get Started",
    },
    {
      id: "2",
      name: "Premium",
      monthly: 5000,
      quarterly: 4666.66,
      features: [
        "Free professional email",
        "Secured Website",
        "payment services intergration"
      ],
      popular: true,
      cta: "Get Started",
    },
  ];

  useEffect(() => {
    setPlans(plans);
  }, [setPlans]);

  const selectPlan = (plan: Plan) => {
    if (!selectedId) return;

    setStoreInterval(interval);

    setChoice(selectedId, plan.id, interval);

    const total = interval === "quarterly" ? plan.quarterly : plan.monthly;
    useCheckoutStore.getState().setTotal(total);

    setTimeout(() => router.push("/checkout"), 700);
  };

  const currentPrice = (plan: Plan) =>
    interval === "monthly" ? plan.monthly : plan.quarterly;

  return (
    <section className="flex  justify-center bg-[#F4EFEA] h-screen w-full px-4 py-8 gap-8">
      <div className="w-full max-w-6x space-y-6">
        {/* Header + toggle */}
        <div className="flex items-center justify-between gap-4 mb-6">
</div>
<div className="place-items-center mt-10 mb-10">
          <div className="flex items-center gap-3 text-[#7D141D]">
            <span
              className={
                interval === "quarterly"
                  ? "font-semibold"
                  : "text-sm text-[#7D141D]/60"
              }
            >
              Quarterly
            </span>

            <label className="relative inline-flex items-center cursor-pointer">
              <Input
                type="checkbox"
                className="sr-only peer"
                checked={interval === "monthly"}
                onChange={(e) =>
                  setInterval(e.target.checked ? "monthly" : "quarterly")
                }
              />
              <div className="w-11 h-6 bg-[#7D141D] rounded-full peer-checked:bg-[#FF1E27] transition" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
            </label>

            <span
              className={
                interval === "monthly"
                  ? "font-semibold"
                  : "text-sm text-[#7D141D]/60"
              }
            >
              Monthly
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="md:flex md:flex-col-2 md:place-content-center gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className=" flex mb-10 sm:mx-8 flex-col p-8 md:px-30 rounded-2xl shadow-lg border border-gray-200 transition-transform hover:scale-[1.02] hover:shadow-xl min-h-[420px]"
            >

              <h3 className="text-xl font-bold text-[#7D141D]">{plan.name}</h3>

              <div className="mt-1 mb-4">
                <div className="flex flex-col items-start">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      ₦{currentPrice(plan).toLocaleString()}
                    </span>
                    <span className="text-sm text-[#7D141D]/70">/month</span>
                  </div>
                  {interval === "quarterly" && (
                    <span className="text-xl text-slate-800  line-through italic">
                      ₦{plan.monthly.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <ul className="mb-6 space-y-2 text-sm text-[#7D141D]/80">
                {plan.features.map((feature) => {
                  if (feature.includes("Free Domain") && interval === "monthly") {
                    return null;
                  }
                  return (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="text-[#FF1E27]">✓</span> {feature}
                    </li>
                  );
                })}
              </ul>

              <Button
                onClick={() => selectPlan(plan)}
                className="mt-auto w-full rounded-full bg-[#7D141D] text-white hover:bg-[#FF1E27] transition"
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
