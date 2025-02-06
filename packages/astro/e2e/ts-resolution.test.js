import { expect } from '@playwright/test';
import { testFactory, waitForHydrate } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/ts-resolution/' });

function runTest(it) {
	it('client:idle', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#client-idle');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		await waitForHydrate(page, counter);

		const inc = counter.locator('.increment');
		await inc.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});
}

test.describe('TypeScript resolution -', () => {
	test.describe('Development', () => {
		let devServer;

		test.beforeAll(async ({ astro }) => {
			devServer = await astro.startDevServer();
		});

		test.afterAll(async () => {
			await devServer.stop();
		});

		runTest(test);
	});

	test.describe('Production', () => {
		let previewServer;

		test.beforeAll(async ({ astro }) => {
			await astro.build();
			previewServer = await astro.preview();
		});

		test.afterAll(async () => {
			await previewServer.stop();
		});

		runTest(test);
	});
});
