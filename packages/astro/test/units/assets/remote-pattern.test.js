import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	matchHostname,
	matchPathname,
	matchPattern,
	matchPort,
	matchProtocol,
} from '../../../dist/assets/utils/remotePattern.js';

describe('astro/src/assets/utils/remotePattern', () => {
	const url1 = new URL('https://docs.astro.build/en/getting-started');
	const url2 = new URL('http://preview.docs.astro.build:8080/');
	const url3 = new URL('https://astro.build/');
	const url4 = new URL('https://example.co/');

	describe('remote pattern matchers', () => {
		it('matches protocol', async () => {
			// undefined
			assert.equal(matchProtocol(url1), true);

			// defined, true/false
			assert.equal(matchProtocol(url1, 'http'), false);
			assert.equal(matchProtocol(url1, 'https'), true);
		});

		it('matches port', async () => {
			// undefined
			assert.equal(matchPort(url1), true);

			// defined, but port is empty (default port used in URL)
			assert.equal(matchPort(url1, ''), true);

			// defined and port is custom
			assert.equal(matchPort(url2, '8080'), true);
		});

		it('matches hostname (no wildcards)', async () => {
			// undefined
			assert.equal(matchHostname(url1), true);

			// defined, true/false
			assert.equal(matchHostname(url1, 'astro.build'), false);
			assert.equal(matchHostname(url1, 'docs.astro.build'), true);
		});

		it('matches hostname (with wildcards)', async () => {
			// defined, true/false
			assert.equal(matchHostname(url1, 'docs.astro.build', true), true);
			assert.equal(matchHostname(url1, '**.astro.build', true), true);
			assert.equal(matchHostname(url1, '*.astro.build', true), true);

			assert.equal(matchHostname(url2, '*.astro.build', true), false);
			assert.equal(matchHostname(url2, '**.astro.build', true), true);

			assert.equal(matchHostname(url3, 'astro.build', true), true);
			assert.equal(matchHostname(url3, '*.astro.build', true), false);
			assert.equal(matchHostname(url3, '**.astro.build', true), false);
		});

		it('matches pathname (no wildcards)', async () => {
			// undefined
			assert.equal(matchPathname(url1), true);

			// defined, true/false
			assert.equal(matchPathname(url1, '/'), false);
			assert.equal(matchPathname(url1, '/en/getting-started'), true);
		});

		it('matches pathname (with wildcards)', async () => {
			// defined, true/false
			assert.equal(matchPathname(url1, '/en/**', true), true);
			assert.equal(matchPathname(url1, '/en/*', true), true);
			assert.equal(matchPathname(url1, '/**', true), true);

			assert.equal(matchPathname(url2, '/**', true), false);
			assert.equal(matchPathname(url2, '/*', true), false);
		});

		it('matches patterns', async () => {
			assert.equal(matchPattern(url1, {}), true);

			assert.equal(
				matchPattern(url1, {
					protocol: 'https',
				}),
				true,
			);

			assert.equal(
				matchPattern(url1, {
					protocol: 'https',
					hostname: '**.astro.build',
				}),
				true,
			);

			assert.equal(
				matchPattern(url1, {
					protocol: 'https',
					hostname: '**.astro.build',
					pathname: '/en/**',
				}),
				true,
			);

			assert.equal(
				matchPattern(url4, {
					protocol: 'https',
					hostname: 'example.com',
				}),
				false,
			);
		});
	});
});
