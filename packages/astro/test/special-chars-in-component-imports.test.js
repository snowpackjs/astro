import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { isWindows, loadFixture } from './test-utils.js';

describe('Special chars in component import paths', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	const componentIds = [
		'caret',
		'rocket',
		// Not supported as import identifier in Vite
		// 'percent',
		'space',
		'round-bracket',
		'square-bracket',
	];

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/special-chars-in-component-imports/',
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('Build succeeds', async () => {
			const html = await fixture.readFile('/index.html');
			assert.equal(html.includes('<html>'), true);
		});

		it('Special chars in imports work from .astro files', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerioLoad(html);

			// Test 1: Correct page
			assert.equal($('h1').text().includes('.astro'), true);

			// Test 2: All components exist
			componentIds.forEach((componentId) => {
				assert.equal($(`#${componentId}`).length, 1, `Component #${componentId} does not exist`);
			});

			// Test 3: Component contents were rendered properly
			componentIds.forEach((componentId) => {
				assert.equal($(`#${componentId} > div`).text(), `${componentId}: 0`);
			});

			// Test 4: There is an island for each component
			assert.equal($('astro-island[uid]').length, componentIds.length);
		});

		it('Special chars in imports work from .mdx files', async () => {
			const html = await fixture.readFile('/mdx/index.html');
			const $ = cheerioLoad(html);

			// Test 1: Correct page
			assert.equal($('h1').text().includes('.mdx'), true);

			// Test 2: All components exist
			componentIds.forEach((componentId) => {
				assert.equal($(`#${componentId}`).length, 1, `Component #${componentId} does not exist`);
			});

			// Test 3: Component contents were rendered properly
			componentIds.forEach((componentId) => {
				assert.equal($(`#${componentId} > div`).text(), `${componentId}: 0`);
			});

			// Test 4: There is an island for each component
			assert.equal($('astro-island[uid]').length, componentIds.length);
		});
	});

	if (isWindows) return;

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('Special chars in imports work from .astro files', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			// Test 1: Correct page
			assert.equal($('h1').text().includes('.astro'), true);

			// Test 2: All components exist
			componentIds.forEach((componentId) => {
				assert.equal($(`#${componentId}`).length, 1, `Component #${componentId} does not exist`);
			});

			// Test 3: Component contents were rendered properly
			componentIds.forEach((componentId) => {
				assert.equal($(`#${componentId} > div`).text(), `${componentId}: 0`);
			});

			// Test 4: There is an island for each component
			assert.equal($('astro-island[uid]').length, componentIds.length);
		});

		it('Special chars in imports work from .mdx files', async () => {
			const html = await fixture.fetch('/mdx').then((res) => res.text());
			const $ = cheerioLoad(html);

			// Test 1: Correct page
			assert.equal($('h1').text().includes('.mdx'), true);

			// Test 2: All components exist
			componentIds.forEach((componentId) => {
				assert.equal($(`#${componentId}`).length, 1, `Component #${componentId} does not exist`);
			});

			// Test 3: Component contents were rendered properly
			componentIds.forEach((componentId) => {
				assert.equal($(`#${componentId} > div`).text(), `${componentId}: 0`);
			});

			// Test 4: There is an island for each component
			assert.equal($('astro-island[uid]').length, componentIds.length);
		});
	});
});
