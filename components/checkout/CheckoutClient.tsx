"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Register from "@/components/form/detailsform";
import { useRegisterStore } from "@/stores/registerStores";
import { useCheckoutStore, useCheckoutSnapshot } from "@/stores/checkoutStore";
import { useTemplateStore } from "@/stores/templateStore";
import { usePricingStore } from "@/stores/pricingStore";
import { Check, Loader2 } from "lucide-react";
import type { Plan as PricePlan } from "@/types/pricing";

declare global {
  interface Window {
    MonnifySDK?: any;
  }
}

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

export default function CheckoutClient() {
  const params = useSearchParams();
  const { name, email } = useRegisterStore();
  const { selectedPreview } = useTemplateStore();
  const { setChoice, setTotal, setDomainAdded, domainAdded } = useCheckoutStore();
  const { plans, interval } = usePricingStore();
  const snap = useCheckoutSnapshot();

  const activeTemplate = params.get("template") || selectedPreview || snap.templateId || "";
  const activePlanId = params.get("plan") || snap.planId || "basic";
  const selectedPlan = (plans as PricePlan[]).find((p) => p.id === activePlanId);

  const planPrice = selectedPlan
    ? interval === "quarterly"
      ? (selectedPlan as any).quarterly || selectedPlan.monthly
      : selectedPlan.monthly
    : 0;

  const DOMAIN_COST = 7500;
  const isQuarterly = interval === "quarterly";
  const isMonthly = interval === "monthly";

  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Calculate total
  const subtotal = isQuarterly ? planPrice * 3 : planPrice;
  const totalAmount = isQuarterly ? subtotal : subtotal + (domainAdded ? DOMAIN_COST : 0);

  // Load Monnify SDK manually
  useEffect(() => {
    if (!window.MonnifySDK) {
      const script = document.createElement("script");
      script.src = "https://sdk.monnify.com/plugin/monnify.js";
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
        setScriptError(false);
      };
      script.onerror = (e) => {
        console.error("service not found", e);
        setScriptError(true);
        setSdkReady(false);
      };
      document.body.appendChild(script);
    } else {
      setSdkReady(true);
    }
  }, []);

  useEffect(() => {
    if (!plans || (Array.isArray(plans) && plans.length === 0)) {
      import("@/lib/defaultPlans").then((m) => {
        const defs = m.defaultPlans as PricePlan[];
        (usePricingStore as any).getState().setPlans(defs);
      }).catch(() => {
      });
    }
  }, [plans]);

  useEffect(() => {
    if (isQuarterly) setDomainAdded(true);
    if (isMonthly && snap.domainAdded !== undefined) setDomainAdded(snap.domainAdded);

    const template = params.get("template");
    const plan = params.get("plan");
    if (template || plan) {
      setChoice(template || selectedPreview || "", plan || activePlanId, interval as "monthly" | "quarterly");
    }

    if (snap.total === null || snap.total === undefined) {
      setTotal(totalAmount);
    }
  }, [params, selectedPreview, activePlanId, interval, setChoice, setTotal, setDomainAdded, snap.domainAdded]);

  const paymentCompletedRef = useRef(false);

  const sanitizeEnv = (v?: string) => {
    if (!v) return "";
    return v.replace(/^\s*"(.*)"\s*$/, "$1");
  };

  const handlePay = () => {
    if (!name || !email) {
      alert("Please fill in your name and email first!");
      return;
    }

    if (!sdkReady || !window.MonnifySDK) {
      const msg = scriptError
        ? "Check your network or browser for errors."
        : "Try again in a moment.";
      alert(msg);
      return;
    }

    setLoading(true);

    // use persisted total when available so refresh doesn't change the amount
    const storedTotal = snap.total;
    const displayTotal = typeof storedTotal === "number" ? storedTotal : totalAmount;

    const apiKey = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_API_KEY as any);
    const contractCode = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE as any);
    const baseUrl = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_BASE_URL as any);

    if (!apiKey || !contractCode) {
      setLoading(false);
      alert(
      "service unavailable"
      );
      return;
    }

    try {
    window.MonnifySDK.initialize({
      amount: displayTotal,
        currency: "NGN",
          customerName: name,
          customerFullName: name,
        customerEmail: email,
        apiKey,
        contractCode,
        baseUrl: baseUrl || undefined,
        paymentDescription: `${selectedPlan?.name ?? "Plan"} - ${isQuarterly ? "Quarterly" : "Monthly"}`,
        metadata: {
          planId: selectedPlan?.id,
          interval,
          domainAdded,
        },
        onLoadStart: () => {
          setLoading(true);
        },
        onLoadComplete: () => {
          setLoading(false);
        },
        onComplete: (res: any) => {
          paymentCompletedRef.current = true;
          try {
            useRegisterStore.getState().clear?.();
          } catch (e) {}
          try {
            useCheckoutStore.getState().clear?.();
          } catch (e) {}
          try {
            useTemplateStore.getState().clear?.();
          } catch (e) {}
          try {
            (usePricingStore as any).getState().clear?.();
          } catch (e) {}

          setLoading(false);
          window.location.href = `/`;
        },
        onClose: (res: any) => {
          if (!paymentCompletedRef.current) {
            setLoading(false);
            window.location.href = "/checkout";
          }
        },
      });
    } catch (err: any) {
      setLoading(false);
      const message = err?.message || String(err);
      console.error("Monnify initialization failed:", message);
      alert("Payment initialization failed: " + message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 h-full">
          {/* Template + Register */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <div className="flex flex-col">
                <div className="mb-6  flex justify-center items-center">
                 <Register />
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <aside className="bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col h-full lg:sticky lg:top-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Order summary</h3>
            {/* Plan */}
            <div className="mb-4 ">
              <p className="text-md text-gray-500 mb-2">Plan</p>
              <div>
              <div className=" ">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                <p className="text-sm text-gray-500">Billed {isQuarterly ? "quarterly" : interval}</p>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatNaira(planPrice)}</p>
                  {isQuarterly && <p className="text-sm text-gray-400 ">* 3</p>}
                </div>
                </div>
               
                 <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                <p className="text-sm text-gray-500">Domain {isQuarterly ? "" : interval}</p>
                <div className="text-right">
                  {isQuarterly && <p className="text-sm text-gray-400 ">+ 7500</p>}
                </div>
                </div>
              </div>
              </div>
            </div>

            {/* Domain */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Custom domain</p>
              {isMonthly ? (
                <label
                  className={`w-full flex items-center justify-between rounded-lg border p-4 cursor-pointer transition ${
                    domainAdded ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium text-gray-800">Add domain (one-off)</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{formatNaira(DOMAIN_COST)}</span>
                    <input
                      type="checkbox"
                      checked={domainAdded}
                      onChange={(e) => setDomainAdded(e.target.checked)}
                      className="w-5 h-5 accent-rose-500 border-gray-300 rounded focus:ring-rose-500"
                    />
                  </div>
                </label>
              ) : (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
                  <Check className="w-5 h-5" />
                  <span className="text-sm">Free domain worth {formatNaira(DOMAIN_COST)}</span>
                </div>
              )}
            </div>

            {/* Subtotal (quarterly) */}
            {isQuarterly && (
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal </span>
                  <span className="text-lg text-gray-900">{formatNaira(planPrice * 3 + (DOMAIN_COST))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 ">Domain</span>
                  <span className="text-gray-400 line-through">{formatNaira(DOMAIN_COST)}</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 font-semibold">Total</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{formatNaira(totalAmount)}</span>
            </div>

            <Button
              onClick={handlePay}
              disabled={loading || !sdkReady}
              className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ${formatNaira(totalAmount)}`}
            </Button>

            <p className="text-xs text-gray-400 text-center mt-3">Secure checkout • Instant activation</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

