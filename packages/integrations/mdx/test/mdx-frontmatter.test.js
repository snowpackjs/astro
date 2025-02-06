import mdx from '@astrojs/mdx';

import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

const FIXTURE_ROOT = new URL('./fixtures/mdx-frontmatter/', import.meta.url);

describe('MDX frontmatter', () => {
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: FIXTURE_ROOT,
			integrations: [mdx()],
		});
		await fixture.build();
	});
	it('builds when "frontmatter.property" is in JSX expression', async () => {
		assert.equal(true, true);
	});

	it('extracts frontmatter to "frontmatter" export', async () => {
		const { titles } = JSON.parse(await fixture.readFile('/glob.json'));
		assert.equal(titles.includes('Using YAML frontmatter'), true);
	});

	it('renders layout from "layout" frontmatter property', async () => {
		const html = await fixture.readFile('/index.html');
		const { document } = parseHTML(html);

		const layoutParagraph = document.querySelector('[data-layout-rendered]');

		assert.notEqual(layoutParagraph, null);
	});

	it('passes frontmatter to layout via "content" and "frontmatter" props', async () => {
		const html = await fixture.readFile('/index.html');
		const { document } = parseHTML(html);

		const contentTitle = document.querySelector('[data-content-title]');
		const frontmatterTitle = document.querySelector('[data-frontmatter-title]');

		assert.equal(contentTitle.textContent, 'Using YAML frontmatter');
		assert.equal(frontmatterTitle.textContent, 'Using YAML frontmatter');
	});

	it('passes headings to layout via "headings" prop', async () => {
		const html = await fixture.readFile('/with-headings/index.html');
		const { document } = parseHTML(html);

		const headingSlugs = [...document.querySelectorAll('[data-headings] > li')].map(
			(el) => el.textContent,
		);

		assert.equal(headingSlugs.length > 0, true);
		assert.equal(headingSlugs.includes('section-1'), true);
		assert.equal(headingSlugs.includes('section-2'), true);
	});

	it('passes "file" and "url" to layout', async () => {
		const html = await fixture.readFile('/with-headings/index.html');
		const { document } = parseHTML(html);

		const frontmatterFile = document.querySelector('[data-frontmatter-file]')?.textContent;
		const frontmatterUrl = document.querySelector('[data-frontmatter-url]')?.textContent;
		const file = document.querySelector('[data-file]')?.textContent;
		const url = document.querySelector('[data-url]')?.textContent;

		assert.equal(
			frontmatterFile?.endsWith('with-headings.mdx'),
			true,
			'"file" prop does not end with correct path or is undefined',
		);
		assert.equal(frontmatterUrl, '/with-headings');
		assert.equal(file, frontmatterFile);
		assert.equal(url, frontmatterUrl);
	});
});
