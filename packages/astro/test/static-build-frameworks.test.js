import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { isWindows, loadFixture } from './test-utils.js';

describe('Static build - frameworks', () => {
	if (isWindows) {
		return;
	}

	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/static-build-frameworks/',
		});
		await fixture.build();
	});

	it('can build preact', async () => {
		const html = await fixture.readFile('/preact/index.html');
		assert.equal(typeof html, 'string');
	});

	it('can build react', async () => {
		const html = await fixture.readFile('/react/index.html');
		assert.equal(typeof html, 'string');
	});

	// SKIP: Lit polyfills the server in a way that breaks `sass` require/import
	// Leads to CI bugs like: "Cannot read properties of undefined (reading 'length')"
	it.skip('can build lit', async () => {
		const html = await fixture.readFile('/lit/index.html');
		assert.equal(typeof html, 'string');
	});

	it('can build nested framework usage', async () => {
		const html = await fixture.readFile('/nested/index.html');
		const $ = cheerio.load(html);
		const counter = $('.nested-counter .counter');
		assert.equal(counter.length, 1, 'Found the counter');
	});
});
