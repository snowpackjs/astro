import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

const defaultAssetsPrefixRegex = /^https:\/\/example.com\/_astro\/.*/;
const jsAssetsPrefixRegex = /^https:\/\/js\.example\.com\/_astro\/.*/;
const cssAssetsPrefixRegex = /^https:\/\/css\.example\.com\/_astro\/.*/;
const assetsPrefix = {
	js: 'https://js.example.com',
	css: 'https://css.example.com',
	fallback: 'https://example.com',
};

// Asset prefix for CDN support
describe('Assets Prefix Multiple CDN - Static', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-assets-prefix',
			build: {
				assetsPrefix,
			},
		});
		await fixture.build();
	});

	it('all stylesheets should start with  cssAssetPrefix', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const stylesheets = $('link[rel="stylesheet"]');
		stylesheets.each((_i, el) => {
			assert.match(el.attribs.href, cssAssetsPrefixRegex);
		});
	});

	it('image src start with fallback', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const imgAsset = $('#image-asset');
		assert.match(imgAsset.attr('src'), defaultAssetsPrefixRegex);
	});

	it('react component astro-island should import from jsAssetsPrefix', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const island = $('astro-island');
		assert.match(island.attr('component-url'), jsAssetsPrefixRegex);
		assert.match(island.attr('renderer-url'), jsAssetsPrefixRegex);
	});

	it('import.meta.env.ASSETS_PREFIX works', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const env = $('#assets-prefix-env');
		assert.deepEqual(JSON.parse(env.text()), assetsPrefix);
	});

	it('markdown image src start with assetsPrefix', async () => {
		const html = await fixture.readFile('/markdown/index.html');
		const $ = cheerio.load(html);
		const imgAssets = $('img');
		imgAssets.each((_i, el) => {
			assert.match(el.attribs.src, defaultAssetsPrefixRegex);
		});
	});

	it('content collections image src start with assetsPrefix', async () => {
		const html = await fixture.readFile('/blog/index.html');
		const $ = cheerio.load(html);
		const imgAsset = $('img');
		assert.match(imgAsset.attr('src'), defaultAssetsPrefixRegex);
	});
});

describe('Assets Prefix Multiple CDN, server', () => {
	let app;

	before(async () => {
		const fixture = await loadFixture({
			root: './fixtures/astro-assets-prefix',
			output: 'server',
			adapter: testAdapter(),
			build: {
				assetsPrefix,
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
			assert.match(el.attribs.href, cssAssetsPrefixRegex);
		});
	});

	it('image src start with assetsPrefix', async () => {
		const request = new Request('http://example.com/custom-base/');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		const imgAsset = $('#image-asset');
		assert.match(imgAsset.attr('src'), defaultAssetsPrefixRegex);
	});

	it('react component astro-island should import from assetsPrefix', async () => {
		const request = new Request('http://example.com/custom-base/');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		const island = $('astro-island');
		assert.match(island.attr('component-url'), jsAssetsPrefixRegex);
		assert.match(island.attr('renderer-url'), jsAssetsPrefixRegex);
	});

	it('markdown optimized image src does not start with assetsPrefix in SSR', async () => {
		const request = new Request('http://example.com/custom-base/markdown/');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		const $ = cheerio.load(html);
		const imgAsset = $('img');
		assert.doesNotMatch(imgAsset.attr('src'), defaultAssetsPrefixRegex);
	});
});
