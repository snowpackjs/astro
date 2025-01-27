import type { SSRManifest } from '../core/app/types.js';
import { IncorrectStrategyForI18n } from '../core/errors/errors-data.js';
import { AstroError } from '../core/errors/index.js';
import * as I18nInternals from '../i18n/index.js';
import type { RedirectToFallback } from '../i18n/index.js';
import { toFallbackType, toRoutingStrategy } from '../i18n/utils.js';
import type { I18nInternalConfig } from '../i18n/vite-plugin-i18n.js';
import type { MiddlewareHandler } from '../types/public/common.js';
import type { AstroConfig, ValidRedirectStatus } from '../types/public/config.js';
import type { APIContext } from '../types/public/context.js';

export { normalizeTheLocale, toCodes, toPaths } from '../i18n/index.js';

const { trailingSlash, format, site, i18n, isBuild } =
	// @ts-expect-error
	__ASTRO_INTERNAL_I18N_CONFIG__ as I18nInternalConfig;
const { defaultLocale, locales, domains, fallback, routing } = i18n!;
const base = import.meta.env.BASE_URL;

let strategy = toRoutingStrategy(routing, domains);
let fallbackType = toFallbackType(routing);

export type GetLocaleOptions = I18nInternals.GetLocaleOptions;

const noop = (method: string) =>
	function () {
		throw new AstroError({
			...IncorrectStrategyForI18n,
			message: IncorrectStrategyForI18n.message(method),
		});
	};

/**
 * @param locale A locale
 * @param path An optional path to add after the `locale`.
 * @param options Customise the generated path
 *
 * Returns a _relative_ path with passed locale.
 *
 * ## Errors
 *
 * Throws an error if the locale doesn't exist in the list of locales defined in the configuration.
 *
 * ## Examples
 *
 * ```js
 * import { getRelativeLocaleUrl } from "astro:i18n";
 * getRelativeLocaleUrl("es"); // /es
 * getRelativeLocaleUrl("es", "getting-started"); // /es/getting-started
 * getRelativeLocaleUrl("es_US", "getting-started", { prependWith: "blog" }); // /blog/es-us/getting-started
 * getRelativeLocaleUrl("es_US", "getting-started", { prependWith: "blog", normalizeLocale: false }); // /blog/es_US/getting-started
 * ```
 */
export const getRelativeLocaleUrl = (locale: string, path?: string, options?: GetLocaleOptions) =>
	I18nInternals.getLocaleRelativeUrl({
		locale,
		path,
		base,
		trailingSlash,
		format,
		defaultLocale,
		locales,
		strategy,
		domains,
		...options,
	});

/**
 *
 * @param locale A locale
 * @param path An optional path to add after the `locale`.
 * @param options Customise the generated path
 *
 * Returns an absolute path with the passed locale. The behaviour is subject to change based on `site` configuration.
 * If _not_ provided, the function will return a _relative_ URL.
 *
 * ## Errors
 *
 * Throws an error if the locale doesn't exist in the list of locales defined in the configuration.
 *
 * ## Examples
 *
 * If `site` is `https://example.com`:
 *
 * ```js
 * import { getAbsoluteLocaleUrl } from "astro:i18n";
 * getAbsoluteLocaleUrl("es"); // https://example.com/es
 * getAbsoluteLocaleUrl("es", "getting-started"); // https://example.com/es/getting-started
 * getAbsoluteLocaleUrl("es_US", "getting-started", { prependWith: "blog" }); // https://example.com/blog/es-us/getting-started
 * getAbsoluteLocaleUrl("es_US", "getting-started", { prependWith: "blog", normalizeLocale: false }); // https://example.com/blog/es_US/getting-started
 * ```
 */
export const getAbsoluteLocaleUrl = (locale: string, path?: string, options?: GetLocaleOptions) =>
	I18nInternals.getLocaleAbsoluteUrl({
		locale,
		path,
		base,
		trailingSlash,
		format,
		site,
		defaultLocale,
		locales,
		strategy,
		domains,
		isBuild,
		...options,
	});

/**
 * @param path An optional path to add after the `locale`.
 * @param options Customise the generated path
 *
 * Works like `getRelativeLocaleUrl` but it emits the relative URLs for ALL locales:
 */
export const getRelativeLocaleUrlList = (path?: string, options?: GetLocaleOptions) =>
	I18nInternals.getLocaleRelativeUrlList({
		base,
		path,
		trailingSlash,
		format,
		defaultLocale,
		locales,
		strategy,
		domains,
		...options,
	});

/**
 * @param path An optional path to add after the `locale`.
 * @param options Customise the generated path
 *
 * Works like `getAbsoluteLocaleUrl` but it emits the absolute URLs for ALL locales:
 */
export const getAbsoluteLocaleUrlList = (path?: string, options?: GetLocaleOptions) =>
	I18nInternals.getLocaleAbsoluteUrlList({
		site,
		base,
		path,
		trailingSlash,
		format,
		defaultLocale,
		locales,
		strategy,
		domains,
		isBuild,
		...options,
	});

/**
 * A function that return the `path` associated to a locale (defined as code). It's particularly useful in case you decide
 * to use locales that are broken down in paths and codes.
 *
 * @param locale The code of the locale
 * @returns The path associated to the locale
 *
 * ## Example
 *
 * ```js
 * // astro.config.mjs
 *
 * export default defineConfig({
 * 	i18n: {
 * 		locales: [
 * 			{ codes: ["it", "it-VT"], path: "italiano" },
 * 			"es"
 * 		]
 * 	}
 * })
 * ```
 *
 * ```js
 * import { getPathByLocale } from "astro:i18n";
 * getPathByLocale("it"); // returns "italiano"
 * getPathByLocale("it-VT"); // returns "italiano"
 * getPathByLocale("es"); // returns "es"
 * ```
 */
export const getPathByLocale = (locale: string) => I18nInternals.getPathByLocale(locale, locales);

/**
 * A function that returns the preferred locale given a certain path. This is particularly useful if you configure a locale using
 * `path` and `codes`. When you define multiple `code`, this function will return the first code of the array.
 *
 * Astro will treat the first code as the one that the user prefers.
 *
 * @param path The path that maps to a locale
 * @returns The path associated to the locale
 *
 * ## Example
 *
 * ```js
 * // astro.config.mjs
 *
 * export default defineConfig({
 * 	i18n: {
 * 		locales: [
 * 			{ codes: ["it-VT", "it"], path: "italiano" },
 * 			"es"
 * 		]
 * 	}
 * })
 * ```
 *
 * ```js
 * import { getLocaleByPath } from "astro:i18n";
 * getLocaleByPath("italiano"); // returns "it-VT" because that's the first code configured
 * getLocaleByPath("es"); // returns "es"
 * ```
 */
export const getLocaleByPath = (path: string) => I18nInternals.getLocaleByPath(path, locales);

/**
 * A function that can be used to check if the current path contains a configured locale.
 *
 * @param path The path that maps to a locale
 * @returns Whether the `path` has the locale
 *
 * ## Example
 *
 * Given the following configuration:
 *
 * ```js
 * // astro.config.mjs
 *
 * export default defineConfig({
 * 	i18n: {
 * 		locales: [
 * 			{ codes: ["it-VT", "it"], path: "italiano" },
 * 			"es"
 * 		]
 * 	}
 * })
 * ```
 *
 * Here's some use cases:
 *
 * ```js
 * import { pathHasLocale } from "astro:i18n";
 * getLocaleByPath("italiano"); // returns `true`
 * getLocaleByPath("es"); // returns `true`
 * getLocaleByPath("it-VT"); // returns `false`
 * ```
 */
export const pathHasLocale = (path: string) => I18nInternals.pathHasLocale(path, locales);

/**
 *
 * This function returns a redirect to the default locale configured in the
 *
 * @param {APIContext} context The context passed to the middleware
 * @param {ValidRedirectStatus?} statusCode An optional status code for the redirect.
 */
export let redirectToDefaultLocale: (
	context: APIContext,
	statusCode?: ValidRedirectStatus,
) => Response | undefined;

if (i18n?.routing === 'manual') {
	redirectToDefaultLocale = I18nInternals.redirectToDefaultLocale({
		base,
		trailingSlash,
		format,
		defaultLocale,
		locales,
		strategy,
		domains,
		fallback,
		fallbackType,
	});
} else {
	redirectToDefaultLocale = noop('redirectToDefaultLocale');
}
/**
 *
 * Use this function to return a 404 when:
 * - the current path isn't a root. e.g. / or /<base>
 * - the URL doesn't contain a locale
 *
 * When a `Response` is passed, the new `Response` emitted by this function will contain the same headers of the original response.
 *
 * @param {APIContext} context The context passed to the middleware
 * @param {Response?} response An optional `Response` in case you're handling a `Response` coming from the `next` function.
 *
 */
export let notFound: (context: APIContext, response?: Response) => Response | undefined;

if (i18n?.routing === 'manual') {
	notFound = I18nInternals.notFound({
		base,
		trailingSlash,
		format,
		defaultLocale,
		locales,
		strategy,
		domains,
		fallback,
		fallbackType,
	});
} else {
	notFound = noop('notFound');
}

/**
 * Checks whether the current URL contains a configured locale. Internally, this function will use `APIContext#url.pathname`
 *
 * @param {APIContext} context The context passed to the middleware
 */
export let requestHasLocale: (context: APIContext) => boolean;

if (i18n?.routing === 'manual') {
	requestHasLocale = I18nInternals.requestHasLocale(locales);
} else {
	requestHasLocale = noop('requestHasLocale');
}

/**
 * Allows to use the build-in fallback system of Astro
 *
 * @param {APIContext} context The context passed to the middleware
 * @param {Promise<Response>} response An optional `Response` in case you're handling a `Response` coming from the `next` function.
 */
export let redirectToFallback: RedirectToFallback;

if (i18n?.routing === 'manual') {
	redirectToFallback = I18nInternals.redirectToFallback({
		base,
		trailingSlash,
		format,
		defaultLocale,
		locales,
		strategy,
		domains,
		fallback,
		fallbackType,
	});
} else {
	redirectToFallback = noop('useFallback');
}

type OnlyObject<T> = T extends object ? T : never;
type NewAstroRoutingConfigWithoutManual = OnlyObject<NonNullable<AstroConfig['i18n']>['routing']>;

/**
 * @param {AstroConfig['i18n']['routing']} customOptions
 *
 * A function that allows to programmatically create the Astro i18n middleware.
 *
 * This is use useful when you still want to use the default i18n logic, but add only few exceptions to your website.
 *
 * ## Examples
 *
 * ```js
 * // middleware.js
 * import { middleware } from "astro:i18n";
 * import { sequence, defineMiddleware } from "astro:middleware";
 *
 * const customLogic = defineMiddleware(async (context, next) => {
 *   const response = await next();
 *
 *   // Custom logic after resolving the response.
 *   // It's possible to catch the response coming from Astro i18n middleware.
 *
 *   return response;
 * });
 *
 * export const onRequest = sequence(customLogic, middleware({
 * 	prefixDefaultLocale: true,
 * 	redirectToDefaultLocale: false
 * }))
 *
 * ```
 */
export let middleware: (customOptions: NewAstroRoutingConfigWithoutManual) => MiddlewareHandler;

if (i18n?.routing === 'manual') {
	middleware = (customOptions: NewAstroRoutingConfigWithoutManual) => {
		strategy = toRoutingStrategy(customOptions, {});
		fallbackType = toFallbackType(customOptions);
		const manifest: SSRManifest['i18n'] = {
			...i18n,
			strategy,
			domainLookupTable: {},
			fallbackType,
			fallback: i18n.fallback,
		};
		return I18nInternals.createMiddleware(manifest, base, trailingSlash, format);
	};
} else {
	middleware = noop('middleware');
}
