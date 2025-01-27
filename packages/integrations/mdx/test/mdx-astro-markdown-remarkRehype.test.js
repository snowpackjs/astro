import mdx from '@astrojs/mdx';

import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

describe('MDX with Astro Markdown remark-rehype config', () => {
	it('Renders footnotes with values from the default configuration', async () => {
		const fixture = await loadFixture({
			root: new URL('./fixtures/mdx-astro-markdown-remarkRehype/', import.meta.url),
			integrations: [mdx()],
			markdown: {
				remarkRehype: {
					footnoteLabel: 'Catatan kaki',
					footnoteBackLabel: 'Kembali ke konten',
				},
			},
		});

		await fixture.build();
		const html = await fixture.readFile('/index.html');
		const { document } = parseHTML(html);

		assert.equal(document.querySelector('#footnote-label').textContent, 'Catatan kaki');
		assert.equal(
			document.querySelector('.data-footnote-backref').getAttribute('aria-label'),
			'Kembali ke konten',
		);
	});

	it('Renders footnotes with values from custom configuration extending the default', async () => {
		const fixture = await loadFixture({
			root: new URL('./fixtures/mdx-astro-markdown-remarkRehype/', import.meta.url),
			integrations: [
				mdx({
					remarkRehype: {
						footnoteLabel: 'Catatan kaki',
						footnoteBackLabel: 'Kembali ke konten',
					},
				}),
			],
			markdown: {
				remarkRehype: {
					footnoteBackLabel: 'Replace me',
				},
			},
		});

		await fixture.build();
		const html = await fixture.readFile('/index.html');
		const { document } = parseHTML(html);

		assert.equal(document.querySelector('#footnote-label').textContent, 'Catatan kaki');
		assert.equal(
			document.querySelector('.data-footnote-backref').getAttribute('aria-label'),
			'Kembali ke konten',
		);
	});

	it('Renders footnotes with values from custom configuration without extending the default', async () => {
		const fixture = await loadFixture({
			root: new URL('./fixtures/mdx-astro-markdown-remarkRehype/', import.meta.url),
			integrations: [
				mdx({
					extendPlugins: 'astroDefaults',
					remarkRehype: {
						footnoteLabel: 'Catatan kaki',
					},
				}),
			],
			markdown: {
				remarkRehype: {
					footnoteBackLabel: 'Kembali ke konten',
				},
			},
		});

		await fixture.build();
		const html = await fixture.readFile('/index.html');
		const { document } = parseHTML(html);

		assert.equal(document.querySelector('#footnote-label').textContent, 'Catatan kaki');
		assert.equal(
			document.querySelector('.data-footnote-backref').getAttribute('aria-label'),
			'Back to reference 1',
		);
	});
});
