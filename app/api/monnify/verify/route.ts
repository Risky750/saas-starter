import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_MONNIFY_BASE_URL || "https://sandbox.monnify.com";
const API_KEY = process.env.NEXT_PUBLIC_MONNIFY_API_KEY;
const SECRET_KEY = process.env.NEXT_PUBLIC_MONNIFY_API_SECRET;

function envsOk() {
  return Boolean(BASE_URL && API_KEY && SECRET_KEY);
}

async function getAuthToken() {
  const credentials = Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString("base64");

  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Monnify auth failed', res.status, data);
    return null;
  }
  return data.responseBody?.accessToken ?? null;
}

async function doVerify(paymentReference: string) {
  // get token
  const token = await getAuthToken();
  if (!token) return { ok: false, status: 500, body: { error: 'Auth failed' } };

  const verifyUrl = `${BASE_URL}/api/v1/merchant/transactions/query?paymentReference=${encodeURIComponent(
    paymentReference
  )}`;
  const verifyRes = await fetch(verifyUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const verifyData = await verifyRes.json().catch(() => ({}));
  // Even if Monnify returns a non-2xx, surface their response so the client
  // can decide how to handle PENDING / NOT_FOUND / other cases instead of
  // treating everything as a server error.
  if (!verifyRes.ok) {
    console.warn('Monnify verify responded non-OK', verifyRes.status, verifyData);
    // Try to extract Monnify's response code/message and body shape.
    const responseCode = verifyData?.responseCode ?? null;
    const responseMessage = verifyData?.responseMessage ?? verifyData?.message ?? null;
    // Map common Monnify cases to sensible HTTP statuses for the client.
    // 404 -> not found, 401/403 -> unauthorized, 422/400 -> bad request, else 200 with body.
    if (responseCode === '99' || verifyRes.status === 404) {
      return {
        ok: false,
        status: 404,
        body: { success: false, status: 'NOT_FOUND', responseCode, responseMessage, raw: verifyData },
      };
    }

    if (verifyRes.status === 401 || verifyRes.status === 403) {
      return {
        ok: false,
        status: 401,
        body: { success: false, status: 'UNAUTHORIZED', responseCode, responseMessage, raw: verifyData },
      };
    }

    // For other non-ok responses, return 200 with structured body so callers
    // (like polling logic) can inspect responseCode/responseMessage without
    // the HTTP client treating it as a transport error.
    return {
      ok: false,
      status: 200,
      body: { success: false, status: 'FAILED', responseCode, responseMessage, raw: verifyData },
    };
  }

  const status = verifyData.responseBody?.paymentStatus;
  const paid = status === "PAID";
  return { ok: true, status: 200, body: { success: paid, status, raw: verifyData } };
}

export async function POST(req: Request) {
  try {
    // parse body defensively
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      const text = await req.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch (_) {
          // ignore
        }
      }
    }

    console.log('verify POST body:', body);

    if (!envsOk()) {
      console.error('Monnify env missing', { BASE_URL: Boolean(BASE_URL), API_KEY: Boolean(API_KEY), SECRET_KEY: Boolean(SECRET_KEY) });
      return NextResponse.json({ error: 'Monnify env misconfigured' }, { status: 500 });
    }

    const paymentReference = body?.paymentReference || body?.transactionReference;
    if (!paymentReference) return NextResponse.json({ error: 'Missing paymentReference' }, { status: 400 });

    const result = await doVerify(paymentReference);
    return NextResponse.json(result.body, { status: result.status });
  } catch (err: any) {
    console.error('verify POST error:', err);
    return NextResponse.json({ error: err.message || "Verification failed", stack: err.stack }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const paymentReference = u.searchParams.get('paymentReference') || u.searchParams.get('transactionReference');
    if (!paymentReference) return NextResponse.json({ error: 'Missing paymentReference' }, { status: 400 });

    if (!envsOk()) {
      console.error('Monnify env missing on GET', { BASE_URL: Boolean(BASE_URL), API_KEY: Boolean(API_KEY), SECRET_KEY: Boolean(SECRET_KEY) });
      return NextResponse.json({ error: 'Monnify env misconfigured' }, { status: 500 });
    }

    const result = await doVerify(paymentReference);
    return NextResponse.json(result.body, { status: result.status });
  } catch (err: any) {
    console.error('verify GET error:', err);
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}
