import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

const assetsPrefix = 'http://localhost:4321';
const assetsPrefixRegex = /^http:\/\/localhost:4321\/_astro\/.*/;

// Asset prefix for CDN support
describe('Assets Prefix - Static', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-assets-prefix/',
			outDir: './dist/static',
		});
		await fixture.build();
	});

	it('all stylesheets should start with assetPrefix', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const stylesheets = $('link[rel="stylesheet"]');
		stylesheets.each((_i, el) => {
			assert.match(el.attribs.href, assetsPrefixRegex);
		});
	});

	it('image src start with assetsPrefix', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const imgAsset = $('#image-asset');
		assert.match(imgAsset.attr('src'), assetsPrefixRegex);
	});

	it('react component astro-island should import from assetsPrefix', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const island = $('astro-island');
		assert.match(island.attr('component-url'), assetsPrefixRegex);
		assert.match(island.attr('renderer-url'), assetsPrefixRegex);
	});

	it('import.meta.env.ASSETS_PREFIX works', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const env = $('#assets-prefix-env');
		assert.equal(env.text(), assetsPrefix);
	});

	it('markdown image src start with assetsPrefix', async () => {
		const html = await fixture.readFile('/markdown/index.html');
		const $ = cheerio.load(html);
		const imgAssets = $('img');
		imgAssets.each((_i, el) => {
			assert.match(el.attribs.src, assetsPrefixRegex);
		});
	});

	it('content collections image src start with assetsPrefix', async () => {
		const html = await fixture.readFile('/blog/index.html');
		const $ = cheerio.load(html);
		const imgAsset = $('img');
		assert.match(imgAsset.attr('src'), assetsPrefixRegex);
	});
});

describe('Assets Prefix - with path prefix', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-assets-prefix/',
			outDir: './dist/server',
			build: {
				assetsPrefix: '/starting-slash',
			},
		});
		await fixture.build();
	});

	it('all stylesheets should start with assetPrefix', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const stylesheets = $('link[rel="stylesheet"]');
		stylesheets.each((_i, el) => {
			assert.match(el.attribs.href, /^\/starting-slash\/.*/);
		});
	});
});

describe('Assets Prefix, server', () => {
	let app;

	before(async () => {
		const fixture = await loadFixture({
			root: './fixtures/astro-assets-prefix/',
			output: 'server',
			adapter: testAdapter(),
			outDir: './dist/server',
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('all stylesheets should start with assetPrefix', async () => {
		const request = new Request('http://example.com/custom-base/');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		const stylesheets = $('link[rel="stylesheet"]');
		stylesheets.each((_i, el) => {
			assert.match(el.attribs.href, assetsPrefixRegex);
		});
	});

	it('image src start with assetsPrefix', async () => {
		const request = new Request('http://example.com/custom-base/');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		const imgAsset = $('#image-asset');
		assert.match(imgAsset.attr('src'), assetsPrefixRegex);
	});

	it('react component astro-island should import from assetsPrefix', async () => {
		const request = new Request('http://example.com/custom-base/');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		const island = $('astro-island');
		assert.match(island.attr('component-url'), assetsPrefixRegex);
		assert.match(island.attr('renderer-url'), assetsPrefixRegex);
	});

	it('markdown optimized image src does not start with assetsPrefix in SSR', async () => {
		const request = new Request('http://example.com/custom-base/markdown/');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		const imgAsset = $('img');
		assert.doesNotMatch(imgAsset.attr('src'), assetsPrefixRegex);
	});
});

describe('Assets Prefix, with path prefix', () => {
	let app;

	before(async () => {
		const fixture = await loadFixture({
			root: './fixtures/astro-assets-prefix/',
			output: 'server',
			adapter: testAdapter(),
			outDir: './dist/server-path-prefix',
			build: {
				assetsPrefix: '/starting-slash',
			},
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('all stylesheets should start with assetPrefix', async () => {
		const request = new Request('http://example.com/custom-base/');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		const stylesheets = $('link[rel="stylesheet"]');
		stylesheets.each((_i, el) => {
			assert.match(el.attribs.href, /^\/starting-slash\/.*/);
		});
	});
});
