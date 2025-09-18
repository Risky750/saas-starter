import React, { Suspense } from 'react';
import CustomerCareClient from '@/components/contact/CustomerCareClient';

export default function CustomerCarePage() {
  return (
    <main className="min-h-screen bg-[#F4EFEA] text-[#7D141D] px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Suspense fallback={<div className="p-8">Loading…</div>}>
          <CustomerCareClient />
        </Suspense>
      </div>
    </main>
  );
}
