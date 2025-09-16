export async function startCheckout(planId: string) {
	const res = await fetch('/api/checkout', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ planId }),
	});

	const json = await res.json();
	if (!res.ok) throw new Error(json?.error ?? 'Failed to start checkout');

	if (json.url) {
		window.location.href = json.url;
	} else {
		throw new Error('No checkout URL returned');
	}
}

export async function startMonnifyCheckout({ planId, name, email }: { planId: string; name?: string; email?: string; }) {
	const res = await fetch('/api/monnify/initialize', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ planId, name, email }),
	});

	const json = await res.json();
	if (!res.ok) throw new Error(json?.error ?? 'Failed to start Monnify checkout');

	if (json.checkoutUrl) {
		window.location.href = json.checkoutUrl;
	} else {
		throw new Error('No Monnify checkout URL returned');
	}
}

export default startCheckout;
