import { NextResponse } from 'next/server';
import type { ReqBody } from '@/types/request';

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json();
    const { name, email } = body as any;

    // Require name + email
    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }
    

    {/*const POSTGRES_URL = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!POSTGRES_URL) {
      return NextResponse.json({ error: 'Missing POSTGRES_URL' }, { status: 500 });
    }

    const postgres = (await import('postgres')).default;
    const client = postgres(POSTGRES_URL, { ssl: 'require' });

    // Create table if it doesn’t exist
    await client`
      CREATE TABLE IF NOT EXISTS contacts (
        id serial PRIMARY KEY,
        name text,
        email text UNIQUE,
        created_at timestamp DEFAULT now()
      );
    `;

    // Check for existing email
    const check = await client`SELECT id FROM contacts WHERE email = ${email}`;
    if (check.length > 0) {
      return NextResponse.json({ ok: true, created: false });
    }

    // Insert new contact
    const insert = await client`
      INSERT INTO contacts (name, email)
      VALUES (${name ?? null}, ${email})
      RETURNING id, email
    `;
    const newContact = insert[0];*/}

    return NextResponse.json({ ok: true, created: true, /*contact: newContact*/ });
  } catch (err: any) {
    console.error('register route error:', err);
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}
