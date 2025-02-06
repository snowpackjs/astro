import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/server-islands/' });

test.describe('Server islands', () => {
	test.describe('Development', () => {
		let devServer;

		test.beforeAll(async ({ astro }) => {
			devServer = await astro.startDevServer();
		});

		test.afterAll(async () => {
			await devServer.stop();
		});

		test('Load content from the server', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl('/base/'));
			let el = page.locator('#basics .island');

			await expect(el, 'element rendered').toBeVisible();
			await expect(el, 'should have content').toHaveText('I am an island');
		});

		test('Can be in an MDX file', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl('/base/mdx/'));
			let el = page.locator('.island');

			await expect(el, 'element rendered').toBeVisible();
			await expect(el, 'should have content').toHaveText('I am an island');
		});

		test('Slots are provided back to the server islands', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl('/base/'));
			let el = page.locator('#children');

			await expect(el, 'element rendered').toBeVisible();
		});

		test('Props are encrypted', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl('/base/'));
			let el = page.locator('#basics .secret');
			await expect(el).toHaveText('test');
		});

		test('content-type header with media type still allows the island to be displayed', async ({
			page,
			astro,
		}) => {
			await page.goto(astro.resolveUrl('/base/'));
			let el = page.locator('#charset-in-content-type');
			await expect(el).toHaveCount(1);
		});

		test('Self imported module can server defer', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl('/base/'));
			let el = page.locator('.now');

			await expect(el).toHaveCount(2);
		});

		test('Large islands that exceed URL length still work through POST', async ({
			page,
			astro,
		}) => {
			await page.goto(astro.resolveUrl('/base/'));
			let el = page.locator('#basics .island');

			await expect(el, 'element rendered').toBeVisible();
			await expect(el, 'should have content').toHaveText('I am an island');
		});

		test("Missing server island start comment doesn't cause browser to lock up", async ({
			page,
			astro,
		}) => {
			await page.goto(astro.resolveUrl('/base/'));
			let el = page.locator('#first');
			await expect(el).toHaveCount(1);
		});
	});

	test.describe('Development - trailingSlash: ignore', () => {
		let devServer;

		test.beforeAll(async ({ astro }) => {
			process.env.TRAILING_SLASH = 'ignore';
			devServer = await astro.startDevServer();
		});

		test.afterAll(async () => {
			await devServer.stop();
		});

		test('Load content from the server', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl('/base/'));
			let el = page.locator('#basics .island');

			await expect(el, 'element rendered').toBeVisible();
			await expect(el, 'should have content').toHaveText('I am an island');
		});
	});
	test.describe('Production', () => {
		let previewServer;

		test.beforeAll(async ({ astro }) => {
			// Playwright's Node version doesn't have these functions, so stub them.
			process.stdout.clearLine = () => {};
			process.stdout.cursorTo = () => {};
			await astro.build();
			previewServer = await astro.preview();
		});

		test.afterAll(async () => {
			await previewServer.stop();
		});

		test('Only one component in prod', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl('/base/'));

			let el = page.locator('#basics .island');

			await expect(el, 'element rendered').toBeVisible();
			await expect(el, 'should have content').toHaveText('I am an island');
		});

		test('Props are encrypted', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl('/'));
			let el = page.locator('#basics .secret');
			await expect(el).toHaveText('test');
		});
	});
});
