"use client";

import React, { FormEvent, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { useRegisterStore } from "@/app/stores/registerStores";

export default function Register() {
  const { name, phoneNumber, email, setField } = useRegisterStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e?: FormEvent) => {
    e?.preventDefault?.();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phoneNumber, email }),
    });

    const json = await res.json();
    setLoading(false);
    if (!res.ok) return setError(json.message ?? 'Something went wrong');
    // keep on the same page after save
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F4EFEA]">
      <Card className="w-full max-w-sm p-6 space-y-5 bg-white rounded-2xl shadow-lg">
        <form className="space-y-4">
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

          {/* Save button stays with the details form */}
          <div className="flex flex-col gap-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button
              onClick={(e) => handleSave(e)}
              className="w-full bg-[#7D141D] text-white hover:bg-[#FF1E27] transition"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}