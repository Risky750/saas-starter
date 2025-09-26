const BASE = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';

const API_KEY = process.env.MONNIFY_API_KEY || process.env.MONNIFY_KEY;
const SECRET_KEY = process.env.MONNIFY_SECRET_KEY || process.env.MONNIFY_API_SECRET || process.env.MONNIFY_SECRET;
const CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;

async function getAccessToken() {
  if (!API_KEY || !SECRET_KEY) {
    throw new Error('Missing Monnify keys');
  }

  const auth = Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString('base64');

  const resp = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.responseMessage || data?.message || 'Monnify auth failed');

  return data?.responseBody?.accessToken;
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
  if (!CONTRACT_CODE) throw new Error('Missing Monnify contract code');

  const token = await getAccessToken();

  if (!amount || isNaN(amount)) throw new Error('Bad amount');
  if (!customerName) throw new Error('Missing name');
  if (!customerEmail) throw new Error('Missing email');
  if (!paymentReference) throw new Error('Missing reference');

  const body: Record<string, any> = {
    amount,
    customerName,
    customerEmail,
    paymentReference,
    contractCode: CONTRACT_CODE,
    currencyCode: currency,
    redirectUrl: `${process.env.BASE_URL}/dashboard`,
    metadata: templateId || templatePreview ? { templateId, templatePreview } : undefined,
  };

  // strip null/undefined fields because Monnify is picky
  const clean = JSON.parse(JSON.stringify(body));

  const resp = await fetch(`${BASE}/api/v1/merchant/transactions/init-transaction`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clean),
  });

  const text = await resp.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!resp.ok) {
    console.error('Monnify init failed', data);
    throw new Error(data?.responseMessage || data?.message || 'Monnify init error');
  }

  return data?.responseBody || data;
}

export default { getAccessToken, initializeTransaction };
