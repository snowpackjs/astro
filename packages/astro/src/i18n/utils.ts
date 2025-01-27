import type { AstroConfig, Locales } from '../types/public/config.js';
import { normalizeTheLocale, toCodes } from './index.js';

type BrowserLocale = {
	locale: string;
	qualityValue: number | undefined;
};

/**
 * Parses the value of the `Accept-Language` header:
 *
 * More info: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
 *
 * Complex example: `fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5`
 *
 */
export function parseLocale(header: string): BrowserLocale[] {
	// Any language, early return
	if (header === '*') {
		return [{ locale: header, qualityValue: undefined }];
	}
	const result: BrowserLocale[] = [];
	// we split by `,` and trim the white spaces
	const localeValues = header.split(',').map((str) => str.trim());

	for (const localeValue of localeValues) {
		// split the locale name from the quality value
		const split = localeValue.split(';').map((str) => str.trim());
		const localeName: string = split[0];
		const qualityValue: string | undefined = split[1];

		if (!split) {
			// invalid value
			continue;
		}

		// we check if the quality value is present, and it is actually `q=`
		if (qualityValue && qualityValue.startsWith('q=')) {
			const qualityValueAsFloat = Number.parseFloat(qualityValue.slice('q='.length));
			// The previous operation can return a `NaN`, so we check if it is a safe operation
			if (Number.isNaN(qualityValueAsFloat) || qualityValueAsFloat > 1) {
				result.push({
					locale: localeName,
					qualityValue: undefined,
				});
			} else {
				result.push({
					locale: localeName,
					qualityValue: qualityValueAsFloat,
				});
			}
		} else {
			result.push({
				locale: localeName,
				qualityValue: undefined,
			});
		}
	}

	return result;
}

function sortAndFilterLocales(browserLocaleList: BrowserLocale[], locales: Locales) {
	const normalizedLocales = toCodes(locales).map(normalizeTheLocale);
	return browserLocaleList
		.filter((browserLocale) => {
			if (browserLocale.locale !== '*') {
				return normalizedLocales.includes(normalizeTheLocale(browserLocale.locale));
			}
			return true;
		})
		.sort((a, b) => {
			if (a.qualityValue && b.qualityValue) {
				return Math.sign(b.qualityValue - a.qualityValue);
			}
			return 0;
		});
}

/**
 * Set the current locale by parsing the value passed from the `Accept-Header`.
 *
 * If multiple locales are present in the header, they are sorted by their quality value and the highest is selected as current locale.
 *
 */
export function computePreferredLocale(request: Request, locales: Locales): string | undefined {
	const acceptHeader = request.headers.get('Accept-Language');
	let result: string | undefined = undefined;
	if (acceptHeader) {
		const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);

		const firstResult = browserLocaleList.at(0);
		if (firstResult && firstResult.locale !== '*') {
			for (const currentLocale of locales) {
				if (typeof currentLocale === 'string') {
					if (normalizeTheLocale(currentLocale) === normalizeTheLocale(firstResult.locale)) {
						result = currentLocale;
					}
				} else {
					for (const currentCode of currentLocale.codes) {
						if (normalizeTheLocale(currentCode) === normalizeTheLocale(firstResult.locale)) {
							result = currentLocale.path;
						}
					}
				}
			}
		}
	}

	return result;
}

export function computePreferredLocaleList(request: Request, locales: Locales): string[] {
	const acceptHeader = request.headers.get('Accept-Language');
	let result: string[] = [];
	if (acceptHeader) {
		const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);

		// SAFETY: bang operator is safe because checked by the previous condition
		if (browserLocaleList.length === 1 && browserLocaleList.at(0)!.locale === '*') {
			return locales.map((locale) => {
				if (typeof locale === 'string') {
					return locale;
				} else {
					// SAFETY: codes is never empty
					return locale.codes.at(0)!;
				}
			});
		} else if (browserLocaleList.length > 0) {
			for (const browserLocale of browserLocaleList) {
				for (const loopLocale of locales) {
					if (typeof loopLocale === 'string') {
						if (normalizeTheLocale(loopLocale) === normalizeTheLocale(browserLocale.locale)) {
							result.push(loopLocale);
						}
					} else {
						for (const code of loopLocale.codes) {
							if (code === browserLocale.locale) {
								result.push(loopLocale.path);
							}
						}
					}
				}
			}
		}
	}

	return result;
}

export function computeCurrentLocale(
	pathname: string,
	locales: Locales,
	defaultLocale: string,
): string | undefined {
	for (const segment of pathname.split('/')) {
		for (const locale of locales) {
			if (typeof locale === 'string') {
				// we skip ta locale that isn't present in the current segment
				if (!segment.includes(locale)) continue;
				if (normalizeTheLocale(locale) === normalizeTheLocale(segment)) {
					return locale;
				}
			} else {
				if (locale.path === segment) {
					return locale.codes.at(0);
				} else {
					for (const code of locale.codes) {
						if (normalizeTheLocale(code) === normalizeTheLocale(segment)) {
							return code;
						}
					}
				}
			}
		}
	}
	// If we didn't exit, it's probably because we don't have any code/locale in the URL.
	// We use the default locale.
	for (const locale of locales) {
		if (typeof locale === 'string') {
			if (locale === defaultLocale) {
				return locale;
			}
		} else {
			if (locale.path === defaultLocale) {
				return locale.codes.at(0);
			}
		}
	}
}

export type RoutingStrategies =
	| 'manual'
	| 'pathname-prefix-always'
	| 'pathname-prefix-other-locales'
	| 'pathname-prefix-always-no-redirect'
	| 'domains-prefix-always'
	| 'domains-prefix-other-locales'
	| 'domains-prefix-always-no-redirect';
export function toRoutingStrategy(
	routing: NonNullable<AstroConfig['i18n']>['routing'],
	domains: NonNullable<AstroConfig['i18n']>['domains'],
) {
	let strategy: RoutingStrategies;
	const hasDomains = domains ? Object.keys(domains).length > 0 : false;
	if (routing === 'manual') {
		strategy = 'manual';
	} else {
		if (!hasDomains) {
			if (routing?.prefixDefaultLocale === true) {
				if (routing.redirectToDefaultLocale) {
					strategy = 'pathname-prefix-always';
				} else {
					strategy = 'pathname-prefix-always-no-redirect';
				}
			} else {
				strategy = 'pathname-prefix-other-locales';
			}
		} else {
			if (routing?.prefixDefaultLocale === true) {
				if (routing.redirectToDefaultLocale) {
					strategy = 'domains-prefix-always';
				} else {
					strategy = 'domains-prefix-always-no-redirect';
				}
			} else {
				strategy = 'domains-prefix-other-locales';
			}
		}
	}

	return strategy;
}

export function toFallbackType(
	routing: NonNullable<AstroConfig['i18n']>['routing'],
): 'redirect' | 'rewrite' {
	if (routing === 'manual') {
		return 'rewrite';
	}
	return routing.fallbackType;
}
