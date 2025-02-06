import type { EnumChangefreq } from 'sitemap';
import type { SitemapItem, SitemapOptions } from './index.js';
import { parseI18nUrl } from './utils/parse-i18n-url.js';

/** Construct sitemap.xml given a set of URLs */
export function generateSitemap(pages: string[], finalSiteUrl: string, opts?: SitemapOptions) {
	const { changefreq, priority, lastmod: lastmodSrc, i18n } = opts ?? {};
	// TODO: find way to respect <link rel="canonical"> URLs here
	const urls = [...pages];
	urls.sort((a, b) => a.localeCompare(b, 'en', { numeric: true })); // sort alphabetically so sitemap is same each time

	const lastmod = lastmodSrc?.toISOString();

	// Parse URLs for i18n matching later
	const { defaultLocale, locales } = i18n ?? {};
	let getI18nLinks: GetI18nLinks | undefined;
	if (defaultLocale && locales) {
		getI18nLinks = createGetI18nLinks(urls, defaultLocale, locales, finalSiteUrl);
	}

	const urlData: SitemapItem[] = urls.map((url, i) => ({
		url,
		links: getI18nLinks?.(i),
		lastmod,
		priority,
		changefreq: changefreq as EnumChangefreq,
	}));

	return urlData;
}

type GetI18nLinks = (urlIndex: number) => SitemapItem['links'] | undefined;

function createGetI18nLinks(
	urls: string[],
	defaultLocale: string,
	locales: Record<string, string>,
	finalSiteUrl: string,
): GetI18nLinks {
	// `parsedI18nUrls` will have the same length as `urls`, matching correspondingly
	const parsedI18nUrls = urls.map((url) => parseI18nUrl(url, defaultLocale, locales, finalSiteUrl));
	// Cache as multiple i18n URLs with the same path will have the same links
	const i18nPathToLinksCache = new Map<string, SitemapItem['links']>();

	return (urlIndex) => {
		const i18nUrl = parsedI18nUrls[urlIndex];
		if (!i18nUrl) {
			return undefined;
		}

		const cached = i18nPathToLinksCache.get(i18nUrl.path);
		if (cached) {
			return cached;
		}

		// Find all URLs with the same path (without the locale part), e.g. /en/foo and /es/foo
		const links: NonNullable<SitemapItem['links']> = [];
		for (let i = 0; i < parsedI18nUrls.length; i++) {
			const parsed = parsedI18nUrls[i];
			if (parsed?.path === i18nUrl.path) {
				links.push({
					url: urls[i],
					lang: locales[parsed.locale],
				});
			}
		}

		// If 0 or 1 (which is itself), return undefined to not create any links.
		// We also don't need to cache this as we know there's no other URLs that would've match this.
		if (links.length <= 1) {
			return undefined;
		}

		i18nPathToLinksCache.set(i18nUrl.path, links);
		return links;
	};
}
