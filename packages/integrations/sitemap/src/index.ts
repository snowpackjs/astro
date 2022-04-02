import fs from 'node:fs';
import type { AstroConfig, AstroIntegration } from 'astro';
const STATUS_CODE_PAGE_REGEXP = /\/[0-9]{3}\/?$/;

type SitemapOptions =
	| {
			/**
			 * All pages are included in your sitemap by default.
			 * With this config option, you can filter included pages by URL.
			 *
			 * The `page` function parameter is the full URL of your rendered page, including your `site` domain.
			 * Return `true` to include a page in your sitemap, and `false` to remove it.
			 *
			 * ```js
			 * filter: (page) => page !== 'http://example.com/secret-page'
			 * ```
			 */
			filter?(page: string): string;

			/**
			 * If present, we use the `site` config option as the base for all sitemap URLs
			 * Use `canonicalURL` to override this
			 */
			canonicalURL?: string;
	  }
	| undefined;

/** Construct sitemap.xml given a set of URLs */
function generateSitemap(pages: string[]) {
	// TODO: find way to respect <link rel="canonical"> URLs here
	const urls = [...pages].filter((url) => !STATUS_CODE_PAGE_REGEXP.test(url));
	urls.sort((a, b) => a.localeCompare(b, 'en', { numeric: true })); // sort alphabetically so sitemap is same each time
	let sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
	for (const url of urls) {
		sitemap += `<url><loc>${url}</loc></url>`;
	}
	sitemap += `</urlset>\n`;
	return sitemap;
}

export default function createPlugin({ filter, canonicalURL }: SitemapOptions = {}): AstroIntegration {
	let config: AstroConfig;
	return {
		name: '@astrojs/sitemap',
		hooks: {
			'astro:config:done': async ({ config: _config }) => {
				config = _config;
			},
			'astro:build:done': async ({ pages, dir }) => {
				const finalSiteUrl = canonicalURL || config.buildOptions.site;
				if (!finalSiteUrl) {
					console.warn('The Sitemap integration requires either the `site` config option or `canonicalURL` integration option to work. Skipping.');
					return;
				}
				let pageUrls = pages.map((p) => new URL(p.pathname, finalSiteUrl).href);
				if (filter) {
					pageUrls.filter((page: string) => filter(page));
				}
				const sitemapContent = generateSitemap(pageUrls);
				fs.writeFileSync(new URL('sitemap.xml', dir), sitemapContent);
			},
		},
	};
}
