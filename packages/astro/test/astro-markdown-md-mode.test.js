import { expect } from 'chai';
import * as cheerio from 'cheerio';
import { loadFixture, fixLineEndings } from './test-utils.js';

describe('Astro Markdown - plain MD mode', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-markdown/',
			markdown: {
				mode: 'md',
			},
		});
		await fixture.build();
	});

	it('Leaves JSX expressions unprocessed', async () => {
		const html = await fixture.readFile('/jsx-expressions/index.html');
		const $ = cheerio.load(html);

		expect($('h2').html()).to.equal('{frontmatter.title}');
	});

	it('Leaves JSX components un-transformed', async () => {
		const html = await fixture.readFile('/children/index.html');

		expect(html).to.include('<textblock title="Hello world!" nopadding="">');
	});

	describe('syntax highlighting', async () => {
		it('handles Shiki', async () => {
			const html = await fixture.readFile('/code-in-md/index.html');
			const $ = cheerio.load(html);

			expect($('pre.astro-code').length).to.not.equal(0);
		});

		it('handles Prism', async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-markdown/',
				markdown: {
					syntaxHighlight: 'prism',
					mode: 'md',
				},
			});
			await fixture.build();

			const html = await fixture.readFile('/code-in-md/index.html');
			const $ = cheerio.load(html);

			expect($('pre.language-html').length).to.not.equal(0);
		});
	});
});
