import { defineFontProvider } from '../helpers.js';
import { providers } from 'unifont';

type Provider = typeof providers.google;

export const GOOGLE_PROVIDER_NAME = 'google';

// TODO: https://github.com/unjs/unifont/issues/108
// This provider downloads too many files when there's a variable font
// available. This is bad because it doesn't align with our default font settings
export function google() {
	return defineFontProvider({
		name: GOOGLE_PROVIDER_NAME,
		entrypoint: 'astro/assets/fonts/providers/google',
	});
}

export const provider: Provider = providers.google;
