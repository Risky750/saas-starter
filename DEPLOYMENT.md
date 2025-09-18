# Deployment & Production Setup

This project is a Next.js app using the App Router. These notes describe environment variables, build steps, and basic production considerations.

## Required environment variables
- `DATABASE_URL` - Postgres connection string.
- `AUTH_SECRET` - Application auth secret.
- `MONNIFY_API_KEY`, `MONNIFY_API_SECRET`, `MONNIFY_CONTRACT_CODE` - Payment provider credentials for Monnify.
- `BASE_URL` - Public base URL (e.g., `https://example.com`).

Optional (only if features enabled):
- `HUBSPOT_API_KEY` - Only used if CRM integration is re-enabled.

## Build
Install dependencies and build the app:

```powershell
pnpm install
pnpm build
```

If you run into module-not-found errors due to removed files, delete the Next.js cache and rebuild:

```powershell
Remove-Item -Recurse -Force .next
pnpm build
```

## Migrations
This project uses SQL migrations located in `lib/db/migrations`. Apply them to your Postgres database with your preferred tool (psql, drizzle, or a migration runner). Example using `psql`:

```powershell
psql "$env:DATABASE_URL" -f lib/db/migrations/0000_initial.sql
```

Note: If you previously had CRM-related migrations (e.g., `0001_add_crm_queue.sql`) and you removed CRM, ensure not to apply that migration.

## Running
Start the built app (example with Node):

```powershell
pnpm start
```

## Worker / Background Jobs
This project previously supported a CRM worker; if you reintroduce background workers, run them as separate processes (e.g., a dedicated VM or serverless function).

## Security
- Never commit `.env.local` to the repository. Use environment variables in your hosting platform (Vercel, Fly, etc.).
- Rotate API keys and secrets regularly.

## Troubleshooting
- If build complains about server/client hook usage (e.g., `useSearchParams()`), ensure hooks are only used inside client components and pages render client components inside `React.Suspense`.
- If you see references to deleted files, clear the `.next` cache and rebuild.

If you'd like, I can add `pnpm test` or CI configuration next.
