import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('SSR with Large Array and client rendering', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/large-array/',
			output: 'server',
			adapter: testAdapter(),
		});
		await fixture.build();
	});

	it('Using response.arrayBuffer() gets the right HTML', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/');
		const response = await app.render(request);
		const data = await response.arrayBuffer();
		const html = new TextDecoder().decode(data);

		const $ = cheerio.load(html);
		assert.equal($('head meta[name="viewport"]').length, 1);
		assert.equal($('head link[rel="icon"]').length, 1);
		assert.equal($('main').length, 1);
		assert.equal($('astro-island').length, 1);
		assert.equal($('h1').text(), 'Hello, Solid!');
	});
});
