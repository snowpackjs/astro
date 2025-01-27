import type { BUILTIN_PROVIDERS } from './constants.js';
import type { GOOGLE_PROVIDER_NAME } from './providers/google.js';
import type { LOCAL_PROVIDER_NAME } from './providers/local.js';

export interface FontProvider<TName extends string> {
	name: TName;
	entrypoint: string;
	config?: Record<string, any>;
}

type LocalFontFamily = {
	provider: LocalProviderName;
	// TODO: refine type
	src: string;
};

type StandardFontFamily<TProvider extends string> = {
	provider: TProvider;
};

export type FontFamily<TProvider extends string> = TProvider extends LocalProviderName
	? LocalFontFamily
	: StandardFontFamily<TProvider>;

export type LocalProviderName = typeof LOCAL_PROVIDER_NAME;
export type GoogleProviderName = typeof GOOGLE_PROVIDER_NAME;
export type BuiltInProvider = (typeof BUILTIN_PROVIDERS)[number];
