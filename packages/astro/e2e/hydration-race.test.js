import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/hydration-race/',
});

let devServer;

test.beforeEach(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterEach(async () => {
	await devServer.stop();
});

test.describe('Hydration race', () => {
	test('Islands inside of slots hydrate', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/slot'));

		const one = page.locator('#one');
		await expect(one, 'updated text').toHaveText('Hello One in the client');

		const two = page.locator('#two');
		await expect(two, 'updated text').toHaveText('Hello Two in the client');

		const three = page.locator('#three');
		await expect(three, 'updated text').toHaveText('Hello Three in the client');

		const four = page.locator('#four');
		await expect(four, 'updated text').toHaveText('Hello Four in the client');
	});
});
