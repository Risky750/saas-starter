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

  // total calculation
  const subtotal = isQuarterly ? planPrice * 3 : planPrice;
  const totalAmount = isQuarterly ? subtotal : subtotal + (domainAdded ? DOMAIN_COST : 0);

  // ✅ Load Monnify SDK safely
  useEffect(() => {
    console.log("🧩 Checking Monnify SDK load status...");
    const existing = document.querySelector('script[src="https://sdk.monnify.com/plugin/monnify.js"]');
    if (!existing) {
      console.log("🧠 Loading Monnify SDK...");
      const script = document.createElement("script");
      script.src = "https://sdk.monnify.com/plugin/monnify.js";
      script.async = true;
      script.onload = () => {
        console.log("✅ Monnify SDK loaded successfully!");
        if (window.MonnifySDK) {
          setSdkReady(true);
          setScriptError(false);
        }
      };
      script.onerror = (e) => {
        console.error("❌ Monnify SDK failed to load:", e);
        setScriptError(true);
        setSdkReady(false);
      };
      document.body.appendChild(script);
    } else {
      console.log("⚡ Monnify SDK already present");
      if (window.MonnifySDK) setSdkReady(true);
    }
  }, []);

  // Load default plans if none found
  useEffect(() => {
    if (!plans || (Array.isArray(plans) && plans.length === 0)) {
      console.warn("⚠️ No pricing plans found. Loading defaults...");
      import("@/lib/defaultPlans")
        .then((m) => {
          const defs = m.defaultPlans as PricePlan[];
          (usePricingStore as any).getState().setPlans(defs);
          console.log("✅ Default plans loaded:", defs);
        })
        .catch((err) => console.error("❌ Failed to load default plans:", err));
    }
  }, [plans]);

  useEffect(() => {
    console.log("🔄 Updating checkout data:", { isQuarterly, isMonthly, domainAdded });

    if (isQuarterly) setDomainAdded(true);
    if (isMonthly && snap.domainAdded !== undefined) setDomainAdded(snap.domainAdded);

    const template = params.get("template");
    const plan = params.get("plan");
    if (template || plan) {
      console.log("📦 Setting choice:", { template, plan, interval });
      setChoice(template || selectedPreview || "", plan || activePlanId, interval as "monthly" | "quarterly");
    }

    if (snap.total === null || snap.total === undefined) {
      console.log("💰 Setting total amount:", totalAmount);
      setTotal(totalAmount);
    }
  }, [params, selectedPreview, activePlanId, interval, setChoice, setTotal, setDomainAdded, snap.domainAdded]);

  const clearTimer = () => {
    if (timerRef.current) {
      console.log("🧹 Clearing payment timer...");
      clearTimeout(timerRef.current as any);
      timerRef.current = null;
    }
  };

  const sanitizeEnv = (v?: string) => {
    if (!v) return "";
    return v.replace(/^\s*"(.*)"\s*$/, "$1");
  };

  // ✅ Handle payment
  const handlePay = () => {
    console.log("💳 Payment attempt started...");
    console.log("User Info:", { name, email, phone });

    if (!name || (!email && !phone)) {
      alert("Please fill in your name and either an email or phone number first!");
      console.warn("⚠️ Missing customer info");
      return;
    }

    if (!sdkReady || typeof window.MonnifySDK !== "object") {
      const msg = scriptError
        ? "Monnify service not available. Check your internet connection or reload."
        : "Payment system still loading. Please wait a few seconds and try again.";
      alert(msg);
      console.warn("⚠️ SDK not ready or failed to load");
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    paymentCompletedRef.current = false;
    clearTimer();

    console.log("🕐 Starting 8s watchdog timer for payment...");
    timerRef.current = setTimeout(() => {
      if (!paymentCompletedRef.current) {
        setLoading(false);
        setErrorMessage("Payment is taking too long. Try again or pay to 9012065117 Opay.");
        console.error("⏰ Payment timeout triggered");
      }
    }, 8000);

    const storedTotal = snap.total;
    const displayTotal = typeof storedTotal === "number" ? storedTotal : totalAmount;

    const apiKey = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_API_KEY as any);
    const contractCode = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE as any);
    const baseUrl = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_BASE_URL as any);

    console.log("🔐 Env Vars:", { apiKey, contractCode, baseUrl });

    if (!apiKey || !contractCode) {
      clearTimer();
      setLoading(false);
      alert("Payment service unavailable. You can also make payment to 9012065117 Opay.");
      console.error("❌ Missing Monnify credentials");
      return;
    }

    try {
      console.log("🚀 Initializing Monnify SDK with params:", {
        amount: displayTotal,
        currency: "NGN",
        customerName: name,
        contact: email || phone,
        plan: selectedPlan?.name,
        interval,
      });

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
        onLoadStart: () => {
          console.log("🌀 Monnify modal loading...");
          setLoading(true);
        },
        onLoadComplete: () => {
          console.log("✅ Monnify modal fully loaded");
          clearTimer();
          setLoading(false);
        },
        onComplete: (res: any) => {
          console.log("🎉 Payment completed successfully:", res);
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
          console.log("🧾 Monnify modal closed");
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
      console.error("🔥 Monnify init failed:", err);
      alert("Payment initialization failed: " + (err?.message || String(err)));
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div className="h-screen bg-gray-50 pb-24 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 h-full">
          {/* Template + Register */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <div className="flex flex-col">
                <div className="mb-6 flex justify-center items-center">
                  <Register />
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <aside className="bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col h-full lg:sticky lg:top-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Order summary</h3>

            {/* Plan */}
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

            {errorMessage && (
              <div className="mt-4 rounded-md p-3 bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-800">{errorMessage}</p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => { setErrorMessage(null); handlePay(); }} className="px-3 py-1">Retry payment</Button>
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
