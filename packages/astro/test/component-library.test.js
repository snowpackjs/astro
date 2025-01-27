import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { loadFixture } from './test-utils.js';

function addLeadingSlash(path) {
	return path.startsWith('/') ? path : '/' + path;
}

describe('Component Libraries', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/component-library/',
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
	});

	describe('build', async () => {
		before(async () => {
			await fixture.build();
		});

		function createFindEvidence(expected) {
			return async function findEvidence(pathname) {
				const html = await fixture.readFile(pathname);
				const $ = cheerioLoad(html);
				const links = $('link[rel=stylesheet]');
				for (const link of links) {
					const href = $(link).attr('href');

					const data = await fixture.readFile(addLeadingSlash(href));
					if (expected.test(data)) {
						return true;
					}
				}

				return false;
			};
		}

		it('Built .astro pages', async () => {
			let html = await fixture.readFile('/with-astro/index.html');
			assert.equal(typeof html, 'string');

			html = await fixture.readFile('/with-react/index.html');
			assert.equal(typeof html, 'string');

			html = await fixture.readFile('/internal-hydration/index.html');
			assert.equal(typeof html, 'string');
		});

		it('Works with .astro components', async () => {
			const html = await fixture.readFile('/with-astro/index.html');
			const $ = cheerioLoad(html);

			assert.equal($('button').text(), 'Click me', "Rendered the component's slot");

			const findEvidence = createFindEvidence(/border-radius:\s*1rem/);
			assert.equal(
				await findEvidence('with-astro/index.html'),
				true,
				"Included the .astro component's <style>",
			);
		});

		it('Works with react components', async () => {
			const html = await fixture.readFile('/with-react/index.html');
			const $ = cheerioLoad(html);

			assert.equal($('#react-static').text(), 'Hello static!', 'Rendered the static component');

			assert.equal(
				$('#react-idle').text(),
				'Hello idle!',
				'Rendered the client hydrated component',
			);

			assert.equal($('astro-island[uid]').length, 1, 'Included one hydration island');
		});

		it('Works with components hydrated internally', async () => {
			const html = await fixture.readFile('/internal-hydration/index.html');
			const $ = cheerioLoad(html);

			assert.equal($('.counter').length, 1, 'Rendered the svelte counter');
			assert.equal(
				$('.counter-message').text().trim(),
				'Hello, Svelte!',
				"rendered the counter's slot",
			);

			assert.equal($('astro-island[uid]').length, 1, 'Included one hydration island');
		});
	});

	describe('dev', async () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		function createFindEvidence(expected) {
			return async function findEvidence(pathname) {
				const html = await fixture.fetch(pathname).then((res) => res.text());
				const $ = cheerioLoad(html);

				// Most styles are inlined in a <style> block in the dev server
				const allInjectedStyles = $('style').text().replace(/\s*/g, '');
				if (expected.test(allInjectedStyles)) {
					return true;
				}

				// Also check for <link> stylesheets
				const links = $('link[rel=stylesheet]');
				for (const link of links) {
					const href = $(link).attr('href');

					const data = await fixture.fetch(addLeadingSlash(href)).then((res) => res.text());
					if (expected.test(data)) {
						return true;
					}
				}

				return false;
			};
		}

		it('Works with .astro components', async () => {
			const html = await fixture.fetch('/with-astro/').then((res) => res.text());
			const $ = cheerioLoad(html);

			assert.equal($('button').text(), 'Click me', "Rendered the component's slot");

			const findEvidence = createFindEvidence(/border-radius:\s*1rem/);
			assert.equal(
				await findEvidence('/with-astro/'),
				true,
				"Included the .astro component's <style>",
			);
		});

		it('Works with react components', async () => {
			const html = await fixture.fetch('/with-react/').then((res) => res.text());
			const $ = cheerioLoad(html);

			assert.equal($('#react-static').text(), 'Hello static!', 'Rendered the static component');

			assert.equal(
				$('#react-idle').text(),
				'Hello idle!',
				'Rendered the client hydrated component',
			);

			assert.equal($('astro-island[uid]').length, 1, 'Included one hydration island');
		});

		it('Works with components hydrated internally', async () => {
			const html = await fixture.fetch('/internal-hydration/').then((res) => res.text());
			const $ = cheerioLoad(html);

			assert.equal($('.counter').length, 1, 'Rendered the svelte counter');
			assert.equal(
				$('.counter-message').text().trim(),
				'Hello, Svelte!',
				"rendered the counter's slot",
			);

			assert.equal($('astro-island[uid]').length, 1, 'Included one hydration island');
		});
	});
});
