import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Aliases with tsconfig.json', () => {
	let fixture;

	/**
	 * @param {string} html
	 * @returns {string[]}
	 */
	function getLinks(html) {
		let $ = cheerio.load(html);
		let out = [];
		$('link[rel=stylesheet]').each((_i, el) => {
			out.push($(el).attr('href'));
		});
		return out;
	}

	/**
	 * @param {string} href
	 * @returns {Promise<{ href: string; css: string; }>}
	 */
	async function getLinkContent(href, f = fixture) {
		const css = await f.readFile(href);
		return { href, css };
	}

	before(async () => {
		fixture = await loadFixture({
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
			root: './fixtures/alias-tsconfig/',
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

		it('can load client components', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerio.load(html);

			// Should render aliased element
			assert.equal($('#client').text(), 'test');

			const scripts = $('script').toArray();
			assert.ok(scripts.length > 0);
		});

		it('can load via baseUrl', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerio.load(html);

			assert.equal($('#foo').text(), 'foo');
			assert.equal($('#constants-foo').text(), 'foo');
			assert.equal($('#constants-index').text(), 'index');
		});

		it('can load namespace packages with @* paths', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerio.load(html);

			assert.equal($('#namespace').text(), 'namespace');
		});

		it('works in css @import', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			// imported css should be bundled
			assert.ok(html.includes('#style-red'));
			assert.ok(html.includes('#style-blue'));
		});

		it('works in components', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerio.load(html);

			assert.equal($('#alias').text(), 'foo');
		});

		it('works for import.meta.glob', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerio.load(html);

			assert.equal($('#glob').text(), '/src/components/glob/a.js');
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('can load client components', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			// Should render aliased element
			assert.equal($('#client').text(), 'test');

			const scripts = $('script').toArray();
			assert.ok(scripts.length > 0);
		});

		it('can load via baseUrl', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#foo').text(), 'foo');
			assert.equal($('#constants-foo').text(), 'foo');
			assert.equal($('#constants-index').text(), 'index');
		});

		it('can load namespace packages with @* paths', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#namespace').text(), 'namespace');
		});

		it('works in css @import', async () => {
			const html = await fixture.readFile('/index.html');
			const content = await Promise.all(getLinks(html).map((href) => getLinkContent(href)));
			const [{ css }] = content;
			// imported css should be bundled
			assert.ok(css.includes('#style-red'));
			assert.ok(css.includes('#style-blue'));
		});

		it('works in components', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#alias').text(), 'foo');
		});

		it('handles multiple replacements in one alias', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#bar').text(), 'bar');
			assert.equal($('#baz').text(), 'baz');
		});

		it('works for import.meta.glob', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#glob').text(), '/src/components/glob/a.js');
		});
	});
});
