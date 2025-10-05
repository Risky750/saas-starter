"use client";
import React, { Suspense } from 'react';
import CheckoutClient from '@/components/checkout/CheckoutClient';

export default function CheckoutPage() {
  return (
        <Suspense fallback={<div className="p-6">Loading checkout...</div>}>
          <CheckoutClient />
        </Suspense>
  );
}