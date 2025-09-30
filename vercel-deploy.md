# Deploying this Next.js app to Vercel

This repository is a Next.js (App Router) TypeScript project. The following notes explain how to deploy to Vercel and the environment variables you'll need to set.

## 1) vercel.json
A minimal `vercel.json` is included in the repo to guide Vercel's build/runtime behavior. It uses the `@vercel/next` builder which is the recommended way to deploy Next.js apps.

## 2) Required environment variables
Set these in your Vercel project settings (do NOT commit secrets to source):

- `BASE_URL` - Your site URL (e.g. `https://my-app.vercel.app`) used for server redirects.
- `MONNIFY_BASE_URL` - Monnify base URL (sandbox or production). Example: `https://sandbox.monnify.com`
- `MONNIFY_API_KEY` - Monnify API key for authenticating.
- `MONNIFY_SECRET_KEY` or `MONNIFY_API_SECRET` - Monnify secret key. The code supports either variable name.
- `MONNIFY_CONTRACT_CODE` - Monnify contract code used for checkout.
- Database envs if you configure Postgres / NeonDB (optional): `DATABASE_URL` or `PGHOST`/`PGUSER` etc.

If you use Drizzle / server-side DB features, configure Neon/Postgres credentials accordingly.

## 3) Notes about local file storage
For development convenience the app writes dev session data to `tmp/checkout-sessions.json`. This is not suitable for production (Vercel filesystem is ephemeral). In production you should:

- Use a proper data store (Postgres/NeonDB) and update the API route to persist sessions there. Or
- Use an external key-value store (Redis) for session state.

## 4) Middleware & runtime
The project uses Next.js middleware. In `next.config.ts` experimental nodeMiddleware is enabled. Vercel's platform supports Edge and Node runtimes, but if you need Node middleware or server-side modules (like `fs`) in API routes, ensure you use serverless functions or run on a platform that supports Node runtimes.

## 5) Build and deploy
- Connect your GitHub repo to Vercel and set the environment variables in the project settings.
- Vercel will run `npm run build` (or `pnpm build` if using pnpm). The `vercel.json` uses the `@vercel/next` builder which will adapt to `next`.

## 6) Troubleshooting
- If you see issues with Monnify auth, verify the MONNIFY env vars in Vercel and check logs from API routes (Vercel Functions logs).
- If your app needs persistent storage, migrate the dev file-backed session to a DB before deploying.

If you'd like, I can:
- Add a production-ready session API backed by Postgres/NeonDB (Drizzle) and a migration.
- Add a server-side verification flow that runs on `/` when `paymentReference` query is present.

***
