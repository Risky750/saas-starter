import { initializeTransaction as monnifyInitialize } from '@/lib/payments/monnify';

function planToAmount(planId: string | null) {
  const basic = process.env.MONNIFY_AMOUNT_BASIC ? Number(process.env.MONNIFY_AMOUNT_BASIC) : 3500;
  const pro = process.env.MONNIFY_AMOUNT_PRO ? Number(process.env.MONNIFY_AMOUNT_PRO) : 5000;
  if (!planId) return null;
  if (planId === 'basic') return basic;
  if (planId === 'pro') return pro;
  return null;
}

export async function checkoutAction(formData: FormData) {
  const planId = String(formData.get('planId') ?? '') || null;
  const templateId = String(formData.get('templateId') ?? '') || null;
  const templatePreview = String(formData.get('templatePreview') ?? '') || null;

  if (process.env.MONNIFY_API_KEY && process.env.MONNIFY_SECRET_KEY && process.env.MONNIFY_CONTRACT_CODE) {
    const amount = planToAmount(planId);
    if (!amount) return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400 });
    try {
      const paymentReference = (globalThis as any).crypto?.randomUUID?.() ?? Date.now().toString();
  const payload: any = { amount, customerName: String(formData.get('name') ?? 'Customer'), customerEmail: String(formData.get('email') ?? 'no-reply@example.com'), paymentReference, templateId, templatePreview };
  const resp = await monnifyInitialize(payload);
      const checkoutUrl = resp?.checkoutUrl ?? resp?.checkout_url;
      if (checkoutUrl) return new Response(JSON.stringify({ checkoutUrl, paymentReference }), { status: 200 });
      return new Response(JSON.stringify({ error: 'Failed to create monnify transaction' }), { status: 500 });
    } catch (err: any) {
      console.error('monnify checkoutAction error', err);
      return new Response(JSON.stringify({ error: err?.message ?? 'Monnify error' }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ error: 'No payment provider configured' }), { status: 400 });
}
