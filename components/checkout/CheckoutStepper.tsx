// /components/checkout/Stepper.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTemplateStore } from "@/stores/templateStore";
import { usePricingStore } from "@/stores/pricingStore";
import { useRegisterStore } from "@/stores/registerStores";
import { useCheckoutStore, useCheckoutSnapshot } from "@/stores/checkoutStore";
import type { Plan as PricePlan } from "@/types/pricing";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const DOMAIN_COST = 7500;

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

export function CheckoutStepper({
  open = true,
  onClose,
  initialPlanId,
  initialTemplateId,
}: {
  open?: boolean;
  onClose?: () => void;
  initialPlanId?: string;
  initialTemplateId?: string;
}) {
  const router = useRouter();

  const { selectedPreview } = useTemplateStore();
  const { plans, interval } = usePricingStore();
  const { name, email, setField } = useRegisterStore();
  const { domainAdded, setDomainAdded, setChoice, setTotal } = useCheckoutStore();
  const snap = useCheckoutSnapshot();

  const [step, setStep] = useState<number>(0);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(snap.planId || null);
  const [loading, setLoading] = useState(false);
  const paymentCompletedRef = useRef(false);
  const [internalOpen, setInternalOpen] = useState<boolean>(open);

  // Responsive check
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
    }
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => setInternalOpen(open), [open]);

  useEffect(() => {
    const prev = typeof document !== "undefined" ? document.body.style.overflow : "";
    if (internalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev;
    return () => {
      if (typeof document !== "undefined") document.body.style.overflow = prev;
    };
  }, [internalOpen]);

  useEffect(() => {
    if (initialTemplateId) localStorage.removeItem("previewed_demo_template");
  }, [initialTemplateId]);

  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlanId(initialPlanId);
      setStep(1);
    } else if (initialTemplateId) setStep(0);
    else if (snap.planId) {
      setSelectedPlanId(snap.planId);
      setStep(1);
    }
  }, [initialPlanId, initialTemplateId]);

  const selectedPlan = useMemo(
    () => (plans as PricePlan[]).find((p) => p.id === selectedPlanId),
    [plans, selectedPlanId]
  ) as PricePlan | undefined;

  const planPrice = selectedPlan
    ? interval === "quarterly"
      ? (selectedPlan as any).quarterly || selectedPlan.monthly
      : selectedPlan.monthly
    : 0;

  const isQuarterly = interval === "quarterly";
  const subtotal = isQuarterly ? planPrice * 3 : planPrice;
  const totalAmount = isQuarterly ? subtotal : subtotal + (domainAdded ? DOMAIN_COST : 0);

  useEffect(() => {
    if (snap.templateId) setChoice?.(snap.templateId, snap.planId || "basic", interval as any);
    if (snap.total) setTotal?.(snap.total);
    if (snap.planId) setSelectedPlanId(snap.planId);
  }, []);

  // Reset domain if switching to quarterly
  useEffect(() => {
    if (interval === "quarterly") setDomainAdded?.(false);
  }, [interval, setDomainAdded]);

  useEffect(() => {
    if (!(window as any).MonnifySDK) {
      const script = document.createElement("script");
      script.src = "https://sdk.monnify.com/plugin/monnify.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const sanitizeEnv = (v?: string) => (!v ? "" : v.replace(/^\s*\"(.*)\"\s*$/, "$1"));

  const proceedToPayment = async () => {
    if (!name || !email) {
      alert("Please enter your name and email before paying");
      return;
    }

    setLoading(true);
    const amountToPay = Math.max(1, Number((totalAmount || 0).toFixed(2)));
    try {
      setChoice?.(useTemplateStore.getState().selectedId || "", selectedPlanId || "basic", interval as any);
      setTotal?.(amountToPay);
    } catch {}

    const apiKey = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_API_KEY as any);
    const contractCode = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE as any);
    const baseUrl = sanitizeEnv(process.env.NEXT_PUBLIC_MONNIFY_BASE_URL as any);

    if (!apiKey || !contractCode) {
      setLoading(false);
      alert("Payment configuration missing. Contact support.");
      return;
    }

    try {
      (window as any).MonnifySDK.initialize({
        amount: amountToPay,
        currency: "NGN",
        customerName: name,
        customerFullName: name,
        customerEmail: email,
        apiKey,
        contractCode,
        baseUrl: baseUrl || undefined,
        paymentDescription: `${selectedPlan?.name ?? "Plan"} - ${isQuarterly ? "Quarterly" : "Monthly"}`,
        metadata: { planId: selectedPlan?.id, interval, domainAdded },
        onLoadStart: () => setLoading(true),
        onLoadComplete: () => setLoading(false),
        onComplete: () => {
          paymentCompletedRef.current = true;
          setLoading(false);
          setInternalOpen(false);
          onClose?.();
        },
        onClose: () => {
          if (!paymentCompletedRef.current) {
            setLoading(false);
            setStep(0);
          }
        },
      });
    } catch (err: any) {
      setLoading(false);
      alert("Payment init failed: " + (err?.message || String(err)));
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setInternalOpen(false);
        onClose?.();
      }
    };
    if (internalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [internalOpen, onClose]);

  // Motion variants
  const backdropVariant = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const drawerHidden = isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, x: "100%" };
  const drawerVisible = { opacity: 1, x: 0, y: 0, transition: { duration: 0.45 } };
  const drawerExit = isMobile
    ? { opacity: 0, y: "100%", transition: { duration: 0.4 } }
    : { opacity: 0, x: "100%", transition: { duration: 0.4 } };

  const handleBackToTemplates = () => {
    setInternalOpen(false);
    onClose?.();
    router.push("/templates");
  };

  return (
    <AnimatePresence>
      {internalOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariant}
            transition={{ duration: 0.25 }}
            style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
            onClick={() => {
              setInternalOpen(false);
              onClose?.();
            }}
            aria-hidden
          />
          <motion.div
            className="fixed z-50 top-0 right-0 h-screen w-full sm:w-full md:w-[45vw] lg:w-[45vw] flex items-center justify-center"
            initial={drawerHidden}
            animate={drawerVisible}
            exit={drawerExit}
          >
            <div
              className="relative bg-transparent w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="bg-white shadow-xl w-full max-w-3xl h-screen sm:h-screen md:h-screen lg:h-screen p-6 overflow-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleBackToTemplates}
                      className="text-sm text-gray-600 hover:text-rose-600"
                      aria-label="Back to templates"
                    >
                      ← Back to Templates
                    </button>
                    <div className="hidden sm:flex items-center gap-3">
                      {["Plan", "Details", "Payment"].map((label, i) => (
                        <div key={label} className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              i <= step ? "bg-rose-600 text-white" : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {i + 1}
                          </div>
                          <div className="hidden sm:block text-sm text-gray-700">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sm:hidden text-sm text-gray-700">Step {step + 1} / 3</div>
                </div>

                <div className="h-full flex flex-col justify-center">
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    {/* Step 0: Plans */}
                    {step === 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Choose a plan</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(plans as PricePlan[]).map((p) => {
                            const price = interval === "quarterly" ? (p.quarterly ?? p.monthly) : p.monthly;
                            return (
                              <label
                                key={p.id}
                                className={`border rounded-xl p-4 cursor-pointer flex flex-col justify-between ${
                                  selectedPlanId === p.id ? "border-rose-500 bg-rose-50" : "border-gray-200"
                                }`}
                              >
                                <div>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold">₦{Math.round(price).toLocaleString()}</span>
                                    <span className="text-sm text-gray-500">{isQuarterly ? "/quarter" : "/month"}</span>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-2">{p.name}</div>
                                </div>
                                <input
                                  type="radio"
                                  name="plan"
                                  checked={selectedPlanId === p.id}
                                  onChange={() => setSelectedPlanId(p.id)}
                                  className="mt-3 self-end"
                                />
                              </label>
                            );
                          })}
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                          <Button onClick={() => setStep(1)} disabled={!selectedPlanId}>
                            Next
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 1: Details */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Your details</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            value={name || ""}
                            onChange={(e) => setField?.("name", e.target.value)}
                            placeholder="Full name"
                            className="input p-3 border rounded"
                          />
                          <input
                            value={email || ""}
                            onChange={(e) => setField?.("email", e.target.value)}
                            placeholder="Email"
                            className="input p-3 border rounded"
                          />

                          {/* Domain only visible for Monthly */}
                          {interval === "monthly" && (
                            <label
                              className={`flex items-center justify-between rounded-lg border p-3 ${
                                domainAdded ? "border-rose-500 bg-rose-50" : "border-gray-200"
                              }`}
                            >
                              <div>
                                <div className="font-medium">Add custom domain (one-off)</div>
                                <div className="text-sm text-gray-500">{formatNaira(DOMAIN_COST)}</div>
                              </div>
                              <input
                                type="checkbox"
                                checked={domainAdded}
                                onChange={(e) => setDomainAdded?.(e.target.checked)}
                                className="w-5 h-5 accent-rose-500"
                              />
                            </label>
                          )}
                        </div>

                        <div className="flex justify-between mt-4">
                          <Button variant="ghost" onClick={() => setStep(0)}>
                            Back
                          </Button>
                          <Button
                            onClick={() => {
                              if (selectedPlanId) {
                                setChoice?.(
                                  useTemplateStore.getState().selectedId || "",
                                  selectedPlanId,
                                  interval as any
                                );
                                setTotal?.(isQuarterly ? planPrice * 3 : planPrice + (domainAdded ? DOMAIN_COST : 0));
                              }
                              setStep(2);
                            }}
                          >
                            Proceed to Payment
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Summary */}
                    {step === 2 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Confirm & Pay</h4>
                        <div className="p-4 rounded-lg border bg-gray-50">
                          <div className="flex justify-between">
                            <span>Plan</span>
                            <strong>{selectedPlan?.name ?? "-"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Billed</span>
                            <strong>{isQuarterly ? "Quarterly" : "Monthly"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Domain</span>
                            <strong>{interval === "monthly" && domainAdded ? formatNaira(DOMAIN_COST) : "Added"}</strong>
                          </div>
                          <div className="flex justify-between mt-2 text-lg">
                            <span>Total</span>
                            <strong>{formatNaira(totalAmount)}</strong>
                          </div>
                        </div>

                        <div className="flex justify-between mt-4">
                          <Button variant="ghost" onClick={() => setStep(1)}>
                            Back
                          </Button>
                          <Button onClick={proceedToPayment} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay ${formatNaira(totalAmount)}`}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CheckoutStepper;
