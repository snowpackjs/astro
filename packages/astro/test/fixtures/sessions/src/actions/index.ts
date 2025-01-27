import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
	addToCart: defineAction({
		accept: 'form',
		input: z.object({ productId: z.string() }),
		handler: async (input, context) => {
			const cart: Array<string> = (await context.session.get('cart')) || [];
			cart.push(input.productId);
			await context.session.set('cart', cart);
			return { cart, message: 'Product added to cart at ' + new Date().toTimeString() };
		},
	}),
	getCart: defineAction({
		handler: async (input, context) => {
			return await context.session.get('cart');
		},
	}),
	clearCart: defineAction({
		accept: 'json',
		handler: async (input, context) => {
			await context.session.set('cart', []);
			return { cart: [], message: 'Cart cleared at ' + new Date().toTimeString() };
		},
	}),
	addUrl: defineAction({
		input: z.object({ favoriteUrl: z.string().url() }),
		handler: async (input, context) => {
			const previousFavoriteUrl = await context.session.get<URL>('favoriteUrl');
			const url = new URL(input.favoriteUrl);
			context.session.set('favoriteUrl', url);
			return { message: 'Favorite URL set to ' + url.href + ' from ' + (previousFavoriteUrl?.href ?? "nothing") };
		}
	})
}
