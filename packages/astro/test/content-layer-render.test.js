import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Content Layer MDX rendering dev', () => {
	/** @type {import("./test-utils.js").Fixture} */
	let fixture;

	let devServer;
	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/content-layer-rendering/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		devServer?.stop();
	});

	it('Render an MDX file', async () => {
		const html = await fixture.fetch('/reptiles/iguana').then((r) => r.text());

		assert.match(html, /Iguana/);
		assert.match(html, /This is a rendered entry/);
	});
});

describe('Content Layer MDX rendering build', () => {
	/** @type {import("./test-utils.js").Fixture} */
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/content-layer-rendering/',
		});
		await fixture.build();
	});

	it('Render an MDX file', async () => {
		const html = await fixture.readFile('/reptiles/iguana/index.html');

		assert.match(html, /Iguana/);
		assert.match(html, /This is a rendered entry/);
	});
});
