"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import MonnifyButton from '@/components/checkout/MonnifyButton';
import { useRegisterStore } from '@/app/stores/registerStores';
import { useCheckoutStore } from '@/app/stores/checkoutStore';
import { useTemplateStore } from '@/app/stores/templateStore';

export default function CheckoutCta() {
  const router = useRouter();
  const { name, phoneNumber, email } = useRegisterStore();
  const { planId } = useCheckoutStore();
  const { selectedId: selectedTemplateId, selectedPreview } = useTemplateStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const preflightRegister = async () => {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phoneNumber, email, planId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message ?? 'Registration failed');
    // optional: redirect after registration elsewhere
  };

  return (
    <div className="mt-auto">
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <div className="flex flex-col gap-3">
        <MonnifyButton
          amount={selectedPreview ? 5000 : 3500} // fallback; you may compute based on planId/pricing
          planId={planId}
          name={name}
          email={email}
          templateId={selectedTemplateId || null}
          templatePreview={selectedPreview || null}
          preflight={preflightRegister}
          onComplete={(data) => {
            // handle post-payment completion: show success then navigate to dashboard
            console.log('Payment complete', data);
            setSuccess('Payment successful. Redirecting to dashboard...');
            try {
              // small delay so user can see the success message
              setTimeout(() => router.push('/dashboard'), 1200);
            } catch (e) {
              // ignore
            }
          }}
          onClose={() => {
            // handle modal close
          }}
        />
      </div>
    </div>
  );
}
