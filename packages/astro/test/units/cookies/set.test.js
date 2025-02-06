import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AstroCookies } from '../../../dist/core/cookies/index.js';
import { apply as applyPolyfill } from '../../../dist/core/polyfill.js';

applyPolyfill();

describe('astro/src/core/cookies', () => {
	describe('Astro.cookies.set', () => {
		it('Sets a cookie value that can be serialized', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			cookies.set('foo', 'bar');
			let headers = Array.from(cookies.headers());
			assert.equal(headers.length, 1);
			assert.equal(headers[0], 'foo=bar');
		});

		it('Sets a cookie value that can be serialized w/ defaultencodeURIComponent behavior', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			const url = 'http://localhost/path';
			cookies.set('url', url);
			let headers = Array.from(cookies.headers());
			assert.equal(headers.length, 1);
			// by default cookie value is URI encoded
			assert.equal(headers[0], `url=${encodeURIComponent(url)}`);
		});

		it('Sets a cookie value that can be serialized w/ custom encode behavior', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			const url = 'http://localhost/path';
			// set encode option to the identity function
			cookies.set('url', url, { encode: (o) => o });
			let headers = Array.from(cookies.headers());
			assert.equal(headers.length, 1);
			// no longer URI encoded
			assert.equal(headers[0], `url=${url}`);
		});

		it('Can set cookie options', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			cookies.set('foo', 'bar', {
				httpOnly: true,
				path: '/subpath/',
			});
			let headers = Array.from(cookies.headers());
			assert.equal(headers.length, 1);
			assert.equal(headers[0], 'foo=bar; Path=/subpath/; HttpOnly');
		});

		it('Can pass a JavaScript object that will be serialized', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			cookies.set('options', { one: 'two', three: 4 });
			let headers = Array.from(cookies.headers());
			assert.equal(headers.length, 1);
			assert.equal(JSON.parse(decodeURIComponent(headers[0].slice(8))).one, 'two');
		});

		it('Can pass a number', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			cookies.set('one', 2);
			let headers = Array.from(cookies.headers());
			assert.equal(headers.length, 1);
			assert.equal(headers[0], 'one=2');
		});

		it('Can pass a boolean', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			cookies.set('admin', true);
			assert.equal(cookies.get('admin').boolean(), true);
			let headers = Array.from(cookies.headers());
			assert.equal(headers.length, 1);
			assert.equal(headers[0], 'admin=true');
		});

		it('Can get the value after setting', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			cookies.set('foo', 'bar');
			let r = cookies.get('foo');
			assert.equal(r.value, 'bar');
		});

		it('Can get the JavaScript object after setting', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			cookies.set('options', { one: 'two', three: 4 });
			let cook = cookies.get('options');
			let value = cook.json();
			assert.equal(typeof value, 'object');
			assert.equal(value.one, 'two');
			assert.equal(typeof value.three, 'number');
			assert.equal(value.three, 4);
		});

		it('Overrides a value in the request', () => {
			let req = new Request('http://example.com/', {
				headers: {
					cookie: 'foo=bar',
				},
			});
			let cookies = new AstroCookies(req);
			assert.equal(cookies.get('foo').value, 'bar');

			// Set a new value
			cookies.set('foo', 'baz');
			assert.equal(cookies.get('foo').value, 'baz');
		});
	});
});
