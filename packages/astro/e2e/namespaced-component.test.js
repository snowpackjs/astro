import { expect } from '@playwright/test';
import { testFactory, waitForHydrate } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/namespaced-component/',
});

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Hydrating namespaced components', () => {
	test('Preact Component', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		// Counter declared with: <ns.components.PreactCounter id="preact-counter-namespace" client:load>
		const namespacedCounter = page.locator('#preact-counter-namespace');
		await expect(namespacedCounter, 'component is visible').toBeVisible();

		const namespacedCount = namespacedCounter.locator('pre');
		await expect(namespacedCount, 'initial count is 0').toHaveText('0');

		const namespacedChildren = namespacedCounter.locator('.children');
		await expect(namespacedChildren, 'children exist').toHaveText('preact (namespace import)');

		await waitForHydrate(page, namespacedCounter);

		const namespacedIncrement = namespacedCounter.locator('.increment');
		await namespacedIncrement.click();

		await expect(namespacedCount, 'count incremented by 1').toHaveText('1');

		// Counter declared with: <components.PreactCounterTwo id="preact-counter-named" client:load>
		const namedCounter = page.locator('#preact-counter-named');
		await expect(namedCounter, 'component is visible').toBeVisible();

		const namedCount = namedCounter.locator('pre');
		await expect(namedCount, 'initial count is 0').toHaveText('0');

		const namedChildren = namedCounter.locator('.children');
		await expect(namedChildren, 'children exist').toHaveText('preact (named import)');

		await waitForHydrate(page, namedCounter);

		const namedIncrement = namedCounter.locator('.increment');
		await namedIncrement.click();

		await expect(namedCount, 'count incremented by 1').toHaveText('1');
	});

	test('MDX', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/mdx'));

		// Counter declared with: <ns.components.PreactCounter id="preact-counter-namespace" client:load>
		const namespacedCounter = page.locator('#preact-counter-namespace');
		await expect(namespacedCounter, 'component is visible').toBeVisible();

		const namespacedCount = namespacedCounter.locator('pre');
		await expect(namespacedCount, 'initial count is 0').toHaveText('0');

		const namespacedChildren = namespacedCounter.locator('.children');
		await expect(namespacedChildren, 'children exist').toHaveText('preact (namespace import)');

		await waitForHydrate(page, namespacedCounter);

		const namespacedIncrement = namespacedCounter.locator('.increment');
		await namespacedIncrement.click();

		await expect(namespacedCount, 'count incremented by 1').toHaveText('1');

		// Counter declared with: <components.PreactCounterTwo id="preact-counter-named" client:load>
		const namedCounter = page.locator('#preact-counter-named');
		await expect(namedCounter, 'component is visible').toBeVisible();

		const namedCount = namedCounter.locator('pre');
		await expect(namedCount, 'initial count is 0').toHaveText('0');

		const namedChildren = namedCounter.locator('.children');
		await expect(namedChildren, 'children exist').toHaveText('preact (named import)');

		await waitForHydrate(page, namedCounter);

		const namedIncrement = namedCounter.locator('.increment');
		await namedIncrement.click();

		await expect(namedCount, 'count incremented by 1').toHaveText('1');
	});
});
