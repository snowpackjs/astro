import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Content layer markdoc', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/content-layer-markdoc/',
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

		it('renders content - with components', async () => {
			const res = await fixture.fetch('/');
			const html = await res.text();

			renderComponentsChecks(html);
		});

		it('renders content - with components inside partials', async () => {
			const res = await fixture.fetch('/');
			const html = await res.text();

			renderComponentsInsidePartialsChecks(html);
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('renders content - with components', async () => {
			const html = await fixture.readFile('/index.html');

			renderComponentsChecks(html);
		});

		it('renders content - with components inside partials', async () => {
			const html = await fixture.readFile('/index.html');

			renderComponentsInsidePartialsChecks(html);
		});
	});
});

/** @param {string} html */
function renderComponentsChecks(html) {
	const $ = cheerio.load(html);
	const h2 = $('h2');
	assert.equal(h2.text(), 'Post with components');

	// Renders custom shortcode component
	const marquee = $('marquee');
	assert.notEqual(marquee, null);
	assert.equal(marquee.attr('data-custom-marquee'), '');

	// Renders Astro Code component
	const pre = $('pre');
	assert.notEqual(pre, null);
	assert.ok(pre.hasClass('github-dark'));
	assert.ok(pre.hasClass('astro-code'));
}

/** @param {string} html */
function renderComponentsInsidePartialsChecks(html) {
	const $ = cheerio.load(html);
	// renders Counter.tsx
	const button = $('#counter');
	assert.equal(button.text(), '1');

	// renders DeeplyNested.astro
	const deeplyNested = $('#deeply-nested');
	assert.equal(deeplyNested.text(), 'Deeply nested partial');
}
