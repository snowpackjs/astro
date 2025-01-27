import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/solid-circular/' });

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Circular imports with Solid', () => {
	test('Context', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const wrapper = page.locator('#context');
		await expect(wrapper, 'context should not be duplicated').toHaveText('fr');
	});
});
