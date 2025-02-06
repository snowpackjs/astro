import { viteID } from '../dist/core/util.js';

/**
 * @typedef {import('../src/types/public/integrations.js').AstroAdapter} AstroAdapter
 * @typedef {import('../src/types/public/integrations.js').AstroIntegration} AstroIntegration
 * @typedef {import('../src/types/public/integrations.js').HookParameters<"astro:build:ssr">['entryPoints']} EntryPoints
 * @typedef {import('../src/types/public/integrations.js').HookParameters<"astro:build:ssr">['middlewareEntryPoint']} MiddlewareEntryPoint
 * @typedef {import('../src/types/public/integrations.js').HookParameters<"astro:build:done">['routes']} Routes
 */

/**
 *
 * @param {{
 * 	provideAddress?: boolean;
 * 	extendAdapter?: AstroAdapter;
 * 	setEntryPoints?: (entryPoints: EntryPoints) => void;
 * 	setMiddlewareEntryPoint?: (middlewareEntryPoint: MiddlewareEntryPoint) => void;
 * 	setRoutes?: (routes: Routes) => void;
 * 	env: Record<string, string | undefined>;
 * }} param0
 * @returns {AstroIntegration}
 */
export default function ({
	provideAddress = true,
	extendAdapter,
	setEntryPoints,
	setMiddlewareEntryPoint,
	setRoutes,
	env,
} = {}) {
	return {
		name: 'my-ssr-adapter',
		hooks: {
			'astro:config:setup': ({ updateConfig }) => {
				updateConfig({
					vite: {
						plugins: [
							{
								resolveId(id) {
									if (id === '@my-ssr') {
										return id;
									} else if (id === 'astro/app') {
										const viteId = viteID(new URL('../dist/core/app/index.js', import.meta.url));
										return viteId;
									}
								},
								load(id) {
									if (id === '@my-ssr') {
										return `
											import { App } from 'astro/app';
											import fs from 'fs';

											${
												env
													? `
											await import('astro/env/setup')
												.then(mod => mod.setGetEnv((key) => {
													const data = ${JSON.stringify(env)};
													return data[key];
												}))
												.catch(() => {});`
													: ''
											}

											class MyApp extends App {
												#manifest = null;
												constructor(manifest, streaming) {
													super(manifest, streaming);
													this.#manifest = manifest;
												}

												async render(request, { routeData, clientAddress, locals, addCookieHeader } = {}) {
													const url = new URL(request.url);
													if(this.#manifest.assets.has(url.pathname)) {
														const filePath = new URL('../../client/' + this.removeBase(url.pathname), import.meta.url);
														const data = await fs.promises.readFile(filePath);
														return new Response(data);
													}

													${
														provideAddress
															? `request[Symbol.for('astro.clientAddress')] = clientAddress ?? '0.0.0.0';`
															: ''
													}
													return super.render(request, { routeData, locals, addCookieHeader });
												}
											}

											export function createExports(manifest) {
												return {
													manifest,
													createApp: (streaming) => new MyApp(manifest, streaming)
												};
											}
										`;
									}
								},
							},
						],
					},
				});
			},
			'astro:config:done': ({ setAdapter }) => {
				setAdapter({
					name: 'my-ssr-adapter',
					serverEntrypoint: '@my-ssr',
					exports: ['manifest', 'createApp'],
					supportedAstroFeatures: {
						serverOutput: 'stable',
						envGetSecret: 'experimental',
						staticOutput: 'stable',
						hybridOutput: 'stable',
						assets: 'stable',
						i18nDomains: 'stable',
					},
					adapterFeatures: {
						buildOutput: 'server',
					},
					...extendAdapter,
				});
			},
			'astro:build:ssr': ({ entryPoints, middlewareEntryPoint }) => {
				if (setEntryPoints) {
					setEntryPoints(entryPoints);
				}
				if (setMiddlewareEntryPoint) {
					setMiddlewareEntryPoint(middlewareEntryPoint);
				}
			},
			'astro:build:done': ({ routes }) => {
				if (setRoutes) {
					setRoutes(routes);
				}
			},
		},
	};
}
