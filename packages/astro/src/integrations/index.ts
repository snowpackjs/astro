import { bold } from 'kleur/colors';
import fs from 'node:fs';
import type { AddressInfo } from 'node:net';
import { fileURLToPath } from 'node:url';
import type { InlineConfig, ViteDevServer } from 'vite';
import type {
	AstroAdapter,
	AstroConfig,
	AstroIntegration,
	AstroRenderer,
	AstroSettings,
	ContentEntryType,
	DataEntryType,
	HookParameters,
	RouteData,
} from '../@types/astro.js';
import type { SerializedSSRManifest } from '../core/app/types.js';
import type { PageBuildData } from '../core/build/types.js';
import { buildClientDirectiveEntrypoint } from '../core/client-directive/index.js';
import { mergeConfig } from '../core/config/index.js';
import { AstroIntegrationLogger, type Logger } from '../core/logger/core.js';
import { isServerLikeOutput } from '../prerender/utils.js';
import { validateSupportedFeatures } from './astroFeaturesValidation.js';

async function withTakingALongTimeMsg<T>({
	name,
	hookResult,
	timeoutMs = 3000,
	logger,
}: {
	name: string;
	hookResult: T | Promise<T>;
	timeoutMs?: number;
	logger: Logger;
}): Promise<T> {
	const timeout = setTimeout(() => {
		logger.info('build', `Waiting for the ${bold(name)} integration...`);
	}, timeoutMs);
	const result = await hookResult;
	clearTimeout(timeout);
	return result;
}

// Used internally to store instances of loggers.
const Loggers = new WeakMap<AstroIntegration, AstroIntegrationLogger>();

function getLogger(integration: AstroIntegration, logger: Logger) {
	if (Loggers.has(integration)) {
		// SAFETY: we check the existence in the if block
		return Loggers.get(integration)!;
	}
	const integrationLogger = logger.forkIntegrationLogger(integration.name);
	Loggers.set(integration, integrationLogger);
	return integrationLogger;
}

export async function runHookConfigSetup({
	settings,
	command,
	logger,
	isRestart = false,
}: {
	settings: AstroSettings;
	command: 'dev' | 'build' | 'preview';
	logger: Logger;
	isRestart?: boolean;
}): Promise<AstroSettings> {
	// An adapter is an integration, so if one is provided push it.
	if (settings.config.adapter) {
		settings.config.integrations.push(settings.config.adapter);
	}

	let updatedConfig: AstroConfig = { ...settings.config };
	let updatedSettings: AstroSettings = { ...settings, config: updatedConfig };
	let addedClientDirectives = new Map<string, Promise<string>>();
	let astroJSXRenderer: AstroRenderer | null = null;

	for (let i = 0; i < updatedConfig.integrations.length; i++) {
		const integration = updatedConfig.integrations[i];
		
		/**
		 * By making integration hooks optional, Astro can now ignore null or undefined Integrations
		 * instead of giving an internal error most people can't read
		 *
		 * This also enables optional integrations, e.g.
		 * ```ts
		 * integration: [
		 *   // Only run `compress` integration in production environments, etc...
		 *   import.meta.env.production ? compress() : null
		 * ]
		 * ```
		 */
		if (integration.hooks?.['astro:config:setup']) {
			const integrationLogger = getLogger(integration, logger);

			const hooks: HookParameters<'astro:config:setup'> = {
				config: updatedConfig,
				command,
				isRestart,
				addRenderer(renderer: AstroRenderer) {
					if (!renderer.name) {
						throw new Error(`Integration ${bold(integration.name)} has an unnamed renderer.`);
					}

					if (!renderer.serverEntrypoint) {
						throw new Error(`Renderer ${bold(renderer.name)} does not provide a serverEntrypoint.`);
					}

					if (renderer.name === 'astro:jsx') {
						astroJSXRenderer = renderer;
					} else {
						updatedSettings.renderers.push(renderer);
					}
				},
				injectScript: (stage, content) => {
					updatedSettings.scripts.push({ stage, content });
				},
				updateConfig: (newConfig) => {
					updatedConfig = mergeConfig(updatedConfig, newConfig) as AstroConfig;
				},
				injectRoute: (injectRoute) => {
					updatedSettings.injectedRoutes.push(injectRoute);
				},
				addWatchFile: (path) => {
					updatedSettings.watchFiles.push(path instanceof URL ? fileURLToPath(path) : path);
				},
				addClientDirective: ({ name, entrypoint }) => {
					if (updatedSettings.clientDirectives.has(name) || addedClientDirectives.has(name)) {
						throw new Error(
							`The "${integration.name}" integration is trying to add the "${name}" client directive, but it already exists.`
						);
					}
					addedClientDirectives.set(name, buildClientDirectiveEntrypoint(name, entrypoint));
				},
				logger: integrationLogger,
			};

			// ---
			// Public, intentionally undocumented hooks - not subject to semver.
			// Intended for internal integrations (ex. `@astrojs/mdx`),
			// though accessible to integration authors if discovered.

			function addPageExtension(...input: (string | string[])[]) {
				const exts = (input.flat(Infinity) as string[]).map((ext) => `.${ext.replace(/^\./, '')}`);
				updatedSettings.pageExtensions.push(...exts);
			}
			function addContentEntryType(contentEntryType: ContentEntryType) {
				updatedSettings.contentEntryTypes.push(contentEntryType);
			}
			function addDataEntryType(dataEntryType: DataEntryType) {
				updatedSettings.dataEntryTypes.push(dataEntryType);
			}

			Object.defineProperty(hooks, 'addPageExtension', {
				value: addPageExtension,
				writable: false,
				enumerable: false,
			});
			Object.defineProperty(hooks, 'addContentEntryType', {
				value: addContentEntryType,
				writable: false,
				enumerable: false,
			});
			Object.defineProperty(hooks, 'addDataEntryType', {
				value: addDataEntryType,
				writable: false,
				enumerable: false,
			});
			// ---

			await withTakingALongTimeMsg({
				name: integration.name,
				hookResult: integration.hooks['astro:config:setup'](hooks),
				logger,
			});

			// Add custom client directives to settings, waiting for compiled code by esbuild
			for (const [name, compiled] of addedClientDirectives) {
				updatedSettings.clientDirectives.set(name, await compiled);
			}
		}
	}

	// The astro:jsx renderer should come last, to not interfere with others.
	if (astroJSXRenderer) {
		updatedSettings.renderers.push(astroJSXRenderer);
	}

	updatedSettings.config = updatedConfig;
	return updatedSettings;
}

export async function runHookConfigDone({
	settings,
	logger,
}: {
	settings: AstroSettings;
	logger: Logger;
}) {
	for (const integration of settings.config.integrations) {
		if (integration?.hooks?.['astro:config:done']) {
			await withTakingALongTimeMsg({
				name: integration.name,
				hookResult: integration.hooks['astro:config:done']({
					config: settings.config,
					setAdapter(adapter) {
						if (settings.adapter && settings.adapter.name !== adapter.name) {
							throw new Error(
								`Integration "${integration.name}" conflicts with "${settings.adapter.name}". You can only configure one deployment integration.`
							);
						}
						if (!adapter.supportedAstroFeatures) {
							// NOTE: throw an error in Astro 4.0
							logger.warn(
								'astro',
								`The adapter ${adapter.name} doesn't provide a feature map. From Astro 3.0, an adapter can provide a feature map. Not providing a feature map will cause an error in Astro 4.0.`
							);
						} else {
							const validationResult = validateSupportedFeatures(
								adapter.name,
								adapter.supportedAstroFeatures,
								settings.config,
								logger
							);
							for (const [featureName, supported] of Object.entries(validationResult)) {
								// If `supported` / `validationResult[featureName]` only allows boolean,
								// in theory 'assets' false, doesn't mean that the feature is not supported, but rather that the chosen image service is unsupported
								// in this case we should not show an error, that the featrue is not supported
								// if we would refactor the validation to support more than boolean, we could still be able to differentiate between the two cases
								if (!supported && featureName !== 'assets') {
									logger.error(
										'astro',
										`The adapter ${adapter.name} doesn't support the feature ${featureName}. Your project won't be built. You should not use it.`
									);
								}
							}
							if (!validationResult.assets) {
								logger.warn(
									'astro',
									`The selected adapter ${adapter.name} does not support image optimization. To allow your project to build with the original, unoptimized images, the image service has been automatically switched to the 'noop' option. See https://docs.astro.build/en/reference/configuration-reference/#imageservice`
								);
								settings.config.image.service = {
									entrypoint: 'astro/assets/services/noop',
									config: {},
								};
							}
						}
						settings.adapter = adapter;
					},
					logger: getLogger(integration, logger),
				}),
				logger,
			});
		}
	}
}

export async function runHookServerSetup({
	config,
	server,
	logger,
}: {
	config: AstroConfig;
	server: ViteDevServer;
	logger: Logger;
}) {
	for (const integration of config.integrations) {
		if (integration?.hooks?.['astro:server:setup']) {
			await withTakingALongTimeMsg({
				name: integration.name,
				hookResult: integration.hooks['astro:server:setup']({
					server,
					logger: getLogger(integration, logger),
				}),
				logger,
			});
		}
	}
}

export async function runHookServerStart({
	config,
	address,
	logger,
}: {
	config: AstroConfig;
	address: AddressInfo;
	logger: Logger;
}) {
	for (const integration of config.integrations) {
		if (integration?.hooks?.['astro:server:start']) {
			await withTakingALongTimeMsg({
				name: integration.name,
				hookResult: integration.hooks['astro:server:start']({
					address,
					logger: getLogger(integration, logger),
				}),
				logger,
			});
		}
	}
}

export async function runHookServerDone({
	config,
	logger,
}: {
	config: AstroConfig;
	logger: Logger;
}) {
	for (const integration of config.integrations) {
		if (integration?.hooks?.['astro:server:done']) {
			await withTakingALongTimeMsg({
				name: integration.name,
				hookResult: integration.hooks['astro:server:done']({
					logger: getLogger(integration, logger),
				}),
				logger,
			});
		}
	}
}

export async function runHookBuildStart({
	config,
	logging,
}: {
	config: AstroConfig;
	logging: Logger;
}) {
	for (const integration of config.integrations) {
		if (integration?.hooks?.['astro:build:start']) {
			const logger = getLogger(integration, logging);

			await withTakingALongTimeMsg({
				name: integration.name,
				hookResult: integration.hooks['astro:build:start']({ logger }),
				logger: logging,
			});
		}
	}
}

export async function runHookBuildSetup({
	config,
	vite,
	pages,
	target,
	logger,
}: {
	config: AstroConfig;
	vite: InlineConfig;
	pages: Map<string, PageBuildData>;
	target: 'server' | 'client';
	logger: Logger;
}): Promise<InlineConfig> {
	let updatedConfig = vite;

	for (const integration of config.integrations) {
		if (integration?.hooks?.['astro:build:setup']) {
			await withTakingALongTimeMsg({
				name: integration.name,
				hookResult: integration.hooks['astro:build:setup']({
					vite,
					pages,
					target,
					updateConfig: (newConfig) => {
						updatedConfig = mergeConfig(updatedConfig, newConfig);
					},
					logger: getLogger(integration, logger),
				}),
				logger,
			});
		}
	}

	return updatedConfig;
}

type RunHookBuildSsr = {
	config: AstroConfig;
	manifest: SerializedSSRManifest;
	logger: Logger;
	entryPoints: Map<RouteData, URL>;
	middlewareEntryPoint: URL | undefined;
};

export async function runHookBuildSsr({
	config,
	manifest,
	logger,
	entryPoints,
	middlewareEntryPoint,
}: RunHookBuildSsr) {
	for (const integration of config.integrations) {
		if (integration?.hooks?.['astro:build:ssr']) {
			await withTakingALongTimeMsg({
				name: integration.name,
				hookResult: integration.hooks['astro:build:ssr']({
					manifest,
					entryPoints,
					middlewareEntryPoint,
					logger: getLogger(integration, logger),
				}),
				logger,
			});
		}
	}
}

export async function runHookBuildGenerated({
	config,
	logger,
}: {
	config: AstroConfig;
	logger: Logger;
}) {
	const dir = isServerLikeOutput(config) ? config.build.client : config.outDir;

	for (const integration of config.integrations) {
		if (integration?.hooks?.['astro:build:generated']) {
			await withTakingALongTimeMsg({
				name: integration.name,
				hookResult: integration.hooks['astro:build:generated']({
					dir,
					logger: getLogger(integration, logger),
				}),
				logger,
			});
		}
	}
}

type RunHookBuildDone = {
	config: AstroConfig;
	pages: string[];
	routes: RouteData[];
	logging: Logger;
};

export async function runHookBuildDone({ config, pages, routes, logging }: RunHookBuildDone) {
	const dir = isServerLikeOutput(config) ? config.build.client : config.outDir;
	await fs.promises.mkdir(dir, { recursive: true });

	for (const integration of config.integrations) {
		if (integration?.hooks?.['astro:build:done']) {
			const logger = getLogger(integration, logging);

			await withTakingALongTimeMsg({
				name: integration.name,
				hookResult: integration.hooks['astro:build:done']({
					pages: pages.map((p) => ({ pathname: p })),
					dir,
					routes,
					logger,
				}),
				logger: logging,
			});
		}
	}
}

export function isFunctionPerRouteEnabled(adapter: AstroAdapter | undefined): boolean {
	if (adapter?.adapterFeatures?.functionPerRoute === true) {
		return true;
	} else {
		return false;
	}
}

export function isEdgeMiddlewareEnabled(adapter: AstroAdapter | undefined): boolean {
	if (adapter?.adapterFeatures?.edgeMiddleware === true) {
		return true;
	} else {
		return false;
	}
}
