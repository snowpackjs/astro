import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Using the Partytown integration in SSR', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-partytown/',
			adapter: testAdapter(),
			output: 'server',
		});
		await fixture.build();
	});

	it('Has the scripts in the page', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerioLoad(html);
		assert.equal($('script').length, 1);
	});

	it('The partytown scripts are in the manifest', async () => {
		const app = await fixture.loadTestAdapterApp();
		const partytownScript = '/~partytown/partytown-sw.js';
		const assets = app.manifest.assets;
		let found = false;
		for (const asset of assets) {
			if (asset === partytownScript) {
				found = true;
				break;
			}
		}
		assert.equal(found, true);
	});
});
