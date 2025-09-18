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

  const postgresMod = await import('postgres');
  const pgFactory = (postgresMod && (postgresMod as any).default) ? (postgresMod as any).default : postgresMod;
  const client: any = pgFactory(POSTGRES_URL, { ssl: 'require' });

    const exists = await client`SELECT to_regclass('public.contacts') as exists;`;
    const tableExists = exists && exists[0] && exists[0].exists;
    if (!tableExists) {
      await client`CREATE TABLE contacts (
        id serial PRIMARY KEY,
        name text,
        email text UNIQUE,
        phone text,
        created_at timestamp DEFAULT now()
      );`;
    }


    const check = await client`SELECT id FROM contacts WHERE email = ${email}`;
    if (check.count > 0) {
      return NextResponse.json({ ok: true, created: false });
    }

    const insert = await client`INSERT INTO contacts (name, email, phone) VALUES (${name ?? null}, ${email}, ${phoneNumber ?? null}) RETURNING id, email`;
    const newContact = insert[0];

    return NextResponse.json({ ok: true, created: true, contact: newContact });
  } catch (err: any) {
    console.error('register route error', err);
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}
