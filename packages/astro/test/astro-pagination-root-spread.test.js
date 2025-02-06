import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Pagination root', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-pagination-root-spread/',
			site: 'https://mysite.dev/',
			base: '/blog',
		});
		await fixture.build();
	});

	it('correct prev url in root spread', async () => {
		const prevMap = {
			'/4/': '/blog/3',
			'/3/': '/blog/2',
			'/2/': '/blog/',
			'/': undefined,
		};

		await Promise.all(
			Object.entries(prevMap).map(async ([curr, prev]) => {
				const html = await fixture.readFile(curr + 'index.html');
				const $ = cheerio.load(html);
				assert.equal($('#prev').attr('href'), prev);
			}),
		);
	});
});
