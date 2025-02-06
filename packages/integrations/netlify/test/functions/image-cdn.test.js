import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { remotePatternToRegex } from '@astrojs/netlify';
import { loadFixture } from '../../../../astro/test/test-utils.js';

describe(
	'Image CDN',
	() => {
		const root = new URL('./fixtures/middleware/', import.meta.url);

		describe('when running outside of netlify', () => {
			it('does not enable Image CDN', async () => {
				const fixture = await loadFixture({ root });
				await fixture.build();

				const astronautPage = await fixture.readFile('astronaut/index.html');
				assert.equal(astronautPage.includes(`src="/_astro/astronaut.`), true);
			});
		});

		describe('when running inside of netlify', () => {
			after(() => {
				process.env.NETLIFY = undefined;
				process.env.DISABLE_IMAGE_CDN = undefined;
			});

			it('enables Netlify Image CDN', async () => {
				process.env.NETLIFY = 'true';
				const fixture = await loadFixture({ root });
				await fixture.build();

				const astronautPage = await fixture.readFile('astronaut/index.html');
				assert.equal(astronautPage.includes(`src="/.netlify/image`), true);
			});

			it('respects image CDN opt-out', async () => {
				process.env.NETLIFY = 'true';
				process.env.DISABLE_IMAGE_CDN = 'true';
				const fixture = await loadFixture({ root });
				await fixture.build();

				const astronautPage = await fixture.readFile('astronaut/index.html');
				assert.equal(astronautPage.includes(`src="/_astro/astronaut.`), true);
			});
		});

		describe('remote image config', () => {
			let regexes;

			before(async () => {
				const fixture = await loadFixture({ root });
				await fixture.build();

				const config = await fixture.readFile('../.netlify/v1/config.json');
				if (config) {
					regexes = JSON.parse(config).images.remote_images.map((pattern) => new RegExp(pattern));
				}
			});

			it('generates remote image config patterns', async () => {
				assert.equal(regexes?.length, 3);
			});

			it('generates correct config for domains', async () => {
				const domain = regexes[0];
				assert.equal(domain.test('https://example.net/image.jpg'), true);
				assert.equal(
					domain.test('https://www.example.net/image.jpg'),
					false,
					'subdomain should not match',
				);
				assert.equal(domain.test('http://example.net/image.jpg'), true, 'http should match');
				assert.equal(
					domain.test('https://example.net/subdomain/image.jpg'),
					true,
					'subpath should match',
				);
				const subdomain = regexes[1];
				assert.equal(
					subdomain.test('https://secret.example.edu/image.jpg'),
					true,
					'should match subdomains',
				);
				assert.equal(
					subdomain.test('https://secretxexample.edu/image.jpg'),
					false,
					'should not use dots in domains as wildcards',
				);
			});

			it('generates correct config for remotePatterns', async () => {
				const patterns = regexes[2];
				assert.equal(
					patterns.test('https://example.org/images/1.jpg'),
					true,
					'should match domain',
				);
				assert.equal(
					patterns.test('https://www.example.org/images/2.jpg'),
					true,
					'www subdomain should match',
				);
				assert.equal(
					patterns.test('https://www.subdomain.example.org/images/2.jpg'),
					false,
					'second level subdomain should not match',
				);
				assert.equal(
					patterns.test('https://example.org/not-images/2.jpg'),
					false,
					'wrong path should not match',
				);
			});

			it('warns when remotepatterns generates an invalid regex', async (t) => {
				const logger = {
					warn: t.mock.fn(),
				};
				const regex = remotePatternToRegex(
					{
						hostname: '*.examp[le.org',
						pathname: '/images/*',
					},
					logger,
				);
				assert.strictEqual(regex, undefined);
				const calls = logger.warn.mock.calls;
				assert.strictEqual(calls.length, 1);
				assert.equal(
					calls[0].arguments[0],
					'Could not generate a valid regex from the remotePattern "{"hostname":"*.examp[le.org","pathname":"/images/*"}". Please check the syntax.',
				);
			});
		});
	},
	{
		timeout: 120000,
	},
);
