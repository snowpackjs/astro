import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cheerio from 'cheerio';

import { testImageService } from './test-image-service.js';
import { loadFixture } from './test-utils.js';

/**
 ** @typedef {import('../src/types/public/config.js').AstroInlineConfig & { root?: string | URL }} AstroInlineConfig
 */

/** @type {AstroInlineConfig} */
const defaultSettings = {
	root: './fixtures/core-image-unconventional-settings/',
	image: {
		service: testImageService(),
	},
};

describe('astro:assets - Support unconventional build settings properly', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	it('supports assetsPrefix', async () => {
		fixture = await loadFixture({
			...defaultSettings,
			build: {
				assetsPrefix: 'https://cdn.example.com/',
			},
		});
		await fixture.build();

		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const src = $('#walrus-img').attr('src');
		assert.equal(src.startsWith('https://cdn.example.com/'), true);

		const data = await fixture.readFile(src.replace('https://cdn.example.com/', ''), null);
		assert.equal(data instanceof Buffer, true);
	});

	it('supports base', async () => {
		fixture = await loadFixture({
			...defaultSettings,
			build: {
				base: '/subdir/',
			},
		});
		await fixture.build();

		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const src = $('#walrus-img').attr('src');
		const data = await fixture.readFile(src.replace('/subdir/', ''), null);
		assert.equal(data instanceof Buffer, true);
	});

	// This test is a bit of a stretch, but it's a good sanity check, `assetsPrefix` should take precedence over `base` in this context
	it('supports assetsPrefix + base', async () => {
		fixture = await loadFixture({
			...defaultSettings,
			build: {
				assetsPrefix: 'https://cdn.example.com/',
				base: '/subdir/',
			},
		});
		await fixture.build();

		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const src = $('#walrus-img').attr('src');
		assert.equal(src.startsWith('https://cdn.example.com/'), true);

		const data = await fixture.readFile(src.replace('https://cdn.example.com/', ''), null);
		assert.equal(data instanceof Buffer, true);
	});

	it('supports custom build.assets', async () => {
		fixture = await loadFixture({
			...defaultSettings,
			build: {
				assets: 'assets',
			},
		});
		await fixture.build();

		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		const unoptimizedSrc = $('#walrus-img-unoptimized').attr('src');
		assert.equal(unoptimizedSrc.startsWith('/assets/'), true);

		const src = $('#walrus-img').attr('src');
		const data = await fixture.readFile(src, null);

		assert.equal(data instanceof Buffer, true);
	});

	it('supports custom vite.build.rollupOptions.output.assetFileNames', async () => {
		fixture = await loadFixture({
			...defaultSettings,
			vite: {
				build: {
					rollupOptions: {
						output: {
							assetFileNames: 'images/hello_[name].[ext]',
						},
					},
				},
			},
		});
		await fixture.build();

		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const unoptimizedSrc = $('#walrus-img-unoptimized').attr('src');
		assert.equal(unoptimizedSrc, '/images/hello_light_walrus.avif');

		const src = $('#walrus-img').attr('src');
		const data = await fixture.readFile(src, null);

		assert.equal(data instanceof Buffer, true);
	});

	it('supports complex vite.build.rollupOptions.output.assetFileNames', async () => {
		fixture = await loadFixture({
			...defaultSettings,
			vite: {
				build: {
					rollupOptions: {
						output: {
							assetFileNames: 'assets/[hash]/[name][extname]',
						},
					},
				},
			},
		});
		await fixture.build();

		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const unoptimizedSrc = $('#walrus-img-unoptimized').attr('src');
		const originalData = await fixture.readFile(unoptimizedSrc, null);
		assert.equal(originalData instanceof Buffer, true);

		const src = $('#walrus-img').attr('src');
		const data = await fixture.readFile(src, null);

		assert.equal(data instanceof Buffer, true);
	});

	it('supports custom vite.build.rollupOptions.output.assetFileNames with assetsPrefix', async () => {
		fixture = await loadFixture({
			...defaultSettings,
			vite: {
				build: {
					rollupOptions: {
						output: {
							assetFileNames: 'images/hello_[name].[ext]',
						},
					},
				},
			},
			build: {
				assetsPrefix: 'https://cdn.example.com/',
			},
		});
		await fixture.build();

		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const unoptimizedSrc = $('#walrus-img-unoptimized').attr('src');
		assert.equal(unoptimizedSrc, 'https://cdn.example.com/images/hello_light_walrus.avif');

		const unoptimizedData = await fixture.readFile(
			unoptimizedSrc.replace('https://cdn.example.com/', ''),
			null,
		);
		assert.equal(unoptimizedData instanceof Buffer, true);

		const src = $('#walrus-img').attr('src');
		assert.equal(src.startsWith('https://cdn.example.com/'), true);

		const data = await fixture.readFile(src.replace('https://cdn.example.com/', ''), null);
		assert.equal(data instanceof Buffer, true);
	});
});
