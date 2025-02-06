import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('ISR', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/isr/',
		});
		await fixture.build();
	});

	it('generates expected prerender config', async () => {
		const vcConfig = JSON.parse(
			await fixture.readFile('../.vercel/output/functions/_isr.prerender-config.json')
		);
		assert.deepEqual(vcConfig, {
			expiration: 120,
			bypassToken: '1c9e601d-9943-4e7c-9575-005556d774a8',
			allowQuery: ['x_astro_path'],
			passQuery: true,
		});
	});

	it('generates expected routes', async () => {
		const deploymentConfig = JSON.parse(await fixture.readFile('../.vercel/output/config.json'));
		// the first two are /_astro/*, and filesystem routes
		assert.deepEqual(deploymentConfig.routes.slice(2), [
			{
				src: '^/two$',
				dest: '_render',
			},
			{
				src: '^/excluded/([^/]+?)$',
				dest: '_render',
			},
			{
				src: '^/excluded(?:/(.*?))?$',
				dest: '_render',
			},
			{
				src: '^/_server-islands/([^/]+?)/?$',
				dest: '_render',
			},
			{
				src: '^/_image/?$',
				dest: '_render',
			},
			{
				src: '^/excluded/([^/]+?)/?$',
				dest: '/_isr?x_astro_path=$0',
			},
			{
				src: '^/excluded(?:/(.*?))?/?$',
				dest: '/_isr?x_astro_path=$0',
			},
			{
				src: '^/one/?$',
				dest: '/_isr?x_astro_path=$0',
			},
			{
				src: '^/two/?$',
				dest: '/_isr?x_astro_path=$0',
			},
		]);
	});
});
