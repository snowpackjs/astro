import { randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import type { IncomingMessage } from 'node:http';
import { fileURLToPath } from 'node:url';
import { emptyDir } from '@astrojs/internal-helpers/fs';
import { createRedirectsFromAstroRoutes } from '@astrojs/underscore-redirects';
import type { Context } from '@netlify/functions';
import type {
	AstroConfig,
	AstroIntegration,
	AstroIntegrationLogger,
	HookParameters,
	IntegrationResolvedRoute,
} from 'astro';
import { build } from 'esbuild';
import { copyDependenciesToFunction } from './lib/nft.js';
import type { Args } from './ssr-function.js';

const { version: packageVersion } = JSON.parse(
	await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);

export interface NetlifyLocals {
	netlify: {
		context: Context;
	};
}

type RemotePattern = AstroConfig['image']['remotePatterns'][number];

/**
 * Convert a remote pattern object to a regex string
 */
export function remotePatternToRegex(
	pattern: RemotePattern,
	logger: AstroIntegrationLogger,
): string | undefined {
	let { protocol, hostname, port, pathname } = pattern;

	let regexStr = '';

	if (protocol) {
		regexStr += `${protocol}://`;
	} else {
		// Default to matching any protocol
		regexStr += '[a-z]+://';
	}

	if (hostname) {
		if (hostname.startsWith('**.')) {
			// match any number of subdomains
			regexStr += '([a-z0-9-]+\\.)*';
			hostname = hostname.substring(3);
		} else if (hostname.startsWith('*.')) {
			// match one subdomain
			regexStr += '([a-z0-9-]+\\.)?';
			hostname = hostname.substring(2); // Remove '*.' from the beginning
		}
		// Escape dots in the hostname
		regexStr += hostname.replace(/\./g, '\\.');
	} else {
		regexStr += '[a-z0-9.-]+';
	}

	if (port) {
		regexStr += `:${port}`;
	} else {
		// Default to matching any port
		regexStr += '(:[0-9]+)?';
	}

	if (pathname) {
		if (pathname.endsWith('/**')) {
			// Match any path.
			regexStr += `(\\${pathname.replace('/**', '')}.*)`;
		}
		if (pathname.endsWith('/*')) {
			// Match one level of path
			regexStr += `(\\${pathname.replace('/*', '')}\/[^/?#]+)\/?`;
		} else {
			// Exact match
			regexStr += `(\\${pathname})`;
		}
	} else {
		// Default to matching any path
		regexStr += '(\\/[^?#]*)?';
	}
	if (!regexStr.endsWith('.*)')) {
		// Match query, but only if it's not already matched by the pathname
		regexStr += '([?][^#]*)?';
	}
	try {
		new RegExp(regexStr);
	} catch (e) {
		logger.warn(
			`Could not generate a valid regex from the remotePattern "${JSON.stringify(
				pattern,
			)}". Please check the syntax.`,
		);
		return undefined;
	}
	return regexStr;
}

async function writeNetlifyFrameworkConfig(config: AstroConfig, logger: AstroIntegrationLogger) {
	const remoteImages: Array<string> = [];
	// Domains get a simple regex match
	remoteImages.push(
		...config.image.domains.map((domain) => `https?:\/\/${domain.replaceAll('.', '\\.')}\/.*`),
	);
	// Remote patterns need to be converted to regexes
	remoteImages.push(
		...config.image.remotePatterns
			.map((pattern) => remotePatternToRegex(pattern, logger))
			.filter(Boolean as unknown as (pattern?: string) => pattern is string),
	);

	const headers = config.build.assetsPrefix
		? undefined
		: [
				{
					for: `${config.base}${config.base.endsWith('/') ? '' : '/'}${config.build.assets}/*`,
					values: {
						'Cache-Control': 'public, max-age=31536000, immutable',
					},
				},
			];

	// See https://docs.netlify.com/image-cdn/create-integration/
	const deployConfigDir = new URL('.netlify/v1/', config.root);
	await mkdir(deployConfigDir, { recursive: true });
	await writeFile(
		new URL('./config.json', deployConfigDir),
		JSON.stringify({
			images: { remote_images: remoteImages },
			headers,
		}),
	);
}

export interface NetlifyIntegrationConfig {
	/**
	 * If enabled, On-Demand-Rendered pages are cached for up to a year.
	 * This is useful for pages that are not updated often, like a blog post,
	 * but that you have too many of to pre-render at build time.
	 *
	 * You can override this behavior on a per-page basis
	 * by setting the `Cache-Control`, `CDN-Cache-Control` or `Netlify-CDN-Cache-Control` header
	 * from within the Page:
	 *
	 * ```astro
	 * // src/pages/cached-clock.astro
	 * Astro.response.headers.set('CDN-Cache-Control', "public, max-age=45, must-revalidate");
	 * ---
	 * <p>{Date.now()}</p>
	 * ```
	 */
	cacheOnDemandPages?: boolean;

	/**
	 * If disabled, Middleware is applied to prerendered pages at build-time, and to on-demand-rendered pages at runtime.
	 * Only disable when your Middleware does not need to run on prerendered pages.
	 * If you use Middleware to implement authentication, redirects or similar things, you should should likely enabled it.
	 *
	 * If enabled, Astro Middleware is deployed as an Edge Function and applies to all routes.
	 * Caveat: Locals set in Middleware are not applied to prerendered pages, because they've been rendered at build-time and are served from the CDN.
	 *
	 * @default {false}
	 */
	edgeMiddleware?: boolean;

	/**
	 * If enabled, Netlify Image CDN is used for image optimization.
	 * This transforms images on-the-fly without impacting build times.
	 *
	 * If disabled, Astro's built-in image optimization is run at build-time instead.
	 *
	 * @default {true}
	 */
	imageCDN?: boolean;
}

export default function netlifyIntegration(
	integrationConfig?: NetlifyIntegrationConfig,
): AstroIntegration {
	const isRunningInNetlify = Boolean(
		process.env.NETLIFY || process.env.NETLIFY_LOCAL || process.env.NETLIFY_DEV,
	);

	let _config: AstroConfig;
	let outDir: URL;
	let rootDir: URL;
	let astroMiddlewareEntryPoint: URL | undefined = undefined;
	// Secret used to verify that the caller is the astro-generated edge middleware and not a third-party
	const middlewareSecret = randomUUID();

	let finalBuildOutput: HookParameters<'astro:config:done'>['buildOutput'];

	const TRACE_CACHE = {};

	const ssrBuildDir = () => new URL('./.netlify/build/', rootDir);
	const ssrOutputDir = () => new URL('./.netlify/v1/functions/ssr/', rootDir);
	const middlewareOutputDir = () => new URL('.netlify/v1/edge-functions/middleware/', rootDir);

	const cleanFunctions = async () =>
		await Promise.all([
			emptyDir(middlewareOutputDir()),
			emptyDir(ssrOutputDir()),
			emptyDir(ssrBuildDir()),
		]);

	async function writeRedirects(
		routes: IntegrationResolvedRoute[],
		dir: URL,
		buildOutput: HookParameters<'astro:config:done'>['buildOutput'],
		assets: HookParameters<'astro:build:done'>['assets'],
	) {
		// all other routes are handled by SSR
		const staticRedirects = routes.filter(
			(route) => route.type === 'redirect' && (route.redirect || route.redirectRoute),
		);

		// this is needed to support redirects to dynamic routes
		// on static. not sure why this is needed, but it works.
		for (const { pattern, redirectRoute } of staticRedirects) {
			const distURL = assets.get(pattern);
			if (!distURL && redirectRoute) {
				const redirectDistURL = assets.get(redirectRoute.pattern);
				if (redirectDistURL) {
					assets.set(pattern, redirectDistURL);
				}
			}
		}

		const fallback = finalBuildOutput === 'static' ? '/.netlify/static' : '/.netlify/functions/ssr';
		const redirects = createRedirectsFromAstroRoutes({
			config: _config,
			dir,
			routeToDynamicTargetMap: new Map(staticRedirects.map((route) => [route, fallback])),
			buildOutput,
			assets,
		});

		if (!redirects.empty()) {
			await appendFile(new URL('_redirects', outDir), `\n${redirects.print()}\n`);
		}
	}

	async function writeSSRFunction({
		notFoundContent,
		logger,
		root,
	}: {
		notFoundContent?: string;
		logger: AstroIntegrationLogger;
		root: URL;
	}) {
		const entry = new URL('./entry.mjs', ssrBuildDir());

		const { handler } = await copyDependenciesToFunction(
			{
				entry,
				outDir: ssrOutputDir(),
				includeFiles: [],
				excludeFiles: [],
				logger,
				root,
			},
			TRACE_CACHE,
		);

		await writeFile(
			new URL('./ssr.mjs', ssrOutputDir()),
			`
				import createSSRHandler from './${handler}';
				export default createSSRHandler(${JSON.stringify({
					cacheOnDemandPages: Boolean(integrationConfig?.cacheOnDemandPages),
					notFoundContent,
				})});
				export const config = {
					includedFiles: ['**/*'],
					name: 'Astro SSR',
					nodeBundler: 'none',
					generator: '@astrojs/netlify@${packageVersion}',
					path: '/*',
					preferStatic: true,
				};
			`,
		);
	}

	async function writeMiddleware(entrypoint: URL) {
		await mkdir(middlewareOutputDir(), { recursive: true });
		await writeFile(
			new URL('./entry.mjs', middlewareOutputDir()),
			/* ts */ `
			import { onRequest } from "${fileURLToPath(entrypoint).replaceAll('\\', '/')}";
			import { createContext, trySerializeLocals } from 'astro/middleware';

			export default async (request, context) => {
				const ctx = createContext({
					request,
					params: {},
					locals: { netlify: { context } }
				});
				// https://docs.netlify.com/edge-functions/api/#return-a-rewrite
				ctx.rewrite = (target) => {
					if(target instanceof Request) {
						// We can only mutate headers, so if anything else is different, we need to fetch
						// the target URL instead.
						if(target.method !== request.method || target.body || target.url.origin !== request.url.origin) {
							return fetch(target);
						}
						// We can't replace the headers object, so we need to delete all headers and set them again
						request.headers.forEach((_value, key) => {
							request.headers.delete(key);
						});
						target.headers.forEach((value, key) => {
							request.headers.set(key, value);
						});
						return new URL(target.url);
					}
					return new URL(target, request.url);
				};
				const next = () => {
					const { netlify, ...otherLocals } = ctx.locals;
					request.headers.set("x-astro-locals", trySerializeLocals(otherLocals));
					request.headers.set("x-astro-middleware-secret", "${middlewareSecret}");
					return context.next();
				};

				return onRequest(ctx, next);
			}

			export const config = {
				name: "Astro Middleware",
				generator: "@astrojs/netlify@${packageVersion}",
				path: "/*", excludedPath: ["/_astro/*", "/.netlify/images/*"]
			};
			`,
		);

		// taking over bundling, because Netlify bundling trips over NPM modules
		await build({
			entryPoints: [fileURLToPath(new URL('./entry.mjs', middlewareOutputDir()))],
			// allow `node:` prefixed imports, which are valid in netlify's deno edge runtime
			plugins: [
				{
					name: 'allowNodePrefixedImports',
					setup(puglinBuild) {
						puglinBuild.onResolve({ filter: /^node:.*$/ }, (args) => ({
							path: args.path,
							external: true,
						}));
					},
				},
			],
			target: 'es2022',
			platform: 'neutral',
			mainFields: ['module', 'main'],
			outfile: fileURLToPath(new URL('./middleware.mjs', middlewareOutputDir())),
			allowOverwrite: true,
			format: 'esm',
			bundle: true,
			minify: false,
			external: ['sharp'],
			banner: {
				// Import Deno polyfill for `process.env` at the top of the file
				js: 'import process from "node:process";',
			},
		});
	}

	function getLocalDevNetlifyContext(req: IncomingMessage): Context {
		const isHttps = req.headers['x-forwarded-proto'] === 'https';
		const parseBase64JSON = <T = unknown>(header: string): T | undefined => {
			if (typeof req.headers[header] === 'string') {
				try {
					return JSON.parse(Buffer.from(req.headers[header] as string, 'base64').toString('utf8'));
				} catch {}
			}
		};

		const context: Context = {
			account: parseBase64JSON('x-nf-account-info') ?? {
				id: 'mock-netlify-account-id',
			},
			// TODO: this has type conflicts with @netlify/functions ^2.8.1
			// @ts-expect-error: this has type conflicts with @netlify/functions ^2.8.1
			deploy: {
				id:
					typeof req.headers['x-nf-deploy-id'] === 'string'
						? req.headers['x-nf-deploy-id']
						: 'mock-netlify-deploy-id',
			},
			site: parseBase64JSON('x-nf-site-info') ?? {
				id: 'mock-netlify-site-id',
				name: 'mock-netlify-site.netlify.app',
				url: `${isHttps ? 'https' : 'http'}://localhost:${isRunningInNetlify ? 8888 : 4321}`,
			},
			geo: parseBase64JSON('x-nf-geo') ?? {
				city: 'Mock City',
				country: { code: 'mock', name: 'Mock Country' },
				subdivision: { code: 'SD', name: 'Mock Subdivision' },
				timezone: 'UTC',
				longitude: 0,
				latitude: 0,
			},
			ip:
				typeof req.headers['x-nf-client-connection-ip'] === 'string'
					? req.headers['x-nf-client-connection-ip']
					: (req.socket.remoteAddress ?? '127.0.0.1'),
			server: {
				region: 'local-dev',
			},
			requestId:
				typeof req.headers['x-nf-request-id'] === 'string'
					? req.headers['x-nf-request-id']
					: 'mock-netlify-request-id',
			get cookies(): never {
				throw new Error('Please use Astro.cookies instead.');
			},
			// @ts-expect-error This is not currently included in the public Netlify types
			flags: undefined,
			json: (input) => Response.json(input),
			log: console.info,
			next: () => {
				throw new Error('`context.next` is not implemented for serverless functions');
			},
			get params(): never {
				throw new Error("context.params don't contain any usable content in Astro.");
			},
			rewrite() {
				throw new Error('context.rewrite is not available in Astro.');
			},
		};

		return context;
	}

	let routes: IntegrationResolvedRoute[];

	return {
		name: '@astrojs/netlify',
		hooks: {
			'astro:config:setup': async ({ config, updateConfig, logger }) => {
				rootDir = config.root;
				await cleanFunctions();

				outDir = new URL('./dist/', rootDir);

				const enableImageCDN = isRunningInNetlify && (integrationConfig?.imageCDN ?? true);

				let session = config.session;

				if (config.experimental.session && !session?.driver) {
					logger.info(
						`Configuring experimental session support using ${isRunningInNetlify ? 'Netlify Blobs' : 'filesystem storage'}`,
					);
					session = isRunningInNetlify
						? {
								...session,
								driver: 'netlify-blobs',
								options: {
									name: 'astro-sessions',
									consistency: 'strong',
									...session?.options,
								},
							}
						: {
								...session,
								driver: 'fs-lite',
								options: {
									base: fileURLToPath(new URL('sessions', config.cacheDir)),
									...session?.options,
								},
							};
				}

				updateConfig({
					outDir,
					build: {
						redirects: false,
						client: outDir,
						server: ssrBuildDir(),
					},
					session,
					vite: {
						server: {
							watch: {
								ignored: [fileURLToPath(new URL('./.netlify/**', rootDir))],
							},
						},
					},
					image: {
						service: {
							entrypoint: enableImageCDN ? '@astrojs/netlify/image-service.js' : undefined,
						},
					},
				});
			},
			'astro:routes:resolved': (params) => {
				routes = params.routes;
			},
			'astro:config:done': async ({ config, setAdapter, logger, buildOutput }) => {
				rootDir = config.root;
				_config = config;

				finalBuildOutput = buildOutput;

				await writeNetlifyFrameworkConfig(config, logger);

				const edgeMiddleware = integrationConfig?.edgeMiddleware ?? false;

				setAdapter({
					name: '@astrojs/netlify',
					serverEntrypoint: '@astrojs/netlify/ssr-function.js',
					exports: ['default'],
					adapterFeatures: {
						edgeMiddleware,
					},
					args: { middlewareSecret } satisfies Args,
					supportedAstroFeatures: {
						hybridOutput: 'stable',
						staticOutput: 'stable',
						serverOutput: 'stable',
						sharpImageService: 'stable',
						envGetSecret: 'stable',
					},
				});
			},
			'astro:build:ssr': async ({ middlewareEntryPoint }) => {
				astroMiddlewareEntryPoint = middlewareEntryPoint;
			},
			'astro:build:done': async ({ assets, dir, logger }) => {
				await writeRedirects(routes, dir, finalBuildOutput, assets);
				logger.info('Emitted _redirects');

				if (finalBuildOutput !== 'static') {
					let notFoundContent = undefined;
					try {
						notFoundContent = await readFile(new URL('./404.html', dir), 'utf8');
					} catch {}
					await writeSSRFunction({ notFoundContent, logger, root: _config.root });
					logger.info('Generated SSR Function');
				}
				if (astroMiddlewareEntryPoint) {
					await writeMiddleware(astroMiddlewareEntryPoint);
					logger.info('Generated Middleware Edge Function');
				}
			},

			// local dev
			'astro:server:setup': async ({ server }) => {
				server.middlewares.use((req, _res, next) => {
					const locals = Symbol.for('astro.locals');
					Reflect.set(req, locals, {
						...Reflect.get(req, locals),
						netlify: { context: getLocalDevNetlifyContext(req) },
					});
					next();
				});
			},
		},
	};
}
