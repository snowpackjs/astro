import { expect } from '@playwright/test';
import { getErrorOverlayContent, testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/error-cyclic/',
});

let devServer;

test.beforeEach(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterEach(async ({ astro }) => {
	await devServer.stop();
	astro.resetAllFiles();
});

test.describe('Error: Cyclic Reference', () => {
	test('overlay', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const message = (await getErrorOverlayContent(page)).message;
		expect(message).toMatch('Cyclic reference');
	});
});
