import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mdx from '@astrojs/mdx';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

const FIXTURE_ROOT = new URL('./fixtures/mdx-script-style-raw/', import.meta.url);

describe('MDX script style raw', () => {
	describe('dev', () => {
		let fixture;
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: FIXTURE_ROOT,
				integrations: [mdx()],
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('works with with raw script and style strings', async () => {
			const res = await fixture.fetch('/index.html');
			assert.equal(res.status, 200);

			const html = await res.text();
			const { document } = parseHTML(html);

			const scriptContent = document.getElementById('test-script').innerHTML;
			assert.equal(
				scriptContent.includes("console.log('raw script')"),
				true,
				'script should not be html-escaped',
			);

			const styleContent = document.getElementById('test-style').innerHTML;
			assert.equal(
				styleContent.includes('h1[id="script-style-raw"]'),
				true,
				'style should not be html-escaped',
			);
		});
	});

	describe('build', () => {
		it('works with with raw script and style strings', async () => {
			const fixture = await loadFixture({
				root: FIXTURE_ROOT,
				integrations: [mdx()],
			});
			await fixture.build();

			const html = await fixture.readFile('/index.html');
			const { document } = parseHTML(html);

			const scriptContent = document.getElementById('test-script').innerHTML;
			assert.equal(
				scriptContent.includes("console.log('raw script')"),
				true,
				'script should not be html-escaped',
			);

			const styleContent = document.getElementById('test-style').innerHTML;
			assert.equal(
				styleContent.includes('h1[id="script-style-raw"]'),
				true,
				'style should not be html-escaped',
			);
		});
	});
});
