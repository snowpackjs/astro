import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Setting inlineStylesheets to never in static output', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			// inconsequential config that differs between tests
			// to bust cache and prevent modules and their state
			// from being reused
			site: 'https://test.dev/',
			root: './fixtures/css-inline-stylesheets/',
			output: 'static',
			outDir: './dist/static-inline-stylesheets-never',
			build: {
				inlineStylesheets: 'never',
			},
		});
		await fixture.build();
	});

	it('Does not render any <style> tags', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		assert.equal($('style').toArray().length, 0);
	});

	describe('Inspect linked stylesheets', () => {
		// object, so it can be passed by reference
		const allStyles = {};

		before(async () => {
			allStyles.value = await stylesFromStaticOutput(fixture);
		});

		commonExpectations(allStyles);
	});
});

describe('Setting inlineStylesheets to never in server output', () => {
	let app;

	before(async () => {
		const fixture = await loadFixture({
			// inconsequential config that differs between tests
			// to bust cache and prevent modules and their state
			// from being reused
			site: 'https://test.dev/',
			root: './fixtures/css-inline-stylesheets/',
			output: 'server',
			adapter: testAdapter(),
			outDir: './dist/server-inline-stylesheets-never',
			build: {
				inlineStylesheets: 'never',
			},
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('Does not render any <style> tags', async () => {
		const request = new Request('http://example.com/');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerio.load(html);

		assert.equal($('style').toArray().length, 0);
	});

	describe('Inspect linked stylesheets', () => {
		const allStyles = {};

		before(async () => {
			allStyles.value = await stylesFromServer(app);
		});

		commonExpectations(allStyles);
	});
});

describe('Setting inlineStylesheets to auto in static output', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			// inconsequential config that differs between tests
			// to bust cache and prevent modules and their state
			// from being reused
			site: 'https://test.info/',
			root: './fixtures/css-inline-stylesheets/',
			output: 'static',
			outDir: './dist/static-inline-stylesheets-auto',
			build: {
				inlineStylesheets: 'auto',
			},
			vite: {
				build: {
					assetsInlineLimit: 512,
				},
			},
		});
		await fixture.build();
	});

	it('Renders some <style> and some <link> tags', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		// the count of style/link tags depends on our css chunking logic
		// this test should be updated if it changes
		assert.equal($('style').length, 3);
		assert.equal($('link[rel=stylesheet]').length, 1);
	});

	describe('Inspect linked and inlined stylesheets', () => {
		const allStyles = {};

		before(async () => {
			allStyles.value = await stylesFromStaticOutput(fixture);
		});

		commonExpectations(allStyles);
	});
});

describe('Setting inlineStylesheets to auto in server output', () => {
	let app;

	before(async () => {
		const fixture = await loadFixture({
			// inconsequential config that differs between tests
			// to bust cache and prevent modules and their state
			// from being reused
			site: 'https://test.info/',
			root: './fixtures/css-inline-stylesheets/',
			output: 'server',
			adapter: testAdapter(),
			outDir: './dist/server-inline-stylesheets-auto',
			build: {
				inlineStylesheets: 'auto',
			},
			vite: {
				build: {
					assetsInlineLimit: 512,
				},
			},
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('Renders some <style> and some <link> tags', async () => {
		const request = new Request('http://example.com/');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerio.load(html);

		// the count of style/link tags depends on our css chunking logic
		// this test should be updated if it changes
		assert.equal($('style').length, 3);
		assert.equal($('link[rel=stylesheet]').length, 1);
	});

	describe('Inspect linked and inlined stylesheets', () => {
		const allStyles = {};

		before(async () => {
			allStyles.value = await stylesFromServer(app);
		});

		commonExpectations(allStyles);
	});
});

describe('Setting inlineStylesheets to always in static output', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			// inconsequential config that differs between tests
			// to bust cache and prevent modules and their state
			// from being reused
			site: 'https://test.net/',
			root: './fixtures/css-inline-stylesheets/',
			output: 'static',
			outDir: './dist/static-inline-stylesheets-always',
			build: {
				inlineStylesheets: 'always',
			},
		});
		await fixture.build();
	});

	it('Does not render any <link> tags', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		assert.equal($('link[rel=stylesheet]').toArray().length, 0);
	});

	describe('Inspect inlined stylesheets', () => {
		const allStyles = {};

		before(async () => {
			allStyles.value = await stylesFromStaticOutput(fixture);
		});

		commonExpectations(allStyles);
	});
});

describe('Setting inlineStylesheets to always in server output', () => {
	let app;

	before(async () => {
		const fixture = await loadFixture({
			// inconsequential config that differs between tests
			// to bust cache and prevent modules and their state
			// from being reused
			site: 'https://test.net/',
			root: './fixtures/css-inline-stylesheets/',
			output: 'server',
			adapter: testAdapter(),
			outDir: './dist/server-inline-stylesheets-always',
			build: {
				inlineStylesheets: 'always',
			},
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('Does not render any <link> tags', async () => {
		const request = new Request('http://example.com/');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerio.load(html);

		assert.equal($('link[rel=stylesheet]').toArray().length, 0);
	});

	describe('Inspect inlined stylesheets', () => {
		const allStyles = {};

		before(async () => {
			allStyles.value = await stylesFromServer(app);
		});

		commonExpectations(allStyles);
	});
});

async function stylesFromStaticOutput(fixture) {
	const html = await fixture.readFile('/index.html');
	const $ = cheerio.load(html);

	const links = $('link[rel=stylesheet]');
	const hrefs = links.map((_, linkEl) => linkEl.attribs.href).toArray();
	const allLinkedStylesheets = await Promise.all(hrefs.map((href) => fixture.readFile(href)));
	const allLinkedStyles = allLinkedStylesheets.join('');

	const styles = $('style');
	const allInlinedStylesheets = styles.map((_, styleEl) => styleEl.children[0].data).toArray();
	const allInlinedStyles = allInlinedStylesheets.join('');

	return allLinkedStyles + allInlinedStyles;
}

async function stylesFromServer(app) {
	const request = new Request('http://example.com/');
	const response = await app.render(request);
	const html = await response.text();
	const $ = cheerio.load(html);

	const links = $('link[rel=stylesheet]');
	const hrefs = links.map((_, linkEl) => linkEl.attribs.href).toArray();
	const allLinkedStylesheets = await Promise.all(
		hrefs.map(async (href) => {
			const cssRequest = new Request(`http://example.com${href}`);
			const cssResponse = await app.render(cssRequest);
			return await cssResponse.text();
		}),
	);
	const allLinkedStyles = allLinkedStylesheets.join('');

	const styles = $('style');
	const allInlinedStylesheets = styles.map((_, styleEl) => styleEl.children[0].data).toArray();
	const allInlinedStyles = allInlinedStylesheets.join('');
	return allLinkedStyles + allInlinedStyles;
}

function commonExpectations(allStyles) {
	it('Includes all authored css', () => {
		// authored in imported.css
		assert.ok(allStyles.value.includes('.bg-lightcoral'));

		// authored in index.astro
		assert.ok(allStyles.value.includes('#welcome'));

		// authored in components/Button.astro
		assert.ok(allStyles.value.includes('.variant-outline'));

		// authored in layouts/Layout.astro
		assert.ok(allStyles.value.includes('Menlo'));
	});

	it('Styles used both in content layout and directly in page are included only once', () => {
		// authored in components/Button.astro
		assert.equal(allStyles.value.match(/cubic-bezier/g).length, 1);
	});
}
