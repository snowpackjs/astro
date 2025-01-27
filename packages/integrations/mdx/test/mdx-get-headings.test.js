import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import { visit } from 'unist-util-visit';

import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

describe('MDX getHeadings', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/mdx-get-headings/', import.meta.url),
			integrations: [mdx()],
		});

		await fixture.build();
	});

	it('adds anchor IDs to headings', async () => {
		const html = await fixture.readFile('/test/index.html');
		const { document } = parseHTML(html);

		const h2Ids = document.querySelectorAll('h2').map((el) => el?.id);
		const h3Ids = document.querySelectorAll('h3').map((el) => el?.id);
		assert.equal(document.querySelector('h1').id, 'heading-test');
		assert.equal(h2Ids.includes('section-1'), true);
		assert.equal(h2Ids.includes('section-2'), true);
		assert.equal(h3Ids.includes('subsection-1'), true);
		assert.equal(h3Ids.includes('subsection-2'), true);
	});

	it('generates correct getHeadings() export', async () => {
		const { headingsByPage } = JSON.parse(await fixture.readFile('/pages.json'));
		// TODO: make this a snapshot test :)
		assert.equal(
			JSON.stringify(headingsByPage['./test.mdx']),
			JSON.stringify([
				{ depth: 1, slug: 'heading-test', text: 'Heading test' },
				{ depth: 2, slug: 'section-1', text: 'Section 1' },
				{ depth: 3, slug: 'subsection-1', text: 'Subsection 1' },
				{ depth: 3, slug: 'subsection-2', text: 'Subsection 2' },
				{ depth: 2, slug: 'section-2', text: 'Section 2' },
			]),
		);
	});

	it('generates correct getHeadings() export for JSX expressions', async () => {
		const { headingsByPage } = JSON.parse(await fixture.readFile('/pages.json'));
		assert.equal(
			JSON.stringify(headingsByPage['./test-with-jsx-expressions.mdx']),
			JSON.stringify([
				{
					depth: 1,
					slug: 'heading-test-with-jsx-expressions',
					text: 'Heading test with JSX expressions',
				},
				{ depth: 2, slug: 'h2title', text: 'h2Title' },
				{ depth: 3, slug: 'h3title', text: 'h3Title' },
			]),
		);
	});
});

describe('MDX heading IDs can be customized by user plugins', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/mdx-get-headings/', import.meta.url),
			integrations: [mdx()],
			markdown: {
				rehypePlugins: [
					() => (tree) => {
						let count = 0;
						visit(tree, 'element', (node) => {
							if (!/^h\d$/.test(node.tagName)) return;
							if (!node.properties?.id) {
								node.properties = { ...node.properties, id: String(count++) };
							}
						});
					},
				],
			},
		});

		await fixture.build();
	});

	it('adds user-specified IDs to HTML output', async () => {
		const html = await fixture.readFile('/test/index.html');
		const { document } = parseHTML(html);

		const h1 = document.querySelector('h1');
		assert.equal(h1?.textContent, 'Heading test');
		assert.equal(h1?.getAttribute('id'), '0');

		const headingIDs = document.querySelectorAll('h1,h2,h3').map((el) => el.id);
		assert.equal(
			JSON.stringify(headingIDs),
			JSON.stringify(Array.from({ length: headingIDs.length }, (_, idx) => String(idx))),
		);
	});

	it('generates correct getHeadings() export', async () => {
		const { headingsByPage } = JSON.parse(await fixture.readFile('/pages.json'));
		assert.equal(
			JSON.stringify(headingsByPage['./test.mdx']),
			JSON.stringify([
				{ depth: 1, slug: '0', text: 'Heading test' },
				{ depth: 2, slug: '1', text: 'Section 1' },
				{ depth: 3, slug: '2', text: 'Subsection 1' },
				{ depth: 3, slug: '3', text: 'Subsection 2' },
				{ depth: 2, slug: '4', text: 'Section 2' },
			]),
		);
	});
});

describe('MDX heading IDs can be injected before user plugins', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/mdx-get-headings/', import.meta.url),
			integrations: [
				mdx({
					rehypePlugins: [
						rehypeHeadingIds,
						() => (tree) => {
							visit(tree, 'element', (node) => {
								if (!/^h\d$/.test(node.tagName)) return;
								if (node.properties?.id) {
									node.children.push({ type: 'text', value: ' ' + node.properties.id });
								}
							});
						},
					],
				}),
			],
		});

		await fixture.build();
	});

	it('adds user-specified IDs to HTML output', async () => {
		const html = await fixture.readFile('/test/index.html');
		const { document } = parseHTML(html);

		const h1 = document.querySelector('h1');
		assert.equal(h1?.textContent, 'Heading test heading-test');
		assert.equal(h1?.id, 'heading-test');
	});
});

describe('MDX headings with frontmatter', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/mdx-get-headings/', import.meta.url),
			integrations: [mdx()],
		});

		await fixture.build();
	});

	it('adds anchor IDs to headings', async () => {
		const html = await fixture.readFile('/test-with-frontmatter/index.html');
		const { document } = parseHTML(html);

		const h3Ids = document.querySelectorAll('h3').map((el) => el?.id);

		assert.equal(document.querySelector('h1').id, 'the-frontmatter-title');
		assert.equal(document.querySelector('h2').id, 'frontmattertitle');
		assert.equal(h3Ids.includes('keyword-2'), true);
		assert.equal(h3Ids.includes('tag-1'), true);
		assert.equal(document.querySelector('h4').id, 'item-2');
		assert.equal(document.querySelector('h5').id, 'nested-item-3');
		assert.equal(document.querySelector('h6').id, 'frontmatterunknown');
	});

	it('generates correct getHeadings() export', async () => {
		const { headingsByPage } = JSON.parse(await fixture.readFile('/pages.json'));
		assert.equal(
			JSON.stringify(headingsByPage['./test-with-frontmatter.mdx']),
			JSON.stringify([
				{ depth: 1, slug: 'the-frontmatter-title', text: 'The Frontmatter Title' },
				{ depth: 2, slug: 'frontmattertitle', text: 'frontmatter.title' },
				{ depth: 3, slug: 'keyword-2', text: 'Keyword 2' },
				{ depth: 3, slug: 'tag-1', text: 'Tag 1' },
				{ depth: 4, slug: 'item-2', text: 'Item 2' },
				{ depth: 5, slug: 'nested-item-3', text: 'Nested Item 3' },
				{ depth: 6, slug: 'frontmatterunknown', text: 'frontmatter.unknown' },
			]),
		);
	});
});
