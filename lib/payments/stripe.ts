export async function createCheckoutSession(priceId: string, metadata: Record<string, string> = {}) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('Missing STRIPE_SECRET_KEY');

  // dynamic import so local environments without stripe dev dep don't fail import-time
  // (stripe is in package.json deps so this should work in most setups)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(secret);

  const base = process.env.BASE_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      { price: priceId, quantity: 1 },
    ],
    success_url: `${base}/dashboard?checkout_success=1`,
    cancel_url: `${base}/dashboard?checkout_canceled=1`,
    metadata,
  });

  return session;
}

export default { createCheckoutSession };
