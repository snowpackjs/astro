import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AstroCookies } from '../../../dist/core/cookies/index.js';
import { apply as applyPolyfill } from '../../../dist/core/polyfill.js';

applyPolyfill();

describe('astro/src/core/cookies', () => {
	describe('Astro.cookies.delete', () => {
		it('creates a Set-Cookie header to delete it', () => {
			let req = new Request('http://example.com/', {
				headers: {
					cookie: 'foo=bar',
				},
			});
			let cookies = new AstroCookies(req);
			assert.equal(cookies.get('foo').value, 'bar');

			cookies.delete('foo');
			let headers = Array.from(cookies.headers());
			assert.equal(headers.length, 1);
		});

		it('calling cookies.get() after returns undefined', () => {
			let req = new Request('http://example.com/', {
				headers: {
					cookie: 'foo=bar',
				},
			});
			let cookies = new AstroCookies(req);
			assert.equal(cookies.get('foo').value, 'bar');

			cookies.delete('foo');
			assert.equal(cookies.get('foo'), undefined);
		});

		it('calling cookies.has() after returns false', () => {
			let req = new Request('http://example.com/', {
				headers: {
					cookie: 'foo=bar',
				},
			});
			let cookies = new AstroCookies(req);
			assert.equal(cookies.has('foo'), true);

			cookies.delete('foo');
			assert.equal(cookies.has('foo'), false);
		});

		it('deletes a cookie with attributes', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);

			cookies.delete('foo', {
				domain: 'example.com',
				path: '/subpath/',
				priority: 'high',
				secure: true,
				httpOnly: true,
				sameSite: 'strict',
			});

			let headers = Array.from(cookies.headers());
			assert.equal(headers.length, 1);
			assert.equal(headers[0].includes('foo=deleted'), true);
			assert.equal(headers[0].includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT'), true);
			assert.equal(/Domain=example.com/.test(headers[0]), true);
			assert.equal(headers[0].includes('Path=/subpath/'), true);
			assert.equal(headers[0].includes('Priority=High'), true);
			assert.equal(headers[0].includes('Secure'), true);
			assert.equal(headers[0].includes('HttpOnly'), true);
			assert.equal(headers[0].includes('SameSite=Strict'), true);
		});

		it('ignores expires option', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);

			cookies.delete('foo', {
				expires: new Date(),
			});

			let headers = Array.from(cookies.headers());
			assert.equal(headers.length, 1);
			assert.equal(headers[0].includes('foo=deleted'), true);
			assert.equal(headers[0].includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT'), true);
		});

		it('ignores maxAge option', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);

			cookies.delete('foo', {
				maxAge: 60,
			});

			let headers = Array.from(cookies.headers());
			assert.equal(headers.length, 1);
			assert.equal(headers[0].includes('foo=deleted'), true);
			assert.equal(headers[0].includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT'), true);
		});
	});
});
