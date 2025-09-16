import { NextResponse } from 'next/server';

type ReqBody = {
  name?: string;
  phoneNumber?: string;
  email?: string;
  templateId?: string;
  planId?: string;
};

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json();
    const { name, phoneNumber, email } = body;

    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const POSTGRES_URL = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!POSTGRES_URL) return NextResponse.json({ error: 'Missing POSTGRES_URL' }, { status: 500 });

    // Use the 'postgres' client (works with Neon connection strings)
  const postgresMod = await import('postgres');
  const pgFactory = (postgresMod && (postgresMod as any).default) ? (postgresMod as any).default : postgresMod;
  const client: any = pgFactory(POSTGRES_URL, { ssl: 'require' });

    // Ensure contacts table exists — safe no-op if already present
    await client`CREATE TABLE IF NOT EXISTS contacts (
      id serial PRIMARY KEY,
      name text,
      email text UNIQUE,
      phone text,
      created_at timestamp DEFAULT now()
    );`;

    // Check if contact exists
    const check = await client`SELECT id FROM contacts WHERE email = ${email}`;
    if (check.count > 0) {
      return NextResponse.json({ ok: true, created: false });
    }

    // Insert new contact
    const insert = await client`INSERT INTO contacts (name, email, phone) VALUES (${name ?? null}, ${email}, ${phoneNumber ?? null}) RETURNING id, email`;
    const newContact = insert[0];

    // Fire and forget Brevo contact creation and welcome list add
    (async () => {
      try {
        const BREVO_API_KEY = process.env.BREVO_API_KEY;
        const BREVO_WELCOME_LIST_ID = process.env.BREVO_WELCOME_LIST_ID;
        if (!BREVO_API_KEY || !BREVO_WELCOME_LIST_ID) {
          console.warn('Brevo keys not configured; skipping contact creation');
          return;
        }

        // Normalize phone number (simple E.164 normalization for NG numbers)
        const normalizePhone = (p?: string | null) => {
          if (!p) return null;
          const str = String(p).trim();
          const digits = str.replace(/\D/g, '');
          // Already in +<digits> form
          if (str.startsWith('+') && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
          // Nigerian local numbers like 08012345678 -> +2348012345678
          if (digits.length === 11 && digits.startsWith('0')) return `+234${digits.slice(1)}`;
          // Starts with country code without plus
          if (digits.length >= 10 && (digits.startsWith('234') || digits.startsWith('44') || digits.startsWith('1'))) return `+${digits}`;
          return null;
        };

        const normalizedPhone = normalizePhone(phoneNumber ?? null);

        const attributes: any = { FIRSTNAME: name ?? '' };
        if (normalizedPhone) attributes.SMS = normalizedPhone;

        const brevoBody = {
          email: email,
          attributes,
          listIds: [Number(BREVO_WELCOME_LIST_ID)],
          updateEnabled: true,
        };

        const resp = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
          },
          body: JSON.stringify(brevoBody),
        });

        if (!resp.ok) {
          const txt = await resp.text();
          console.error('Brevo contact creation failed', resp.status, txt);
        }
      } catch (err) {
        console.error('Brevo call failed', err);
      }
    })();

    return NextResponse.json({ ok: true, created: true, contact: newContact });
  } catch (err: any) {
    console.error('register route error', err);
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}
