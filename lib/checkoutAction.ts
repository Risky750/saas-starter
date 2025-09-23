export async function startCheckout(planId: string) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? 'Failed to start checkout');

  if (json.url) {
    window.location.href = json.url;
  } else {
    throw new Error('No checkout URL returned');
  }
}

export async function startMonnifyCheckout({ planId, name, email, templateId, templatePreview, amount }: { planId: string; name?: string; email?: string; templateId?: string | null; templatePreview?: string | null; amount?: number | null; }): Promise<{ checkoutUrl?: string; paymentReference?: string } > {
  const res = await fetch('/api/monnify/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, name, email, templateId, templatePreview, amount }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? 'Failed to start Monnify checkout');

  const checkoutUrl = json.checkoutUrl ?? json.url ?? json.checkout_url;
  const paymentReference = json.paymentReference ?? json.payment_reference;
  return { checkoutUrl, paymentReference };
}

export default startCheckout;

