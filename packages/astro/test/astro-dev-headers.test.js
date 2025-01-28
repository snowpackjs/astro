import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Astro dev headers', () => {
	let fixture;
	let devServer;
	const headers = {
		'x-astro': 'test',
	};

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-dev-headers/',
			server: {
				headers,
			},
		});
		await fixture.build();
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	describe('dev', () => {
		it('returns custom headers for valid URLs', async () => {
			const result = await fixture.fetch('/');
			assert.equal(result.status, 200);
			assert.equal(Object.fromEntries(result.headers)['x-astro'], headers['x-astro']);
		});

		it('returns custom headers in the default 404 response', async () => {
			const result = await fixture.fetch('/bad-url');
			assert.equal(result.status, 404);
			assert.equal(Object.fromEntries(result.headers).hasOwnProperty('x-astro'), true);
		});
	});
});

describe('Astro dev with vite.base path', () => {
	let fixture;
	let devServer;
	const headers = {
		'x-astro': 'test',
	};

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-dev-headers/',
			server: {
				headers,
			},
			vite: {
				base: '/hello'
			}
		});
		await fixture.build();
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('Generated script src get included with vite.base path', async () => {
		const result = await fixture.fetch('/hello');
		const html = await result.text();
		const $ = cheerioLoad(html);
		assert.match($('script').attr('src'), /^\/hello\/@vite\/client$/);
	});
});
