import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { Logger } from '../dist/core/logger/core.js';
import { loadFixture } from './test-utils.js';

function addLeadingSlash(path) {
	return path.startsWith('/') ? path : '/' + path;
}

function removeBasePath(path) {
	// `/subpath` is defined in the test fixture's Astro config
	return path.replace('/subpath', '');
}

/**
 * @typedef {import('../src/core/logger/core').LogMessage} LogMessage
 */

describe('Static build', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	/** @type {LogMessage[]} */
	let logs = [];

	before(async () => {
		/** @type {import('../src/core/logger/core').Logger} */
		const logger = new Logger({
			dest: {
				write(chunk) {
					logs.push(chunk);
				},
			},
			level: 'warn',
		});

		fixture = await loadFixture({
			root: './fixtures/static-build/',
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
		await fixture.build({ logger });
	});

	it('generates canonical redirect page with site prefix', async () => {
		const html = await fixture.readFile('/old/index.html');
		const $ = cheerioLoad(html);
		const link = $('link[rel="canonical"]');
		const href = link.attr('href');
		assert.match(href, /http/);
	});

	it('Builds out .astro pages', async () => {
		const html = await fixture.readFile('/index.html');
		assert.equal(typeof html, 'string');
	});

	it('can build pages using Astro.glob()', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerioLoad(html);
		const link = $('.posts a');
		const href = link.attr('href');
		assert.equal(href, '/subpath/posts/thoughts');
	});

	it('Builds out .md pages', async () => {
		const html = await fixture.readFile('/posts/thoughts/index.html');
		assert.equal(typeof html, 'string');
	});

	it('Builds out .json files', async () => {
		const content = await fixture.readFile('/company.json').then((text) => JSON.parse(text));
		assert.equal(content.name, 'Astro Technology Company');
		assert.equal(content.url, 'https://astro.build/');
	});

	it('Builds out async .json files', async () => {
		const content = await fixture.readFile('/posts.json').then((text) => JSON.parse(text));
		assert.equal(Array.isArray(content), true);
		assert.deepEqual(content, [
			{
				filename: './posts/nested/more.md',
				title: 'More post',
			},
			{
				filename: './posts/thoughts.md',
				title: 'Thoughts post',
			},
		]);
	});

	it('Builds out dynamic .json files', async () => {
		const slugs = ['thing1', 'thing2'];

		for (const slug of slugs) {
			const content = await fixture.readFile(`/data/${slug}.json`).then((text) => JSON.parse(text));
			assert.equal(content.name, 'Astro Technology Company');
			assert.equal(content.url, 'https://astro.build/');
			assert.equal(content.slug, slug);
		}
	});

	function createFindEvidence(expected) {
		return async function findEvidence(pathname) {
			const html = await fixture.readFile(pathname);
			const $ = cheerioLoad(html);
			const links = $('link[rel=stylesheet]');
			for (const link of links) {
				const href = $(link).attr('href');

				// The imported .scss file should include the base subpath in the href
				assert.equal(href.startsWith('/subpath/'), true);

				/**
				 * The link should be built with the config's `base` included
				 * as a subpath.
				 *
				 * The test needs to verify that the file will be found once the `/dist`
				 * output is deployed to a subpath in production by ignoring the subpath here.
				 */
				const data = await fixture.readFile(removeBasePath(addLeadingSlash(href)));
				if (expected.test(data)) {
					return true;
				}
			}

			return false;
		};
	}

	describe('Page CSS', () => {
		const findEvidence = createFindEvidence(/height:\s*45vw/);

		it('Page level CSS is added', async () => {
			const found = await findEvidence('/index.html');
			assert.equal(found, true, 'Did not find page-level CSS on this page');
		});
	});

	describe('Shared CSS', () => {
		const findEvidence = createFindEvidence(/var\(--c\)/);

		it('Included on the index page', async () => {
			const found = await findEvidence('/index.html');
			assert.equal(found, true, 'Did not find shared CSS on this page');
		});

		it('Included on a md page', async () => {
			const found = await findEvidence('/posts/thoughts/index.html');
			assert.equal(found, true, 'Did not find shared CSS on this page');
		});
	});

	describe('CSS modules', () => {
		const findEvidence = createFindEvidence(/var\(--c-black\)/);

		it('Is included in the index CSS', async () => {
			const found = await findEvidence('/index.html');
			assert.equal(found, true, 'Did not find shared CSS module code');
		});
	});

	describe('Scripts', () => {
		it('Get included on the page', async () => {
			const html = await fixture.readFile('/scripts/index.html');
			const $ = cheerioLoad(html);
			assert.equal($('script[type="module"]').length, 2, 'Script added');
		});

		it('Do not get added to the wrong page', async () => {
			const scriptsHTML = await fixture.readFile('/scripts/index.html');
			const $ = cheerioLoad(scriptsHTML);
			const href = $('script[type="module"]').attr('src');
			const indexHTML = await fixture.readFile('/index.html');
			const $$ = cheerioLoad(indexHTML);
			assert.equal($$(`script[src="${href}"]`).length, 0, 'no script added to different page');
		});
	});

	it('honors ssr config', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerioLoad(html);
		assert.equal($('#ssr-config').text(), 'testing');
	});

	it('warns when accessing headers', async () => {
		let found = false;
		for (const log of logs) {
			if (/`Astro\.request\.headers` is not available on prerendered pages./.test(log.message)) {
				found = true;
			}
		}
		assert.equal(found, true, 'Found the log message');
	});
});

describe('Static build SSR', () => {
	it('Copies public files', async () => {
		const fixture = await loadFixture({
			root: './fixtures/static-build-ssr/',
		});
		await fixture.build();

		assert.ok(await fixture.readFile('/client/nested/asset2.txt'));
		assert.ok(await fixture.readFile('/client/.well-known/apple-app-site-association'));
	});
});
