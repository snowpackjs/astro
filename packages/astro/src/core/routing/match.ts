import type { AstroConfig, ManifestData, RouteData } from '../../@types/astro.js';

/** Find matching route from pathname */
export function matchRoute(pathname: string, manifest: ManifestData): RouteData | undefined {
	return manifest.routes.find((route) => route.pattern.test(decodeURI(pathname)));
}

/** Finds all matching routes from pathname */
export function matchAllRoutes(pathname: string, manifest: ManifestData): RouteData[] {
	return manifest.routes.filter((route) => route.pattern.test(pathname));
}

/**
 * Given a pathname, the function attempts to retrieve the one that belongs to the `defaultLocale`.
 *
 * For example, given this configuration:
 *
 * ```js
 * {
 * 	defaultLocale: 'en',
 * 	locales: ['en', 'fr']
 * }
 * ```
 *
 * If we don't have the page `/fr/hello`, this function will attempt to match against `/en/hello`.
 */
export function matchDefaultLocaleRoutes(
	pathname: string,
	manifest: ManifestData,
	config: AstroConfig['experimental']['i18n']
): RouteData[] {
	const matchedRoutes: RouteData[] = [];
	// SAFETY: the function is called upon checkin if `experimental.i18n` exists first
	const defaultLocale = config!.defaultLocale;

	for (const route of manifest.routes) {
		// we don't need to check routes that don't belong to the default locale
		if (route.locale === defaultLocale) {
			// we check if the current route pathname contains `/en` somewhere
			if (route.pathname?.includes(`/${defaultLocale}`)) {
				let localeToReplace;
				// now we need to check if the locale inside `pathname` is actually one of the locales configured
				for (const locale of config!.locales) {
					if (pathname.includes(`/${locale}`)) {
						localeToReplace = locale;
						break;
					}
				}
				if (localeToReplace) {
					// we attempt the replace the locale found with the default locale, and now we could if matches the current `route`
					const maybePathname = pathname.replace(localeToReplace, defaultLocale);
					if (route.pattern.test(maybePathname)) {
						matchedRoutes.push(route);
					}
				}
			}
		}
	}

	return matchedRoutes;
}
