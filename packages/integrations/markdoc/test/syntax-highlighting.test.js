import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import Markdoc from '@markdoc/markdoc';
import { isHTMLString } from 'astro/runtime/server/index.js';
import { parseHTML } from 'linkedom';
import prism from '../dist/extensions/prism.js';
import shiki from '../dist/extensions/shiki.js';
import { setupConfig } from '../dist/runtime.js';

const entry = `
\`\`\`ts
const highlighting = true;
\`\`\`

\`\`\`css
.highlighting {
	color: red;
}
\`\`\`
`;

describe('Markdoc - syntax highlighting', () => {
	describe('shiki', () => {
		it('transforms with defaults', async () => {
			const ast = Markdoc.parse(entry);
			const content = await Markdoc.transform(ast, await getConfigExtendingShiki());

			assert.equal(content.children.length, 2);
			for (const codeBlock of content.children) {
				assert.equal(isHTMLString(codeBlock), true);

				const pre = parsePreTag(codeBlock);
				assert.equal(pre.classList.contains('astro-code'), true);
				assert.equal(pre.classList.contains('github-dark'), true);
			}
		});
		it('transforms with `theme` property', async () => {
			const ast = Markdoc.parse(entry);
			const content = await Markdoc.transform(
				ast,
				await getConfigExtendingShiki({
					theme: 'dracula',
				}),
			);
			assert.equal(content.children.length, 2);
			for (const codeBlock of content.children) {
				assert.equal(isHTMLString(codeBlock), true);

				const pre = parsePreTag(codeBlock);
				assert.equal(pre.classList.contains('astro-code'), true);
				assert.equal(pre.classList.contains('dracula'), true);
			}
		});
		it('transforms with `wrap` property', async () => {
			const ast = Markdoc.parse(entry);
			const content = await Markdoc.transform(
				ast,
				await getConfigExtendingShiki({
					wrap: true,
				}),
			);
			assert.equal(content.children.length, 2);
			for (const codeBlock of content.children) {
				assert.equal(isHTMLString(codeBlock), true);

				const pre = parsePreTag(codeBlock);
				assert.equal(pre.getAttribute('style').includes('white-space: pre-wrap'), true);
				assert.equal(pre.getAttribute('style').includes('word-wrap: break-word'), true);
			}
		});
		it('transform within if tags', async () => {
			const ast = Markdoc.parse(`
{% if equals("true", "true") %}
Inside truthy

\`\`\`js
const hello = "yes";
\`\`\`

{% /if %}`);
			const content = await Markdoc.transform(ast, await getConfigExtendingShiki());
			assert.equal(content.children.length, 1);
			assert.equal(content.children[0].length, 2);
			const pTag = content.children[0][0];
			assert.equal(pTag.name, 'p');
			const codeBlock = content.children[0][1];
			assert.equal(isHTMLString(codeBlock), true);
			const pre = parsePreTag(codeBlock);
			assert.equal(pre.classList.contains('astro-code'), true);
			assert.equal(pre.classList.contains('github-dark'), true);
		});
	});

	describe('prism', () => {
		it('transforms', async () => {
			const ast = Markdoc.parse(entry);
			const config = await setupConfig({
				extends: [prism()],
			});
			const content = await Markdoc.transform(ast, config);

			assert.equal(content.children.length, 2);
			const [tsBlock, cssBlock] = content.children;

			assert.equal(isHTMLString(tsBlock), true);
			assert.equal(isHTMLString(cssBlock), true);

			const preTs = parsePreTag(tsBlock);
			assert.equal(preTs.classList.contains('language-ts'), true);

			const preCss = parsePreTag(cssBlock);
			assert.equal(preCss.classList.contains('language-css'), true);
		});
	});
});

/**
 * @param {import('astro').ShikiConfig} config
 * @returns {import('../src/config.js').AstroMarkdocConfig}
 */
async function getConfigExtendingShiki(config) {
	return await setupConfig({
		extends: [shiki(config)],
	});
}

/**
 * @param {string} html
 * @returns {HTMLPreElement}
 */
function parsePreTag(html) {
	const { document } = parseHTML(html);
	const pre = document.querySelector('pre');
	assert.ok(pre);
	return pre;
}
