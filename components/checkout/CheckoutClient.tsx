"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Register from "@/components/form/detailsform";
import { useRegisterStore } from "@/stores/registerStores";
import { useCheckoutStore, useCheckoutSnapshot } from "@/stores/checkoutStore";
import { useTemplateStore } from "@/stores/templateStore";
import { usePricingStore } from "@/stores/pricingStore";
import type { Plan as PricePlan } from "@/types/pricing";
import { Check, Loader2 } from "lucide-react";

const naira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);

declare global {
  interface Window {
    MonnifySDK: any;
  }
}

export default function CheckoutClient() {
  const params = useSearchParams();

  const { name, email } = useRegisterStore();
  const { selectedPreview } = useTemplateStore();
  const { setChoice } = useCheckoutStore();
  const { plans, interval } = usePricingStore();
  const snap = useCheckoutSnapshot();

  const activeTemplate = snap.templateId || params.get("template") || selectedPreview || "";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isQuarterly) setAddDomain(true);
    else if (isMonthly) setAddDomain(false);
  }, [interval, isQuarterly, isMonthly]);

  let total = planPrice;
  if (isMonthly && addDomain) total = planPrice + DOMAIN_COST;
  else if (isQuarterly) total = planPrice * 3;

  useEffect(() => {
    const templateParam = params.get("template");
    const planParam = params.get("plan");
    if (templateParam || planParam) {
      setChoice(templateParam || selectedPreview || "", planParam || activePlanId || "");
    }
  }, [params, selectedPreview, activePlanId, setChoice]);

  useEffect(() => {
    const existing = document.querySelector("script[data-monnify-sdk]");
    if (existing) return;
    const script = document.createElement("script");
    script.src = "https://sdk.monnify.com/plugin/monnify.js";
    script.async = true;
    script.setAttribute("data-monnify-sdk", "1");
    document.body.appendChild(script);
    return () => {
    };
  }, []);
const handlePay = async () => {
  if (!name || !email) {
    alert("Please enter your details before proceeding with payment");
    return;
  }

  if (!window.MonnifySDK) {
    alert("Payment provider not ready. Please try again in a moment.");
    return;
  }

  setLoading(true);

  try {
    const amountValue = Math.round(total * 100) / 100; 

    console.log("Initializing Monnify with:", {
      amount: amountValue,
      apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY,
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE,
      customerName: name,
      customerEmail: email,
      isTestMode: true,
    });

    window.MonnifySDK.initialize({
      amount: amountValue,
      currency: "NGN",
      reference: String(Date.now()),
      customerName: name,
      customerEmail: email,
      apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY,
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE,
      paymentDescription: `${plan?.name ?? "Plan"} - ${isQuarterly ? "Quarterly" : "Monthly"}`,
      isTestMode: true,

      onLoadStart: function () {
        console.log("✅ Monnify checkout loading…");
      },

      onComplete: function (response: any) {
        console.log("🎉 Monnify onComplete:", response);

        const ref = response?.paymentReference || response?.transactionReference;
        const status = response?.paymentStatus || "SUCCESS";

        if (ref) {
          window.location.href = `/dashboard?paymentReference=${encodeURIComponent(
            ref
          )}&paymentStatus=${encodeURIComponent(status)}`;
        } else {
          window.location.href = `/?paymentStatus=SUCCESS`;
        }
      },

onClose: function (data: any) {
  const ref = data?.paymentReference || data?.transactionReference;
  window.location.href = `/dashboard?paymentStatus=PENDING&paymentReference=${encodeURIComponent(ref || "")}`;
}

    });
  } catch (err) {
    console.error(" Payment initiation failed:", err);
    alert("Could not start payment. Try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col pb-32">
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <div className="lg:grid lg:grid-cols-2 gap-8">
                <div className="mb-6 lg:mb-0 items-center">
                  <div className="relative w-full h-32 rounded-lg ">
                    {selectedPreview ? (
                      <img src={selectedPreview} alt="template" className="w-fit h-fit object-cover " />
                    ) : (
                      <div className="w-full h-full bg-gray-100 grid place-items-center text-xs text-gray-400">
                        No preview
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Register />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <aside className="bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col h-full">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Order summary</h3>

            {/* Plan */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Plan</p>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-500">Billed {isQuarterly ? "quarterly" : interval}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{naira(planPrice)}</div>
                  {isQuarterly && (
                    <>
                      <div className="text-sm text-gray-500">* 3</div>
                      <div className="text-sm text-gray-400 line-through mt-1">{naira(plan?.monthly ?? 0)}</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Domain */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Custom domain</p>
              {isMonthly ? (
                <>
                  <label
                    className={`w-full flex items-center justify-between rounded-lg border p-4 transition cursor-pointer ${
                      addDomain ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-medium text-gray-800">
                      Add domain / per year <br /> (one-off)
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{naira(DOMAIN_COST)}</span>
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
                      <span className="text-sm text-gray-500">Domain cost added</span>
                      <span className="text-sm text-gray-900 font-semibold">+ {naira(DOMAIN_COST)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
                  <Check className="w-5 h-5" />
                  <span className="text-sm">Free domain worth {naira(DOMAIN_COST)}</span>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              {isQuarterly ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-lg font-semibold text-gray-900">{naira(planPrice * 3 + DOMAIN_COST)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">Domain cost</span>
                    <span className="text-lg text-gray-400 line-through">{naira(DOMAIN_COST)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700 font-bold">Total</span>
                    <span className="text-xl font-bold text-gray-900">{naira(planPrice * 3)}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500">Total</span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">{naira(total)}</span>
                </div>
              )}

              <Button
                onClick={handlePay}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ${naira(total)}`}
              </Button>

              <p className="text-xs text-gray-400 text-center mt-3">Secure checkout • Instant activation</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
