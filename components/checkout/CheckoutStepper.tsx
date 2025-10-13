"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useRegisterStore } from "@/stores/registerStores";
import { usePricingStore } from "@/stores/pricingStore";
import type { Plan } from "@/types/pricing";

// next/dynamic typing can be strict; cast to any to accept the imported module shape
const CheckoutClient: any = dynamic(() => import("@/components/checkout/CheckoutClient") as any, { ssr: false });

export default function CheckoutStepper() {
  const router = useRouter();
  const { templateId, planId, interval, setChoice, setTotal } = useCheckoutStore();
  const { plans } = usePricingStore();

  const [open] = useState(true); // always open on checkout2 route
  const [step, setStep] = useState(0);

  // Local details form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const availablePlans = useMemo<Plan[]>(() => plans ?? [], [plans]);

  const selectedPlan = useMemo(() => availablePlans.find((p) => p.id === planId) ?? null, [availablePlans, planId]);

  const selectPlan = (p: Plan) => {
    if (!templateId) {
      alert("Please select a template before choosing a plan.");
      router.push("/templates");
      return;
    }
    setChoice(templateId, p.id, interval);
    const price = interval === "quarterly" ? (p.quarterly ?? p.monthly) : p.monthly;
    setTotal(price);
  };

  const canProceedFromPlans = !!useCheckoutStore.getState().planId;

  const next = () => {
    if (step === 0 && !canProceedFromPlans) {
      alert("Please pick a plan to continue.");
      return;
    }

    if (step === 1) {
      // basic validation
      if (!name || !email) {
        alert("Please enter your name and email.");
        return;
      }
      // persist details to register store so CheckoutClient can use them
      try {
        useRegisterStore.getState().setField?.('name', name);
        useRegisterStore.getState().setField?.('email', email);
        useRegisterStore.getState().setField?.('phone', phone);
      } catch (e) {
        // ignore
      }
    }

    setStep((s) => Math.min(2, s + 1));
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 pointer-events-auto">
          <div className="absolute inset-0 bg-black/30" onClick={() => router.push("/templates")} />

          {/* Mobile: bottom sheet */}
          <div className={`fixed left-0 bottom-0 w-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            open ? "translate-y-0" : "translate-y-full"
          } h-[60vh]`}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Checkout</h3>
              <button onClick={() => router.push("/templates")} aria-label="Close" className="p-2">
                ×
              </button>
            </div>
            <div className="p-4 h-full overflow-auto">
              {step === 0 && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold">Choose a plan</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {availablePlans.map((p) => {
                      const price = interval === "quarterly" ? p.quarterly ?? p.monthly : p.monthly;
                      return (
                        <Card key={p.id} className="p-4 flex justify-between items-center">
                          <div>
                            <div className="font-bold">{p.name}</div>
                            <div className="text-sm text-slate-600">₦{Math.round(price).toLocaleString()} / {interval}</div>
                          </div>
                          <div>
                            <Button onClick={() => selectPlan(p)} className="mr-2">Select</Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold">Your details</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <input className="border p-2 rounded" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                    <input className="border p-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="border p-2 rounded" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold">Order summary</h4>
                  <div className="border rounded p-3">
                    <div className="flex justify-between">
                      <div className="font-medium">Plan</div>
                      <div>{selectedPlan ? selectedPlan.name : '—'}</div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="text-sm text-slate-600">Interval</div>
                      <div className="text-sm text-slate-700">{interval}</div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="text-sm text-slate-600">Total</div>
                      <div className="font-bold">₦{useCheckoutStore.getState().total ?? '—'}</div>
                    </div>
                  </div>

                  <div>
                    {/* Render the existing CheckoutClient to handle payment if needed */}
                    <CheckoutClient />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex items-center justify-between">
              <div>
                {step > 0 && (
                  <Button variant="ghost" onClick={back} className="mr-2">Back</Button>
                )}
              </div>
              <div>
                {step < 2 ? (
                  <Button onClick={next}>{step === 0 ? 'Continue' : 'Review order'}</Button>
                ) : (
                  <Button onClick={() => alert('Proceeding to payment...')}>Confirm & Pay</Button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop: right panel (slides in from right) */}
          <div className={`hidden md:block fixed top-0 right-0 h-full w-2/5 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Checkout</h3>
              <button onClick={() => router.push('/templates')} aria-label="Close" className="p-2">×</button>
            </div>

            <div className="p-6 h-full overflow-auto flex flex-col">
              <div className="flex-1">
                {step === 0 && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold">Choose a plan</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {availablePlans.map((p) => {
                        const price = interval === "quarterly" ? p.quarterly ?? p.monthly : p.monthly;
                        const selected = p.id === planId;
                        return (
                          <Card key={p.id} className={`p-4 flex justify-between items-center ${selected ? 'ring-2 ring-[#b23b44]/30' : ''}`}>
                            <div>
                              <div className="font-bold">{p.name}</div>
                              <div className="text-sm text-slate-600">₦{Math.round(price).toLocaleString()} / {interval}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {selected && <Check className="w-5 h-5 text-[#b23b44]" />}
                              <Button onClick={() => selectPlan(p)}>Select</Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Your details</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <input className="border p-3 rounded" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                      <input className="border p-3 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <input className="border p-3 rounded" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Order summary</h4>
                    <div className="border rounded p-4">
                      <div className="flex justify-between">
                        <div className="font-medium">Plan</div>
                        <div>{selectedPlan ? selectedPlan.name : '—'}</div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div className="text-sm text-slate-600">Interval</div>
                        <div className="text-sm text-slate-700">{interval}</div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div className="text-sm text-slate-600">Total</div>
                        <div className="font-bold">₦{useCheckoutStore.getState().total ?? '—'}</div>
                      </div>
                    </div>

                    <div>
                      <CheckoutClient />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t p-4 flex justify-between">
                <div>
                  {step > 0 && (
                    <Button variant="ghost" onClick={back} className="mr-2">Back</Button>
                  )}
                </div>
                <div>
                  {step < 2 ? (
                    <Button onClick={next}>{step === 0 ? 'Continue' : 'Review order'}</Button>
                  ) : (
                    <Button onClick={() => alert('Proceeding to payment...')}>Confirm & Pay</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
