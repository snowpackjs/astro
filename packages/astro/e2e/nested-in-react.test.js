import { expect } from '@playwright/test';
import { testFactory, waitForHydrate } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/nested-in-react/' });

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Nested Frameworks in React', () => {
	test('No hydration mismatch', async ({ page, astro }) => {
		// Get browser logs
		const logs = [];
		page.on('console', (msg) => logs.push(msg.text()));

		await page.goto(astro.resolveUrl('/'));

		// wait for root island to hydrate
		const counter = page.locator('#react-counter');
		await waitForHydrate(page, counter);

		for (const log of logs) {
			expect(log, 'React hydration mismatch').not.toMatch('An error occurred during hydration');
		}
	});

	test('React counter', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#react-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('#react-counter-count');
		await expect(count, 'initial count is 0').toHaveText('0');

		await waitForHydrate(page, counter);

		const increment = counter.locator('#react-counter-increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Preact counter', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#preact-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('#preact-counter-count');
		await expect(count, 'initial count is 0').toHaveText('0');

		await waitForHydrate(page, counter);

		const increment = counter.locator('#preact-counter-increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Solid counter', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#solid-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('#solid-counter-count');
		await expect(count, 'initial count is 0').toHaveText('0');

		await waitForHydrate(page, counter);

		const increment = counter.locator('#solid-counter-increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Vue counter', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#vue-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('#vue-counter-count');
		await expect(count, 'initial count is 0').toHaveText('0');

		await waitForHydrate(page, counter);

		const increment = counter.locator('#vue-counter-increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Svelte counter', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#svelte-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('#svelte-counter-count');
		await expect(count, 'initial count is 0').toHaveText('0');

		await waitForHydrate(page, counter);

		const increment = counter.locator('#svelte-counter-increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('React counter nested in client:only component', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/nested-in-only'));

		const counter = page.locator('#react-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('#react-counter-count');
		await expect(count).toBeVisible();
	});
});
