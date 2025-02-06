import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Directives', async () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-directives/',
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
		await fixture.build();
	});

	it('Passes define:vars to script elements', async () => {
		const html = await fixture.readFile('/define-vars/index.html');
		const $ = cheerio.load(html);

		assert.equal($('script').length, 5);

		let i = 0;
		for (const script of $('script').toArray()) {
			// Wrap script in scope ({}) to avoid redeclaration errors
			assert.equal($(script).text().startsWith('(function(){'), true);
			assert.equal($(script).text().endsWith('})();'), true);
			if (i < 2) {
				// Inline defined variables
				assert.equal($(script).toString().includes('const foo = "bar"'), true);
			} else if (i < 3) {
				// Convert invalid keys to valid identifiers
				assert.equal($(script).toString().includes('const dashCase = "bar"'), true);
			} else if (i < 4) {
				// Closing script tags in strings are escaped
				assert.equal($(script).toString().includes('const bar = "<script>bar\\x3C/script>"'), true);
			} else {
				// Vars with undefined values are handled
				assert.equal($(script).toString().includes('const undef = undefined'), true);
			}
			i++;
		}
	});

	it('Passes define:vars to style elements', async () => {
		const html = await fixture.readFile('/define-vars/index.html');
		const $ = cheerio.load(html);

		// All styles should be bundled
		assert.equal($('style').length, 0);

		// Inject style attribute on top-level element in page
		assert.equal($('html').attr('style').toString().includes('--bg: white;'), true);
		assert.equal($('html').attr('style').toString().includes('--fg: black;'), true);

		// Inject style attribute on top-level elements in component
		assert.equal($('h1').attr('style').toString().includes('--textColor: red;'), true);
	});

	it('Properly handles define:vars on style elements with style object', async () => {
		const html = await fixture.readFile('/define-vars/index.html');
		const $ = cheerio.load(html);

		// All styles should be bundled
		assert.equal($('style').length, 0);

		// Inject style attribute on top-level element in page
		assert.equal(
			$('#compound-style')
				.attr('style')
				.toString()
				.includes('color:var(--fg);--fg: black;--bg: white;'),
			true,
		);
	});

	it('set:html', async () => {
		const html = await fixture.readFile('/set-html/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#text').length, 1);
		assert.equal($('#text').text(), 'a');

		assert.equal($('#zero').length, 1);
		assert.equal($('#zero').text(), '0');

		assert.equal($('#number').length, 1);
		assert.equal($('#number').text(), '1');

		assert.equal($('#undefined').length, 1);
		assert.equal($('#undefined').text(), '');

		assert.equal($('#null').length, 1);
		assert.equal($('#null').text(), '');

		assert.equal($('#false').length, 1);
		assert.equal($('#false').text(), '');

		assert.equal($('#true').length, 1);
		assert.equal($('#true').text(), 'true');
	});
});
