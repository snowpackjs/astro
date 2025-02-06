import { defineFontProvider } from '../helpers.js';

export const LOCAL_PROVIDER_NAME = 'local';

export function local() {
	return defineFontProvider({
		name: LOCAL_PROVIDER_NAME,
		entrypoint: 'astro/assets/fonts/providers/google',
	});
}
