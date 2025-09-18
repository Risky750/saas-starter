
const BASE = process.env.MONNIFY_BASE_URL ?? 'https://sandbox.monnify.com';
// accept multiple common env var names for backwards compatibility
const API_KEY = process.env.MONNIFY_API_KEY ?? process.env.MONNIFY_KEY;
const SECRET_KEY = process.env.MONNIFY_SECRET_KEY ?? process.env.MONNIFY_API_SECRET ?? process.env.MONNIFY_SECRET;
const CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;

async function getAccessToken() {
  if (!API_KEY || !SECRET_KEY) {
    throw new Error('Missing MONNIFY_API_KEY or MONNIFY_API_SECRET / MONNIFY_SECRET_KEY');
  }

  const auth = Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString('base64');

  const res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.responseMessage || json?.message || 'Monnify auth failed');
  return json?.responseBody?.accessToken;
}

export async function initializeTransaction({
  amount,
  customerName,
  customerEmail,
  paymentReference,
  templateId,
  templatePreview,
  currency = 'NGN',
  redirectUrl,
}: {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  templateId?: string | null;
  templatePreview?: string | null;
  currency?: string;
  redirectUrl?: string;
}) {
  if (!CONTRACT_CODE) throw new Error('Missing MONNIFY_CONTRACT_CODE');

  const token = await getAccessToken();
  // Basic validation to catch missing/invalid fields early and provide better errors
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid amount provided to Monnify initialize: ${String(amount)}`);
  }
  if (!customerName || String(customerName).trim().length === 0) {
    throw new Error('Missing customerName for Monnify initialize');
  }
  if (!customerEmail || String(customerEmail).trim().length === 0) {
    throw new Error('Missing customerEmail for Monnify initialize');
  }
  if (!paymentReference || String(paymentReference).trim().length === 0) {
    throw new Error('Missing paymentReference for Monnify initialize');
  }
  const body: Record<string, any> = {
    amount,
    customerName,
    customerEmail,
    paymentReference,
    contractCode: CONTRACT_CODE,
    // Monnify expects `currencyCode` in their init API
    currencyCode: currency,
    redirectUrl: redirectUrl ?? (process.env.BASE_URL ?? 'http://localhost:3000') + '/dashboard',
    // include non-sensitive metadata if provided
    metadata: templateId || templatePreview ? { templateId, templatePreview } : undefined,
  };

  // remove any undefined/null properties to avoid sending explicit nulls which Monnify rejects
  function stripNulls(input: any): any {
    if (input === null || input === undefined) return undefined;
    if (Array.isArray(input)) return input.map(stripNulls).filter((v) => v !== undefined);
    if (typeof input === 'object') {
      const out: any = {};
      for (const [k, v] of Object.entries(input)) {
        const s = stripNulls(v);
        if (s !== undefined) out[k] = s;
      }
      return Object.keys(out).length ? out : undefined;
    }
    return input;
  }

  const safeBody = stripNulls(body) ?? {};

  const res = await fetch(`${BASE}/api/v1/merchant/transactions/init-transaction`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(safeBody),
  });

  const text = await res.text();
  let parsed: any = null;
  try { parsed = JSON.parse(text); } catch (e) { parsed = text; }

  if (!res.ok) {
    const bodySnippet = typeof parsed === 'string' ? parsed : (parsed?.responseMessage || parsed?.message || JSON.stringify(parsed));
    const err = {
      status: res.status,
      url: `${BASE}/api/v1/merchant/transactions/init-transaction`,
      responseBody: bodySnippet,
      requestBody: safeBody,
    };
    throw new Error(`Monnify init error: ${JSON.stringify(err)}`);
  }

  // responseBody.checkoutUrl typically contains the payment link
  return parsed?.responseBody ?? parsed;
}

export default { getAccessToken, initializeTransaction };
