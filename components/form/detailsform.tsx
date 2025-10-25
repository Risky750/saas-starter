"use client";
import React, { FormEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRegisterStore } from "@/stores/registerStores";

export default function Register() {
  const { name, email, phone, setField } = useRegisterStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local value mirrors either email or phone and helps detection
  const [inputValue, setInputValue] = useState<string>(email || phone || "");
  const [detected, setDetected] = useState<"email" | "phone" | null>(
    email ? "email" : phone ? "phone" : null
  );

  useEffect(() => {
    setInputValue(email || phone || "");
    setDetected(email ? "email" : phone ? "phone" : null);
  }, [email, phone]);

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = (v: string) => v.replace(/[^0-9]/g, "").length >= 7;

  const handleSave = async (e?: FormEvent) => {
    e?.preventDefault?.();
    setLoading(true);
    setError(null);

    // Prepare payload using detected type
    const payload: Record<string, string | undefined> = { name };
    if (detected === "email") payload.email = inputValue;
    else if (detected === "phone") payload.phone = inputValue;
    else {
      // Fallback: prefer email if input looks like email, otherwise phone
      if (isEmail(inputValue)) payload.email = inputValue;
      else if (isPhone(inputValue)) payload.phone = inputValue;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
            placeholder="Phone Number / Email"
            value={inputValue}
            onChange={(e) => {
              const v = e.target.value;
              setInputValue(v);
              if (isEmail(v)) {
                setDetected("email");
                setField("email", v);
                setField("phone", "");
              } else if (isPhone(v) && !v.includes("@")) {
                setDetected("phone");
                setField("phone", v);
                setField("email", "");
              } else {
                setDetected(null);
                setField("phone", "");
                setField("email", "");
              }
            }}
            type={detected === "email" ? "email" : "tel"}
            required
            className="border-[#7D141D]/30 focus:ring-[#FF1E27]"
          />
          <p className="text-xs text-gray-500 mt-1">
            {detected === "email" && "Detected: email address"}
            {detected === "phone" && "Detected: phone number"}
          </p>
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
