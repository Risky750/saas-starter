"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CheckoutStepper from "./CheckoutStepper";

export default function PricingOverlayLauncher() {
  const search = useSearchParams();
  const router = useRouter();

  const overlay = search.get("overlay");
  const planQuery = search.get("plan");
  const templateQuery = search.get("template");

  // If overlay is not checkout2 we don't render anything
  useEffect(() => {
    // Defensive: if flag exists and overlay is missing, ensure we don't loop; PricingPage already handles redirect.
    try {
      const demoFlag = localStorage.getItem("previewed_demo_template");
      if (!overlay && demoFlag) {
        // if for some reason PricingPage didn't redirect, trigger replace here
        router.replace(`/pricing?overlay=checkout2&template=${encodeURIComponent(demoFlag)}`);
        localStorage.removeItem("previewed_demo_template");
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (overlay !== "checkout2") return null;

  return (
    <CheckoutStepper
      open
      initialPlanId={planQuery || undefined}
      initialTemplateId={templateQuery || undefined}
      onClose={() => {
        // close: navigate back to pricing without overlay
        router.replace("/pricing");
      }}
    />
  );
}
