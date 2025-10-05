"use client";

import React, { useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTemplateStore } from "@/stores/templateStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { usePricingStore } from "@/stores/pricingStore";
import type { Plan } from "@/types/pricing";
import { Check } from "lucide-react";

// Default plans
const defaultPlans: Plan[] = [
  {
    id: "1",
    name: "Standard",
    monthly: 3500,
    quarterly: 3166.66,
    features: [
      "1-page personal portfolio",
      "Custom colours & branding",
      "Social-media integration",
      "Free consultation & setup guide",
      "Free domain",
    ],
  },
  {
    id: "2",
    name: "Premium",
    monthly: 5000,
    quarterly: 4666.66,
    features: [
      "1-page personal portfolio",
      "Custom colours & branding",
      "Social-media integration",
      "Free consultation & setup guide",
      "Custom e-mail setup",
      "Free domain",
    ],
  },
  {
    id: "3",
    name: "Enterprise",
    monthly: 10000,
    quarterly: 9666.66,
    features: [
      "1-page personal portfolio",
      "Custom colours & branding",
      "Social-media integration",
      "Free consultation & setup guide",
      "Custom e-mail setup",
      "Free domain",
      "E-mail hosting",
      "SEO optimisation",
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { selectedId, selectedPreview, category } = useTemplateStore();
  const { setChoice, setTotal } = useCheckoutStore();
  const { plans: storedPlans, setPlans, interval, setInterval } = usePricingStore();

  // Initialize plans if empty
  useEffect(() => {
    if (storedPlans.length === 0) setPlans(defaultPlans);
  }, [storedPlans.length, setPlans]);

  // Filter plans by category
  const filteredPlans = useMemo(() => {
    if (!storedPlans.length) return [];
    if (category === "website") return storedPlans.filter(p => ["Premium", "Enterprise"].includes(p.name));
    if (category === "portfolio") return storedPlans.filter(p => ["Standard", "Premium"].includes(p.name));
    return storedPlans;
  }, [category, storedPlans]);

  const selectPlan = (plan: Plan) => {
    if (!selectedId) return;

    const price = interval === "quarterly" ? plan.quarterly : plan.monthly;
    setChoice(selectedId, plan.id, interval);
    setTotal(price);

    router.push("/checkout");
  };

  const currentPrice = (plan: Plan) => (interval === "monthly" ? plan.monthly : plan.quarterly);

  const visibleFeatures = (plan: Plan) =>
    interval === "monthly"
      ? plan.features.filter(f => f.toLowerCase() !== "free domain")
      : plan.features;

  if (!selectedId) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f5f2f0] text-[#2c1013] px-4">
        <h2 className="text-2xl font-bold mb-4">No template selected</h2>
        <p className="text-center mb-6 text-sm text-[#6e5659]">
          Pick a template before choosing a plan.
        </p>
        <Button
          onClick={() => router.push("/templates")}
          className="px-6 py-3 rounded-full bg-[#7d141d] text-white hover:bg-[#a01c24] transition"
        >
          Pick a Template
        </Button>
      </div>
    );
  }

  return (
    <section className="bg-[#f5f2f0] w-full flex justify-center items-start px-4 py-8">
  <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6 items-center md:items-start">
    {/* Left: Template Preview */}
    {selectedPreview && (
      <div className="w-full md:w-3/5 flex flex-col gap-4 items-center mt-10">
        <div className="relative w-full max-w-[650px] aspect-[16/10] rounded-xl border border-[#e0d7d1] bg-white shadow-md overflow-visible hover:shadow-lg transition-shadow">
          <Image
            src={selectedPreview}
            alt="Selected template preview"
            width={650}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>

        <Button
          onClick={() => router.push(`/templates/${selectedId}`)}
          className="px-6 py-3 mt-3 rounded-full bg-[#7d141d] text-white hover:bg-[#a01c24] transition font-semibold shadow-sm"
        >
          Live Preview
        </Button>
      </div>
    )}

    {/* Right: Pricing */}
    <div className="w-full md:w-2/5 flex flex-col gap-4 items-center">
      {/* Interval toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-white shadow-sm border border-[#e0d7d1]">
        {(["quarterly", "monthly"] as const).map((val) => (
          <button
            key={val}
            onClick={() => setInterval(val)}
            className={`px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              interval === val
                ? "bg-[#b23b44] text-white shadow-md"
                : "text-[#6e5659] hover:bg-[#f0dcdc]"
            }`}
          >
            {val === "quarterly" ? "Quarterly" : "Monthly"}
          </button>
        ))}
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4 items-center justify-center">
        {filteredPlans.map((plan) => {
          const price = Math.round(currentPrice(plan));
          const isQuarterly = interval === "quarterly";
          const isBestValue = plan.name.toLowerCase().includes("premium");

          return (
            <Card
              key={plan.id}
              className={`relative p-6 rounded-2xl border border-transparent shadow-md hover:shadow-lg transition-transform duration-200 transform hover:-translate-y-1 flex flex-col ${
                isBestValue ? "ring-2 ring-[#b23b44]/20" : ""
              }`}
            >
              <h3 className="text-xl font-bold text-[#2c1013] mb-3 text-center">{plan.name}</h3>

              <div className="mb-4 flex flex-col items-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#b23b44]">₦{price.toLocaleString()}</span>
                  <span className="text-sm text-[#6e5659]">/month</span>
                </div>
                {isQuarterly && (
                  <span className="text-xl text-slate-900 line-through mt-1">
                    ₦{Math.round(plan.monthly).toLocaleString()}
                  </span>
                )}
              </div>

              <ul className="flex-1 space-y-2 text-sm text-[#6e5659] mb-5">
                {visibleFeatures(plan).map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#b23b44]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => selectPlan(plan)}
                className="w-full py-3 rounded-full bg-[#b23b44] text-white font-bold shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  </div>
</section>
  );
}
