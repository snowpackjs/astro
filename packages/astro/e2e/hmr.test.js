import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/hmr/',
	devToolbar: {
		enabled: false,
	},
});

let devServer;

function throwPageShouldNotReload() {
	throw new Error('Page should not reload in HMR');
}

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterEach(({ page }) => {
	page.off('load', throwPageShouldNotReload);
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Scripts with dependencies', () => {
	test('refresh with HMR', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/script-dep'));

		const h = page.locator('h1');
		await expect(h, 'original text set').toHaveText('before');

		await astro.editFile('./src/scripts/heading.js', (original) =>
			original.replace('before', 'after'),
		);

		await expect(h, 'text changed').toHaveText('after');
	});
});

test.describe('Styles', () => {
	test('dependencies cause refresh with HMR', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/css-dep'));

		page.once('load', throwPageShouldNotReload);

		const h = page.locator('h1');
		await expect(h).toHaveCSS('color', 'rgb(0, 0, 255)');

		await astro.editFile('./src/styles/vars.scss', (original) => original.replace('blue', 'red'));

		await expect(h).toHaveCSS('color', 'rgb(255, 0, 0)');
	});

	test('external CSS refresh with HMR', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/css-external'));

		page.once('load', throwPageShouldNotReload);

		const h = page.locator('h1');
		await expect(h).toHaveCSS('color', 'rgb(0, 0, 255)');

		await astro.editFile('./src/styles/css-external.css', (original) =>
			original.replace('blue', 'red'),
		);

		await expect(h).toHaveCSS('color', 'rgb(255, 0, 0)');
	});
});
