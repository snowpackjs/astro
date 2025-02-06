import mdx from '@astrojs/mdx';

import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

describe('MDX slots', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/mdx-slots/', import.meta.url),
			integrations: [mdx()],
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('supports top-level imports', async () => {
			const html = await fixture.readFile('/index.html');
			const { document } = parseHTML(html);

			const h1 = document.querySelector('h1');
			const defaultSlot = document.querySelector('[data-default-slot]');
			const namedSlot = document.querySelector('[data-named-slot]');

			assert.equal(h1.textContent, 'Hello slotted component!');
			assert.equal(defaultSlot.textContent, 'Default content.');
			assert.equal(namedSlot.textContent, 'Content for named slot.');
		});

		it('supports glob imports - <Component.default />', async () => {
			const html = await fixture.readFile('/glob/index.html');
			const { document } = parseHTML(html);

			const h1 = document.querySelector('[data-default-export] h1');
			const defaultSlot = document.querySelector('[data-default-export] [data-default-slot]');
			const namedSlot = document.querySelector('[data-default-export] [data-named-slot]');

			assert.equal(h1.textContent, 'Hello slotted component!');
			assert.equal(defaultSlot.textContent, 'Default content.');
			assert.equal(namedSlot.textContent, 'Content for named slot.');
		});

		it('supports glob imports - <Content />', async () => {
			const html = await fixture.readFile('/glob/index.html');
			const { document } = parseHTML(html);

			const h1 = document.querySelector('[data-content-export] h1');
			const defaultSlot = document.querySelector('[data-content-export] [data-default-slot]');
			const namedSlot = document.querySelector('[data-content-export] [data-named-slot]');

			assert.equal(h1.textContent, 'Hello slotted component!');
			assert.equal(defaultSlot.textContent, 'Default content.');
			assert.equal(namedSlot.textContent, 'Content for named slot.');
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

		it('supports top-level imports', async () => {
			const res = await fixture.fetch('/');

			assert.equal(res.status, 200);

			const html = await res.text();
			const { document } = parseHTML(html);

			const h1 = document.querySelector('h1');
			const defaultSlot = document.querySelector('[data-default-slot]');
			const namedSlot = document.querySelector('[data-named-slot]');

			assert.equal(h1.textContent, 'Hello slotted component!');
			assert.equal(defaultSlot.textContent, 'Default content.');
			assert.equal(namedSlot.textContent, 'Content for named slot.');
		});

		it('supports glob imports - <Component.default />', async () => {
			const res = await fixture.fetch('/glob');

			assert.equal(res.status, 200);

			const html = await res.text();
			const { document } = parseHTML(html);

			const h1 = document.querySelector('[data-default-export] h1');
			const defaultSlot = document.querySelector('[data-default-export] [data-default-slot]');
			const namedSlot = document.querySelector('[data-default-export] [data-named-slot]');

			assert.equal(h1.textContent, 'Hello slotted component!');
			assert.equal(defaultSlot.textContent, 'Default content.');
			assert.equal(namedSlot.textContent, 'Content for named slot.');
		});

		it('supports glob imports - <Content />', async () => {
			const res = await fixture.fetch('/glob');

			assert.equal(res.status, 200);

			const html = await res.text();
			const { document } = parseHTML(html);

			const h1 = document.querySelector('[data-content-export] h1');
			const defaultSlot = document.querySelector('[data-content-export] [data-default-slot]');
			const namedSlot = document.querySelector('[data-content-export] [data-named-slot]');

			assert.equal(h1.textContent, 'Hello slotted component!');
			assert.equal(defaultSlot.textContent, 'Default content.');
			assert.equal(namedSlot.textContent, 'Content for named slot.');
		});
	});
});
