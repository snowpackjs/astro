import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/astro-envs/',
	devToolbar: {
		enabled: false,
	},
	vite: {
		optimizeDeps: {
			// Vite has a bug where if you close the server too quickly, while the optimized
			// dependencies are still held before serving, it will stall the server from closing.
			// This will workaround it for now.
			holdUntilCrawlEnd: false,
		},
	},
});

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Astro Environment BASE_URL', () => {
	test('BASE_URL', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/'));

		const astroBaseUrl = page.locator('id=astro-base-url');
		await expect(astroBaseUrl, 'astroBaseUrl equals to /blog').toHaveText('/blog');

		const clientComponentBaseUrl = page.locator('id=client-component-base-url');
		await expect(clientComponentBaseUrl, 'clientComponentBaseUrl equals to /blog').toHaveText(
			'/blog',
		);
	});
});
