import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/nested-styles/',
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

test.describe('Loading styles that are nested', () => {
	test('header', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const header = page.locator('header');

		await expect(header, 'should have background color').toHaveCSS(
			'background-color',
			'rgb(0, 0, 139)', // darkblue
		);
	});
});
