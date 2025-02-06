import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { isWindows, loadFixture } from './test-utils.js';

describe.skip('Solid component build', { todo: 'Check why an error is thrown.' }, () => {
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/solid-component/',
		});
		await fixture.build();
	});

	it('Can load a component', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		// test 1: Works
		assert.equal($('.hello').length, 1);

		// test 2: Support rendering proxy components
		assert.equal($('#proxy-component').text(), 'Hello world');
	});

	// ssr-client-none.astro
	it('Supports server only components', async () => {
		const html = await fixture.readFile('ssr-client-none/index.html');
		const hydrationScriptCount = countHydrationScripts(html);
		assert.equal(hydrationScriptCount, 0);
		const hydrationEventsCount = countHydrationEvents(html);
		assert.equal(hydrationEventsCount, 0);
	});

	it('Supports lazy server only components', async () => {
		const html = await fixture.readFile('ssr-client-none/index.html');
		const $ = cheerio.load(html);
		// AsyncComponent renders 1 button
		// LazyCounter renders 4 buttons
		// Total is 5 buttons
		assert.equal($('button').length, 5);
	});

	// ssr-client-none-throwing.astro
	it('Supports server only components with error boundaries', async () => {
		const html = await fixture.readFile('ssr-client-none-throwing/index.html');
		const hydrationScriptCount = countHydrationScripts(html);
		assert.equal(hydrationScriptCount, 0);
		assert.equal(html.includes('Async error boundary fallback'), true);
		assert.equal(html.includes('Sync error boundary fallback'), true);
		const hydrationEventsCount = countHydrationEvents(html);
		assert.equal(hydrationEventsCount, 0);
	});

	// ssr-client-load.astro
	it('Supports hydrating components', async () => {
		const html = await fixture.readFile('ssr-client-load/index.html');
		const hydrationScriptCount = countHydrationScripts(html);
		assert.equal(hydrationScriptCount, 1);
	});

	it('Supports lazy hydrating components', async () => {
		const html = await fixture.readFile('ssr-client-load/index.html');
		const $ = cheerio.load(html);
		// AsyncComponent renders 1 button, and there are 2 AsyncComponents
		// LazyCounter renders 4 buttons
		// Total is 6 buttons
		assert.equal($('button').length, 6);
	});

	// ssr-client-load-throwing.astro
	it('Supports hydrating components with error boundaries', async () => {
		const html = await fixture.readFile('ssr-client-load-throwing/index.html');
		const hydrationScriptCount = countHydrationScripts(html);
		assert.equal(hydrationScriptCount, 1);
		assert.equal(html.includes('Async error boundary fallback'), true);
		assert.equal(html.includes('Sync error boundary fallback'), true);
		const hydrationEventsCount = countHydrationEvents(html);
		assert.equal(hydrationEventsCount.length > 1, true);
	});

	// ssr-client-only.astro
	it('Supports client only components', async () => {
		const html = await fixture.readFile('ssr-client-only/index.html');
		const hydrationScriptCount = countHydrationScripts(html);
		assert.equal(hydrationScriptCount, 0);
	});

	// nested.astro

	it('Injects hydration script before any SolidJS components in the HTML, even if heavily nested', async () => {
		// TODO: This tests SSG mode, where the extraHead is generally available.
		// Should add a test (and solution) for SSR mode, where head is more likely to have already
		// been streamed to the client.
		const html = await fixture.readFile('nested/index.html');

		const firstHydrationScriptAt = getFirstHydrationScriptLocation(html);
		assert.equal(firstHydrationScriptAt.length, 0);

		const firstHydrationEventAt = getFirstHydrationEventLocation(html);
		assert.equal(firstHydrationEventAt.length, 0);

		assert.equal(
			firstHydrationScriptAt < firstHydrationEventAt,
			'Position of first hydration event',
		);
	});

	it('Injects hydration script before any SolidJS components in the HTML, even if render order is reversed by delay', async () => {
		const html = await fixture.readFile('deferred/index.html');

		const firstHydrationScriptAt = getFirstHydrationScriptLocation(html);
		assert.equal(firstHydrationScriptAt > 0, true);

		const firstHydrationEventAt = getFirstHydrationEventLocation(html);
		assert.equal(firstHydrationEventAt > 0, true);

		const hydrationScriptCount = countHydrationScripts(html);
		assert.equal(hydrationScriptCount, 1);
		assert.equal(
			firstHydrationScriptAt < firstHydrationEventAt,
			'Position of first hydration event',
		);
	});
});

describe.skip('Solid component dev', { todo: 'Check why the test hangs.', skip: isWindows }, () => {
	let devServer;
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/solid-component/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('Can load a component', async () => {
		const html = await fixture.fetch('/').then((res) => res.text());
		const $ = cheerio.load(html);

		// test 1: Works
		assert.equal($('.hello').length, 1);

		// test 2: Support rendering proxy components
		assert.equal($('#proxy-component').text(), 'Hello world');
	});

	it('scripts proxy correctly', async () => {
		const html = await fixture.fetch('/').then((res) => res.text());
		const $ = cheerio.load(html);

		for (const script of $('script').toArray()) {
			const { src } = script.attribs;
			if (!src) continue;
			assert.equal((await fixture.fetch(src)).status, 200, `404: ${src}`);
		}
	});
});

/**
 * Get a regex that matches hydration scripts.
 *
 * Based on this hydration script:
 * https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/assets/hydrationScripts.js
 *
 * Which is supposed to be injected in a page with hydrating Solid components
 * essentially one time.
 *
 * We look for the hint "_$HY=".
 *
 * I chose to make this a function to avoid accidentally sharing regex state
 * between tests.
 *
 * NOTE: These scripts have occasionally changed in the past. If the tests
 * start failing after a Solid version change, we may need to find a different
 * way to count the hydration scripts.
 */
const createHydrationScriptRegex = (flags) => new RegExp(/_\$HY=/, flags);

function countHydrationScripts(/** @type {string} */ html) {
	// eslint-disable-next-line regexp/prefer-regexp-exec
	return html.match(createHydrationScriptRegex('g'))?.length ?? 0;
}

function getFirstHydrationScriptLocation(/** @type {string} */ html) {
	return createHydrationScriptRegex().exec(html)?.index;
}

/**
 * Get a regex that matches hydration events. A hydration event
 * is when data is emitted to help hydrate a component during SSR process.
 *
 * We look for the hint "_$HY.r["
 */
const createHydrationEventRegex = (flags) => new RegExp(/_\$HY.r\[/, flags);

function countHydrationEvents(/** @type {string} */ html) {
	// Number of times a component was hydrated during rendering
	// We look for the hint "_$HY.r["

	// eslint-disable-next-line regexp/prefer-regexp-exec
	return html.match(createHydrationEventRegex('g'))?.length ?? 0;
}

function getFirstHydrationEventLocation(/** @type {string} */ html) {
	return createHydrationEventRegex().exec(html)?.index;
}
