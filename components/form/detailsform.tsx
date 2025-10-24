"use client";
import React, { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRegisterStore } from "@/stores/registerStores";

export default function Register() {
  const { name, email, phone, setField } = useRegisterStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e?: FormEvent) => {
    e?.preventDefault?.();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }), // phoneNumber removed
    });

    const json = await res.json();
    setLoading(false);
    if (!res.ok) return setError(json.message ?? "Something went wrong");
  
  };

  return (
    <div className=" justify-center items-center mb-10 mx-5 ">
      <div className=" max-w-sm p-6 space-y-5 bg-white rounded-2xl ">
        <form className="space-y-4" onSubmit={handleSave}>
 <h2 className="text-lg sm:text-2xl text-gray-900 mb-6">
            Fill your details before proceeding
          </h2>
          <Input
            placeholder="Name / Business Name"
            value={name}
            onChange={(e) => setField("name", e.target.value)}
            type="text"
            required
            className="border-[#7D141D]/30 focus:ring-[#FF1E27]"
          />

          <Input
            placeholder="Phone Number / Email "
            value={phone}
            onChange={(e) => setField("phone", e.target.value)}
            type="string"
            required
            className="border-[#7D141D]/30 focus:ring-[#FF1E27]"
          />
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

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
