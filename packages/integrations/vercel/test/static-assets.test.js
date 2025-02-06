import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Static Assets', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	const VALID_CACHE_CONTROL = 'public, max-age=31536000, immutable';

	async function build({ adapter, assets, output }) {
		fixture = await loadFixture({
			root: './fixtures/static-assets/',
			output,
			adapter,
			build: {
				assets,
			},
		});
		await fixture.build();
	}

	async function getConfig() {
		const json = await fixture.readFile('../.vercel/output/config.json');
		const config = JSON.parse(json);

		return config;
	}

	async function getAssets() {
		return fixture.config.build.assets;
	}

	async function checkValidCacheControl(assets) {
		const config = await getConfig();
		const theAssets = assets ?? (await getAssets());

		const route = config.routes.find((r) => r.src === `^/${theAssets}/(.*)$`);
		assert.equal(route.headers['cache-control'], VALID_CACHE_CONTROL);
		assert.equal(route.continue, true);
	}

	describe('static adapter', () => {
		it('has cache control', async () => {
			const { default: vercel } = await import('@astrojs/vercel');
			await build({ adapter: vercel() });
			await checkValidCacheControl();
		});

		it('has cache control other assets', async () => {
			const { default: vercel } = await import('@astrojs/vercel');
			const assets = '_foo';
			await build({ adapter: vercel(), assets });
			await checkValidCacheControl(assets);
		});
	});

	describe('serverless adapter', () => {
		it('has cache control', async () => {
			const { default: vercel } = await import('@astrojs/vercel');
			await build({ output: 'server', adapter: vercel() });
			await checkValidCacheControl();
		});

		it('has cache control other assets', async () => {
			const { default: vercel } = await import('@astrojs/vercel');
			const assets = '_foo';
			await build({ output: 'server', adapter: vercel(), assets });
			await checkValidCacheControl(assets);
		});
	});
});
