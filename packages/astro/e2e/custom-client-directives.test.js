import { expect } from '@playwright/test';
import testAdapter from '../test/test-adapter.js';
import { testFactory, waitForHydrate } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/custom-client-directives/',
});

test.describe('Custom Client Directives - dev', () => {
	let devServer;

	test.beforeAll(async ({ astro }) => {
		devServer = await astro.startDevServer();
	});

	test.afterAll(async () => {
		await devServer.stop();
	});

	testClientDirectivesShared();
});

test.describe('Custom Client Directives - build static', () => {
	let previewServer;

	test.beforeAll(async ({ astro }) => {
		await astro.build();
		previewServer = await astro.preview();
	});

	test.afterAll(async () => {
		await previewServer.stop();
	});

	testClientDirectivesShared();
});

test.describe('Custom Client Directives - build server', () => {
	let previewServer;

	test.beforeAll(async ({ astro }) => {
		await astro.build({
			adapter: testAdapter({
				extendAdapter: {
					adapterFeatures: {
						buildOutput: 'static',
					},
				},
			}),
		});
		previewServer = await astro.preview();
	});

	test.afterAll(async () => {
		await previewServer.stop();
	});

	testClientDirectivesShared();
});

function testClientDirectivesShared() {
	test('client:click should work', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const incrementBtn = page.locator('#client-click .increment');
		const counterValue = page.locator('#client-click pre');

		await expect(counterValue).toHaveText('0');

		// Component only hydrates on first click
		await Promise.all([waitForHydrate(page, counterValue), incrementBtn.click()]);

		// Since first click only triggers hydration, this should stay 0
		await expect(counterValue).toHaveText('0');
		await incrementBtn.click();
		// Hydrated, this should be 1
		await expect(counterValue).toHaveText('1');
	});

	test('client:password should work', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const incrementBtn = page.locator('#client-password .increment');
		const counterValue = page.locator('#client-password pre');

		await expect(counterValue).toHaveText('0');
		await incrementBtn.click();
		// Not hydrated, so this should stay 0
		await expect(counterValue).toHaveText('0');

		// Type super cool password to activate password!
		await Promise.all([waitForHydrate(page, counterValue), page.keyboard.type('hunter2')]);

		await incrementBtn.click();
		// Hydrated, this should be 1
		await expect(counterValue).toHaveText('1');
	});

	test('Client directives should be passed options correctly', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const optionsContent = page.locator('#client-has-options pre');
		await waitForHydrate(page, optionsContent);

		const clientOptions = page.locator('#options');
		await expect(clientOptions).toHaveText(
			'Passed options are: {"message":"Hello! I was passed as an option"}',
		);
	});
}
