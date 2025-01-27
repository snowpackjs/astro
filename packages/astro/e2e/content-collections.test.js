import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/content-collections/' });

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async ({ astro }) => {
	await devServer.stop();
	astro.resetAllFiles();
});

test.describe('Content Collections', () => {
	test('HMR', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		await astro.editFile('./src/components/MyComponent.astro', (original) =>
			original.replace('red', 'green'),
		);

		const h1 = page.locator('#my-heading');

		await expect(h1, 'should have green color').toHaveCSS('color', 'rgb(0, 128, 0)');
	});
});
