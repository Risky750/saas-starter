import { NextResponse } from 'next/server';
import type { CustomerCareBody } from '@/types/customercare';

export async function POST(req: Request) {
  try {
    const body: CustomerCareBody = await req.json();
    const { name, email, subject, message, templateId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const POSTGRES_URL = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!POSTGRES_URL) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 });
    }

    const sql = (await import('postgres')).default(POSTGRES_URL, { ssl: 'require' });
   

    // make sure tables exist
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id serial PRIMARY KEY,
        name text,
        email text UNIQUE,
        created_at timestamp DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS customer_care (
        id serial PRIMARY KEY,
        contact_id integer REFERENCES contacts(id) ON DELETE CASCADE,
        subject text,
        message text,
        template_id text,
        created_at timestamp DEFAULT now()
      );
    `;

    // find or create contact
    let contact = await sql`SELECT id FROM contacts WHERE email = ${email}`;
    let contactId: number;

    if (contact.length > 0) {
      contactId = contact[0].id;
      if (name) {
        await sql`UPDATE contacts SET name = ${name} WHERE id = ${contactId}`;
      }
    } else {
      let inserted = await sql`
        INSERT INTO contacts (name, email)
        VALUES (${name ?? null}, ${email})
        RETURNING id
      `;
      contactId = inserted[0].id;
    }

    // insert customer care entry
    await sql`
      INSERT INTO customer_care (contact_id, subject, message, template_id)
      VALUES (${contactId}, ${subject ?? null}, ${message ?? null}, ${templateId ?? null})
    `;

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('CustomerCare API error:', err);
    return NextResponse.json({ error: err?.message ?? 'Something went wrong' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'CustomerCare API' });
}
