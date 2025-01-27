import { expect } from '@playwright/test';
import { scrollToElement, testFactory, waitForHydrate } from './test-utils.js';

export function prepareTestFactory(testFile, opts) {
	const test = testFactory(testFile, opts);

	let devServer;

	test.beforeAll(async ({ astro }) => {
		devServer = await astro.startDevServer();
	});

	test.afterAll(async () => {
		await devServer.stop();
	});

	const createTests = ({ pageUrl, pageSourceFilePath, componentFilePath, counterCssFilePath }) => {
		test('server only', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl(pageUrl));

			const counter = page.locator('#server-only');
			await expect(counter, 'component is visible').toBeVisible();

			const count = counter.locator('pre');
			await expect(count, 'initial count is 0').toHaveText('0');

			const inc = counter.locator('.increment');
			await inc.click();

			await expect(count, 'component not hydrated').toHaveText('0');
		});

		test('client:idle', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl(pageUrl));

			const counter = page.locator('#client-idle');
			await expect(counter, 'component is visible').toBeVisible();

			const count = counter.locator('pre');
			await expect(count, 'initial count is 0').toHaveText('0');

			await waitForHydrate(page, counter);

			const inc = counter.locator('.increment');
			await inc.click();

			await expect(count, 'count incremented by 1').toHaveText('1');
		});

		test('client:load', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl(pageUrl));

			const counter = page.locator('#client-load');
			await expect(counter, 'component is visible').toBeVisible();

			const count = counter.locator('pre');
			await expect(count, 'initial count is 0').toHaveText('0');

			await waitForHydrate(page, counter);

			const inc = counter.locator('.increment');
			await inc.click();

			await expect(count, 'count incremented by 1').toHaveText('1');
		});

		test('client:visible', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl(pageUrl));

			// Make sure the component is on screen to trigger hydration
			const counter = page.locator('#client-visible');
			// NOTE: Use custom implementation instead of `counter.scrollIntoViewIfNeeded`
			// as Playwright's function doesn't take into account of `counter` being hydrated
			// and losing the original DOM reference.
			await scrollToElement(counter);

			await expect(counter, 'component is visible').toBeVisible();

			const count = counter.locator('pre');
			await expect(count, 'initial count is 0').toHaveText('0');

			await waitForHydrate(page, counter);

			const inc = counter.locator('.increment');
			await inc.click();

			await expect(count, 'count incremented by 1').toHaveText('1');
		});

		test('client:media', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl(pageUrl));

			const counter = page.locator('#client-media');
			await expect(counter, 'component is visible').toBeVisible();

			const count = counter.locator('pre');
			await expect(count, 'initial count is 0').toHaveText('0');
			const inc = counter.locator('.increment');
			await inc.click();
			await expect(count, 'component not hydrated yet').toHaveText('0');

			// Reset the viewport to hydrate the component (max-width: 50rem)
			await page.setViewportSize({ width: 414, height: 1124 });
			await waitForHydrate(page, counter);

			await inc.click();
			await expect(count, 'count incremented by 1').toHaveText('1');
		});

		test('client:only', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl(pageUrl));

			const label = page.locator('#client-only');
			await waitForHydrate(page, label);
			await expect(label, 'component is visible').toBeVisible();

			await expect(label, 'slot text is visible').toHaveText('Framework client:only component');
		});

		test('HMR', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl(pageUrl));

			const counter = page.locator('#client-idle');
			const count = counter.locator('pre');
			await expect(count, 'initial count is 0').toHaveText('0');

			// Edit the component's initial count prop
			await astro.editFile(pageSourceFilePath, (original) =>
				original.replace('id="client-idle" {...someProps}', 'id="client-idle" count={5}'),
			);

			await expect(count, 'count prop updated').toHaveText('5', { timeout: 10000 });
			await expect(counter, 'component styles persisted').toHaveCSS('display', 'grid');

			// Edit the client:only component's slot text
			await astro.editFile(componentFilePath, (original) =>
				original.replace(
					'Framework client:only component',
					'Updated framework client:only component',
				),
			);

			const label = page.locator('#client-only');
			await expect(label, 'client:only component is visible').toBeVisible();
			await expect(label, 'client:only slot text is visible').toHaveText(
				'Updated framework client:only component',
			);

			// Edit the imported CSS file
			await astro.editFile(counterCssFilePath || './src/components/Counter.css', (original) =>
				original.replace('font-size: 2em;', 'font-size: 24px;'),
			);

			await expect(count, 'imported CSS updated').toHaveCSS('font-size', '24px');

			// Revert our edits
			astro.resetAllFiles();
		});
	};

	return {
		test,
		createTests,
	};
}
