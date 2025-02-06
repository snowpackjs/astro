/**
 * **IMPORTANT**: use the `Pick` interface to select only the properties that we want to expose
 * to the users. Using blanket types could expose properties that we don't want. So if we decide to expose
 * properties, we need to be good at justifying them. For example: why you need this config? can't you use an integration?
 * why do you need access to the shiki config? (very low-level confiig)
 */

import type { SSRManifest } from '../../core/app/types.js';
import type { AstroConfig } from './config.js';

// do not export
type Extend<T, U> = { [K in keyof T]: T[K] | U };

// do not export
type Dirs = Pick<SSRManifest, 'cacheDir' | 'outDir' | 'publicDir' | 'srcDir'>;

// do not export
type DeserializedDirs = Extend<Dirs, URL>;

// Export types after this comment

export type ServerDeserializedManifest = Pick<
	SSRManifest,
	'base' | 'trailingSlash' | 'compressHTML' | 'site'
> &
	DeserializedDirs & {
		i18n: AstroConfig['i18n'];
		build: Pick<AstroConfig['build'], 'server' | 'client' | 'format'>;
		root: URL;
	};

export type ClientDeserializedManifest = Pick<
	SSRManifest,
	'base' | 'trailingSlash' | 'compressHTML' | 'site'
> & {
	i18n: AstroConfig['i18n'];
	build: Pick<AstroConfig['build'], 'format'>;
};
