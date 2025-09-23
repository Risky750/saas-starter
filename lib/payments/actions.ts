import { initializeTransaction as monnifyInitialize } from '@/lib/payments/monnify';

function planToAmount(planId: string | null): number | null {
  const basic = process.env.MONNIFY_AMOUNT_BASIC ? Number(process.env.MONNIFY_AMOUNT_BASIC) : 3500;
  const pro   = process.env.MONNIFY_AMOUNT_PRO ? Number(process.env.MONNIFY_AMOUNT_PRO)   : 5000;

  switch (planId) {
    case 'basic':
      return basic;
    case 'pro':
      return pro;
    default:
      return null;
  }
}

export async function checkoutAction(formData: FormData) {
  const planId     = formData.get('planId')?.toString() || null;
  const templateId = formData.get('templateId')?.toString() || null;
  const preview    = formData.get('templatePreview')?.toString() || null;
  const name       = formData.get('name')?.toString().trim() || 'Customer';
  const email      = formData.get('email')?.toString().trim() || 'no-reply@example.com';

  if (!process.env.MONNIFY_API_KEY || !process.env.MONNIFY_SECRET_KEY || !process.env.MONNIFY_CONTRACT_CODE) {
    return new Response(JSON.stringify({ error: 'Payment provider not configured' }), { status: 400 });
  }

  const amount = planToAmount(planId);
  if (!amount) {
    return new Response(JSON.stringify({ error: 'Invalid plan selected' }), { status: 400 });
  }

  try {
    const paymentReference = (globalThis as any).crypto?.randomUUID?.() ?? Date.now().toString();

    const payload = {
      amount,
      customerName: name,
      customerEmail: email,
      paymentReference,
      templateId,
      templatePreview: preview,
    };

    const resp = await monnifyInitialize(payload);
    const checkoutUrl = resp?.checkoutUrl ?? resp?.checkout_url;

    if (checkoutUrl) {
      return new Response(JSON.stringify({ checkoutUrl, paymentReference }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Could not create Monnify transaction' }), { status: 500 });
  } catch (err: any) {
    console.error('checkoutAction error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Monnify request failed' }), { status: 500 });
  }
}
