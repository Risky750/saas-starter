"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterStore } from "@/app/stores/registerStores";
import { useCheckoutStore } from "@/app/stores/checkoutStore"; // template + plan
import { Loader2 } from "lucide-react";
import { startMonnifyCheckout } from "@/lib/checkoutAction";

export default function Register() {
  const router = useRouter();
  const { name,phoneNumber, email, setField } = useRegisterStore();
  const { templateId, planId } = useCheckoutStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ name, phoneNumber, email, templateId, planId }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) return setError(json.message ?? "Something went wrong");
    router.push("/dashboard");
  };

  const handleRegisterAndPay = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // First register the user
    const res = await fetch("/api/register", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ name, phoneNumber, email, templateId, planId }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) return setError(json.message ?? "Something went wrong");
    // After successful registration, start Monnify checkout
    try {
      if (!planId) {
        setError('Please select a plan to proceed to payment');
        setLoading(false);
        return;
      }

      await startMonnifyCheckout({ planId, name, email });
      // startMonnifyCheckout will redirect the browser to Monnify; nothing else to do here
    } catch (err: any) {
      console.error('startMonnifyCheckout error', err);
      setError(err?.message ?? 'Failed to start payment');
      setLoading(false);
      // fallback to checkout page
      router.push('/dashboard/checkout');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F4EFEA]">
      <Card className="w-full max-w-sm p-6 space-y-5 bg-white rounded-2xl shadow-lg">
        <form onSubmit={handleRegister} className="space-y-4">
          <h1 className="text-xl font-semibold text-[#7D141D]">Your details</h1>

          <Input
            placeholder="Name / Business Name"
            value={name}
            onChange={(e) => setField("name", e.target.value)}
            type="text"
            required
            className="border-[#7D141D]/30 focus:ring-[#FF1E27]"
          />
          <Input
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setField("phoneNumber", e.target.value)}
            type="tel"
            required
            className="border-[#7D141D]/30 focus:ring-[#FF1E27]"
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setField("email", e.target.value)}
            type="email"
            required
            className="border-[#7D141D]/30 focus:ring-[#FF1E27]"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full bg-[#7D141D] text-white hover:bg-[#FF1E27] transition"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>

            <Button
              type="button"
              onClick={handleRegisterAndPay}
              className="w-full bg-[#FF1E27] text-white rounded-full hover:bg-[#7D141D] transition"
              disabled={loading || !planId}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Processing…
                </>
              ) : (
                "Register & pay"
              )}
            </Button>
          </div>
        </form>

        {/* Using Monnify client flow; no hidden server form needed here */}
      </Card>
    </div>
  );
}