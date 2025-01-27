import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

describe('MDX Namespace', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/mdx-namespace/', import.meta.url),
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('works for object', async () => {
			const html = await fixture.readFile('/object/index.html');
			const { document } = parseHTML(html);

			const island = document.querySelector('astro-island');
			const component = document.querySelector('#component');

			assert.notEqual(island, undefined);
			assert.equal(component.textContent, 'Hello world');
		});

		it('works for star', async () => {
			const html = await fixture.readFile('/star/index.html');
			const { document } = parseHTML(html);

			const island = document.querySelector('astro-island');
			const component = document.querySelector('#component');

			assert.notEqual(island, undefined);
			assert.equal(component.textContent, 'Hello world');
		});
	});

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('works for object', async () => {
			const res = await fixture.fetch('/object');

			assert.equal(res.status, 200);

			const html = await res.text();
			const { document } = parseHTML(html);

			const island = document.querySelector('astro-island');
			const component = document.querySelector('#component');

			assert.notEqual(island, undefined);
			assert.equal(component.textContent, 'Hello world');
		});

		it('works for star', async () => {
			const res = await fixture.fetch('/star');

			assert.equal(res.status, 200);

			const html = await res.text();
			const { document } = parseHTML(html);

			const island = document.querySelector('astro-island');
			const component = document.querySelector('#component');

			assert.notEqual(island, undefined);
			assert.equal(component.textContent, 'Hello world');
		});
	});
});
