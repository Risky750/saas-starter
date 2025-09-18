import { NextResponse } from 'next/server';

type CustomerCareBody = {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
    templateId?: string;
};

export async function POST(req: Request) {
    try {
        const body: CustomerCareBody = await req.json();
        const { name, email, phone, subject, message, templateId } = body;

        if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

        const POSTGRES_URL = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
        if (!POSTGRES_URL) return NextResponse.json({ error: 'Missing POSTGRES_URL' }, { status: 500 });

        const postgresMod = await import('postgres');
        const pgFactory = (postgresMod && (postgresMod as any).default) ? (postgresMod as any).default : postgresMod;
        const client: any = pgFactory(POSTGRES_URL, { ssl: 'require' });

        // Ensure contacts table exists (safe when first-run)
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

        // Ensure customer_care table exists
        const ccExists = await client`SELECT to_regclass('public.customer_care') as exists;`;
        const ccTableExists = ccExists && ccExists[0] && ccExists[0].exists;
        if (!ccTableExists) {
            await client`CREATE TABLE customer_care (
                id serial PRIMARY KEY,
                contact_id integer REFERENCES contacts(id) ON DELETE CASCADE,
                subject text,
                message text,
                template_id text,
                created_at timestamp DEFAULT now()
            );`;
        }

        // Find or create contact
        const check = await client`SELECT id FROM contacts WHERE email = ${email}`;
        let contactId: number;
        if (check && check.count > 0) {
            contactId = check[0].id;
            // update name/phone if provided
            try {
                await client`UPDATE contacts SET name = ${name ?? null}, phone = ${phone ?? null} WHERE id = ${contactId}`;
            } catch (e) {
                // non-fatal
            }
        } else {
            const insert = await client`INSERT INTO contacts (name, email, phone) VALUES (${name ?? null}, ${email}, ${phone ?? null}) RETURNING id`;
            contactId = insert[0].id;
        }

        // Insert a customer care ticket linked to the contact
        const ticket = await client`INSERT INTO customer_care (contact_id, subject, message, template_id) VALUES (${contactId}, ${subject ?? null}, ${message ?? null}, ${templateId ?? null}) RETURNING id`;
        const ticketId = ticket && ticket[0] && ticket[0].id;

        console.info('Customer care request persisted', { ticketId, contactId, email });
        return NextResponse.json({ ok: true, ticketId, contactId }, { status: 200 });
    } catch (err: any) {
        console.error('CustomerCare API error', err);
        return NextResponse.json({ error: err?.message ?? 'Invalid request' }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json({ ok: true, message: 'CustomerCare API' });
}
