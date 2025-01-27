import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe("Static build - format: 'file'", () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/static-build-page-url-format/',
		});
		await fixture.build();
	});

	it('Builds pages in root', async () => {
		const html = await fixture.readFile('/one.html');
		assert.equal(typeof html, 'string');
	});

	it('Builds pages in subfolders', async () => {
		const html = await fixture.readFile('/sub/page.html');
		assert.equal(typeof html, 'string');
	});
});
