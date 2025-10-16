"use client";

import dynamic from "next/dynamic";
import React, { Suspense, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTemplateStore } from "@/stores/templateStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { usePricingStore } from "@/stores/pricingStore";
import type { Plan } from "@/types/pricing";
import { Check, ChevronLeft } from "lucide-react";
import { defaultPlans } from "@/lib/defaultPlans";

const PricingOverlayLauncher = dynamic(
  () => import("@/components/checkout/PricingOverlayLauncher").then((m) => m.default),
  { ssr: false }
);

export default function PricingPage() {
  const router = useRouter();
  const { selectedId, selectedPreview, category } = useTemplateStore();
  const { setChoice, setTotal } = useCheckoutStore();
  const { plans: storedPlans, setPlans, interval, setInterval } = usePricingStore();

  // Set default plans
  useEffect(() => {
    if (storedPlans.length === 0) setPlans(defaultPlans);
  }, [storedPlans.length, setPlans]);

  // 🧠 Detect return from Live Demo
  useEffect(() => {
    if (typeof window === "undefined") return;
    const previewed = localStorage.getItem("previewed_demo_template");
    if (previewed) {
      router.replace("/checkout2");
      localStorage.removeItem("previewed_demo_template"); 
    }
  }, [router]);

  const filteredPlans = useMemo(() => {
    if (!storedPlans.length) return [];
    let list = storedPlans;
    if (category === "website")
      list = storedPlans.filter((p) => ["Enterprise", "Premium"].includes(p.name));
    else if (category === "portfolio")
      list = storedPlans.filter((p) => ["Premium", "Standard"].includes(p.name));

    const byPriceDesc = (a: Plan, b: Plan) => {
      const aPrice = interval === "quarterly" ? a.quarterly ?? a.monthly : a.monthly;
      const bPrice = interval === "quarterly" ? b.quarterly ?? b.monthly : b.monthly;
      return bPrice - aPrice;
    };

    return [...list].sort(byPriceDesc);
  }, [category, storedPlans, interval]);

  const maxPrice = useMemo(() => {
    if (!filteredPlans.length) return 0;
    const prices = filteredPlans.map((p) =>
      interval === "quarterly" ? p.quarterly ?? p.monthly : p.monthly
    );
    return Math.max(...prices, 0);
  }, [filteredPlans, interval]);

  const selectPlan = (plan: Plan) => {
    if (!selectedId) return;
    const price = interval === "quarterly" ? (plan.quarterly ?? plan.monthly) * 3 : plan.monthly;
    setChoice(selectedId, plan.id, interval);
    setTotal(price);

    // Check for demo preview flag
    const rawParts = selectedId.split("/").filter(Boolean);
    const namePart = rawParts[rawParts.length - 1] || selectedId;
    const previewFlag =
      typeof window !== "undefined" ? localStorage.getItem("previewed_demo_template") : null;

    if (previewFlag && previewFlag === namePart) {
      router.push(`/checkout2`);
      return;
    }

    router.push("/checkout");
  };

  const currentPrice = (plan: Plan) =>
    interval === "monthly" ? plan.monthly : plan.quarterly;

  const visibleFeatures = (plan: Plan) =>
    interval === "monthly"
      ? plan.features.filter((f) => f.toLowerCase() !== "free domain")
      : plan.features;

  return (
    <section className="bg-[#f5f2f0] w-full flex justify-center items-start px-4 py-8 h-screen">
      <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-[#7D141D] text-white place-content-center justify-center hover:opacity-100 transition">
        <a href="/templates" aria-label="Back to templates" title="Back to templates">
          <ChevronLeft className="w-5 h-5" />
        </a>
      </div>

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
              onClick={() => {
                if (!selectedId) {
                  alert("Select a template first to preview it.");
                  return;
                }
                const rawParts = selectedId.split("/").filter(Boolean);
                const namePart = rawParts[rawParts.length - 1] || selectedId;
                const parts = encodeURIComponent(namePart);
                const baseRaw = (process.env.NEXT_PUBLIC_TEMPLATES_BASE_URL || "").replace(/\/$/, "");
                const url = baseRaw ? `${baseRaw}/${parts}` : `https://tinyurl.com/${parts}`;
                try {
                  localStorage.setItem("previewed_demo_template", namePart);
                } catch (e) {}
                window.open(url);
              }}
              className="px-6 py-3 mt-3 rounded-full bg-[#7d141d] text-white hover:bg-[#a01c24] transition font-semibold shadow-sm"
            >
              Live Demo
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
              const planPrice =
                interval === "quarterly" ? plan.quarterly ?? plan.monthly : plan.monthly;
              const isBestValue = planPrice === maxPrice;

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
                      <span className="text-3xl font-extrabold text-[#b23b44]">
                        ₦{price.toLocaleString()}
                      </span>
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
                  Select plan
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/*<Suspense fallback={null}>
        <PricingOverlayLauncher />
      </Suspense>*/}
    </section>
  );
}
