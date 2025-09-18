"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

declare global {
  interface Window {
    MonnifySDK?: any;
  }
}

type Props = {
  amount: number;
  currency?: string;
  planId?: string;
  name?: string;
  email?: string;
  templateId?: string | null;
  templatePreview?: string | null;
  preflight?: () => Promise<void>;
  apiKey?: string; // publishable API key (optional - or use NEXT_PUBLIC_MONNIFY_API_KEY)
  contractCode?: string; // contract code (optional - or use NEXT_PUBLIC_MONNIFY_CONTRACT_CODE)
  paymentDescription?: string;
  metadata?: Record<string, any>;
  onComplete?: (data: any) => void;
  onClose?: (data: any) => void;
};

function loadMonnifyScript(src = 'https://sdk.monnify.com/plugin/monnify.js') {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('window not available'));
    if (window.MonnifySDK) return resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Monnify SDK')));
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Monnify SDK'));
    document.head.appendChild(s);
  });
}

export default function MonnifyButton({
  amount,
  currency = 'NGN',
  planId,
  name = 'Customer',
  email = 'no-reply@example.com',
  templateId = null,
  templatePreview = null,
  apiKey,
  contractCode,
  paymentDescription = 'Order payment',
  metadata,
  onComplete,
  onClose,
  preflight,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // prefer explicit props, otherwise fall back to NEXT_PUBLIC_* env values
  const publishableKey = apiKey ?? (process.env.NEXT_PUBLIC_MONNIFY_API_KEY as string | undefined);
  const publicContract = contractCode ?? (process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE as string | undefined);

  useEffect(() => {
    // Optionally pre-load SDK in background
    if (publishableKey && publicContract) {
      loadMonnifyScript().catch(() => {
        // ignore - will be handled when user clicks
      });
    }
  }, [publishableKey, publicContract]);

  async function handleClick() {
    setLoading(true);
    try {
      // run optional preflight (e.g., register the user) before starting payment
      if (preflight) {
        await preflight();
      }
      // If publishable key + contract present, prefer inline SDK
      if (publishableKey && publicContract) {
        await loadMonnifyScript();
        const reference = (globalThis as any).crypto?.randomUUID?.() ?? Date.now().toString();

        // Build payload similar to Monnify SDK example
        const cfg: any = {
          amount,
          currency,
          reference,
          customerFullName: name,
          customerEmail: email,
          apiKey: publishableKey,
          contractCode: publicContract,
          paymentDescription,
          metadata: metadata ?? { planId, templateId },
          onComplete: (response: any) => {
            setLoading(false);
            onComplete?.(response);
            try {
              // navigate user to dashboard after successful inline payment
              router.push('/dashboard');
            } catch (e) {
              // ignore navigation errors
            }
          },
          onClose: (data: any) => {
            setLoading(false);
            onClose?.(data);
          },
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Monnify SDK types not available in this repo
        window.MonnifySDK.initialize(cfg);
        return;
      }

      // Fallback: call server initialize endpoint to get a checkout URL and open it
      const resp = await fetch('/api/monnify/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, name, email, templateId, templatePreview }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error ?? 'Failed to start checkout');
      const url = json.checkoutUrl ?? json.url;
      if (!url) throw new Error('No checkout URL returned');
  // redirect current tab so Monnify's redirectUrl (set server-side) will return to the dashboard
  window.location.href = url;
  // note: navigation will happen via Monnify redirect; no need to setLoading(false) here
    } catch (err: any) {
      setLoading(false);
      console.error('Monnify button error:', err);
      alert(err?.message ?? 'Payment initialization failed');
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={"btn btn-primary"}
      aria-busy={loading ? true : undefined}
    >
      {loading ? 'Starting payment...' : 'Pay with Monnify'}
    </Button>
  );
}
