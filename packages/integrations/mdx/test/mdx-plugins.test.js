import mdx from '@astrojs/mdx';

import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { visit as estreeVisit } from 'estree-util-visit';
import { parseHTML } from 'linkedom';
import remarkToc from 'remark-toc';
import { loadFixture } from '../../../astro/test/test-utils.js';

const FIXTURE_ROOT = new URL('./fixtures/mdx-plugins/', import.meta.url);
const FILE = '/with-plugins/index.html';

describe('MDX plugins', () => {
	it('supports custom remark plugins - TOC', async () => {
		const fixture = await buildFixture({
			integrations: [
				mdx({
					remarkPlugins: [remarkToc],
				}),
			],
		});

		const html = await fixture.readFile(FILE);
		const { document } = parseHTML(html);

		assert.notEqual(selectTocLink(document), null);
	});

	it('Applies GFM by default', async () => {
		const fixture = await buildFixture({
			integrations: [mdx()],
		});

		const html = await fixture.readFile(FILE);
		const { document } = parseHTML(html);

		assert.notEqual(selectGfmLink(document), null);
	});

	it('Applies SmartyPants by default', async () => {
		const fixture = await buildFixture({
			integrations: [mdx()],
		});

		const html = await fixture.readFile(FILE);
		const { document } = parseHTML(html);

		const quote = selectSmartypantsQuote(document);
		assert.notEqual(quote, null);
		assert.equal(quote.textContent.includes('“Smartypants” is — awesome'), true);
	});

	it('supports custom rehype plugins', async () => {
		const fixture = await buildFixture({
			integrations: [
				mdx({
					rehypePlugins: [rehypeExamplePlugin],
				}),
			],
		});
		const html = await fixture.readFile(FILE);
		const { document } = parseHTML(html);

		assert.notEqual(selectRehypeExample(document), null);
	});

	it('supports custom rehype plugins from integrations', async () => {
		const fixture = await buildFixture({
			integrations: [
				mdx(),
				{
					name: 'test',
					hooks: {
						'astro:config:setup': ({ updateConfig }) => {
							updateConfig({
								markdown: {
									rehypePlugins: [rehypeExamplePlugin],
								},
							});
						},
					},
				},
			],
		});
		const html = await fixture.readFile(FILE);
		const { document } = parseHTML(html);

		assert.notEqual(selectRehypeExample(document), null);
	});

	it('supports custom rehype plugins with namespaced attributes', async () => {
		const fixture = await buildFixture({
			integrations: [
				mdx({
					rehypePlugins: [rehypeSvgPlugin],
				}),
			],
		});
		const html = await fixture.readFile(FILE);
		const { document } = parseHTML(html);

		assert.notEqual(selectRehypeSvg(document), null);
	});

	it('extends markdown config by default', async () => {
		const fixture = await buildFixture({
			markdown: {
				remarkPlugins: [remarkExamplePlugin],
				rehypePlugins: [rehypeExamplePlugin],
			},
			integrations: [mdx()],
		});

		const html = await fixture.readFile(FILE);
		const { document } = parseHTML(html);

		assert.notEqual(selectRemarkExample(document), null);
		assert.notEqual(selectRehypeExample(document), null);
	});

	it('ignores string-based plugins in markdown config', async () => {
		const fixture = await buildFixture({
			markdown: {
				remarkPlugins: [['remark-toc', {}]],
			},
			integrations: [mdx()],
		});

		const html = await fixture.readFile(FILE);
		const { document } = parseHTML(html);

		assert.equal(selectTocLink(document), null);
	});

	for (const extendMarkdownConfig of [true, false]) {
		describe(`extendMarkdownConfig = ${extendMarkdownConfig}`, () => {
			let fixture;
			before(async () => {
				fixture = await buildFixture({
					markdown: {
						remarkPlugins: [remarkToc],
						gfm: false,
						smartypants: false,
					},
					integrations: [
						mdx({
							extendMarkdownConfig,
							remarkPlugins: [remarkExamplePlugin],
							rehypePlugins: [rehypeExamplePlugin],
						}),
					],
				});
			});

			it('Handles MDX plugins', async () => {
				const html = await fixture.readFile(FILE);
				const { document } = parseHTML(html);

				assert.notEqual(selectRemarkExample(document, 'MDX remark plugins not applied.'), null);
				assert.notEqual(selectRehypeExample(document, 'MDX rehype plugins not applied.'), null);
			});

			it('Handles Markdown plugins', async () => {
				const html = await fixture.readFile(FILE);
				const { document } = parseHTML(html);

				assert.equal(
					selectTocLink(
						document,
						'`remarkToc` plugin applied unexpectedly. Should override Markdown config.',
					),
					null,
				);
			});

			it('Handles gfm', async () => {
				const html = await fixture.readFile(FILE);
				const { document } = parseHTML(html);

				if (extendMarkdownConfig === true) {
					assert.equal(selectGfmLink(document), null, 'Does not respect `markdown.gfm` option.');
				} else {
					assert.notEqual(selectGfmLink(document), null, 'Respects `markdown.gfm` unexpectedly.');
				}
			});

			it('Handles smartypants', async () => {
				const html = await fixture.readFile(FILE);
				const { document } = parseHTML(html);

				const quote = selectSmartypantsQuote(document);

				if (extendMarkdownConfig === true) {
					assert.equal(
						quote.textContent.includes('"Smartypants" is -- awesome'),
						true,
						'Does not respect `markdown.smartypants` option.',
					);
				} else {
					assert.equal(
						quote.textContent.includes('“Smartypants” is — awesome'),
						true,
						'Respects `markdown.smartypants` unexpectedly.',
					);
				}
			});
		});
	}

	it('supports custom recma plugins', async () => {
		const fixture = await buildFixture({
			integrations: [
				mdx({
					recmaPlugins: [recmaExamplePlugin],
				}),
			],
		});

		const html = await fixture.readFile(FILE);
		const { document } = parseHTML(html);

		assert.notEqual(selectRecmaExample(document), null);
	});
});

async function buildFixture(config) {
	const fixture = await loadFixture({
		root: FIXTURE_ROOT,
		...config,
	});
	await fixture.build();
	return fixture;
}

function remarkExamplePlugin() {
	return (tree) => {
		tree.children.push({
			type: 'html',
			value: '<div data-remark-plugin-works="true"></div>',
		});
	};
}

function rehypeExamplePlugin() {
	return (tree) => {
		tree.children.push({
			type: 'element',
			tagName: 'div',
			properties: { 'data-rehype-plugin-works': 'true' },
		});
	};
}

function rehypeSvgPlugin() {
	return (tree) => {
		tree.children.push({
			type: 'element',
			tagName: 'svg',
			properties: { xmlns: 'http://www.w3.org/2000/svg' },
			children: [
				{
					type: 'element',
					tagName: 'use',
					properties: { xLinkHref: '#icon' },
				},
			],
		});
	};
}

function recmaExamplePlugin() {
	return (tree) => {
		estreeVisit(tree, (node) => {
			if (
				node.type === 'VariableDeclarator' &&
				node.id.name === 'recmaPluginWorking' &&
				node.init?.type === 'Literal'
			) {
				node.init = {
					...(node.init ?? {}),
					value: true,
					raw: 'true',
				};
			}
		});
	};
}

function selectTocLink(document) {
	return document.querySelector('ul a[href="#section-1"]');
}

function selectGfmLink(document) {
	return document.querySelector('a[href="https://handle-me-gfm.com"]');
}

function selectSmartypantsQuote(document) {
	return document.querySelector('blockquote');
}

function selectRemarkExample(document) {
	return document.querySelector('div[data-remark-plugin-works]');
}

function selectRehypeExample(document) {
	return document.querySelector('div[data-rehype-plugin-works]');
}

function selectRehypeSvg(document) {
	return document.querySelector('svg > use[xlink\\:href]');
}

function selectRecmaExample(document) {
	return document.querySelector('div[data-recma-plugin-works]');
}
