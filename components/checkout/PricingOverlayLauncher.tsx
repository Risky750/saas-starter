"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CheckoutStepper from "./CheckoutStepper";

export default function PricingOverlayLauncher() {
  const search = useSearchParams();
  const router = useRouter();

  const overlay = search.get("overlay");
  const planQuery = search.get("plan");
  const templateQuery = search.get("template");

  if (overlay !== "checkout2") return null;

  return (
    <CheckoutStepper
      open
      initialPlanId={planQuery || undefined}
      initialTemplateId={templateQuery || undefined}
      onClose={() => {
        router.push("/pricing");
      }}
    />
  );
}
