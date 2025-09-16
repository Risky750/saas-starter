
const BASE = process.env.MONNIFY_BASE_URL ?? 'https://sandbox.monnify.com';
const API_KEY = process.env.MONNIFY_API_KEY;
const SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
const CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;

if (!API_KEY || !SECRET_KEY || !CONTRACT_CODE) {
}

async function getAccessToken() {
  if (!API_KEY || !SECRET_KEY) throw new Error('Missing MONNIFY_API_KEY or MONNIFY_SECRET_KEY');

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
  currency = 'NGN',
  redirectUrl,
}: {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  currency?: string;
  redirectUrl?: string;
}) {
  if (!CONTRACT_CODE) throw new Error('Missing MONNIFY_CONTRACT_CODE');

  const token = await getAccessToken();
  const body = {
    amount,
    customerName,
    customerEmail,
    paymentReference,
    contractCode: CONTRACT_CODE,
    currency,
    redirectUrl: redirectUrl ?? (process.env.BASE_URL ?? 'http://localhost:3000') + '/dashboard',
  };

  const res = await fetch(`${BASE}/api/v2/merchant/transactions/init-transaction`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.responseMessage || JSON.stringify(json));

  // responseBody.checkoutUrl typically contains the payment link
  return json?.responseBody;
}

export default { getAccessToken, initializeTransaction };
