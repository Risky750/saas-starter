"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plan, Interval } from "@/types/plan";

type Props = {
  plan: Plan;
  onSelect?: (plan: Plan, interval: Interval) => void; // optional for flexibility
};

export default function PlanCard({ plan, onSelect }: Props) {
  const [cardInterval, setCardInterval] = useState<Interval>("quarterly");

  // ✅ Safe fallback (won't break if data is missing)
  const currentPrice =
    cardInterval === "monthly"
      ? plan?.monthly ?? 0
      : plan?.quarterly ?? 0;

  return (
    <Card
      key={plan.id}
      className={`relative flex flex-col p-6 rounded-2xl shadow-lg border transition-transform hover:scale-[1.02] hover:shadow-xl ${
        plan.popular
          ? "border-[#FF1E27] ring-2 ring-[#FF1E27]/30"
          : "border-gray-200"
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF1E27] text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most popular
        </span>
      )}

      <h3 className="text-xl font-bold text-[#7D141D]">{plan.name}</h3>

      {/* Interval toggle */}
      <div className="flex items-center gap-3 mb-2">
        <span
          className={
            cardInterval === "quarterly"
              ? "font-semibold"
              : "text-sm text-[#7D141D]/60"
          }
        >
          Quarterly
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <Input
            type="checkbox"
            className="sr-only peer"
            checked={cardInterval === "monthly"}
            onChange={(e) =>
              setCardInterval(e.target.checked ? "monthly" : "quarterly")
            }
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#FF1E27] transition" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
        </label>
        <span
          className={
            cardInterval === "monthly"
              ? "font-semibold"
              : "text-sm text-[#7D141D]/60"
          }
        >
          Monthly
        </span>
      </div>

      <div className="mt-2 mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold">
            ₦{currentPrice.toLocaleString()}
          </span>
          <span className="text-sm text-[#7D141D]/70">/month</span>
          {cardInterval === "quarterly" && plan.monthly && (
            <span className="text-sm text-gray-400 ml-2 line-through">
              ₦{plan.monthly.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <ul className="mb-6 space-y-2 text-sm text-[#7D141D]/80">
        {plan.features.map((feature) => {
          if (feature.includes("Free Domain") && cardInterval === "monthly") {
            return null;
          }
          return (
            <li key={feature} className="flex items-center gap-2">
              <span className="text-[#FF1E27]">✓</span> {feature}
            </li>
          );
        })}
      </ul>

      <Button
        onClick={() => onSelect?.(plan, cardInterval)}
        className="mt-auto w-full rounded-full bg-[#7D141D] text-white hover:bg-[#FF1E27] transition"
      >
        {plan.cta}
      </Button>
    </Card>
  );
}
