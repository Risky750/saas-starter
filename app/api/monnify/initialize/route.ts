import { NextResponse } from 'next/server';
import { initializeTransaction } from '@/lib/payments/monnify';
import crypto from 'node:crypto';

function planToAmount(planId: string | null) {
  const basic = process.env.MONNIFY_AMOUNT_BASIC ? Number(process.env.MONNIFY_AMOUNT_BASIC) : 3500;
  const pro = process.env.MONNIFY_AMOUNT_PRO ? Number(process.env.MONNIFY_AMOUNT_PRO) : 5000;
  if (!planId) return null;
  if (planId === 'basic') return basic;
  if (planId === 'pro') return pro;
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const planId = String(body.planId ?? '') || null;
    const name = String(body.name ?? '');
    const email = String(body.email ?? '');

    const amount = planToAmount(planId);
    if (!amount) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const paymentReference = crypto.randomUUID();

    const resp = await initializeTransaction({
      amount,
      customerName: name || 'Customer',
      customerEmail: email || 'no-reply@example.com',
      paymentReference,
    });

    return NextResponse.json({ checkoutUrl: resp.checkoutUrl, paymentReference });
  } catch (err: any) {
    console.error('monnify initialize error', err);
    return NextResponse.json({ error: err?.message ?? 'Failed' }, { status: 500 });
  }
}
