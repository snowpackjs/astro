import type { APIContext } from 'astro';
import { userCartItems } from '../../models/session';

export function GET({ cookies }: APIContext) {
	let userId = cookies.get('user-id')?.value;

	if (!userId || !userCartItems.has(userId)) {
		return Response.json({ items: [] });
	}
	let items = userCartItems.get(userId);
	let array = Array.from(items.values());

	return Response.json({ items: array });
}

interface AddToCartItem {
	id: number;
	name: string;
}

export async function POST({ cookies, request }: APIContext) {
	const item: AddToCartItem = await request.json();

	let userId = cookies.get('user-id')?.value;

	if (!userCartItems.has(userId)) {
		userCartItems.set(userId, new Map());
	}

	let cart = userCartItems.get(userId);
	if (cart.has(item.id)) {
		cart.get(item.id).count++;
	} else {
		cart.set(item.id, { id: item.id, name: item.name, count: 1 });
	}

	return Response.json({ ok: true });
}
