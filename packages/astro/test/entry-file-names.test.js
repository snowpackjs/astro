import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('vite.build.rollupOptions.entryFileNames', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/entry-file-names',
		});
		await fixture.build();
	});

	it('Renders correctly', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		assert.equal($('#hello').length, 1);
	});

	it('Outputs a client module that was specified by the config', async () => {
		const js = await fixture.readFile('/assets/js/Hello.js');
		assert.equal(typeof js === 'string', true);
		assert.equal(js.length > 0, true);
	});
});
