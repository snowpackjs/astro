import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import mdx from '@astrojs/mdx';
import { parseHTML } from 'linkedom';
import rehypeMathjaxSvg from 'rehype-mathjax';
import rehypeMathjaxChtml from 'rehype-mathjax/chtml';
import remarkMath from 'remark-math';
import { loadFixture } from '../../../astro/test/test-utils.js';

const FIXTURE_ROOT = new URL('./fixtures/mdx-math/', import.meta.url);

describe('MDX math', () => {
	describe('mathjax', () => {
		it('works with svg', async () => {
			const fixture = await loadFixture({
				root: FIXTURE_ROOT,
				markdown: {
					remarkPlugins: [remarkMath],
					rehypePlugins: [rehypeMathjaxSvg],
				},
				integrations: [mdx()],
			});
			await fixture.build();

			const html = await fixture.readFile('/mathjax/index.html');
			const { document } = parseHTML(html);

			const mjxContainer = document.querySelector('mjx-container[jax="SVG"]');
			assert.notEqual(mjxContainer, null);

			const mjxStyle = document.querySelectorAll('style')[0].innerHTML;
			assert.equal(
				mjxStyle.includes('mjx-container[jax="SVG"]'),
				true,
				'style should not be html-escaped',
			);
		});

		it('works with chtml', async () => {
			const fixture = await loadFixture({
				root: FIXTURE_ROOT,
				markdown: {
					remarkPlugins: [remarkMath],
					rehypePlugins: [
						[
							rehypeMathjaxChtml,
							{
								chtml: {
									fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2',
								},
							},
						],
					],
				},
				integrations: [mdx()],
			});
			await fixture.build();

			const html = await fixture.readFile('/mathjax/index.html');
			const { document } = parseHTML(html);

			const mjxContainer = document.querySelector('mjx-container[jax="CHTML"]');
			assert.notEqual(mjxContainer, null);

			const mjxStyle = document.querySelectorAll('style')[0].innerHTML;
			assert.equal(
				mjxStyle.includes('mjx-container[jax="CHTML"]'),
				true,
				'style should not be html-escaped',
			);
		});
	});
});
