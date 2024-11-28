import fsMod from 'node:fs';
import type { AddressInfo } from 'node:net';
import { fileURLToPath } from 'node:url';
import { bold } from 'kleur/colors';
import type { InlineConfig, ViteDevServer } from 'vite';
import { mergeConfig as mergeViteConfig } from 'vite';
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
	RouteOptions,
} from '../@types/astro.js';
import astroIntegrationActionsRouteHandler from '../actions/integration.js';
import { isActionsFilePresent } from '../actions/utils.js';
import type { SerializedSSRManifest } from '../core/app/types.js';
import type { PageBuildData } from '../core/build/types.js';
import { buildClientDirectiveEntrypoint } from '../core/client-directive/index.js';
import { mergeConfig } from '../core/config/index.js';
import type { AstroIntegrationLogger, Logger } from '../core/logger/core.js';
import { isServerLikeOutput } from '../core/util.js';
import { validateSupportedFeatures } from './features-validation.js';

async function withTakingALongTimeMsg<T>({
	name,
	hookName,
	hookResult,
	timeoutMs = 3000,
	logger,
}: {
	name: string;
	hookName: string;
	hookResult: T | Promise<T>;
	timeoutMs?: number;
	logger: Logger;
}): Promise<T> {
	const timeout = setTimeout(() => {
		logger.info(
			'build',
			`Waiting for integration ${bold(JSON.stringify(name))}, hook ${bold(
				JSON.stringify(hookName),
			)}...`,
		);
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

const serverEventPrefix = 'astro-dev-toolbar';

export function getToolbarServerCommunicationHelpers(server: ViteDevServer) {
	return {
		/**
		 * Send a message to the dev toolbar that an app can listen for. The payload can be any serializable data.
		 * @param event - The event name
		 * @param payload - The payload to send
		 */
		send: <T>(event: string, payload: T) => {
			server.hot.send(event, payload);
		},
		/**
		 * Receive a message from a dev toolbar app.
		 * @param event
		 * @param callback
		 */
		on: <T>(event: string, callback: (data: T) => void) => {
			server.hot.on(event, callback);
		},
		/**
		 * Fired when an app is initialized.
		 * @param appId - The id of the app that was initialized
		 * @param callback - The callback to run when the app is initialized
		 */
		onAppInitialized: (appId: string, callback: (data: Record<string, never>) => void) => {
			server.hot.on(`${serverEventPrefix}:${appId}:initialized`, callback);
		},
		/**
		 * Fired when an app is toggled on or off.
		 * @param appId - The id of the app that was toggled
		 * @param callback - The callback to run when the app is toggled
		 */
		onAppToggled: (appId: string, callback: (data: { state: boolean }) => void) => {
			server.hot.on(`${serverEventPrefix}:${appId}:toggled`, callback);
		},
	};
}

// Will match any invalid characters (will be converted to _). We only allow a-zA-Z0-9.-_
const SAFE_CHARS_RE = /[^\w.-]/g;

export function normalizeInjectedTypeFilename(filename: string, integrationName: string): string {
	if (!filename.endsWith('.d.ts')) {
		throw new Error(
			`Integration ${bold(integrationName)} is injecting a type that does not end with "${bold('.d.ts')}"`,
		);
	}
	return `./integrations/${integrationName.replace(SAFE_CHARS_RE, '_')}/${filename.replace(SAFE_CHARS_RE, '_')}`;
}

export async function runHookConfigSetup({
	settings,
	command,
	logger,
	isRestart = false,
	fs = fsMod,
}: {
	settings: AstroSettings;
	command: 'dev' | 'build' | 'preview' | 'sync';
	logger: Logger;
	isRestart?: boolean;
	fs?: typeof fsMod;
}): Promise<AstroSettings> {
	// An adapter is an integration, so if one is provided push it.
	if (settings.config.adapter) {
		settings.config.integrations.push(settings.config.adapter);
	}
	if (await isActionsFilePresent(fs, settings.config.srcDir)) {
		settings.config.integrations.push(astroIntegrationActionsRouteHandler({ settings }));
	}

	let updatedConfig: AstroConfig = { ...settings.config };
	let updatedSettings: AstroSettings = { ...settings, config: updatedConfig };
	let addedClientDirectives = new Map<string, Promise<string>>();
	let astroJSXRenderer: AstroRenderer | null = null;

	// eslint-disable-next-line @typescript-eslint/prefer-for-of -- We need a for loop to be able to read integrations pushed while the loop is running.
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
					updatedConfig = mergeConfig(updatedConfig, newConfig);
					return { ...updatedConfig };
				},
				injectRoute: (injectRoute) => {
					if (injectRoute.entrypoint == null && 'entryPoint' in injectRoute) {
						logger.warn(
							null,
							`The injected route "${injectRoute.pattern}" by ${integration.name} specifies the entry point with the "entryPoint" property. This property is deprecated, please use "entrypoint" instead.`,
						);
						injectRoute.entrypoint = injectRoute.entryPoint as string;
					}
					updatedSettings.injectedRoutes.push(injectRoute);
				},
				addWatchFile: (path) => {
					updatedSettings.watchFiles.push(path instanceof URL ? fileURLToPath(path) : path);
				},
				addDevOverlayPlugin: (entrypoint) => {
					// TODO add a deprecation warning in Astro 5.
					hooks.addDevToolbarApp(entrypoint);
				},
				addDevToolbarApp: (entrypoint) => {
					updatedSettings.devToolbarApps.push(entrypoint);
				},
				addClientDirective: ({ name, entrypoint }) => {
					if (updatedSettings.clientDirectives.has(name) || addedClientDirectives.has(name)) {
						throw new Error(
							`The "${integration.name}" integration is trying to add the "${name}" client directive, but it already exists.`,
						);
					}
					// TODO: this should be performed after astro:config:done
					addedClientDirectives.set(
						name,
						buildClientDirectiveEntrypoint(name, entrypoint, settings.config.root),
					);
				},
				addMiddleware: ({ order, entrypoint }) => {
					if (typeof updatedSettings.middlewares[order] === 'undefined') {
						throw new Error(
							`The "${integration.name}" integration is trying to add middleware but did not specify an order.`,
						);
					}
					logger.debug(
						'middleware',
						`The integration ${integration.name} has added middleware that runs ${
							order === 'pre' ? 'before' : 'after'
						} any application middleware you define.`,
					);
					updatedSettings.middlewares[order].push(entrypoint);
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
				hookName: 'astro:config:setup',
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
				hookName: 'astro:config:done',
				hookResult: integration.hooks['astro:config:done']({
					config: settings.config,
					setAdapter(adapter) {
						if (settings.adapter && settings.adapter.name !== adapter.name) {
							throw new Error(
								`Integration "${integration.name}" conflicts with "${settings.adapter.name}". You can only configure one deployment integration.`,
							);
						}
						if (!adapter.supportedAstroFeatures) {
							throw new Error(
								`The adapter ${adapter.name} doesn't provide a feature map. It is required in Astro 4.0.`,
							);
						} else {
							const validationResult = validateSupportedFeatures(
								adapter.name,
								adapter.supportedAstroFeatures,
								settings.config,
								// SAFETY: we checked before if it's not present, and we throw an error
								adapter.adapterFeatures,
								logger,
							);
							for (const [featureName, supported] of Object.entries(validationResult)) {
								// If `supported` / `validationResult[featureName]` only allows boolean,
								// in theory 'assets' false, doesn't mean that the feature is not supported, but rather that the chosen image service is unsupported
								// in this case we should not show an error, that the featrue is not supported
								// if we would refactor the validation to support more than boolean, we could still be able to differentiate between the two cases
								if (!supported && featureName !== 'assets') {
									logger.error(
										null,
										`The adapter ${adapter.name} doesn't support the feature ${featureName}. Your project won't be built. You should not use it.`,
									);
								}
							}
						}
						settings.adapter = adapter;
					},
					injectTypes(injectedType) {
						const normalizedFilename = normalizeInjectedTypeFilename(
							injectedType.filename,
							integration.name,
						);

						settings.injectedTypes.push({
							filename: normalizedFilename,
							content: injectedType.content,
						});

						// It must be relative to dotAstroDir here and not inside normalizeInjectedTypeFilename
						// because injectedTypes are handled relatively to the dotAstroDir already
						return new URL(normalizedFilename, settings.dotAstroDir);
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
				hookName: 'astro:server:setup',
				hookResult: integration.hooks['astro:server:setup']({
					server,
					logger: getLogger(integration, logger),
					toolbar: getToolbarServerCommunicationHelpers(server),
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
				hookName: 'astro:server:start',
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
				hookName: 'astro:server:done',
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
				hookName: 'astro:build:start',
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
				hookName: 'astro:build:setup',
				hookResult: integration.hooks['astro:build:setup']({
					vite,
					pages,
					target,
					updateConfig: (newConfig) => {
						updatedConfig = mergeViteConfig(updatedConfig, newConfig);
						return { ...updatedConfig };
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
				hookName: 'astro:build:ssr',
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
				hookName: 'astro:build:generated',
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
	cacheManifest: boolean;
};

export async function runHookBuildDone({
	config,
	pages,
	routes,
	logging,
	cacheManifest,
}: RunHookBuildDone) {
	const dir = isServerLikeOutput(config) ? config.build.client : config.outDir;
	await fsMod.promises.mkdir(dir, { recursive: true });

	for (const integration of config.integrations) {
		if (integration?.hooks?.['astro:build:done']) {
			const logger = getLogger(integration, logging);

			await withTakingALongTimeMsg({
				name: integration.name,
				hookName: 'astro:build:done',
				hookResult: integration.hooks['astro:build:done']({
					pages: pages.map((p) => ({ pathname: p })),
					dir,
					routes,
					logger,
					cacheManifest,
				}),
				logger: logging,
			});
		}
	}
}

export async function runHookRouteSetup({
	route,
	settings,
	logger,
}: {
	route: RouteOptions;
	settings: AstroSettings;
	logger: Logger;
}) {
	const prerenderChangeLogs: { integrationName: string; value: boolean | undefined }[] = [];

	for (const integration of settings.config.integrations) {
		if (integration?.hooks?.['astro:route:setup']) {
			const originalRoute = { ...route };
			const integrationLogger = getLogger(integration, logger);

			await withTakingALongTimeMsg({
				name: integration.name,
				hookName: 'astro:route:setup',
				hookResult: integration.hooks['astro:route:setup']({
					route,
					logger: integrationLogger,
				}),
				logger,
			});

			if (route.prerender !== originalRoute.prerender) {
				prerenderChangeLogs.push({ integrationName: integration.name, value: route.prerender });
			}
		}
	}

	if (prerenderChangeLogs.length > 1) {
		logger.debug(
			'router',
			`The ${route.component} route's prerender option has been changed multiple times by integrations:\n` +
				prerenderChangeLogs.map((log) => `- ${log.integrationName}: ${log.value}`).join('\n'),
		);
	}
}

export function isFunctionPerRouteEnabled(adapter: AstroAdapter | undefined): boolean {
	if (adapter?.adapterFeatures?.functionPerRoute === true) {
		return true;
	} else {
		return false;
	}
}
