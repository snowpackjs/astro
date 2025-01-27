import { defineFontProvider } from '../helpers.js';

export const GOOGLE_PROVIDER_NAME = 'google';

export function google() {
	return defineFontProvider({
		name: GOOGLE_PROVIDER_NAME,
		entrypoint: 'astro/assets/fonts/providers/google',
	});
}
