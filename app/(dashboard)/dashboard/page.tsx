"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"pending" | "success" | "failed" | null>(null);

  useEffect(() => {
    const paymentStatus = params.get("paymentStatus");
    const reference = params.get("paymentReference");

    if (paymentStatus === "SUCCESS") {
      setStatus("success");

      // ✅ Optional: verify with backend
      fetch(`/api/monnify/verify?reference=${reference}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) setStatus("failed");
        });
    } else if (paymentStatus) {
      setStatus("failed");
    }
  }, [params]);

  return (
    <div className="p-8">
      {status === "success" && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
        Payment successful.
        </div>
      )}
      {status === "failed" && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          Payment failed or cancelled. Please try again.
        </div>
      )}
      {!status && (
        <div className="bg-gray-100 text-gray-600 p-4 rounded-lg">
          ⏳ Loading your dashboard...
        </div>
      )}
    </div>
  );
}
