
import React, { Suspense } from 'react';
import CheckoutClient from '@/components/checkout/CheckoutClient';

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#F4EFEA] text-[#7D141D] flex items-start justify-center p-8 overflow-hidden">
      <div className="w-full h-screen max-w-4xl">
        <Suspense fallback={<div className="p-6">Loading checkout...</div>}>
          <CheckoutClient />
        </Suspense>
      </div>
    </main>
  );
}