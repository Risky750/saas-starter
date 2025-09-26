'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ReferencePage() {
  const sp = useSearchParams();
  const ref = sp.get('paymentReference');
  const monRef = sp.get('transactionReference');
  const status = sp.get('status'); // FAILED, SUCCESS, PENDING
  const msg = sp.get('errorMessage') || '';

  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!ref) return;
    // optional server-side verification
    fetch(`/api/monnify/verify?reference=${ref}`)
      .then((r) => r.json())
      .then((d) => setVerified(d.success))
      .catch(() => setVerified(false));
  }, [ref]);

  const failed = status?.toUpperCase() === 'FAILED' || verified === false;

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 to-white grid place-items-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mx-auto mb-4 w-16 h-16 grid place-items-center rounded-full bg-rose-100">
          <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800">Payment failed</h1>
        <p className="mt-2 text-gray-600">
          {msg || 'Unable to complete payment. No money was debited.'}
        </p>

        {ref && (
          <p className="mt-4 text-sm text-gray-500">
            Reference: <span className="font-mono">{ref}</span>
          </p>
        )}

        <div className="mt-6 flex gap-3 justify-center">
          <a
            href="/pricing"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Try again
          </a>
          <a
            href="/"
            className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}