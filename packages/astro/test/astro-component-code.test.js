import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('<Code>', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/astro-component-code/' });
		await fixture.build();
	});

	it('<Code> without lang or theme', async () => {
		let html = await fixture.readFile('/no-lang/index.html');
		const $ = cheerio.load(html);
		assert.equal($('pre').length, 1);
		assert.equal(
			$('pre').attr('style'),
			'background-color:#24292e;color:#e1e4e8; overflow-x: auto;',
			'applies default and overflow',
		);
		assert.equal($('pre > code').length, 1);

		// test: contains some generated spans
		assert.equal($('pre > code span').length > 1, true);
	});

	it('<Code lang="...">', async () => {
		let html = await fixture.readFile('/basic/index.html');
		const $ = cheerio.load(html);
		assert.equal($('pre').length, 1);
		assert.equal($('pre').attr('class'), 'astro-code github-dark');
		assert.equal($('pre > code').length, 1);
		// test: contains many generated spans
		assert.equal($('pre > code span').length >= 6, true);
	});

	it('<Code theme="...">', async () => {
		let html = await fixture.readFile('/custom-theme/index.html');
		const $ = cheerio.load(html);
		assert.equal($('pre').length, 1);
		assert.equal($('pre').attr('class'), 'astro-code nord');
		assert.equal(
			$('pre').attr('style'),
			'background-color:#2e3440ff;color:#d8dee9ff; overflow-x: auto;',
			'applies custom theme',
		);
	});

	it('<Code wrap>', async () => {
		{
			let html = await fixture.readFile('/wrap-true/index.html');
			const $ = cheerio.load(html);
			assert.equal($('pre').length, 1);
			// test: applies wrap overflow
			assert.equal(
				$('pre').attr('style'),
				'background-color:#24292e;color:#e1e4e8; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;',
			);
		}
		{
			let html = await fixture.readFile('/wrap-false/index.html');
			const $ = cheerio.load(html);
			assert.equal($('pre').length, 1);
			// test: applies wrap overflow
			assert.equal(
				$('pre').attr('style'),
				'background-color:#24292e;color:#e1e4e8; overflow-x: auto;',
			);
		}
		{
			let html = await fixture.readFile('/wrap-null/index.html');
			const $ = cheerio.load(html);
			assert.equal($('pre').length, 1);
			// test: applies wrap overflow
			assert.equal($('pre').attr('style'), 'background-color:#24292e;color:#e1e4e8');
		}
	});

	it('<Code lang="..." theme="css-variables">', async () => {
		let html = await fixture.readFile('/css-theme/index.html');
		const $ = cheerio.load(html);
		assert.equal($('pre').length, 1);
		assert.equal($('pre').attr('class'), 'astro-code css-variables');
		assert.deepEqual(
			$('pre, pre span')
				.map((_i, f) => (f.attribs ? f.attribs.style : 'no style found'))
				.toArray(),
			[
				'background-color:var(--astro-code-background);color:var(--astro-code-foreground); overflow-x: auto;',
				'color:var(--astro-code-token-constant)',
				'color:var(--astro-code-token-function)',
				'color:var(--astro-code-foreground)',
				'color:var(--astro-code-token-string-expression)',
				'color:var(--astro-code-foreground)',
			],
		);
	});

	it('<Code> with custom theme and lang', async () => {
		let html = await fixture.readFile('/imported/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#theme > pre').length, 1);
		assert.equal(
			$('#theme > pre').attr('style'),
			'background-color:#FDFDFE;color:#4E5377; overflow-x: auto;',
		);

		assert.equal($('#lang > pre').length, 1);
		assert.equal($('#lang > pre > code span').length, 3);
	});

	it('<Code inline> has no pre tag', async () => {
		let html = await fixture.readFile('/inline/index.html');
		const $ = cheerio.load(html);
		const codeEl = $('.astro-code');

		assert.equal(codeEl.prop('tagName'), 'CODE');
		assert.match(codeEl.attr('style'), /background-color:/);
		assert.equal($('pre').length, 0);
	});
});
