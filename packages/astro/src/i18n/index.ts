import { appendForwardSlash, joinPaths } from '@astrojs/internal-helpers/path';
import type { SSRManifest } from '../core/app/types.js';
import { shouldAppendForwardSlash } from '../core/build/util.js';
import { REROUTE_DIRECTIVE_HEADER } from '../core/constants.js';
import { MissingLocale, i18nNoLocaleFoundInPath } from '../core/errors/errors-data.js';
import { AstroError } from '../core/errors/index.js';
import type { AstroConfig, Locales, ValidRedirectStatus } from '../types/public/config.js';
import type { APIContext } from '../types/public/context.js';
import { createI18nMiddleware } from './middleware.js';
import type { RoutingStrategies } from './utils.js';

export function requestHasLocale(locales: Locales) {
	return function (context: APIContext): boolean {
		return pathHasLocale(context.url.pathname, locales);
	};
}

// Checks if the pathname has any locale
export function pathHasLocale(path: string, locales: Locales): boolean {
	const segments = path.split('/');
	for (const segment of segments) {
		for (const locale of locales) {
			if (typeof locale === 'string') {
				if (normalizeTheLocale(segment) === normalizeTheLocale(locale)) {
					return true;
				}
			} else if (segment === locale.path) {
				return true;
			}
		}
	}

	return false;
}

type GetLocaleRelativeUrl = GetLocaleOptions & {
	locale: string;
	base: string;
	locales: Locales;
	trailingSlash: AstroConfig['trailingSlash'];
	format: AstroConfig['build']['format'];
	strategy?: RoutingStrategies;
	defaultLocale: string;
	domains: Record<string, string> | undefined;
	path?: string;
};

export type GetLocaleOptions = {
	/**
	 * Makes the locale URL-friendly by replacing underscores with dashes, and converting the locale to lower case.
	 * @default true
	 */
	normalizeLocale?: boolean;
	/**
	 *  An optional path to prepend to `locale`.
	 */
	prependWith?: string;
};

type GetLocaleAbsoluteUrl = GetLocaleRelativeUrl & {
	site: AstroConfig['site'];
	isBuild: boolean;
};

/**
 * The base URL
 */
export function getLocaleRelativeUrl({
	locale,
	base,
	locales: _locales,
	trailingSlash,
	format,
	path,
	prependWith,
	normalizeLocale = true,
	strategy = 'pathname-prefix-other-locales',
	defaultLocale,
}: GetLocaleRelativeUrl) {
	const codeToUse = peekCodePathToUse(_locales, locale);
	if (!codeToUse) {
		throw new AstroError({
			...MissingLocale,
			message: MissingLocale.message(locale),
		});
	}
	const pathsToJoin = [base, prependWith];
	const normalizedLocale = normalizeLocale ? normalizeTheLocale(codeToUse) : codeToUse;
	if (
		strategy === 'pathname-prefix-always' ||
		strategy === 'pathname-prefix-always-no-redirect' ||
		strategy === 'domains-prefix-always' ||
		strategy === 'domains-prefix-always-no-redirect'
	) {
		pathsToJoin.push(normalizedLocale);
	} else if (locale !== defaultLocale) {
		pathsToJoin.push(normalizedLocale);
	}
	pathsToJoin.push(path);

	let relativePath: string;
	if (shouldAppendForwardSlash(trailingSlash, format)) {
		relativePath = appendForwardSlash(joinPaths(...pathsToJoin));
	} else {
		relativePath = joinPaths(...pathsToJoin);
	}

	if (relativePath === '') {
		return '/';
	}
	return relativePath;
}

/**
 * The absolute URL
 */
export function getLocaleAbsoluteUrl({ site, isBuild, ...rest }: GetLocaleAbsoluteUrl) {
	const localeUrl = getLocaleRelativeUrl(rest);
	const { domains, locale } = rest;
	let url;
	if (isBuild && domains && domains[locale]) {
		const base = domains[locale];
		url = joinPaths(base, localeUrl.replace(`/${rest.locale}`, ''));
	} else {
		if (localeUrl === '/') {
			url = site || '/';
		} else if (site) {
			url = joinPaths(site, localeUrl);
		} else {
			url = localeUrl;
		}
	}

	if (shouldAppendForwardSlash(rest.trailingSlash, rest.format)) {
		return appendForwardSlash(url);
	} else {
		return url;
	}
}

interface GetLocalesRelativeUrlList extends GetLocaleOptions {
	base: string;
	path?: string;
	locales: Locales;
	trailingSlash: AstroConfig['trailingSlash'];
	format: AstroConfig['build']['format'];
	strategy?: RoutingStrategies;
	defaultLocale: string;
	domains: Record<string, string> | undefined;
}

export function getLocaleRelativeUrlList({
	locales: _locales,
	...rest
}: GetLocalesRelativeUrlList) {
	const locales = toPaths(_locales);
	return locales.map((locale) => {
		return getLocaleRelativeUrl({ ...rest, locales, locale });
	});
}

interface GetLocalesAbsoluteUrlList extends GetLocalesRelativeUrlList {
	site: AstroConfig['site'];
	isBuild: boolean;
}

export function getLocaleAbsoluteUrlList(params: GetLocalesAbsoluteUrlList) {
	const locales = toCodes(params.locales);
	return locales.map((currentLocale) => {
		return getLocaleAbsoluteUrl({ ...params, locale: currentLocale });
	});
}

/**
 * Given a locale (code), it returns its corresponding path
 * @param locale
 * @param locales
 */
export function getPathByLocale(locale: string, locales: Locales): string {
	for (const loopLocale of locales) {
		if (typeof loopLocale === 'string') {
			if (loopLocale === locale) {
				return loopLocale;
			}
		} else {
			for (const code of loopLocale.codes) {
				if (code === locale) {
					return loopLocale.path;
				}
			}
		}
	}
	throw new AstroError(i18nNoLocaleFoundInPath);
}

/**
 * A utility function that retrieves the preferred locale that correspond to a path.
 *
 * @param path
 * @param locales
 */
export function getLocaleByPath(path: string, locales: Locales): string {
	for (const locale of locales) {
		if (typeof locale !== 'string') {
			if (locale.path === path) {
				// the first code is the one that user usually wants
				const code = locale.codes.at(0);
				if (code === undefined) throw new AstroError(i18nNoLocaleFoundInPath);
				return code;
			}
		} else if (locale === path) {
			return locale;
		}
	}
	throw new AstroError(i18nNoLocaleFoundInPath);
}

/**
 *
 * Given a locale, this function:
 * - replaces the `_` with a `-`;
 * - transforms all letters to be lower case;
 */
export function normalizeTheLocale(locale: string): string {
	return locale.replaceAll('_', '-').toLowerCase();
}

/**
 * Returns an array of only locales, by picking the `code`
 * @param locales
 */
export function toCodes(locales: Locales): string[] {
	return locales.map((loopLocale) => {
		if (typeof loopLocale === 'string') {
			return loopLocale;
		} else {
			return loopLocale.codes[0];
		}
	});
}

/**
 * It returns the array of paths
 * @param locales
 */
export function toPaths(locales: Locales): string[] {
	return locales.map((loopLocale) => {
		if (typeof loopLocale === 'string') {
			return loopLocale;
		} else {
			return loopLocale.path;
		}
	});
}

function peekCodePathToUse(locales: Locales, locale: string): undefined | string {
	for (const loopLocale of locales) {
		if (typeof loopLocale === 'string') {
			if (loopLocale === locale) {
				return loopLocale;
			}
		} else {
			for (const code of loopLocale.codes) {
				if (code === locale) {
					return loopLocale.path;
				}
			}
		}
	}

	return undefined;
}

export type MiddlewarePayload = {
	base: string;
	locales: Locales;
	trailingSlash: AstroConfig['trailingSlash'];
	format: AstroConfig['build']['format'];
	strategy: RoutingStrategies;
	defaultLocale: string;
	domains: Record<string, string> | undefined;
	fallback: Record<string, string> | undefined;
	fallbackType: 'redirect' | 'rewrite';
};

// NOTE: public function exported to the users via `astro:i18n` module
export function redirectToDefaultLocale({
	trailingSlash,
	format,
	base,
	defaultLocale,
}: MiddlewarePayload) {
	return function (context: APIContext, statusCode?: ValidRedirectStatus) {
		if (shouldAppendForwardSlash(trailingSlash, format)) {
			return context.redirect(`${appendForwardSlash(joinPaths(base, defaultLocale))}`, statusCode);
		} else {
			return context.redirect(`${joinPaths(base, defaultLocale)}`, statusCode);
		}
	};
}

// NOTE: public function exported to the users via `astro:i18n` module
export function notFound({ base, locales, fallback }: MiddlewarePayload) {
	return function (context: APIContext, response?: Response): Response | undefined {
		if (
			response?.headers.get(REROUTE_DIRECTIVE_HEADER) === 'no' &&
			typeof fallback === 'undefined'
		) {
			return response;
		}

		const url = context.url;
		// We return a 404 if:
		// - the current path isn't a root. e.g. / or /<base>
		// - the URL doesn't contain a locale
		const isRoot = url.pathname === base + '/' || url.pathname === base;
		if (!(isRoot || pathHasLocale(url.pathname, locales))) {
			if (response) {
				response.headers.set(REROUTE_DIRECTIVE_HEADER, 'no');
				return new Response(response.body, {
					status: 404,
					headers: response.headers,
				});
			} else {
				return new Response(null, {
					status: 404,
					headers: {
						[REROUTE_DIRECTIVE_HEADER]: 'no',
					},
				});
			}
		}

		return undefined;
	};
}

// NOTE: public function exported to the users via `astro:i18n` module
export type RedirectToFallback = (context: APIContext, response: Response) => Promise<Response>;

export function redirectToFallback({
	fallback,
	locales,
	defaultLocale,
	strategy,
	base,
	fallbackType,
}: MiddlewarePayload) {
	return async function (context: APIContext, response: Response): Promise<Response> {
		if (response.status >= 300 && fallback) {
			const fallbackKeys = fallback ? Object.keys(fallback) : [];
			// we split the URL using the `/`, and then check in the returned array we have the locale
			const segments = context.url.pathname.split('/');
			const urlLocale = segments.find((segment) => {
				for (const locale of locales) {
					if (typeof locale === 'string') {
						if (locale === segment) {
							return true;
						}
					} else if (locale.path === segment) {
						return true;
					}
				}
				return false;
			});

			if (urlLocale && fallbackKeys.includes(urlLocale)) {
				const fallbackLocale = fallback[urlLocale];
				// the user might have configured the locale using the granular locales, so we want to retrieve its corresponding path instead
				const pathFallbackLocale = getPathByLocale(fallbackLocale, locales);
				let newPathname: string;
				// If a locale falls back to the default locale, we want to **remove** the locale because
				// the default locale doesn't have a prefix
				if (pathFallbackLocale === defaultLocale && strategy === 'pathname-prefix-other-locales') {
					if (context.url.pathname.includes(`${base}`)) {
						newPathname = context.url.pathname.replace(`/${urlLocale}`, ``);
					} else {
						newPathname = context.url.pathname.replace(`/${urlLocale}`, `/`);
					}
				} else {
					newPathname = context.url.pathname.replace(`/${urlLocale}`, `/${pathFallbackLocale}`);
				}

				if (fallbackType === 'rewrite') {
					return await context.rewrite(newPathname + context.url.search);
				} else {
					return context.redirect(newPathname + context.url.search);
				}
			}
		}
		return response;
	};
}

// NOTE: public function exported to the users via `astro:i18n` module
export function createMiddleware(
	i18nManifest: SSRManifest['i18n'],
	base: SSRManifest['base'],
	trailingSlash: SSRManifest['trailingSlash'],
	format: SSRManifest['buildFormat'],
) {
	return createI18nMiddleware(i18nManifest, base, trailingSlash, format);
}
