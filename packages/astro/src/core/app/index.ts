import { collapseDuplicateTrailingSlashes, hasFileExtension } from '@astrojs/internal-helpers/path';
import { normalizeTheLocale } from '../../i18n/index.js';
import type { RoutesList } from '../../types/astro.js';
import type { RouteData, SSRManifest } from '../../types/public/internal.js';
import {
	REROUTABLE_STATUS_CODES,
	REROUTE_DIRECTIVE_HEADER,
	clientAddressSymbol,
	responseSentSymbol,
} from '../constants.js';
import { getSetCookiesFromResponse } from '../cookies/index.js';
import { AstroError, AstroErrorData } from '../errors/index.js';
import { consoleLogDestination } from '../logger/console.js';
import { AstroIntegrationLogger, Logger } from '../logger/core.js';
import { NOOP_MIDDLEWARE_FN } from '../middleware/noop-middleware.js';
import {
	appendForwardSlash,
	joinPaths,
	prependForwardSlash,
	removeTrailingForwardSlash,
} from '../path.js';
import { RenderContext } from '../render-context.js';
import { createAssetLink } from '../render/ssr-element.js';
import { redirectTemplate } from '../routing/3xx.js';
import { ensure404Route } from '../routing/astro-designed-error-pages.js';
import { createDefaultRoutes } from '../routing/default.js';
import { matchRoute } from '../routing/match.js';
import { type AstroSession, PERSIST_SYMBOL } from '../session.js';
import { AppPipeline } from './pipeline.js';

export { deserializeManifest } from './common.js';

export interface RenderOptions {
	/**
	 * Whether to automatically add all cookies written by `Astro.cookie.set()` to the response headers.
	 *
	 * When set to `true`, they will be added to the `Set-Cookie` header as comma-separated key=value pairs. You can use the standard `response.headers.getSetCookie()` API to read them individually.
	 *
	 * When set to `false`, the cookies will only be available from `App.getSetCookieFromResponse(response)`.
	 *
	 * @default {false}
	 */
	addCookieHeader?: boolean;

	/**
	 * The client IP address that will be made available as `Astro.clientAddress` in pages, and as `ctx.clientAddress` in API routes and middleware.
	 *
	 * Default: `request[Symbol.for("astro.clientAddress")]`
	 */
	clientAddress?: string;

	/**
	 * The mutable object that will be made available as `Astro.locals` in pages, and as `ctx.locals` in API routes and middleware.
	 */
	locals?: object;

	/**
	 * **Advanced API**: you probably do not need to use this.
	 *
	 * Default: `app.match(request)`
	 */
	routeData?: RouteData;
}

export interface RenderErrorOptions {
	locals?: App.Locals;
	routeData?: RouteData;
	response?: Response;
	status: 404 | 500;
	/**
	 * Whether to skip middleware while rendering the error page. Defaults to false.
	 */
	skipMiddleware?: boolean;
	/**
	 * Allows passing an error to 500.astro. It will be available through `Astro.props.error`.
	 */
	error?: unknown;
	clientAddress: string | undefined;
}

export class App {
	#manifest: SSRManifest;
	#manifestData: RoutesList;
	#logger = new Logger({
		dest: consoleLogDestination,
		level: 'info',
	});
	#baseWithoutTrailingSlash: string;
	#pipeline: AppPipeline;
	#adapterLogger: AstroIntegrationLogger;
	#renderOptionsDeprecationWarningShown = false;

	constructor(manifest: SSRManifest, streaming = true) {
		this.#manifest = manifest;
		this.#manifestData = {
			routes: manifest.routes.map((route) => route.routeData),
		};
		// This is necessary to allow running middlewares for 404 in SSR. There's special handling
		// to return the host 404 if the user doesn't provide a custom 404
		ensure404Route(this.#manifestData);
		this.#baseWithoutTrailingSlash = removeTrailingForwardSlash(this.#manifest.base);
		this.#pipeline = this.#createPipeline(this.#manifestData, streaming);
		this.#adapterLogger = new AstroIntegrationLogger(
			this.#logger.options,
			this.#manifest.adapterName,
		);
	}

	getAdapterLogger(): AstroIntegrationLogger {
		return this.#adapterLogger;
	}

	/**
	 * Creates a pipeline by reading the stored manifest
	 *
	 * @param manifestData
	 * @param streaming
	 * @private
	 */
	#createPipeline(manifestData: RoutesList, streaming = false) {
		return AppPipeline.create(manifestData, {
			logger: this.#logger,
			manifest: this.#manifest,
			runtimeMode: 'production',
			renderers: this.#manifest.renderers,
			defaultRoutes: createDefaultRoutes(this.#manifest),
			resolve: async (specifier: string) => {
				if (!(specifier in this.#manifest.entryModules)) {
					throw new Error(`Unable to resolve [${specifier}]`);
				}
				const bundlePath = this.#manifest.entryModules[specifier];
				if (bundlePath.startsWith('data:') || bundlePath.length === 0) {
					return bundlePath;
				} else {
					return createAssetLink(bundlePath, this.#manifest.base, this.#manifest.assetsPrefix);
				}
			},
			serverLike: true,
			streaming,
		});
	}

	set setManifestData(newManifestData: RoutesList) {
		this.#manifestData = newManifestData;
	}

	removeBase(pathname: string) {
		if (pathname.startsWith(this.#manifest.base)) {
			return pathname.slice(this.#baseWithoutTrailingSlash.length + 1);
		}
		return pathname;
	}

	/**
	 * It removes the base from the request URL, prepends it with a forward slash and attempts to decoded it.
	 *
	 * If the decoding fails, it logs the error and return the pathname as is.
	 * @param request
	 * @private
	 */
	#getPathnameFromRequest(request: Request): string {
		const url = new URL(request.url);
		const pathname = prependForwardSlash(this.removeBase(url.pathname));
		try {
			return decodeURI(pathname);
		} catch (e: any) {
			this.getAdapterLogger().error(e.toString());
			return pathname;
		}
	}

	match(request: Request): RouteData | undefined {
		const url = new URL(request.url);
		// ignore requests matching public assets
		if (this.#manifest.assets.has(url.pathname)) return undefined;
		let pathname = this.#computePathnameFromDomain(request);
		if (!pathname) {
			pathname = prependForwardSlash(this.removeBase(url.pathname));
		}
		let routeData = matchRoute(pathname, this.#manifestData);

		// missing routes fall-through, pre rendered are handled by static layer
		if (!routeData || routeData.prerender) return undefined;
		return routeData;
	}

	#computePathnameFromDomain(request: Request): string | undefined {
		let pathname: string | undefined = undefined;
		const url = new URL(request.url);

		if (
			this.#manifest.i18n &&
			(this.#manifest.i18n.strategy === 'domains-prefix-always' ||
				this.#manifest.i18n.strategy === 'domains-prefix-other-locales' ||
				this.#manifest.i18n.strategy === 'domains-prefix-always-no-redirect')
		) {
			// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host
			let host = request.headers.get('X-Forwarded-Host');
			// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto
			let protocol = request.headers.get('X-Forwarded-Proto');
			if (protocol) {
				// this header doesn't have a colon at the end, so we add to be in line with URL#protocol, which does have it
				protocol = protocol + ':';
			} else {
				// we fall back to the protocol of the request
				protocol = url.protocol;
			}
			if (!host) {
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host
				host = request.headers.get('Host');
			}
			// If we don't have a host and a protocol, it's impossible to proceed
			if (host && protocol) {
				// The header might have a port in their name, so we remove it
				host = host.split(':')[0];
				try {
					let locale;
					const hostAsUrl = new URL(`${protocol}//${host}`);
					for (const [domainKey, localeValue] of Object.entries(
						this.#manifest.i18n.domainLookupTable,
					)) {
						// This operation should be safe because we force the protocol via zod inside the configuration
						// If not, then it means that the manifest was tampered
						const domainKeyAsUrl = new URL(domainKey);

						if (
							hostAsUrl.host === domainKeyAsUrl.host &&
							hostAsUrl.protocol === domainKeyAsUrl.protocol
						) {
							locale = localeValue;
							break;
						}
					}

					if (locale) {
						pathname = prependForwardSlash(
							joinPaths(normalizeTheLocale(locale), this.removeBase(url.pathname)),
						);
						if (url.pathname.endsWith('/')) {
							pathname = appendForwardSlash(pathname);
						}
					}
				} catch (e: any) {
					this.#logger.error(
						'router',
						`Astro tried to parse ${protocol}//${host} as an URL, but it threw a parsing error. Check the X-Forwarded-Host and X-Forwarded-Proto headers.`,
					);
					this.#logger.error('router', `Error: ${e}`);
				}
			}
		}
		return pathname;
	}

	#redirectTrailingSlash(pathname: string): string {
		const { trailingSlash } = this.#manifest;

		// Ignore root and internal paths
		if (pathname === '/' || pathname.startsWith('/_')) {
			return pathname;
		}

		// Redirect multiple trailing slashes to collapsed path
		const path = collapseDuplicateTrailingSlashes(pathname, trailingSlash !== 'never');
		if (path !== pathname) {
			return path;
		}

		if (trailingSlash === 'ignore') {
			return pathname;
		}

		if (trailingSlash === 'always' && !hasFileExtension(pathname)) {
			return appendForwardSlash(pathname);
		}
		if (trailingSlash === 'never') {
			return removeTrailingForwardSlash(pathname);
		}

		return pathname;
	}

	async render(request: Request, renderOptions?: RenderOptions): Promise<Response> {
		let routeData: RouteData | undefined;
		let locals: object | undefined;
		let clientAddress: string | undefined;
		let addCookieHeader: boolean | undefined;
		const url = new URL(request.url);
		const redirect = this.#redirectTrailingSlash(url.pathname);

		if (redirect !== url.pathname) {
			const status = request.method === 'GET' ? 301 : 308;
			return new Response(redirectTemplate({ status, location: redirect, from: request.url }), {
				status,
				headers: {
					location: redirect + url.search,
				},
			});
		}

		addCookieHeader = renderOptions?.addCookieHeader;
		clientAddress = renderOptions?.clientAddress ?? Reflect.get(request, clientAddressSymbol);
		routeData = renderOptions?.routeData;
		locals = renderOptions?.locals;

		if (routeData) {
			this.#logger.debug(
				'router',
				'The adapter ' + this.#manifest.adapterName + ' provided a custom RouteData for ',
				request.url,
			);
			this.#logger.debug('router', 'RouteData:\n' + routeData);
		}
		if (locals) {
			if (typeof locals !== 'object') {
				const error = new AstroError(AstroErrorData.LocalsNotAnObject);
				this.#logger.error(null, error.stack!);
				return this.#renderError(request, { status: 500, error, clientAddress });
			}
		}
		if (!routeData) {
			routeData = this.match(request);
			this.#logger.debug('router', 'Astro matched the following route for ' + request.url);
			this.#logger.debug('router', 'RouteData:\n' + routeData);
		}
		if (!routeData) {
			this.#logger.debug('router', "Astro hasn't found routes that match " + request.url);
			this.#logger.debug('router', "Here's the available routes:\n", this.#manifestData);
			return this.#renderError(request, { locals, status: 404, clientAddress });
		}
		const pathname = this.#getPathnameFromRequest(request);
		const defaultStatus = this.#getDefaultStatusCode(routeData, pathname);

		let response;
		let session: AstroSession | undefined;
		try {
			// Load route module. We also catch its error here if it fails on initialization
			const mod = await this.#pipeline.getModuleForRoute(routeData);

			const renderContext = await RenderContext.create({
				pipeline: this.#pipeline,
				locals,
				pathname,
				request,
				routeData,
				status: defaultStatus,
				clientAddress,
			});
			session = renderContext.session;
			response = await renderContext.render(await mod.page());
		} catch (err: any) {
			this.#logger.error(null, err.stack || err.message || String(err));
			return this.#renderError(request, { locals, status: 500, error: err, clientAddress });
		} finally {
			await session?.[PERSIST_SYMBOL]();
		}

		if (
			REROUTABLE_STATUS_CODES.includes(response.status) &&
			response.headers.get(REROUTE_DIRECTIVE_HEADER) !== 'no'
		) {
			return this.#renderError(request, {
				locals,
				response,
				status: response.status as 404 | 500,
				// We don't have an error to report here. Passing null means we pass nothing intentionally
				// while undefined means there's no error
				error: response.status === 500 ? null : undefined,
				clientAddress,
			});
		}

		// We remove internally-used header before we send the response to the user agent.
		if (response.headers.has(REROUTE_DIRECTIVE_HEADER)) {
			response.headers.delete(REROUTE_DIRECTIVE_HEADER);
		}

		if (addCookieHeader) {
			for (const setCookieHeaderValue of App.getSetCookieFromResponse(response)) {
				response.headers.append('set-cookie', setCookieHeaderValue);
			}
		}

		Reflect.set(response, responseSentSymbol, true);
		return response;
	}

	setCookieHeaders(response: Response) {
		return getSetCookiesFromResponse(response);
	}

	/**
	 * Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
	 * For example,
	 * ```ts
	 * for (const cookie_ of App.getSetCookieFromResponse(response)) {
	 *     const cookie: string = cookie_
	 * }
	 * ```
	 * @param response The response to read cookies from.
	 * @returns An iterator that yields key-value pairs as equal-sign-separated strings.
	 */
	static getSetCookieFromResponse = getSetCookiesFromResponse;

	/**
	 * If it is a known error code, try sending the according page (e.g. 404.astro / 500.astro).
	 * This also handles pre-rendered /404 or /500 routes
	 */
	async #renderError(
		request: Request,
		{
			locals,
			status,
			response: originalResponse,
			skipMiddleware = false,
			error,
			clientAddress,
		}: RenderErrorOptions,
	): Promise<Response> {
		const errorRoutePath = `/${status}${this.#manifest.trailingSlash === 'always' ? '/' : ''}`;
		const errorRouteData = matchRoute(errorRoutePath, this.#manifestData);
		const url = new URL(request.url);
		if (errorRouteData) {
			if (errorRouteData.prerender) {
				const maybeDotHtml = errorRouteData.route.endsWith(`/${status}`) ? '.html' : '';
				const statusURL = new URL(
					`${this.#baseWithoutTrailingSlash}/${status}${maybeDotHtml}`,
					url,
				);
				if (statusURL.toString() !== request.url) {
					const response = await fetch(statusURL.toString());

					// response for /404.html and 500.html is 200, which is not meaningful
					// so we create an override
					const override = { status };

					return this.#mergeResponses(response, originalResponse, override);
				}
			}
			const mod = await this.#pipeline.getModuleForRoute(errorRouteData);
			let session: AstroSession | undefined;
			try {
				const renderContext = await RenderContext.create({
					locals,
					pipeline: this.#pipeline,
					middleware: skipMiddleware ? NOOP_MIDDLEWARE_FN : undefined,
					pathname: this.#getPathnameFromRequest(request),
					request,
					routeData: errorRouteData,
					status,
					props: { error },
					clientAddress,
				});
				session = renderContext.session;
				const response = await renderContext.render(await mod.page());
				return this.#mergeResponses(response, originalResponse);
			} catch {
				// Middleware may be the cause of the error, so we try rendering 404/500.astro without it.
				if (skipMiddleware === false) {
					return this.#renderError(request, {
						locals,
						status,
						response: originalResponse,
						skipMiddleware: true,
						clientAddress,
					});
				}
			} finally {
				await session?.[PERSIST_SYMBOL]();
			}
		}

		const response = this.#mergeResponses(new Response(null, { status }), originalResponse);
		Reflect.set(response, responseSentSymbol, true);
		return response;
	}

	#mergeResponses(
		newResponse: Response,
		originalResponse?: Response,
		override?: { status: 404 | 500 },
	) {
		if (!originalResponse) {
			if (override !== undefined) {
				return new Response(newResponse.body, {
					status: override.status,
					statusText: newResponse.statusText,
					headers: newResponse.headers,
				});
			}
			return newResponse;
		}

		// If the new response did not have a meaningful status, an override may have been provided
		// If the original status was 200 (default), override it with the new status (probably 404 or 500)
		// Otherwise, the user set a specific status while rendering and we should respect that one
		const status = override?.status
			? override.status
			: originalResponse.status === 200
				? newResponse.status
				: originalResponse.status;

		try {
			// this function could throw an error...
			originalResponse.headers.delete('Content-type');
		} catch {}
		// we use a map to remove duplicates
		const mergedHeaders = new Map([
			...Array.from(newResponse.headers),
			...Array.from(originalResponse.headers),
		]);
		const newHeaders = new Headers();
		for (const [name, value] of mergedHeaders) {
			newHeaders.set(name, value);
		}
		return new Response(newResponse.body, {
			status,
			statusText: status === 200 ? newResponse.statusText : originalResponse.statusText,
			// If you're looking at here for possible bugs, it means that it's not a bug.
			// With the middleware, users can meddle with headers, and we should pass to the 404/500.
			// If users see something weird, it's because they are setting some headers they should not.
			//
			// Although, we don't want it to replace the content-type, because the error page must return `text/html`
			headers: newHeaders,
		});
	}

	#getDefaultStatusCode(routeData: RouteData, pathname: string): number {
		if (!routeData.pattern.test(pathname)) {
			for (const fallbackRoute of routeData.fallbackRoutes) {
				if (fallbackRoute.pattern.test(pathname)) {
					return 302;
				}
			}
		}
		const route = removeTrailingForwardSlash(routeData.route);
		if (route.endsWith('/404')) return 404;
		if (route.endsWith('/500')) return 500;
		return 200;
	}
}
