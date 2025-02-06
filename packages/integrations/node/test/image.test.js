import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { inferRemoteSize } from 'astro/assets/utils/inferRemoteSize.js';
import * as cheerio from 'cheerio';
import nodejs from '../dist/index.js';
import { loadFixture } from './test-utils.js';

describe('Image endpoint', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devPreview;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/image/',
			output: 'server',
			adapter: nodejs({ mode: 'standalone' }),
			image: {
				domains: ['images.unsplash.com'],
			},
		});
		await fixture.build();
		devPreview = await fixture.preview();
	});

	after(async () => {
		await devPreview.stop();
	});

	it('it returns local images', { skip: 'Check why the infer remote size fails' }, async () => {
		const res = await fixture.fetch('/');
		assert.equal(res.status, 200);
		const html = await res.text();
		const $ = cheerio.load(html);

		const img = $('img[alt=Penguins]').attr('src');
		const size = await inferRemoteSize(`http://localhost:4321${img}`);
		assert.equal(size.format, 'webp');
		assert.equal(size.width, 50);
		assert.equal(size.height, 33);
	});

	it('it returns remote images', { skip: 'Check why the infer remote size fails' }, async () => {
		const res = await fixture.fetch('/');
		assert.equal(res.status, 200);
		const html = await res.text();
		const $ = cheerio.load(html);
		const img = $('img[alt=Cornwall]').attr('src');
		const size = await inferRemoteSize(`http://localhost:4321${img}`);
		assert.equal(size.format, 'webp');
		assert.equal(size.width, 400);
		assert.equal(size.height, 300);
	});
});
