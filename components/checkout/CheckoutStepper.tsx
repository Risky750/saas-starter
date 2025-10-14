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
  const { selectedPreview } = useTemplateStore();
  const { plans, interval } = usePricingStore();
  const { name, email, setField } = useRegisterStore();
  const { domainAdded, setDomainAdded, setChoice, setTotal } = useCheckoutStore();
  const snap = useCheckoutSnapshot();

  const [step, setStep] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(snap.planId || null);
  const [loading, setLoading] = useState(false);
  const paymentCompletedRef = useRef(false);

  // Drawer open state (internal) - default open on checkout2
  const [internalOpen, setInternalOpen] = useState(open);

  // Detect mobile vs desktop (responsive animation)
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth < 640 : false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
    }
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  useEffect(() => {
    if (!(window as any).MonnifySDK) {
      const script = document.createElement("script");
      script.src = "https://sdk.monnify.com/plugin/monnify.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const sanitizeEnv = (v?: string) => {
    if (!v) return "";
    return v.replace(/^\s*\"(.*)\"\s*$/, "$1");
  };

  const proceedToPayment = async () => {
    if (!name || !email) {
      alert("Please enter your name and email before paying");
      return;
    }

    setLoading(true);

    const amountToPay = Math.max(1, Number((totalAmount || 0).toFixed(2)));
    // persist choice & total so CheckoutClient and other pages read the same values
    try {
      setChoice?.(useTemplateStore.getState().selectedId || "", selectedPlanId || "basic", interval as any);
      setTotal?.(amountToPay);
    } catch (e) {}
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
        metadata: {
          planId: selectedPlan?.id,
          interval,
          domainAdded,
        },
        onLoadStart: () => setLoading(true),
        onLoadComplete: () => setLoading(false),
        onComplete: (res: any) => {
          paymentCompletedRef.current = true;
          setLoading(false);
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

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInternalOpen(false);
    };
    if (internalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [internalOpen]);

  // Motion variants
  const backdropVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  // drawer: on desktop slide from left (x: "-100%"), on mobile slide from bottom (y: "100%")
  const drawerHidden = isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, x: "-100%" };
  const drawerVisible = { opacity: 1, x: 0, y: 0, transition: { duration: 0.5 } };
  const drawerExit = isMobile ? { opacity: 0, y: "100%", transition: { duration: 0.45 } } : { opacity: 0, x: "-100%", transition: { duration: 0.45 } };

  // Set initial plan/template if provided
  useEffect(() => {
    if (initialPlanId) setSelectedPlanId(initialPlanId);
    if (initialTemplateId) {
      // If you have a setTemplateId in your store, call it here
      // useTemplateStore.getState().setSelectedId(initialTemplateId);
    }
  }, [initialPlanId, initialTemplateId]);

  return (
    <AnimatePresence>
      {internalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariant}
            transition={{ duration: 0.25 }}
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => {
              setInternalOpen(false);
              onClose?.();
            }}
            aria-hidden
          />
          {/* Drawer panel */}
          <motion.div
            className="fixed z-50 top-0 right-0 h-screen w-full sm:w-full md:w-[45vw] lg:w-[45vw] flex items-center justify-center"
            initial={drawerHidden}
            animate={drawerVisible}
            exit={drawerExit}
          >
            {/* Inner content wrapper: ensures content is centered and has the card sizing */}
            <div
              className={`
                  relative
                  bg-transparent
                  w-full
                  h-full
                  flex
                  items-center
                  justify-center
           
                `}
              // Prevent click on panel from closing the drawer
              onClick={(e) => e.stopPropagation()}
            >
              {/* The actual stepper card */}
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="bg-white  shadow-xl w-full max-w-3xl h-screen sm:h-screen md:h-screen lg:h-screen p-6 "
                style={{
                 
                  boxSizing: "border-box",
                }}
              >
          
                {/* Stepper content (your original UI) */}
                <div className="h-full flex flex-col justify-center">
                  {/* Stepper header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
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

                  {/* Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
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
                                    <span className="text-sm text-gray-500">/month</span>
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
                        </div>

                        <div className="flex justify-between mt-4">
                          <Button variant="ghost" onClick={() => setStep(0)}>
                            Back
                          </Button>
                          <Button
                            onClick={() => {
                              if (selectedPlanId) {
                                setChoice?.(useTemplateStore.getState().selectedId || "", selectedPlanId, interval as any);
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
                            <strong>{isQuarterly ? "Quarterly" : interval}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Domain</span>
                            <strong>{domainAdded ? formatNaira(DOMAIN_COST) : "None"}</strong>
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
