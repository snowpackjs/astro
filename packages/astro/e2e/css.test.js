import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/css/',
	devToolbar: {
		enabled: false,
	},
});

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('CSS HMR', () => {
	test('edit CSS from @import', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const h = page.locator('h1');
		await expect(h).toHaveCSS('color', 'rgb(255, 0, 0)');

		await astro.editFile('./src/styles/main.css', (original) =>
			original.replace('--h1-color: red;', '--h1-color: green;'),
		);

		await expect(h).toHaveCSS('color', 'rgb(0, 128, 0)');
	});

	test('removes Astro-injected CSS once Vite-injected CSS loads', async ({ astro }) => {
		const html = await astro.fetch('/').then((res) => res.text());
		// style[data-vite-dev-id] should exist in initial SSR'd markup
		expect(html).toMatch('data-vite-dev-id');
	});
});
