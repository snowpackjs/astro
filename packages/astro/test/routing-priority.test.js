import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { loadFixture } from './test-utils.js';

const routes = [
	{
		description: 'matches / to index.astro',
		url: '/',
		h1: 'index.astro',
	},
	{
		description: 'matches /slug-1 to [slug].astro',
		url: '/slug-1',
		h1: '[slug].astro',
		p: 'slug-1',
	},
	{
		description: 'matches /slug-2 to [slug].astro',
		url: '/slug-2',
		h1: '[slug].astro',
		p: 'slug-2',
	},
	{
		description: 'matches /page-1 to [page].astro',
		url: '/page-1',
		h1: '[page].astro',
		p: 'page-1',
	},
	{
		description: 'matches /page-2 to [page].astro',
		url: '/page-2',
		h1: '[page].astro',
		p: 'page-2',
	},
	{
		description: 'matches /posts/post-1 to posts/[pid].astro',
		url: '/posts/post-1',
		h1: 'posts/[pid].astro',
		p: 'post-1',
	},
	{
		description: 'matches /posts/post-2 to posts/[pid].astro',
		url: '/posts/post-2',
		h1: 'posts/[pid].astro',
		p: 'post-2',
	},
	{
		description: 'matches /posts/1/2 to posts/[...slug].astro',
		url: '/posts/1/2',
		h1: 'posts/[...slug].astro',
		p: '1/2',
	},
	{
		description: 'matches /de to de/index.astro',
		url: '/de',
		h1: 'de/index.astro (priority)',
	},
	{
		description: 'matches /en to [lang]/index.astro',
		url: '/en',
		h1: '[lang]/index.astro',
		p: 'en',
	},
	{
		description: 'matches /de/1/2 to [lang]/[...catchall].astro',
		url: '/de/1/2',
		h1: '[lang]/[...catchall].astro',
		p: 'de | 1/2',
	},
	{
		description: 'matches /en/1/2 to [lang]/[...catchall].astro',
		url: '/en/1/2',
		h1: '[lang]/[...catchall].astro',
		p: 'en | 1/2',
	},
	{
		description: 'matches /injected to to-inject.astro',
		url: '/injected',
		h1: 'to-inject.astro',
	},
	{
		description: 'matches /_injected to to-inject.astro',
		url: '/_injected',
		h1: 'to-inject.astro',
	},
	{
		description: 'matches /injected-1 to [id].astro',
		url: '/injected-1',
		h1: '[id].astro',
		p: 'injected-1',
	},
	{
		description: 'matches /injected-2 to [id].astro',
		url: '/injected-2',
		h1: '[id].astro',
		p: 'injected-2',
	},
	{
		description: 'matches /empty-slug to empty-slug/[...slug].astro',
		url: '/empty-slug',
		h1: 'empty-slug/[...slug].astro',
		p: 'slug: ',
	},
	{
		description: 'do not match /empty-slug/undefined to empty-slug/[...slug].astro',
		url: '/empty-slug/undefined',
		fourOhFour: true,
	},
	{
		description: 'do not match /empty-paths/hello to empty-paths/[...slug].astro',
		url: '/empty-paths/hello',
		fourOhFour: true,
	},
	{
		description: 'matches /api/catch/a.json to api/catch/[...slug].json.ts',
		url: '/api/catch/a.json',
		htmlMatch: JSON.stringify({ path: 'a' }),
	},
	{
		description: 'matches /api/catch/b/c.json to api/catch/[...slug].json.ts',
		url: '/api/catch/b/c.json',
		htmlMatch: JSON.stringify({ path: 'b/c' }),
	},
	{
		description: 'matches /api/catch/a-b.json to api/catch/[foo]-[bar].json.ts',
		url: '/api/catch/a-b.json',
		htmlMatch: JSON.stringify({ foo: 'a', bar: 'b' }),
	},
];

function appendForwardSlash(path) {
	return path.endsWith('/') ? path : path + '/';
}

describe('Routing priority', () => {
	describe('build', () => {
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/routing-priority/',
			});
			await fixture.build();
		});

		routes.forEach(({ description, url, fourOhFour, h1, p, htmlMatch }) => {
			const isEndpoint = htmlMatch && !h1 && !p;

			it(description, async () => {
				const htmlFile = isEndpoint ? url : `${appendForwardSlash(url)}index.html`;

				if (fourOhFour) {
					assert.equal(fixture.pathExists(htmlFile), false);
					return;
				}

				const html = await fixture.readFile(htmlFile);
				const $ = cheerioLoad(html);

				if (h1) {
					assert.equal($('h1').text(), h1);
				}

				if (p) {
					assert.equal($('p').text(), p);
				}

				if (htmlMatch) {
					assert.equal(html, htmlMatch);
				}
			});
		});
	});

	describe('dev', () => {
		let fixture;
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/routing-priority/',
			});

			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		routes.forEach(({ description, url, fourOhFour, h1, p, htmlMatch }) => {
			const isEndpoint = htmlMatch && !h1 && !p;

			// checks URLs as written above
			it(description, async () => {
				const html = await fixture.fetch(url).then((res) => res.text());
				const $ = cheerioLoad(html);

				if (fourOhFour) {
					assert.equal($('title').text(), '404: Not Found');
					return;
				}

				if (h1) {
					assert.equal($('h1').text(), h1);
				}

				if (p) {
					assert.equal($('p').text(), p);
				}

				if (htmlMatch) {
					assert.equal(html, htmlMatch);
				}
			});

			// skip for endpoint page test
			if (isEndpoint) return;

			// checks with trailing slashes, ex: '/de/' instead of '/de'
			it(`${description} (trailing slash)`, async () => {
				const html = await fixture.fetch(appendForwardSlash(url)).then((res) => res.text());
				const $ = cheerioLoad(html);

				if (fourOhFour) {
					assert.equal($('title').text(), '404: Not Found');
					return;
				}

				if (h1) {
					assert.equal($('h1').text(), h1);
				}

				if (p) {
					assert.equal($('p').text(), p);
				}

				if (htmlMatch) {
					assert.equal(html, htmlMatch);
				}
			});

			// checks with index.html, ex: '/de/index.html' instead of '/de'
			it(`${description} (index.html)`, async () => {
				const html = await fixture
					.fetch(`${appendForwardSlash(url)}index.html`)
					.then((res) => res.text());
				const $ = cheerioLoad(html);

				if (fourOhFour) {
					assert.equal($('title').text(), '404: Not Found');
					return;
				}

				if (h1) {
					assert.equal($('h1').text(), h1);
				}

				if (p) {
					assert.equal($('p').text(), p);
				}

				if (htmlMatch) {
					assert.equal(html, htmlMatch);
				}
			});
		});
	});
});
