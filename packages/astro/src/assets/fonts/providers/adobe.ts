import { defineFontProvider } from '../helpers.js';
import { providers } from 'unifont';

type Provider = typeof providers.adobe;

export function adobe(config: Parameters<Provider>[0]) {
	return defineFontProvider({
		name: 'adobe',
		entrypoint: 'astro/assets/fonts/providers/adobe',
		config,
	});
}

export const provider: Provider = providers.adobe;
