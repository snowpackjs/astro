import { GOOGLE_PROVIDER_NAME } from './providers/google.js';
import { LOCAL_PROVIDER_NAME } from './providers/local.js';
import type * as unifont from 'unifont';

export const BUILTIN_PROVIDERS = [GOOGLE_PROVIDER_NAME, LOCAL_PROVIDER_NAME] as const;

export const DEFAULTS: unifont.ResolveFontOptions = {
	weights: ['400'],
	styles: ['normal', 'italic'],
	subsets: ['cyrillic-ext', 'cyrillic', 'greek-ext', 'greek', 'vietnamese', 'latin-ext', 'latin'],
	fallbacks: undefined,
};

export const VIRTUAL_MODULE_ID = 'virtual:astro:assets/fonts/internal';
export const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

export const URL_PREFIX = '/_fonts/';
export const CACHE_DIR = './fonts/';
