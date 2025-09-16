//import { createCheckoutSession as stripeCreateSession } from '@/lib/payments/stripe';
import { initializeTransaction as monnifyInitialize } from '@/lib/payments/monnify';

function planToStripePrice(planId: string | null) {
  const basic = process.env.STRIPE_PRICE_BASIC;
  const pro = process.env.STRIPE_PRICE_PRO;
  if (!planId) return null;
  if (planId === 'basic') return basic ?? null;
  if (planId === 'pro') return pro ?? null;
  return null;
}

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

  // Prefer Stripe if configured
 {/* if (process.env.STRIPE_SECRET_KEY) {
    const priceId = planToStripePrice(planId);
    if (!priceId) return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400 });
    try {
      const session = await stripeCreateSession(priceId, { planId: planId ?? '' });
      if (session.url) return Response.redirect(session.url, 303);
      return new Response(JSON.stringify({ error: 'Failed to create stripe session' }), { status: 500 });
    } catch (err: any) {
      console.error('stripe checkoutAction error', err);
      return new Response(JSON.stringify({ error: err?.message ?? 'Stripe error' }), { status: 500 });
    }
  }
 */}
  // Fall back to Monnify if configured
  if (process.env.MONNIFY_API_KEY && process.env.MONNIFY_SECRET_KEY && process.env.MONNIFY_CONTRACT_CODE) {
    const amount = planToAmount(planId);
    if (!amount) return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400 });
    try {
      const paymentReference = (globalThis as any).crypto?.randomUUID?.() ?? Date.now().toString();
      const resp = await monnifyInitialize({ amount, customerName: String(formData.get('name') ?? 'Customer'), customerEmail: String(formData.get('email') ?? 'no-reply@example.com'), paymentReference });
      const checkoutUrl = resp?.checkoutUrl ?? resp?.checkout_url;
      if (checkoutUrl) return Response.redirect(checkoutUrl, 303);
      return new Response(JSON.stringify({ error: 'Failed to create monnify transaction' }), { status: 500 });
    } catch (err: any) {
      console.error('monnify checkoutAction error', err);
      return new Response(JSON.stringify({ error: err?.message ?? 'Monnify error' }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ error: 'No payment provider configured' }), { status: 400 });
}
