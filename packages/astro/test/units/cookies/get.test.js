import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AstroCookies } from '../../../dist/core/cookies/index.js';
import { apply as applyPolyfill } from '../../../dist/core/polyfill.js';

applyPolyfill();

describe('astro/src/core/cookies', () => {
	describe('Astro.cookies.get', () => {
		it('gets the cookie value', () => {
			const req = new Request('http://example.com/', {
				headers: {
					cookie: 'foo=bar',
				},
			});
			const cookies = new AstroCookies(req);
			assert.equal(cookies.get('foo').value, 'bar');
		});

		it('gets the cookie value with default decode', () => {
			const url = 'http://localhost';
			const req = new Request('http://example.com/', {
				headers: {
					cookie: `url=${encodeURIComponent(url)}`,
				},
			});
			const cookies = new AstroCookies(req);
			// by default decodeURIComponent is used on the value
			assert.equal(cookies.get('url').value, url);
		});

		it('gets the cookie value with custom decode', () => {
			const url = 'http://localhost';
			const req = new Request('http://example.com/', {
				headers: {
					cookie: `url=${encodeURIComponent(url)}`,
				},
			});
			const cookies = new AstroCookies(req);
			// set decode to the identity function to prevent decodeURIComponent on the value
			assert.equal(cookies.get('url', { decode: (o) => o }).value, encodeURIComponent(url));
		});

		it("Returns undefined is the value doesn't exist", () => {
			const req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			let cookie = cookies.get('foo');
			assert.equal(cookie, undefined);
		});

		describe('.json()', () => {
			it('returns a JavaScript object', () => {
				const req = new Request('http://example.com/', {
					headers: {
						cookie: 'foo=%7B%22key%22%3A%22value%22%7D',
					},
				});
				let cookies = new AstroCookies(req);

				const json = cookies.get('foo').json();
				assert.equal(typeof json, 'object');
				assert.equal(json.key, 'value');
			});
		});

		describe('.number()', () => {
			it('Coerces into a number', () => {
				const req = new Request('http://example.com/', {
					headers: {
						cookie: 'foo=22',
					},
				});
				let cookies = new AstroCookies(req);

				const value = cookies.get('foo').number();
				assert.equal(typeof value, 'number');
				assert.equal(value, 22);
			});

			it('Coerces non-number into NaN', () => {
				const req = new Request('http://example.com/', {
					headers: {
						cookie: 'foo=bar',
					},
				});
				let cookies = new AstroCookies(req);

				const value = cookies.get('foo').number();
				assert.equal(typeof value, 'number');
				assert.equal(Number.isNaN(value), true);
			});
		});

		describe('.boolean()', () => {
			it('Coerces true into `true`', () => {
				const req = new Request('http://example.com/', {
					headers: {
						cookie: 'foo=true',
					},
				});
				let cookies = new AstroCookies(req);

				const value = cookies.get('foo').boolean();
				assert.equal(typeof value, 'boolean');
				assert.equal(value, true);
			});

			it('Coerces false into `false`', () => {
				const req = new Request('http://example.com/', {
					headers: {
						cookie: 'foo=false',
					},
				});
				let cookies = new AstroCookies(req);

				const value = cookies.get('foo').boolean();
				assert.equal(typeof value, 'boolean');
				assert.equal(value, false);
			});

			it('Coerces 1 into `true`', () => {
				const req = new Request('http://example.com/', {
					headers: {
						cookie: 'foo=1',
					},
				});
				let cookies = new AstroCookies(req);

				const value = cookies.get('foo').boolean();
				assert.equal(typeof value, 'boolean');
				assert.equal(value, true);
			});

			it('Coerces 0 into `false`', () => {
				const req = new Request('http://example.com/', {
					headers: {
						cookie: 'foo=0',
					},
				});
				let cookies = new AstroCookies(req);

				const value = cookies.get('foo').boolean();
				assert.equal(typeof value, 'boolean');
				assert.equal(value, false);
			});

			it('Coerces truthy strings into `true`', () => {
				const req = new Request('http://example.com/', {
					headers: {
						cookie: 'foo=bar',
					},
				});
				let cookies = new AstroCookies(req);

				const value = cookies.get('foo').boolean();
				assert.equal(typeof value, 'boolean');
				assert.equal(value, true);
			});
		});
	});
});
