import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Astro.cookies', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-cookies/',
			output: 'server',
			adapter: testAdapter(),
		});
	});

	describe('Development', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('is able to get cookies from the request', async () => {
			const response = await fixture.fetch('/get-json', {
				headers: {
					cookie: `prefs=${encodeURIComponent(JSON.stringify({ mode: 'light' }))}`,
				},
			});
			assert.equal(response.status, 200);
			const html = await response.text();

			const $ = cheerio.load(html);
			assert.equal($('dd').text(), 'light');
		});

		it('can set the cookie value', async () => {
			const response = await fixture.fetch('/set-value', {
				method: 'POST',
			});
			assert.equal(response.status, 200);
			// Bug in 18.14.1 where `set-cookie` will not be defined
			// Should be fixed in 18.14.2
			if (process.versions.node !== '18.14.1') {
				assert.equal(response.headers.has('set-cookie'), true);
			}
		});

		it('can set cookies in a rewritten page request', async () => {
			const response = await fixture.fetch('/from');
			assert.equal(response.status, 200);

			assert.match(response.headers.get('set-cookie'), /my_cookie=value/);
		});

		it('overwrites cookie values set in the source page with values from the target page', async () => {
			const response = await fixture.fetch('/from');
			assert.equal(response.status, 200);
			assert.match(response.headers.get('set-cookie'), /another=set-in-target/);
		});

		it('allows cookies to be set in the source page', async () => {
			const response = await fixture.fetch('/from');
			assert.equal(response.status, 200);
			assert.match(response.headers.get('set-cookie'), /set-in-from=yes/);
		});

		it('can set cookies in a rewritten endpoint request', async () => {
			const response = await fixture.fetch('/from-endpoint');
			assert.equal(response.status, 200);
			assert.match(response.headers.get('set-cookie'), /test=value/);
		});
	});

	describe('Production', () => {
		let app;
		before(async () => {
			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		async function fetchResponse(path, requestInit) {
			const request = new Request('http://example.com' + path, requestInit);
			const response = await app.render(request);
			return response;
		}

		it('is able to get cookies from the request', async () => {
			const response = await fetchResponse('/get-json', {
				headers: {
					cookie: `prefs=${encodeURIComponent(JSON.stringify({ mode: 'light' }))}`,
				},
			});
			assert.equal(response.status, 200);
			const html = await response.text();

			const $ = cheerio.load(html);
			assert.equal($('dd').text(), 'light');
		});

		it('can set the cookie value', async () => {
			const response = await fetchResponse('/set-value', {
				method: 'POST',
			});
			assert.equal(response.status, 200);
			let headers = Array.from(app.setCookieHeaders(response));
			assert.equal(headers.length, 1);
			assert.match(headers[0], /Expires/);
		});

		it('app.render can include the cookie in the Set-Cookie header', async () => {
			const request = new Request('http://example.com/set-value', {
				method: 'POST',
			});
			const response = await app.render(request, { addCookieHeader: true });
			assert.equal(response.status, 200);
			const value = response.headers.get('Set-Cookie');
			assert.equal(typeof value, 'string');
			assert.equal(value.startsWith('admin=true; Expires='), true);
		});

		it('app.render can exclude the cookie from the Set-Cookie header', async () => {
			const request = new Request('http://example.com/set-value', {
				method: 'POST',
			});
			const response = await app.render(request, { addCookieHeader: false });
			assert.equal(response.status, 200);
			assert.equal(response.headers.get('Set-Cookie'), null);
		});

		it('Early returning a Response still includes set headers', async () => {
			const response = await fetchResponse('/early-return', {
				headers: {
					cookie: `prefs=${encodeURIComponent(JSON.stringify({ mode: 'light' }))}`,
				},
			});
			assert.equal(response.status, 302);
			let headers = Array.from(app.setCookieHeaders(response));
			assert.equal(headers.length, 1);
			let raw = headers[0].slice(6);
			let data = JSON.parse(decodeURIComponent(raw));
			assert.equal(typeof data, 'object');
			assert.equal(data.mode, 'dark');
		});

		it('API route can get and set cookies', async () => {
			const response = await fetchResponse('/set-prefs', {
				method: 'POST',
				headers: {
					cookie: `prefs=${encodeURIComponent(JSON.stringify({ mode: 'light' }))}`,
				},
			});
			assert.equal(response.status, 302);
			let headers = Array.from(app.setCookieHeaders(response));
			assert.equal(headers.length, 1);
			let raw = headers[0].slice(6);
			let data = JSON.parse(decodeURIComponent(raw));
			assert.equal(typeof data, 'object');
			assert.equal(data.mode, 'dark');
		});

		it('can set cookies in a rewritten page request', async () => {
			const request = new Request('http://example.com/from');
			const response = await app.render(request, { addCookieHeader: true });
			assert.equal(response.status, 200);

			assert.match(response.headers.get('Set-Cookie'), /my_cookie=value/);
		});

		it('overwrites cookie values set in the source page with values from the target page', async () => {
			const request = new Request('http://example.com/from');
			const response = await app.render(request, { addCookieHeader: true });
			assert.equal(response.status, 200);
			assert.match(response.headers.get('Set-Cookie'), /another=set-in-target/);
		});

		it('allows cookies to be set in the source page', async () => {
			const request = new Request('http://example.com/from');
			const response = await app.render(request, { addCookieHeader: true });
			assert.equal(response.status, 200);
			assert.match(response.headers.get('Set-Cookie'), /set-in-from=yes/);
		});

		it('can set cookies in a rewritten endpoint request', async () => {
			const request = new Request('http://example.com/from-endpoint');
			const response = await app.render(request, { addCookieHeader: true });
			assert.equal(response.status, 200);
			assert.match(response.headers.get('Set-Cookie'), /test=value/);
		});
	});
});
