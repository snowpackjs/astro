import type { FontProvider } from './types.js';

export function defineFontProvider<TName extends string>(provider: FontProvider<TName>) {
	return provider;
}
