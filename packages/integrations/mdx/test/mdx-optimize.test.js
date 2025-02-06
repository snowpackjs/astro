import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

const FIXTURE_ROOT = new URL('./fixtures/mdx-optimize/', import.meta.url);

describe('MDX optimize', () => {
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: FIXTURE_ROOT,
		});
		await fixture.build();
	});

	it('renders an MDX page fine', async () => {
		const html = await fixture.readFile('/index.html');
		const { document } = parseHTML(html);

		assert.equal(document.querySelector('h1').textContent.includes('MDX page'), true);
		assert.equal(
			document.querySelector('p').textContent.includes('I once heard a very inspirational quote:'),
			true,
		);

		const blockquote = document.querySelector('blockquote.custom-blockquote');
		assert.notEqual(blockquote, null);
		assert.equal(blockquote.textContent.includes('I like pancakes'), true);

		const code = document.querySelector('pre.astro-code');
		assert.notEqual(code, null);
		assert.equal(code.textContent.includes(`const pancakes = 'yummy'`), true);
	});

	it('renders an Astro page that imports MDX fine', async () => {
		const html = await fixture.readFile('/import/index.html');
		const { document } = parseHTML(html);

		assert.equal(document.querySelector('h1').textContent.includes('Astro page'), true);
		assert.equal(
			document.querySelector('p').textContent.includes('I once heard a very inspirational quote:'),
			true,
		);

		const blockquote = document.querySelector('blockquote.custom-blockquote');
		assert.notEqual(blockquote, null);
		assert.equal(blockquote.textContent.includes('I like pancakes'), true);
	});

	it('renders MDX with rehype plugin that incorrectly injects root hast node', async () => {
		const html = await fixture.readFile('/import/index.html');
		const { document } = parseHTML(html);

		assert.doesNotMatch(html, /set:html=/);
		assert.equal(
			document.getElementById('injected-root-hast').textContent,
			'Injected root hast from rehype plugin',
		);
	});
});
