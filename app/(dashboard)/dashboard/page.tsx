// app/(dashboard)/dashboard/page.tsx (server)
import { Suspense } from "react";
import DashboardPageClient from "@/components/reference/reference";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <DashboardPageClient />
    </Suspense>
  );
}
