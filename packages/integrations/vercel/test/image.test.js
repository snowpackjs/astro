import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Image', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/image/',
		});
		await fixture.build();
	});

	it('build successful', async () => {
		assert.ok(await fixture.readFile('../.vercel/output/static/index.html'));
	});

	it('has link to vercel in build with proper attributes', async () => {
		const html = await fixture.readFile('../.vercel/output/static/index.html');
		const $ = cheerio.load(html);
		const img = $('#basic-image img');

		assert.equal(img.attr('src').startsWith('/_vercel/image?url=_astr'), true);
		assert.equal(img.attr('loading'), 'lazy');
		assert.equal(img.attr('width'), '225');
	});

	it('has proper vercel config', async () => {
		const vercelConfig = JSON.parse(await fixture.readFile('../.vercel/output/config.json'));

		assert.deepEqual(vercelConfig.images, {
			sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
			domains: ['astro.build'],
			remotePatterns: [
				{
					protocol: 'https',
					hostname: '**.amazonaws.com',
				},
			],
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

		it('has link to local image in dev with proper attributes', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerio.load(html);
			const img = $('#basic-image img');

			assert.equal(img.attr('src').startsWith('/_image?href='), true);
			assert.equal(img.attr('loading'), 'lazy');
			assert.equal(img.attr('width'), '225');
		});

		it('supports SVGs', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerio.load(html);
			const img = $('#svg img');
			const src = img.attr('src');

			const res = await fixture.fetch(src);
			assert.equal(res.status, 200);
			assert.equal(res.headers.get('content-type'), 'image/svg+xml');
		});
	});
});
