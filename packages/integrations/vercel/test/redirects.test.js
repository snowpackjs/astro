import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Redirects', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/redirects/',
			redirects: {
				'/one': '/',
				'/two': '/',
				'/three': {
					status: 302,
					destination: '/',
				},
				'/blog/[...slug]': '/team/articles/[...slug]',
				'/Basic/http-2-0.html': '/posts/http2',
			},
			trailingSlash: 'always',
		});
		await fixture.build();
	});

	async function getConfig() {
		const json = await fixture.readFile('../.vercel/output/config.json');
		const config = JSON.parse(json);
		return config;
	}

	it('define static routes', async () => {
		const config = await getConfig();
		const oneRoute = config.routes.find((r) => r.src === '^/one$');
		assert.equal(oneRoute.headers.Location, '/');
		assert.equal(oneRoute.status, 301);

		const twoRoute = config.routes.find((r) => r.src === '^/two$');
		assert.equal(twoRoute.headers.Location, '/');
		assert.equal(twoRoute.status, 301);

		const threeRoute = config.routes.find((r) => r.src === '^/three$');
		assert.equal(threeRoute.headers.Location, '/');
		assert.equal(threeRoute.status, 302);
	});

	it('define redirects for static files', async () => {
		const config = await getConfig();

		const staticRoute = config.routes.find((r) => r.src === '^/Basic/http-2-0\\.html$');
		assert.notEqual(staticRoute, undefined);
		assert.equal(staticRoute.headers.Location, '/posts/http2');
		assert.equal(staticRoute.status, 301);
	});

	it('defines dynamic routes', async () => {
		const config = await getConfig();

		const blogRoute = config.routes.find((r) => r.src.startsWith('^/blog'));
		assert.notEqual(blogRoute, undefined);
		assert.equal(blogRoute.headers.Location.startsWith('/team/articles'), true);
		assert.equal(blogRoute.status, 301);
	});

	it('throws an error for invalid redirects', async () => {
		const fails = await loadFixture({
			root: './fixtures/redirects/',
			redirects: {
				// Invalid source syntax
				'/blog/(![...slug]': '/team/articles/[...slug]',
			},
		});
		await assert.rejects(() => fails.build(), {
			name: 'AstroUserError',
			message:
				'Error generating redirects: Redirect at index 0 has invalid `source` regular expression "/blog/(!:slug*".',
		});
	});
});
