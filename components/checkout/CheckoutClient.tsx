"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Register from "@/components/form/detailsform";
import { useRegisterStore } from "@/app/stores/registerStores";
import { useCheckoutStore, useCheckoutSnapshot } from "@/app/stores/checkoutStore";
import { useTemplateStore } from "@/app/stores/templateStore";
import { usePricingStore } from "@/app/stores/pricingStore";
import type { Plan as PricePlan } from "@/types/pricing";
import { Check, Loader2 } from "lucide-react";

const naira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);

function PayButton({
  amount,
  planId,
  name,
  email,
  templateId,
  templatePreview,
}: {
  amount: number;
  planId?: string;
  name: string;
  email: string;
  templateId?: string | null;
  templatePreview?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handlePay = async () => {
    if (!name || !email) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, planId }),
      });
      const res = await fetch("/api/monnify/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          name,
          email,
          templateId,
          templatePreview,
          amount,
        }),
      });
      const { checkoutUrl } = await res.json();
      if (!checkoutUrl) throw new Error("No checkout url");
      window.location.href = checkoutUrl;
    } catch (e: any) {
      alert(e?.message || "Payment could not be started");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handlePay}
        disabled={loading}
        className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ${naira(amount)}`}
      </Button>
      {showError && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          Please enter your details before proceeding with payment
        </div>
      )}
    </>
  );
}

export default function CheckoutClient() {
  const params = useSearchParams();
  const { name, email } = useRegisterStore();
  const { selectedId, selectedPreview } = useTemplateStore();
  const { setChoice } = useCheckoutStore();
  const { plans, interval } = usePricingStore();
  const snap = useCheckoutSnapshot();

  const activeTemplate =
    snap.templateId || params.get("template") || selectedId || "";
  const activePlanId = snap.planId || params.get("plan") || "basic";

  const plan = (plans as PricePlan[]).find((p) => p.id === activePlanId);

  const planPrice = plan
    ? interval === "quarterly"
      ? (plan as any).quarterly || plan.monthly
      : plan.monthly
    : 0;

  const DOMAIN_COST = 7500;
  const isQuarterly = interval === "quarterly";
  const isMonthly = interval === "monthly";
  const [addDomain, setAddDomain] = useState(isQuarterly ? true : false);

  // Fixed: Added missing dependency array and proper effect logic
  useEffect(() => {
    if (isQuarterly) {
      setAddDomain(true);
    } else if (isMonthly) {
      setAddDomain(false);
    }
  }, [interval, isQuarterly, isMonthly]);

  // Fixed: Corrected total calculation logic
  let total = snap.total !== null ? snap.total : planPrice;
  if (isMonthly && addDomain) {
    total = planPrice + DOMAIN_COST;
  } else if (isQuarterly) {
    total = planPrice * 3; // Quarterly already includes domain
  }

  // Fixed: Added proper dependency array and moved setChoice call
  useEffect(() => {
    const templateParam = params.get("template");
    const planParam = params.get("plan");
    
    if (templateParam || planParam) {
      setChoice(
        templateParam || selectedId || "",
        planParam || activePlanId || ""
      );
    }
  }, [params, selectedId, activePlanId, setChoice]);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left side - Fixed layout structure */}
          <div className="lg:col-span-2 space-y-6">
            {/* User details - Fixed grid layout */}
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <div className="lg:grid lg:grid-cols-2 gap-8">
                {/* Register component */}
                <div className="mb-6 lg:mb-0">
                  <Register />
                </div>
                
                {/* Plan Features and Template - Fixed structure */}
                <div className="space-y-6">
                  {/* Features */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Features</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {plan?.features?.map((feature: string) => (
                        <li key={feature} className="flex items-center gap-2">
                          <span className="text-rose-600">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Template - Fixed structure */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Template</p>
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      {selectedPreview ? (
                        <img
                          src={selectedPreview}
                          alt="template"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 grid place-items-center text-xs text-gray-400">
                          No preview
                        </div>
                      )}
                    </div>
                    <span className="font-medium capitalize text-gray-800 mt-2 block">
                      {activeTemplate
                        ? activeTemplate.replace(/[-_]/g, " ")
                        : "Not chosen"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: order summary - Fixed structure */}
          <aside className="bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col h-full">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Order summary
            </h3>
            
            {/* Plan section - Fixed structure */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Plan</p>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Billed {interval === "quarterly" ? "quarterly" : interval}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {naira(planPrice)}
                  </div>
                  {isQuarterly && (
                    <div className="text-sm text-gray-500">* 3</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Domain section - Fixed structure */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Custom domain</p>
              {isMonthly ? (
                <>
                  <label
                    className={`w-full flex items-center justify-between rounded-lg border p-4 transition cursor-pointer ${
                      addDomain
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-medium text-gray-800">
                      Add domain / per year <br/>(one-off)
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {naira(DOMAIN_COST)}
                      </span>
                      <input
                        type="checkbox"
                        checked={addDomain}
                        onChange={(e) => setAddDomain(e.target.checked)}
                        className="w-5 h-5 accent-rose-500 border-gray-300 rounded focus:ring-rose-500"
                      />
                    </div>
                  </label>
                  {addDomain && (
                    <div className="flex items-center justify-between mt-2 px-2">
                      <span className="text-sm text-gray-500">
                        Domain cost added
                      </span>
                      <span className="text-sm text-gray-900 font-semibold">
                        + {naira(DOMAIN_COST)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
                  <Check className="w-5 h-5" />
                  <span className="text-sm">
                    Free domain worth {naira(DOMAIN_COST)}
                  </span>
                </div>
              )}
            </div>

            {/* Totals - Fixed structure */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              {isQuarterly ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {naira(planPrice * 3 + DOMAIN_COST)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">Domain cost</span>
                    <span className="text-lg text-gray-400 line-through">
                      {naira(DOMAIN_COST)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700 font-bold">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {naira(planPrice * 3)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500">Total</span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {naira(total)}
                  </span>
                </div>
              )}
              <PayButton
                amount={total}
                planId={activePlanId}
                name={name}
                email={email}
                templateId={activeTemplate}
                templatePreview={selectedPreview}
              />
              <p className="text-xs text-gray-400 text-center mt-3">
                Secure checkout • Instant activation
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}