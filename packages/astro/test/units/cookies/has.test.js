import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AstroCookies } from '../../../dist/core/cookies/index.js';
import { apply as applyPolyfill } from '../../../dist/core/polyfill.js';

applyPolyfill();

describe('astro/src/core/cookies', () => {
	describe('Astro.cookies.has', () => {
		it('returns true if the request has the cookie', () => {
			let req = new Request('http://example.com/', {
				headers: {
					cookie: 'foo=bar',
				},
			});
			let cookies = new AstroCookies(req);
			assert.equal(cookies.has('foo'), true);
		});

		it('returns false if the request does not have the cookie', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			assert.equal(cookies.has('foo'), false);
		});

		it('returns true if the cookie has been set', () => {
			let req = new Request('http://example.com/');
			let cookies = new AstroCookies(req);
			cookies.set('foo', 'bar');
			assert.equal(cookies.has('foo'), true);
		});
	});
});
