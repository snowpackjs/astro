import { defineFontProvider } from '../helpers.js';
import { providers } from 'unifont';

type Provider = typeof providers.google;

export const GOOGLE_PROVIDER_NAME = 'google';

// TODO: expose on fonts config
export function google(config?: Parameters<Provider>[0]) {
	return defineFontProvider({
		name: GOOGLE_PROVIDER_NAME,
		entrypoint: 'astro/assets/fonts/providers/google',
		config,
	});
}

export const provider: Provider = providers.google;
