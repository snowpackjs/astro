import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroConfig, AstroIntegration } from 'astro';
import type { EnumChangefreq, LinkItem as LinkItemBase, SitemapItemLoose } from 'sitemap';
import { ZodError } from 'zod';

import { generateSitemap } from './generate-sitemap.js';
import { validateOptions } from './validate-options.js';
import { writeSitemap } from './write-sitemap.js';

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

			// called for each sitemap item just before to save them on disk, sync or async
			serialize?(item: SitemapItem): SitemapItem | Promise<SitemapItem | undefined> | undefined;

			xslURL?: string;
	  }
	| undefined;

function formatConfigErrorMessage(err: ZodError) {
	const errorList = err.issues.map((issue) => ` ${issue.path.join('.')}  ${issue.message + '.'}`);
	return errorList.join('\n');
}

const PKG_NAME = '@astrojs/sitemap';
const OUTFILE = 'sitemap-index.xml';
const STATUS_CODE_PAGES = new Set(['404', '500']);

const isStatusCodePage = (locales: string[]) => {
	const statusPathNames = new Set(
		locales
			.flatMap((locale) => [...STATUS_CODE_PAGES].map((page) => `${locale}/${page}`))
			.concat([...STATUS_CODE_PAGES]),
	);

	return (pathname: string): boolean => {
		if (pathname.endsWith('/')) {
			pathname = pathname.slice(0, -1);
		}
		if (pathname.startsWith('/')) {
			pathname = pathname.slice(1);
		}
		return statusPathNames.has(pathname);
	};
};
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
							'The Sitemap integration requires the `site` astro.config option. Skipping.',
						);
						return;
					}

					const opts = validateOptions(config.site, options);

					const { filter, customPages, serialize, entryLimit } = opts;

					const finalSiteUrl = new URL(config.base, config.site);
					const shouldIgnoreStatus = isStatusCodePage(Object.keys(opts.i18n?.locales ?? {}));
					let pageUrls = pages
						.filter((p) => !shouldIgnoreStatus(p.pathname))
						.map((p) => {
							if (p.pathname !== '' && !finalSiteUrl.pathname.endsWith('/'))
								finalSiteUrl.pathname += '/';
							if (p.pathname.startsWith('/')) p.pathname = p.pathname.slice(1);
							const fullPath = finalSiteUrl.pathname + p.pathname;
							return new URL(fullPath, finalSiteUrl).href;
						});

					const routeUrls = routes.reduce<string[]>((urls, r) => {
						// Only expose pages, not endpoints or redirects
						if (r.type !== 'page') return urls;

						/**
						 * Dynamic URLs have entries with `undefined` pathnames
						 */
						if (r.pathname) {
							if (shouldIgnoreStatus(r.pathname ?? r.route)) return urls;

							// `finalSiteUrl` may end with a trailing slash
							// or not because of base paths.
							let fullPath = finalSiteUrl.pathname;
							if (fullPath.endsWith('/')) fullPath += r.generate(r.pathname).substring(1);
							else fullPath += r.generate(r.pathname);

							const newUrl = new URL(fullPath, finalSiteUrl).href;

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
					const xslURL = opts.xslURL ? new URL(opts.xslURL, finalSiteUrl).href : undefined;
					await writeSitemap(
						{
							hostname: finalSiteUrl.href,
							destinationDir: destDir,
							publicBasePath: config.base,
							sourceData: urlData,
							limit: entryLimit,
							xslURL: xslURL,
						},
						config,
					);
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
