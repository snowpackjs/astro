import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/i18n/',
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

test.describe('i18n', () => {
	test('getLocaleByPath', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const p1 = page.locator('p').nth(0);
		await expect(p1).toHaveText('Locale: en');

		const p2 = page.locator('p').nth(1);
		await expect(p2).toHaveText('Locale: fr');

		const p3 = page.locator('p').nth(2);
		await expect(p3).toHaveText('Locale: pt-AO');
	});
});

test.describe('i18n default locale', () => {
	test('is "en" when navigating the default locale page', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/island'));
		let el = page.getByTestId('greeting');

		await expect(el, 'element rendered').toBeVisible();
		await expect(el).toHaveText('Greeting en!');
	});

	test('is "fr" when navigating the french page', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/fr/island'));
		let el = page.getByTestId('greeting');

		await expect(el, 'element rendered').toBeVisible();
		await expect(el).toHaveText('Greeting fr!');
	});
});
