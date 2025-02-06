import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';
import markdoc from '../dist/index.js';

const root = new URL('./fixtures/variables/', import.meta.url);

describe('Markdoc - Variables', () => {
	let baseFixture;

	before(async () => {
		baseFixture = await loadFixture({
			root,
			integrations: [markdoc()],
		});
	});

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await baseFixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('has expected entry properties', async () => {
			const res = await baseFixture.fetch('/');
			const html = await res.text();
			const { document } = parseHTML(html);
			assert.equal(document.querySelector('h1')?.textContent, 'Processed by schema: Test entry');
			assert.equal(document.getElementById('id')?.textContent?.trim(), 'id: entry.mdoc');
			assert.equal(document.getElementById('slug')?.textContent?.trim(), 'slug: entry');
			assert.equal(document.getElementById('collection')?.textContent?.trim(), 'collection: blog');
		});
	});

	describe('build', () => {
		before(async () => {
			await baseFixture.build();
		});

		it('has expected entry properties', async () => {
			const html = await baseFixture.readFile('/index.html');
			const { document } = parseHTML(html);
			assert.equal(document.querySelector('h1')?.textContent, 'Processed by schema: Test entry');
			assert.equal(document.getElementById('id')?.textContent?.trim(), 'id: entry.mdoc');
			assert.equal(document.getElementById('slug')?.textContent?.trim(), 'slug: entry');
			assert.equal(document.getElementById('collection')?.textContent?.trim(), 'collection: blog');
		});
	});
});
