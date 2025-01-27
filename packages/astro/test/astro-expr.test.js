import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Expressions', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-expr/',
		});
		await fixture.build();
	});

	it('Can load page', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		for (let col of ['red', 'yellow', 'blue']) {
			assert.equal($('#' + col).length, 1);
		}
	});

	it('Ignores characters inside of strings', async () => {
		const html = await fixture.readFile('/strings/index.html');
		const $ = cheerio.load(html);

		for (let col of ['red', 'yellow', 'blue']) {
			assert.equal($('#' + col).length, 1);
		}
	});

	it('Ignores characters inside of line comments', async () => {
		const html = await fixture.readFile('/line-comments/index.html');
		const $ = cheerio.load(html);

		for (let col of ['red', 'yellow', 'blue']) {
			assert.equal($('#' + col).length, 1);
		}
	});

	it('Ignores characters inside of multiline comments', async () => {
		const html = await fixture.readFile('/multiline-comments/index.html');
		const $ = cheerio.load(html);

		for (let col of ['red', 'yellow', 'blue']) {
			assert.equal($('#' + col).length, 1);
		}
	});

	it('Allows multiple JSX children in mustache', async () => {
		const html = await fixture.readFile('/multiple-children/index.html');

		assert.equal(html.includes('#f'), true);
		assert.equal(html.includes('#t'), false);
	});

	it('Allows <> Fragments in expressions', async () => {
		const html = await fixture.readFile('/multiple-children/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#fragment').children().length, 3);
		assert.equal($('#fragment').children('#a').length, 1);
		assert.equal($('#fragment').children('#b').length, 1);
		assert.equal($('#fragment').children('#c').length, 1);
	});

	it('Does not render falsy values using &&', async () => {
		const html = await fixture.readFile('/falsy/index.html');
		const $ = cheerio.load(html);

		// test 1: Expected {true && <span id="true" />} to render
		assert.equal($('#true').length, 1);

		// test 2: Expected {0 && "VALUE"} to render "0"
		assert.equal($('#zero').text(), '0');

		// test 3: Expected {false && <span id="false" />} not to render
		assert.equal($('#false').length, 0);

		// test 4: Expected {null && <span id="null" />} not to render
		assert.equal($('#null').length, 0);

		// test 5: Expected {undefined && <span id="undefined" />} not to render
		assert.equal($('#undefined').length, 0);

		// Inside of a component

		// test 6: Expected {true && <span id="true" />} to render
		assert.equal($('#frag-true').length, 1);

		// test 7: Expected {false && <span id="false" />} not to render
		assert.equal($('#frag-false').length, 0);

		// test 8: Expected {null && <span id="null" />} not to render
		assert.equal($('#frag-null').length, 0);

		// test 9: Expected {undefined && <span id="undefined" />} not to render
		assert.equal($('#frag-undefined').length, 0);
	});

	it('Escapes HTML by default', async () => {
		const html = await fixture.readFile('/escape/index.html');
		const $ = cheerio.load(html);

		assert.equal($('body').children().length, 2);
		assert.equal(
			$('body').html().includes('&lt;script&gt;console.log("pwnd")&lt;/script&gt;'),
			true,
		);
		assert.equal($('#trusted').length, 1);
	});

	it('Does not double-escape HTML', async () => {
		const html = await fixture.readFile('/escape/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#single-escape').html(), 'Astro &amp; Vite');
	});

	it('Handles switch statements', async () => {
		const html = await fixture.readFile('/switch/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#red').length, 0);
		assert.equal($('#yellow').length, 1);
		assert.equal($('#blue').length, 0);
	});
});
