import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/client-only/' });

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Client only', () => {
	test('React counter', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = await page.locator('#react-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = await counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		const children = await counter.locator('.children');
		await expect(children, 'children exist').toHaveText('react');

		const increment = await counter.locator('.increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Preact counter', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = await page.locator('#preact-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = await counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		const children = await counter.locator('.children');
		await expect(children, 'children exist').toHaveText('preact');

		const increment = await counter.locator('.increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Solid counter', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = await page.locator('#solid-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = await counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		const children = await counter.locator('.children');
		await expect(children, 'children exist').toHaveText('solid');

		const increment = await counter.locator('.increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Vue counter', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = await page.locator('#vue-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = await counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		const children = await counter.locator('.children');
		await expect(children, 'children exist').toHaveText('vue');

		const increment = await counter.locator('.increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Svelte counter', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = await page.locator('#svelte-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = await counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		const children = await counter.locator('.children');
		await expect(children, 'children exist').toHaveText('svelte');

		const increment = await counter.locator('.increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});
});
