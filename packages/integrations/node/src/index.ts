import { fileURLToPath } from 'node:url';
import type { AstroAdapter, AstroIntegration } from 'astro';
import { AstroError } from 'astro/errors';
import type { Options, UserOptions } from './types.js';

export function getAdapter(options: Options): AstroAdapter {
	return {
		name: '@astrojs/node',
		serverEntrypoint: '@astrojs/node/server.js',
		previewEntrypoint: '@astrojs/node/preview.js',
		exports: ['handler', 'startServer', 'options'],
		args: options,
		adapterFeatures: {
			buildOutput: 'server',
			edgeMiddleware: false,
		},
		supportedAstroFeatures: {
			hybridOutput: 'stable',
			staticOutput: 'stable',
			serverOutput: 'stable',
			sharpImageService: 'stable',
			i18nDomains: 'experimental',
			envGetSecret: 'stable',
		},
	};
}

export default function createIntegration(userOptions: UserOptions): AstroIntegration {
	if (!userOptions?.mode) {
		throw new AstroError(`Setting the 'mode' option is required.`);
	}

	let _options: Options;
	return {
		name: '@astrojs/node',
		hooks: {
			'astro:config:setup': async ({ updateConfig, config, logger }) => {
				let session = config.session;

				if (config.experimental.session && !session?.driver) {
					logger.info('Configuring experimental session support using filesystem storage');
					session = {
						...session,
						driver: 'fs-lite',
						options: {
							base: fileURLToPath(new URL('sessions', config.cacheDir)),
						},
					};
				}

				updateConfig({
					image: {
						endpoint: config.image.endpoint ?? 'astro/assets/endpoint/node',
					},
					session,
					vite: {
						ssr: {
							noExternal: ['@astrojs/node'],
						},
					},
				});
			},
			'astro:config:done': ({ setAdapter, config }) => {
				_options = {
					...userOptions,
					client: config.build.client?.toString(),
					server: config.build.server?.toString(),
					host: config.server.host,
					port: config.server.port,
					assets: config.build.assets,
				};
				setAdapter(getAdapter(_options));
			},
		},
	};
}
