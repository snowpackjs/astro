import type { SSRManifest, SSRManifestI18n } from '../core/app/types.js';
import { REROUTE_DIRECTIVE_HEADER, ROUTE_TYPE_HEADER } from '../core/constants.js';
import { isRequestServerIsland, requestIs404Or500 } from '../core/routing/match.js';
import type { MiddlewareHandler } from '../types/public/common.js';
import type { APIContext } from '../types/public/context.js';
import {
	type MiddlewarePayload,
	normalizeTheLocale,
	notFound,
	redirectToDefaultLocale,
	redirectToFallback,
	requestHasLocale,
} from './index.js';

export function createI18nMiddleware(
	i18n: SSRManifest['i18n'],
	base: SSRManifest['base'],
	trailingSlash: SSRManifest['trailingSlash'],
	format: SSRManifest['buildFormat'],
): MiddlewareHandler {
	if (!i18n) return (_, next) => next();
	const payload: MiddlewarePayload = {
		...i18n,
		trailingSlash,
		base,
		format,
		domains: {},
	};
	const _redirectToDefaultLocale = redirectToDefaultLocale(payload);
	const _noFoundForNonLocaleRoute = notFound(payload);
	const _requestHasLocale = requestHasLocale(payload.locales);
	const _redirectToFallback = redirectToFallback(payload);

	const prefixAlways = (context: APIContext, response: Response): Response | undefined => {
		const url = context.url;
		if (url.pathname === base + '/' || url.pathname === base) {
			return _redirectToDefaultLocale(context);
		}

		// Astro can't know where the default locale is supposed to be, so it returns a 404.
		else if (!_requestHasLocale(context)) {
			return _noFoundForNonLocaleRoute(context, response);
		}

		return undefined;
	};

	const prefixOtherLocales = (context: APIContext, response: Response): Response | undefined => {
		let pathnameContainsDefaultLocale = false;
		const url = context.url;
		for (const segment of url.pathname.split('/')) {
			if (normalizeTheLocale(segment) === normalizeTheLocale(i18n.defaultLocale)) {
				pathnameContainsDefaultLocale = true;
				break;
			}
		}
		if (pathnameContainsDefaultLocale) {
			const newLocation = url.pathname.replace(`/${i18n.defaultLocale}`, '');
			response.headers.set('Location', newLocation);
			return _noFoundForNonLocaleRoute(context);
		}

		return undefined;
	};

	return async (context, next) => {
		const response = await next();
		const type = response.headers.get(ROUTE_TYPE_HEADER);

		// This is case where we are internally rendering a 404/500, so we need to bypass checks that were done already
		const isReroute = response.headers.get(REROUTE_DIRECTIVE_HEADER);
		if (isReroute === 'no' && typeof i18n.fallback === 'undefined') {
			return response;
		}
		// If the route we're processing is not a page, then we ignore it
		if (type !== 'page' && type !== 'fallback') {
			return response;
		}

		// 404 and 500 are **known** routes (users can have their custom pages), so we need to let them be
		if (requestIs404Or500(context.request, base)) {
			return response;
		}

		// This is a case where the rendering phase belongs to a server island. Server island are
		// special routes, and should be exhempt from i18n routing
		if (isRequestServerIsland(context.request, base)) {
			return response;
		}

		const { currentLocale } = context;
		switch (i18n.strategy) {
			// NOTE: theoretically, we should never hit this code path
			case 'manual': {
				return response;
			}
			case 'domains-prefix-other-locales': {
				if (localeHasntDomain(i18n, currentLocale)) {
					const result = prefixOtherLocales(context, response);
					if (result) {
						return result;
					}
				}
				break;
			}
			case 'pathname-prefix-other-locales': {
				const result = prefixOtherLocales(context, response);
				if (result) {
					return result;
				}
				break;
			}

			case 'domains-prefix-always-no-redirect': {
				if (localeHasntDomain(i18n, currentLocale)) {
					const result = _noFoundForNonLocaleRoute(context, response);
					if (result) {
						return result;
					}
				}
				break;
			}

			case 'pathname-prefix-always-no-redirect': {
				const result = _noFoundForNonLocaleRoute(context, response);
				if (result) {
					return result;
				}
				break;
			}

			case 'pathname-prefix-always': {
				const result = prefixAlways(context, response);
				if (result) {
					return result;
				}
				break;
			}
			case 'domains-prefix-always': {
				if (localeHasntDomain(i18n, currentLocale)) {
					const result = prefixAlways(context, response);
					if (result) {
						return result;
					}
				}
				break;
			}
		}

		return _redirectToFallback(context, response);
	};
}

/**
 * Checks if the current locale doesn't belong to a configured domain
 * @param i18n
 * @param currentLocale
 */
function localeHasntDomain(i18n: SSRManifestI18n, currentLocale: string | undefined) {
	for (const domainLocale of Object.values(i18n.domainLookupTable)) {
		if (domainLocale === currentLocale) {
			return false;
		}
	}
	return true;
}
