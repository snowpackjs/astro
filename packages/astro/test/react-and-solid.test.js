import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Solid app with some React components', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/react-and-solid/' });
		await fixture.build();
	});

	it('Reads jsxImportSource from tsconfig', async () => {
		let html = await fixture.readFile('/index.html');
		let $ = cheerio.load(html);
		assert.equal($('#example-solid').text(), 'example solidjs component');
		assert.equal($('#example-react').text(), 'example react component');
	});
});
