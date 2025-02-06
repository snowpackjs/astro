import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import * as cheerio from 'cheerio';
import addClasses from './fixtures/astro-markdown-plugins/add-classes.mjs';
import { loadFixture } from './test-utils.js';

const defaultMarkdownConfig = {
	gfm: true,
	smartypants: true,
	remarkPlugins: [
		remarkExamplePlugin,
		'remark-code-titles',
		['rehype-autolink-headings', { behavior: 'prepend' }],
	],
	rehypePlugins: [
		'rehype-slug',
		['rehype-toc', { headings: ['h2', 'h3'] }],
		[addClasses, { 'h1,h2,h3': 'title' }],
	],
};

function remarkExamplePlugin() {
	return (tree) => {
		tree.children.push({
			type: 'paragraph',
			children: [{ type: 'text', value: 'Remark plugin applied!' }],
		});
	};
}

describe('Astro Markdown plugins', () => {
	describe('Default test plugins', () => {
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-markdown-plugins/',
				markdown: defaultMarkdownConfig,
			});
			await fixture.build();
		});

		it('Can render markdown with plugins', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);

			// test 1: Added a TOC
			assert.equal($('.toc').length, 1);

			// test 2: Added .title to h1
			assert.ok($('#hello-world').hasClass('title'));
		});

		// Asserts Astro 1.0 behavior is removed. Test can be removed in Astro 3.0.
		it('Still applies default plugins when user plugins are provided', async () => {
			const gfmHtml = await fixture.readFile('/with-gfm/index.html');
			const $1 = cheerio.load(gfmHtml);
			assert.equal($1('a[href="https://example.com"]').length, 1);

			const smartypantsHtml = await fixture.readFile('/with-smartypants/index.html');
			const $2 = cheerio.load(smartypantsHtml);
			assert.equal($2('p').html(), '“Smartypants” is — awesome');

			testRemark(gfmHtml);
			testRehype(gfmHtml, '#github-flavored-markdown-test');
		});

		it(`Handles GFM when gfm = true`, async () => {
			const html = await fixture.readFile('/with-gfm/index.html');
			const $ = cheerio.load(html);

			// test 1: GFM autolink applied correctly
			assert.equal($('a[href="https://example.com"]').length, 1);

			testRemark(html);
			testRehype(html, '#github-flavored-markdown-test');
		});

		it(`Handles SmartyPants when smartypants = true`, async () => {
			const html = await fixture.readFile('/with-smartypants/index.html');
			const $ = cheerio.load(html);

			// test 1: smartypants applied correctly
			assert.equal($('p').html(), '“Smartypants” is — awesome');

			testRemark(html);
			testRehype(html, '#smartypants-test');
		});
	});

	it(`Handles GFM when gfm = false`, async () => {
		const fixture = await loadFixture({
			root: './fixtures/astro-markdown-plugins/',
			markdown: { ...defaultMarkdownConfig, gfm: false },
		});
		await fixture.build();

		const html = await fixture.readFile('/with-gfm/index.html');
		const $ = cheerio.load(html);

		assert.equal($('a[href="https://example.com"]').length, 0);

		testRemark(html);
		testRehype(html, '#github-flavored-markdown-test');
	});

	it(`Handles SmartyPants when smartypants = false`, async () => {
		const fixture = await loadFixture({
			root: './fixtures/astro-markdown-plugins/',
			markdown: { ...defaultMarkdownConfig, smartypants: false },
		});
		await fixture.build();

		const html = await fixture.readFile('/with-smartypants/index.html');
		const $ = cheerio.load(html);

		assert.equal($('p').html(), '"Smartypants" is -- awesome');

		testRemark(html);
		testRehype(html, '#smartypants-test');
	});

	describe('content layer plugins', () => {
		let fixture;
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/content-layer-remark-plugins/',
			});
			await fixture.build();
		});

		it('passes untransformed frontmatter to remark plugins', async () => {
			const html = await fixture.readFile('/test1/index.html');
			const $ = cheerio.load(html);
			assert.equal($('p').text(), 'Not transformed');
		});

		it('processes empty markdown content with remark plugins', async () => {
			const html = await fixture.readFile('/empty-content/index.html');
			const $ = cheerio.load(html);
			assert.equal($('h1').text(), 'Test Empty Markdown');
			assert.equal(
				$('#frontmatter-custom-property').text(),
				'Generated property via remark plugin!',
			);
		});
	});
});

function testRehype(html, headingId) {
	const $ = cheerio.load(html);
	assert.equal($(headingId).length, 1);
	assert.ok($(headingId).hasClass('title'));
}

function testRemark(html) {
	assert.ok(html.includes('Remark plugin applied!'));
}
