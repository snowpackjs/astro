import { expect } from '@playwright/test';
import { testFactory, waitForHydrate } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/client-idle-timeout/' });

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Client idle timeout', () => {
	test('React counter', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#react-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		await waitForHydrate(page, counter);

		const inc = counter.locator('.increment');
		await inc.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});
});
