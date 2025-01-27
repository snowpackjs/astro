import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/server-islands-key/' });

test.describe('Server islands - Key reuse', () => {
	test.describe('Production', () => {
		let previewServer;

		test.beforeAll(async ({ astro }) => {
			// Playwright's Node version doesn't have these functions, so stub them.
			process.stdout.clearLine = () => {};
			process.stdout.cursorTo = () => {};
			process.env.ASTRO_KEY = 'eKBaVEuI7YjfanEXHuJe/pwZKKt3LkAHeMxvTU7aR0M=';
			await astro.build();
			previewServer = await astro.preview();
		});

		test.afterAll(async () => {
			await previewServer.stop();
			delete process.env.ASTRO_KEY;
		});

		test('Components render properly', async ({ page, astro }) => {
			await page.goto(astro.resolveUrl('/'));

			let el = page.locator('#island');

			await expect(el, 'element rendered').toBeVisible();
			await expect(el, 'should have content').toHaveText('I am an island');
		});
	});
});
