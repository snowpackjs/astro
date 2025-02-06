import type { Plugin } from 'vite';
import { CantUseAstroConfigModuleError } from '../core/errors/errors-data.js';
import { AstroError, AstroErrorData } from '../core/errors/index.js';
import type { Logger } from '../core/logger/core.js';
import { fromRoutingStrategy } from '../i18n/utils.js';
import type { AstroSettings } from '../types/astro.js';
import type {
	AstroConfig,
	ClientDeserializedManifest,
	SSRManifest,
	ServerDeserializedManifest,
} from '../types/public/index.js';

const VIRTUAL_SERVER_ID = 'astro:config/server';
const RESOLVED_VIRTUAL_SERVER_ID = '\0' + VIRTUAL_SERVER_ID;
const VIRTUAL_CLIENT_ID = 'astro:config/client';
const RESOLVED_VIRTUAL_CLIENT_ID = '\0' + VIRTUAL_CLIENT_ID;

export default function virtualModulePlugin({
	settings,
	manifest,
	logger: _logger,
}: { settings: AstroSettings; manifest: SSRManifest; logger: Logger }): Plugin {
	return {
		enforce: 'pre',
		name: 'astro-manifest-plugin',
		resolveId(id) {
			// Resolve the virtual module
			if (VIRTUAL_SERVER_ID === id) {
				return RESOLVED_VIRTUAL_SERVER_ID;
			} else if (VIRTUAL_CLIENT_ID === id) {
				return RESOLVED_VIRTUAL_CLIENT_ID;
			}
		},
		load(id, opts) {
			// client
			if (id === RESOLVED_VIRTUAL_CLIENT_ID) {
				if (!settings.config.experimental.serializeConfig) {
					throw new AstroError({
						...CantUseAstroConfigModuleError,
						message: CantUseAstroConfigModuleError.message(VIRTUAL_CLIENT_ID),
					});
				}
				// There's nothing wrong about using `/client` on the server
				return `${serializeClientConfig(manifest)};`;
			}
			// server
			else if (id == RESOLVED_VIRTUAL_SERVER_ID) {
				if (!settings.config.experimental.serializeConfig) {
					throw new AstroError({
						...CantUseAstroConfigModuleError,
						message: CantUseAstroConfigModuleError.message(VIRTUAL_SERVER_ID),
					});
				}
				if (!opts?.ssr) {
					throw new AstroError({
						...AstroErrorData.ServerOnlyModule,
						message: AstroErrorData.ServerOnlyModule.message(VIRTUAL_SERVER_ID),
					});
				}
				return `${serializeServerConfig(manifest)};`;
			}
		},
	};
}

function serializeClientConfig(manifest: SSRManifest): string {
	let i18n: AstroConfig['i18n'] | undefined = undefined;
	if (manifest.i18n) {
		i18n = {
			defaultLocale: manifest.i18n.defaultLocale,
			locales: manifest.i18n.locales,
			routing: fromRoutingStrategy(manifest.i18n.strategy, manifest.i18n.fallbackType),
			fallback: manifest.i18n.fallback,
		};
	}
	const serClientConfig: ClientDeserializedManifest = {
		base: manifest.base,
		i18n,
		build: {
			format: manifest.buildFormat,
		},
		trailingSlash: manifest.trailingSlash,
		compressHTML: manifest.compressHTML,
		site: manifest.site,
	};

	const output = [];
	for (const [key, value] of Object.entries(serClientConfig)) {
		output.push(`export const ${key} = ${JSON.stringify(value)};`);
	}
	return output.join('\n') + '\n';
}

function serializeServerConfig(manifest: SSRManifest): string {
	let i18n: AstroConfig['i18n'] | undefined = undefined;
	if (manifest.i18n) {
		i18n = {
			defaultLocale: manifest.i18n.defaultLocale,
			routing: fromRoutingStrategy(manifest.i18n.strategy, manifest.i18n.fallbackType),
			locales: manifest.i18n.locales,
			fallback: manifest.i18n.fallback,
		};
	}
	const serverConfig: ServerDeserializedManifest = {
		build: {
			server: new URL(manifest.buildServerDir),
			client: new URL(manifest.buildClientDir),
			format: manifest.buildFormat,
		},
		cacheDir: new URL(manifest.cacheDir),
		outDir: new URL(manifest.outDir),
		publicDir: new URL(manifest.publicDir),
		srcDir: new URL(manifest.srcDir),
		root: new URL(manifest.hrefRoot),
		base: manifest.base,
		i18n,
		trailingSlash: manifest.trailingSlash,
		site: manifest.site,
		compressHTML: manifest.compressHTML,
	};
	const output = [];
	for (const [key, value] of Object.entries(serverConfig)) {
		output.push(`export const ${key} = ${JSON.stringify(value)};`);
	}
	return output.join('\n') + '\n';
}
