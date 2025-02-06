import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('build.format=file with dynamic routes', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/dynamic-route-build-file',
			build: {
				format: 'file',
			},
		});
		await fixture.build();
	});

	it('Outputs a slug of undefined as the index.html', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		assert.equal($('h1').text(), 'Astro Store');
	});
});
