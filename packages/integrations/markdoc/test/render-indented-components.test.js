import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

const root = new URL('./fixtures/render-with-indented-components/', import.meta.url);

describe('Markdoc - render indented components', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root,
		});
	});

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('renders content - with indented components', async () => {
			const res = await fixture.fetch('/');
			const html = await res.text();

			renderIndentedComponentsChecks(html);
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('renders content - with indented components', async () => {
			const html = await fixture.readFile('/index.html');

			renderIndentedComponentsChecks(html);
		});
	});
});

/** @param {string} html */
function renderIndentedComponentsChecks(html) {
	const { document } = parseHTML(html);
	const h2 = document.querySelector('h2');
	assert.equal(h2.textContent, 'Post with indented components');

	// Renders custom shortcode components
	const marquees = document.querySelectorAll('marquee');
	assert.equal(marquees.length, 2);

	// Renders h3
	const h3 = document.querySelector('h3');
	assert.equal(h3.textContent, 'I am an h3!');

	// Renders Astro Code component
	const pre = document.querySelector('pre');
	assert.notEqual(pre, null);
	assert.equal(pre.className, 'astro-code github-dark');
}
