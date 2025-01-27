import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('CSS production ordering', () => {
	function getLinks(html) {
		let $ = cheerio.load(html);
		let out = [];
		$('link[rel=stylesheet]').each((_i, el) => {
			out.push($(el).attr('href'));
		});
		return out;
	}

	/**
	 *
	 * @param {import('./test-utils').Fixture} fixture
	 * @param {string} href
	 * @returns {Promise<{ href: string; css: string; }>}
	 */
	async function getLinkContent(fixture, href) {
		const css = await fixture.readFile(href);
		return { href, css };
	}

	describe('SSG and SSR parity', () => {
		let staticHTML, serverHTML;
		let staticCSS, serverCSS;

		const commonConfig = Object.freeze({
			root: './fixtures/css-order/',
		});

		before(async () => {
			let fixture = await loadFixture({ ...commonConfig });
			await fixture.build();
			staticHTML = await fixture.readFile('/one/index.html');
			staticCSS = await Promise.all(
				getLinks(staticHTML).map((href) => getLinkContent(fixture, href)),
			);
		});

		before(async () => {
			let fixture = await loadFixture({
				...commonConfig,
				adapter: testAdapter(),
				output: 'server',
			});
			await fixture.build();

			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/one');
			const response = await app.render(request);
			serverHTML = await response.text();
			serverCSS = await Promise.all(
				getLinks(serverHTML).map(async (href) => {
					const css = await fixture.readFile(`/client${href}`);
					return { href, css };
				}),
			);
		});

		it('is in the same order for output: server and static', async () => {
			const staticContent = staticCSS.map((o) => o.css);
			const serverContent = serverCSS.map((o) => o.css);

			assert.deepEqual(staticContent, serverContent);
		});
	});

	describe('Page vs. Shared CSS', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/css-order/',
				// test suite was authored when inlineStylesheets defaulted to never
				build: { inlineStylesheets: 'never' },
			});
			await fixture.build();
		});

		it('Page level CSS is defined lower in the page', async () => {
			let html = await fixture.readFile('/two/index.html');

			const content = await Promise.all(
				getLinks(html).map((href) => getLinkContent(fixture, href)),
			);

			assert.ok(content.length, 3, 'there are 3 stylesheets');
			const [, sharedStyles, pageStyles] = content;

			assert.ok(/red/.exec(sharedStyles.css));
			assert.ok(/#00f/.exec(pageStyles.css));
		});

		it('CSS injected by injectScript comes first because of import order', async () => {
			let oneHtml = await fixture.readFile('/one/index.html');
			let twoHtml = await fixture.readFile('/two/index.html');
			let threeHtml = await fixture.readFile('/three/index.html');

			for (const html of [oneHtml, twoHtml, threeHtml]) {
				const content = await Promise.all(
					getLinks(html).map((href) => getLinkContent(fixture, href)),
				);

				const [first] = content;
				assert.ok(first.css.includes('green'), 'Came from the injected script');
			}
		});
	});
});
