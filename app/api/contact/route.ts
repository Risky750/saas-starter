import { NextResponse } from "next/server";
import type { ContactBody } from "@/types/contact";
import postgres from "postgres";

export async function POST(req: Request) {
	try {
		const body: ContactBody = await req.json();
		const { email, name } = body;

		if (!email) {
			return NextResponse.json({ error: "Missing email" }, { status: 400 });
		}

		const POSTGRES_URL = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
		if (!POSTGRES_URL) {
			return NextResponse.json({ error: "Missing POSTGRES_URL" }, { status: 500 });
		}

		const client = postgres(POSTGRES_URL, { ssl: "require" });

		// Check if already exists
		const check = await client`SELECT id FROM contacts WHERE email = ${email}`;
		let contactId: number;

		if (check && check.length > 0) {
			contactId = check[0].id;
			try {
				await client`
          UPDATE contacts
          SET name = ${name ?? null}
          WHERE id = ${contactId}`;
			} catch {
				// ignore optional update errors
			}
		} else {
			const insert = await client`
        INSERT INTO contacts (name, email)
        VALUES (${name ?? null}, ${email})
        RETURNING id`;
			contactId = insert[0].id;
		}

		console.info("Contact saved", { contactId, email });
		return NextResponse.json({ ok: true, contactId }, { status: 200 });
	} catch (err: any) {
		console.error("Contact API error", err);
		return NextResponse.json({ error: err?.message ?? "Invalid request" }, { status: 400 });
	}
}

export async function GET() {
	return NextResponse.json({ ok: true, message: "Contact API" });
}
