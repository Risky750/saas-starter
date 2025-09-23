# CraftmyWeb — Next.js SaaS starter (tailored)

Welcome! This repository contains a small SaaS starter app built with Next.js, TypeScript and Postgres. It's wired to a simple checkout flow (Monnify in sandbox by default), template previews, and a tiny dashboard.

This README is short and practical — the goal is to get you developing and testing locally as fast as possible.

Quick overview
- React + Next.js (App Router)
- Postgres (via `postgres`/Drizzle in some places)
- Monnify payments (sandbox by default, see `MONNIFY_*` env vars)
- Zustand for small client stores (pricing, template, checkout)

Local quickstart
1. Copy example env and edit values:

```powershell
copy .env.example .env.local
```

2. Install dependencies and run the dev server:

```powershell
pnpm install
pnpm dev
```

3. Open `http://localhost:3000`.

Payments (Monnify)
- The project defaults to the Monnify sandbox. Make sure your `.env.local` includes `MONNIFY_API_KEY`, `MONNIFY_API_SECRET`, and `MONNIFY_CONTRACT_CODE`.
- If the server returns a 400 when initializing a Monnify transaction, it's usually because the request didn't include a valid `amount` or required customer fields (`name`, `email`). The API now accepts an explicit `amount` in the request body.

Database
- If you need to run DB setup / migrations, use the scripts in `package.json` (Drizzle toolkit):

```powershell
pnpm db:setup
pnpm db:migrate
pnpm db:seed
```

Notes & tips
- Checkout totals are computed client-side (monthly vs quarterly, domain add-on). We now pass the explicit `amount` to the Monnify initialize endpoint to avoid mismatch.
- If you want the app to be production-ready, review env vars in `.env.example` and keep secrets out of source control.

If you'd like, I can:
- Add a CLI helper script to run quick integration tests against the Monnify sandbox.
- Harden server logging for payment webhooks.
- Add small Cypress/Puppeteer tests to smoke-test the checkout flow.

Happy hacking — open an issue or tell me what you'd like me to implement next.
pnpm db:migrate
