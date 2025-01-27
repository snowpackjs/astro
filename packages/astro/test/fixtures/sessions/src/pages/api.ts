import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async (context) => {
	const url = new URL(context.url, 'http://localhost');
	let value = url.searchParams.get('set');
	if (value) {
		 context.session.set('value', value);
	} else {
		value = await context.session.get('value');
	}
	const cart = await context.session.get('cart');
	return Response.json({ value, cart });
};
