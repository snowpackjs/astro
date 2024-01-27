import type { AstroConfig, AstroIntegration } from 'astro';
import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EnumChangefreq, LinkItem as LinkItemBase, SitemapItemLoose } from 'sitemap';
import { SitemapAndIndexStream, SitemapStream, streamToPromise } from 'sitemap';
import { ZodError } from 'zod';

import { generateSitemap } from './generate-sitemap.js';
import { validateOptions } from './validate-options.js';
import { createWriteStream } from 'fs';
import { Readable } from 'node:stream';

export { EnumChangefreq as ChangeFreqEnum } from 'sitemap';
export type ChangeFreq = `${EnumChangefreq}`;
export type SitemapItem = Pick<
	SitemapItemLoose,
	'url' | 'lastmod' | 'changefreq' | 'priority' | 'links'
>;
export type LinkItem = LinkItemBase;

export type SitemapOptions =
	| {
			filter?(page: string): boolean;
			customPages?: string[];

			i18n?: {
				defaultLocale: string;
				locales: Record<string, string>;
			};
			// number of entries per sitemap file
			entryLimit?: number;

			// sitemap specific
			changefreq?: ChangeFreq;
			lastmod?: Date;
			priority?: number;

			prefix?: string;

			// called for each sitemap item just before to save them on disk, sync or async
			serialize?(item: SitemapItem): SitemapItem | Promise<SitemapItem | undefined> | undefined;
	  }
	| undefined;

function formatConfigErrorMessage(err: ZodError) {
	const errorList = err.issues.map((issue) => ` ${issue.path.join('.')}  ${issue.message + '.'}`);
	return errorList.join('\n');
}

const PKG_NAME = '@astrojs/sitemap';
const STATUS_CODE_PAGES = new Set(['404', '500']);

function isStatusCodePage(pathname: string): boolean {
	if (pathname.endsWith('/')) {
		pathname = pathname.slice(0, -1);
	}
	const end = pathname.split('/').pop() ?? '';
	return STATUS_CODE_PAGES.has(end);
}

const createPlugin = (options?: SitemapOptions): AstroIntegration => {
	let config: AstroConfig;

	return {
		name: PKG_NAME,

		hooks: {
			'astro:config:done': async ({ config: cfg }) => {
				config = cfg;
			},

			'astro:build:done': async ({ dir, routes, pages, logger }) => {
				try {
					if (!config.site) {
						logger.warn(
							'The Sitemap integration requires the `site` astro.config option. Skipping.'
						);
						return;
					}

					const opts = validateOptions(config.site, options);

					const { filter, customPages, serialize, entryLimit, prefix = 'sitemap-' } = opts;
					const OUTFILE = `${prefix}index.xml`;

					let finalSiteUrl: URL;
					if (config.site) {
						finalSiteUrl = new URL(config.base, config.site);
					} else {
						console.warn(
							'The Sitemap integration requires the `site` astro.config option. Skipping.'
						);
						return;
					}

					let pageUrls = pages
						.filter((p) => !isStatusCodePage(p.pathname))
						.map((p) => {
							if (p.pathname !== '' && !finalSiteUrl.pathname.endsWith('/'))
								finalSiteUrl.pathname += '/';
							const fullPath = finalSiteUrl.pathname + p.pathname;
							return new URL(fullPath, finalSiteUrl).href;
						});

					let routeUrls = routes.reduce<string[]>((urls, r) => {
						// Only expose pages, not endpoints or redirects
						if (r.type !== 'page') return urls;

						/**
						 * Dynamic URLs have entries with `undefined` pathnames
						 */
						if (r.pathname) {
							if (isStatusCodePage(r.pathname ?? r.route)) return urls;

							// `finalSiteUrl` may end with a trailing slash
							// or not because of base paths.
							let fullPath = finalSiteUrl.pathname;
							if (fullPath.endsWith('/')) fullPath += r.generate(r.pathname).substring(1);
							else fullPath += r.generate(r.pathname);

							let newUrl = new URL(fullPath, finalSiteUrl).href;

							if (config.trailingSlash === 'never') {
								urls.push(newUrl);
							} else if (config.build.format === 'directory' && !newUrl.endsWith('/')) {
								urls.push(newUrl + '/');
							} else {
								urls.push(newUrl);
							}
						}

						return urls;
					}, []);

					pageUrls = Array.from(new Set([...pageUrls, ...routeUrls, ...(customPages ?? [])]));

					try {
						if (filter) {
							pageUrls = pageUrls.filter(filter);
						}
					} catch (err) {
						logger.error(`Error filtering pages\n${(err as any).toString()}`);
						return;
					}

					if (pageUrls.length === 0) {
						logger.warn(`No pages found!\n\`${OUTFILE}\` not created.`);
						return;
					}

					let urlData = generateSitemap(pageUrls, finalSiteUrl.href, opts);

					if (serialize) {
						try {
							const serializedUrls: SitemapItem[] = [];
							for (const item of urlData) {
								const serialized = await Promise.resolve(serialize(item));
								if (serialized) {
									serializedUrls.push(serialized);
								}
							}
							if (serializedUrls.length === 0) {
								logger.warn('No pages found!');
								return;
							}
							urlData = serializedUrls;
						} catch (err) {
							logger.error(`Error serializing pages\n${(err as any).toString()}`);
							return;
						}
					}
					const destDir = fileURLToPath(dir);

					const sms = new SitemapAndIndexStream({
						limit: entryLimit,
						getSitemapStream: (i) => {
							const sitemapStream = new SitemapStream({ hostname: finalSiteUrl.href });
							const fileName = `${prefix}${i}.xml`;

							const ws = sitemapStream.pipe(createWriteStream(resolve(destDir + fileName)));

							return [new URL(fileName, finalSiteUrl.href).toString(), sitemapStream, ws];
						},
					});

					sms.pipe(createWriteStream(resolve(destDir + OUTFILE)));
					await streamToPromise(Readable.from(urlData).pipe(sms));
					sms.end();
					logger.info(`\`${OUTFILE}\` created at \`${path.relative(process.cwd(), destDir)}\``);
				} catch (err) {
					if (err instanceof ZodError) {
						logger.warn(formatConfigErrorMessage(err));
					} else {
						throw err;
					}
				}
			},
		},
	};
};

export default createPlugin;
