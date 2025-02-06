import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Pagination', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-pagination/',
			site: 'https://mysite.dev/',
			base: '/blog',
		});
		await fixture.build();
	});

	it('optional root page', async () => {
		for (const file of [
			'/posts/optional-root-page/index.html',
			'/posts/optional-root-page/2/index.html',
			'/posts/optional-root-page/3/index.html',
		]) {
			assert.ok(await fixture.readFile(file));
		}
	});

	it('named root page', async () => {
		for (const file of [
			'/posts/named-root-page/1/index.html',
			'/posts/named-root-page/2/index.html',
			'/posts/named-root-page/3/index.html',
		]) {
			assert.ok(await fixture.readFile(file));
		}
	});

	it('multiple params', async () => {
		const params = [
			{ color: 'red', p: '1' },
			{ color: 'blue', p: '1' },
			{ color: 'blue', p: '2' },
		];
		await Promise.all(
			params.map(async ({ color, p }) => {
				const html = await fixture.readFile(`/posts/${color}/${p}/index.html`);
				const $ = cheerio.load(html);
				assert.equal($('#page-param').text(), p);
				assert.equal($('#currentPage').text(), p);
				assert.equal($('#filter').text(), color);

				const prevHref = $('#prev').attr('href');
				const nextHref = $('#next').attr('href');

				if (color === 'red') {
					assert.equal(prevHref, undefined);
					assert.equal(nextHref, undefined);
				}
				if (color === 'blue' && p === '1') {
					assert.equal(prevHref, undefined);
					assert.equal(nextHref, '/blog/posts/blue/2');
				}
				if (color === 'blue' && p === '2') {
					assert.equal(prevHref, '/blog/posts/blue/1');
					assert.equal(nextHref, undefined);
				}
			}),
		);
	});
});
