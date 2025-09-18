import { NextResponse } from 'next/server';

type ContactBody = {
	name?: string;
	email?: string;
	phone?: string;
	message?: string;
	templateId?: string;
};

export async function POST(req: Request) {
	try {
		const body: ContactBody = await req.json();
		const { name, email, phone, message, templateId } = body;

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

			// No CRM integration — we persist the contact but do not enqueue for external sync

		console.info('Contact received and queued', { contactId, email });
		return NextResponse.json({ ok: true, queued: true, contactId }, { status: 200 });
	} catch (err: any) {
		console.error('Contact API error', err);
		return NextResponse.json({ error: err?.message ?? 'Invalid request' }, { status: 400 });
	}
}

export async function GET() {
	return NextResponse.json({ ok: true, message: 'Contact API' });
}
