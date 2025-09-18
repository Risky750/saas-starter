import { NextResponse } from 'next/server';
import { initializeTransaction } from '@/lib/payments/monnify';
import crypto from 'node:crypto';

const PLAN_AMOUNTS: Record<string, number> = {
  basic: Number(process.env.MONNIFY_AMOUNT_BASIC) || 3500,
  pro:   Number(process.env.MONNIFY_AMOUNT_PRO)   || 5000,
};

function toAmount(planId: string | null) {
  return planId ? PLAN_AMOUNTS[planId] || null : null;
}

export async function POST(req: Request) {
  let initPayload: any = null;
  try {
    const body = await req.json();
    const planId = String(body.planId ?? '') || null;
    const name   = String(body.name ?? '').trim();
    const email  = String(body.email ?? '').trim();

    if (!name || !email)            return NextResponse.json({ error: 'Name and e-mail required' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                                    return NextResponse.json({ error: 'Invalid e-mail' },        { status: 400 });

    const amount = toAmount(planId);
    if (!amount)                    return NextResponse.json({ error: 'Invalid plan' },          { status: 400 });

    const reference = crypto.randomUUID();

    // 1. persist order so webhook can find it
    const postgresMod = await import('postgres');
    const pgFactory = (postgresMod && (postgresMod as any).default) ? (postgresMod as any).default : postgresMod;
    const client: any = pgFactory(process.env.POSTGRES_URL ?? process.env.DATABASE_URL, { ssl: 'require' });

    // Ensure orders table exists (idempotent)
    const exists = await client`SELECT to_regclass('public.orders') as exists;`;
    const tableExists = exists && exists[0] && exists[0].exists;
    if (!tableExists) {
      await client`CREATE TABLE orders (
        id serial PRIMARY KEY,
        plan_id text,
        amount integer,
        reference text UNIQUE,
        status text,
        customer_email text,
        customer_name text,
        created_at timestamptz DEFAULT now()
      );`;
    }

    await client`INSERT INTO orders (plan_id, amount, reference, status, customer_email, customer_name) VALUES (${planId}, ${amount}, ${reference}, 'pending', ${email}, ${name})`;

    // 2. ask Monnify for checkout URL
    initPayload = {
      amount,
      customerName: name,
      customerEmail: email,
      paymentReference: reference,
    };

    const { checkoutUrl } = await initializeTransaction(initPayload);

    return NextResponse.json({ checkoutUrl, paymentReference: reference });
  } catch (e: any) {
    console.error('Monnify init error:', e, 'initPayload:', initPayload);
    try { const raw = await req.text(); if (raw) console.error('raw request body (could be empty if already parsed):', raw); } catch (_) { /* ignore */ }
    return NextResponse.json({ error: 'Provider error' }, { status: 502 });
  }
}