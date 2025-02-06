import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateSitemap } from '../../dist/generate-sitemap.js';

const site = 'http://example.com';

describe('generateSitemap', () => {
	describe('basic', () => {
		it('works', () => {
			const items = generateSitemap(
				[
					// All pages
					`${site}/a`,
					`${site}/b`,
					`${site}/c`,
				],
				site,
			);
			assert.equal(items.length, 3);
			assert.equal(items[0].url, `${site}/a`);
			assert.equal(items[1].url, `${site}/b`);
			assert.equal(items[2].url, `${site}/c`);
		});

		it('sorts the items', () => {
			const items = generateSitemap(
				[
					// All pages
					`${site}/c`,
					`${site}/a`,
					`${site}/b`,
				],
				site,
			);
			assert.equal(items.length, 3);
			assert.equal(items[0].url, `${site}/a`);
			assert.equal(items[1].url, `${site}/b`);
			assert.equal(items[2].url, `${site}/c`);
		});

		it('sitemap props are passed to items', () => {
			const now = new Date();
			const items = generateSitemap(
				[
					// All pages
					`${site}/a`,
					`${site}/b`,
					`${site}/c`,
				],
				site,
				{
					changefreq: 'monthly',
					lastmod: now,
					priority: 0.5,
				},
			);

			assert.equal(items.length, 3);

			assert.equal(items[0].url, `${site}/a`);
			assert.equal(items[0].changefreq, 'monthly');
			assert.equal(items[0].lastmod, now.toISOString());
			assert.equal(items[0].priority, 0.5);

			assert.equal(items[1].url, `${site}/b`);
			assert.equal(items[1].changefreq, 'monthly');
			assert.equal(items[1].lastmod, now.toISOString());
			assert.equal(items[1].priority, 0.5);

			assert.equal(items[2].url, `${site}/c`);
			assert.equal(items[2].changefreq, 'monthly');
			assert.equal(items[2].lastmod, now.toISOString());
			assert.equal(items[2].priority, 0.5);
		});
	});

	describe('i18n', () => {
		it('works', () => {
			const items = generateSitemap(
				[
					// All pages
					`${site}/a`,
					`${site}/b`,
					`${site}/c`,
					`${site}/es/a`,
					`${site}/es/b`,
					`${site}/es/c`,
					`${site}/fr/a`,
					`${site}/fr/b`,
					// `${site}/fr-CA/c`, (intentionally missing for testing)
				],
				site,
				{
					i18n: {
						defaultLocale: 'en',
						locales: {
							en: 'en-US',
							es: 'es-ES',
							fr: 'fr-CA',
						},
					},
				},
			);

			assert.equal(items.length, 8);

			const aLinks = [
				{ url: `${site}/a`, lang: 'en-US' },
				{ url: `${site}/es/a`, lang: 'es-ES' },
				{ url: `${site}/fr/a`, lang: 'fr-CA' },
			];
			const bLinks = [
				{ url: `${site}/b`, lang: 'en-US' },
				{ url: `${site}/es/b`, lang: 'es-ES' },
				{ url: `${site}/fr/b`, lang: 'fr-CA' },
			];
			const cLinks = [
				{ url: `${site}/c`, lang: 'en-US' },
				{ url: `${site}/es/c`, lang: 'es-ES' },
			];

			assert.equal(items[0].url, `${site}/a`);
			assert.deepEqual(items[0].links, aLinks);

			assert.equal(items[1].url, `${site}/b`);
			assert.deepEqual(items[1].links, bLinks);

			assert.equal(items[2].url, `${site}/c`);
			assert.deepEqual(items[2].links, cLinks);

			assert.equal(items[3].url, `${site}/es/a`);
			assert.deepEqual(items[3].links, aLinks);

			assert.equal(items[4].url, `${site}/es/b`);
			assert.deepEqual(items[4].links, bLinks);

			assert.equal(items[5].url, `${site}/es/c`);
			assert.deepEqual(items[5].links, cLinks);

			assert.equal(items[6].url, `${site}/fr/a`);
			assert.deepEqual(items[6].links, aLinks);

			assert.equal(items[7].url, `${site}/fr/b`);
			assert.deepEqual(items[7].links, bLinks);
		});
	});
});
