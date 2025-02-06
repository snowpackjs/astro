import type * as vite from 'vite';
import { telemetry } from '../events/index.js';
import { eventAppToggled } from '../events/toolbar.js';
import type { AstroPluginOptions } from '../types/astro.js';

const PRIVATE_VIRTUAL_MODULE_ID = 'astro:toolbar:internal';
const resolvedPrivateVirtualModuleId = '\0' + PRIVATE_VIRTUAL_MODULE_ID;

export default function astroDevToolbar({ settings, logger }: AstroPluginOptions): vite.Plugin {
	let telemetryTimeout: ReturnType<typeof setTimeout>;

	return {
		name: 'astro:dev-toolbar',
		config() {
			return {
				optimizeDeps: {
					// Optimize CJS dependencies used by the dev toolbar
					include: ['astro > aria-query', 'astro > axobject-query'],
				},
			};
		},
		resolveId(id) {
			if (id === PRIVATE_VIRTUAL_MODULE_ID) {
				return resolvedPrivateVirtualModuleId;
			}
		},
		configureServer(server) {
			server.hot.on('astro:devtoolbar:error:load', (args) => {
				logger.error(
					'toolbar',
					`Failed to load dev toolbar app from ${args.entrypoint}: ${args.error}`,
				);
			});

			server.hot.on('astro:devtoolbar:error:init', (args) => {
				logger.error(
					'toolbar',
					`Failed to initialize dev toolbar app ${args.app.name} (${args.app.id}):\n${args.error}`,
				);
			});

			server.hot.on('astro:devtoolbar:app:toggled', (args) => {
				// Debounce telemetry to avoid recording events when the user is rapidly toggling apps for debugging
				clearTimeout(telemetryTimeout);
				telemetryTimeout = setTimeout(() => {
					let nameToRecord = args?.app?.id;
					// Only record apps names for apps that are built-in
					if (!nameToRecord || !nameToRecord.startsWith('astro:')) {
						nameToRecord = 'other';
					}
					telemetry.record(
						eventAppToggled({
							appName: nameToRecord,
						}),
					);
				}, 200);
			});
		},
		async load(id) {
			if (id === resolvedPrivateVirtualModuleId) {
				return `
					export const loadDevToolbarApps = async () => {
						return (await Promise.all([${settings.devToolbarApps
							.map(
								(plugin) =>
									`safeLoadPlugin(${JSON.stringify(
										plugin,
									)}, async () => (await import(${JSON.stringify(
										typeof plugin === 'string' ? plugin : plugin.entrypoint.toString(),
									)})).default, ${JSON.stringify(
										typeof plugin === 'string' ? plugin : plugin.entrypoint.toString(),
									)})`,
							)
							.join(',')}]));
					};

					async function safeLoadPlugin(appDefinition, importEntrypoint, entrypoint) {
						try {
							let app;
							if (typeof appDefinition === 'string') {
								app = await importEntrypoint();

								if (typeof app !== 'object' || !app.id || !app.name) {
									throw new Error("Apps must default export an object with an id, and a name.");
								}
							} else {
								app = appDefinition;

								if (typeof app !== 'object' || !app.id || !app.name || !app.entrypoint) {
									throw new Error("Apps must be an object with an id, a name and an entrypoint.");
								}

								const loadedApp = await importEntrypoint();

								if (typeof loadedApp !== 'object') {
									throw new Error("App entrypoint must default export an object.");
								}

								app = { ...app, ...loadedApp };
							}

							return app;
						} catch (err) {
							console.error(\`Failed to load dev toolbar app from \${entrypoint}: \${err.message}\`);

							if (import.meta.hot) {
  							import.meta.hot.send('astro:devtoolbar:error:load', { entrypoint: entrypoint, error: err.message })
							}

							return undefined;
						}

						return undefined;
					}
				`;
			}
		},
	};
}
