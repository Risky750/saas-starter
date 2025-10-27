"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();

  const { name, email, phone } = useRegisterStore();
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paymentCompletedRef = useRef(false);

  const subtotal = isQuarterly ? planPrice * 3 : planPrice;
  const totalAmount = isQuarterly ? subtotal : subtotal + (domainAdded ? DOMAIN_COST : 0);

  // Load Monnify SDK
  useEffect(() => {
    const existing = document.querySelector('script[src="https://sdk.monnify.com/plugin/monnify.js"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://sdk.monnify.com/plugin/monnify.js";
      script.async = true;
      script.onload = () => {
        if (window.MonnifySDK) {
          setSdkReady(true);
          setScriptError(false);
        }
      };
      script.onerror = () => {
        setScriptError(true);
        setSdkReady(false);
      };
      document.body.appendChild(script);
    } else {
      if (window.MonnifySDK) setSdkReady(true);
    }
  }, []);

  useEffect(() => {
    if (!plans || (Array.isArray(plans) && plans.length === 0)) {
      import("@/lib/defaultPlans")
        .then((m) => {
          const defs = m.defaultPlans as PricePlan[];
          (usePricingStore as any).getState().setPlans(defs);
        })
        .catch(() => {});
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

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current as any);
      timerRef.current = null;
    }
  };

  const sanitizeEnv = (v?: string) => {
    if (!v) return "";
    return v.replace(/^\s*"(.*)"\s*$/, "$1");
  };

  const handlePay = () => {
    setErrorMessage(null);

    if (!name || (!email && !phone)) {
      setErrorMessage("Please fill in your name and either an email or phone number first!");
      return;
    }

    if (!sdkReady || typeof window.MonnifySDK !== "object") {
      const msg = scriptError
        ? "Monnify service not available. Check your internet connection or reload."
        : "Payment system still loading. Please wait a few seconds and try again.";
      setErrorMessage(msg);
      return;
    }

    setLoading(true);
    paymentCompletedRef.current = false;
    clearTimer();

    timerRef.current = setTimeout(() => {
      if (!paymentCompletedRef.current) {
        setLoading(false);
        setErrorMessage("Payment is taking too long. Try again or pay to 9012065117 Opay.");
      }
    }, 8000);

    const storedTotal = snap.total;
    const displayTotal = typeof storedTotal === "number" ? storedTotal : totalAmount;

    const apiKey = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_API_KEY as any);
    const contractCode = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE as any);
    const baseUrl = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_BASE_URL as any);

    if (!apiKey || !contractCode) {
      clearTimer();
      setLoading(false);
      setErrorMessage("Payment service unavailable. You can also make payment to 9012065117 Opay.");
      return;
    }

    try {
      window.MonnifySDK.initialize({
        amount: displayTotal,
        currency: "NGN",
        customerName: name,
        customerFullName: name,
        ...(email ? { customerEmail: email } : {}),
        apiKey,
        contractCode,
        baseUrl: baseUrl || undefined,
        paymentDescription: `${selectedPlan?.name ?? "Plan"} - ${isQuarterly ? "Quarterly" : "Monthly"}`,
        metadata: {
          planId: selectedPlan?.id,
          interval,
          domainAdded,
          contact: email || phone || undefined,
        },
        onLoadStart: () => setLoading(true),
        onLoadComplete: () => {
          clearTimer();
          setLoading(false);
        },
        onComplete: () => {
          paymentCompletedRef.current = true;
          try { useRegisterStore.getState().clear?.(); } catch {}
          try { useCheckoutStore.getState().clear?.(); } catch {}
          try { useTemplateStore.getState().clear?.(); } catch {}
          try { (usePricingStore as any).getState().clear?.(); } catch {}
          clearTimer();
          setLoading(false);
          router.push(`/`);
        },
        onClose: () => {
          if (!paymentCompletedRef.current) {
            clearTimer();
            setLoading(false);
            router.push("/checkout");
          }
        },
      });
    } catch (err: any) {
      clearTimer();
      setLoading(false);
      setErrorMessage("Payment initialization failed: " + (err?.message || String(err)));
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div className="h-screen bg-gray-50 pb-24 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 h-full">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <div className="flex flex-col">
                <div className="mb-6 flex justify-center items-center">
                  <Register />
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col h-full lg:sticky lg:top-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Order summary</h3>

            <div className="mb-4">
              <p className="text-md text-gray-500 mb-2">Plan</p>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                <p className="text-sm text-gray-500">Billed {isQuarterly ? "quarterly" : interval}</p>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatNaira(planPrice)}</p>
                  {isQuarterly && <p className="text-sm text-gray-400 ">* 3</p>}
                </div>
              </div>

              {isQuarterly && (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1 mt-1">
                  <p className="text-sm text-gray-500">Domain</p>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 ">+ 7500</p>
                  </div>
                </div>
              )}
            </div>

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

            {errorMessage && (
              <div className="mt-4 rounded-md p-3 bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-800">{errorMessage}</p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => { setErrorMessage(null); handlePay(); }} className="px-3 py-1">
                    Retry payment
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">Secure checkout • Instant activation</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
