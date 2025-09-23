import { NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/payments/monnify";
import crypto from "node:crypto";
import postgres from "postgres";

const PLAN_AMOUNTS: Record<string, number> = {
  basic: Number(process.env.MONNIFY_AMOUNT_BASIC) || 3500,
  pro:   Number(process.env.MONNIFY_AMOUNT_PRO)   || 5000,
};

function resolveAmount(planId: string | null, billingCycle: string | null, explicitAmount?: number | null) {
  if (explicitAmount && explicitAmount > 0) return explicitAmount;
  if (!planId) return null;

  let base = PLAN_AMOUNTS[planId] || null;
  if (!base) return null;

  if (billingCycle === "quarterly") {
    base = base * 3; 
  }

  return base;
}

export async function POST(req: Request) {
  let initPayload: any = null;

  try {
    const body = await req.json();
    const planId = body.planId ? String(body.planId) : null;
    const billingCycle = body.billingCycle ? String(body.billingCycle) : "monthly"; // new
    const name   = String(body.name ?? "").trim();
    const email  = String(body.email ?? "").trim();
    const explicitAmount = body.amount ? Number(body.amount) : null;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const amount = resolveAmount(planId, billingCycle, explicitAmount);
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan or amount" }, { status: 400 });
    }

    const reference = crypto.randomUUID();

    // Save order
    const POSTGRES_URL = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!POSTGRES_URL) {
      throw new Error("Missing POSTGRES_URL or DATABASE_URL");
    }
    const client = postgres(POSTGRES_URL, { ssl: "require" });

    await client`
      INSERT INTO orders (plan_id, amount, reference, status, customer_email, customer_name)
      VALUES (${planId}, ${amount}, ${reference}, 'pending', ${email}, ${name})
    `;

    // Init Monnify transaction
    initPayload = {
      amount,
      customerName: name,
      customerEmail: email,
      paymentReference: reference,
    };

    const { checkoutUrl } = await initializeTransaction(initPayload);

    return NextResponse.json({ checkoutUrl, paymentReference: reference });
  } catch (e: any) {
    console.error("Monnify init error:", e, "initPayload:", initPayload);
    return NextResponse.json({ error: "Provider error" }, { status: 502 });
  }
}
