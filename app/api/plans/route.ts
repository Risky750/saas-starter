import { NextResponse } from 'next/server';
import { Plan } from '../../stores/planStores';

const PLANS: Plan[] = [
  { id: 'basic', title: 'Basic', price: 2500, perks: ['1-page site', 'Free SSL', '1 day delivery'], cta: 'Get started' },
  { id: 'pro', title: 'Pro', price: 5000, perks: ['Unlimited pages', 'E-commerce ready', 'SEO setup'], cta: 'Go Pro', popular: true },
];

export async function GET() {
  return NextResponse.json(PLANS);
}