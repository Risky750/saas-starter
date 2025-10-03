"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "pending" | "success" | "failed">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("paymentReference");
    const paymentStatus = params.get("paymentStatus");
    if (!reference || !paymentStatus) {
      setStatus("failed");
      return;
    }
    if (paymentStatus === "pending") {
      setStatus("pending");
      setTimeout(() => {
        const isSuccess = Math.random() > 0.5; 
        if (isSuccess) {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      }, 2000);
    }
  }, [router]);

  const icon = {
    loading: <Loader2 className="mx-auto h-16 w-16 text-gray-400 animate-spin" />,
    pending: <Loader2 className="mx-auto h-16 w-16 text-yellow-500 animate-spin" />,
    success: <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />,
    failed: <XCircle className="mx-auto h-16 w-16 text-red-600" />,
  }[status];

  const heading = {
    loading: "Loading",
    pending: "Verifying",
    success: "Payment Successful",
    failed: "Payment Failed",
  }[status];

  const msg = {
    loading: "loading…",
    pending: "verifying your payment…",
    success: "payment successful.",
    failed: "payment failed. Retry?",
  }[status];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow">
        {icon}
        <h2 className="mt-4 text-xl font-bold text-gray-800">{heading}</h2>
        <p className="mt-1 text-sm text-gray-600">{msg}</p>

        {status === "failed" && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/checkout")}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}