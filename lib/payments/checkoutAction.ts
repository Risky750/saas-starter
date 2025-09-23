export async function startCheckout(planId: string) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'checkout failed');
  }

  if (data.url) {
    window.location.href = data.url;
    return;
  }

  throw new Error('no checkout url');
}

export async function startMonnifyCheckout(opts: {
  planId: string;
  name?: string;
  email?: string;
  templateId?: string | null;
  templatePreview?: string | null;
  amount?: number | null;
}): Promise<{ checkoutUrl?: string; paymentReference?: string }> {
  const res = await fetch('/api/monnify/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'monnify init failed');
  }

  const checkoutUrl = data.checkoutUrl || data.url || data.checkout_url;
  const paymentReference = data.paymentReference || data.payment_reference;

  if (!checkoutUrl) {
    throw new Error('no monnify checkout url');
  }

  return { checkoutUrl, paymentReference };
}

export default startCheckout;
