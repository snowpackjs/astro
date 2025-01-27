import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/astro-component/' });

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Astro component HMR', () => {
	test('component styles', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const hero = page.locator('section');
		await expect(hero, 'hero has background: white').toHaveCSS(
			'background-color',
			'rgb(255, 255, 255)',
		);
		await expect(hero, 'hero has color: black').toHaveCSS('color', 'rgb(0, 0, 0)');

		// Edit the Hero component with a new background color
		await astro.editFile('./src/components/Hero.astro', (content) =>
			content.replace('background: white', 'background: rgb(230, 230, 230)'),
		);

		await expect(hero, 'background color updated').toHaveCSS(
			'background-color',
			'rgb(230, 230, 230)',
		);
	});

	test('Scripts', async ({ page, astro }) => {
		const initialLog = page.waitForEvent(
			'console',
			(message) => message.text() === 'Hello, Astro!',
		);

		await page.goto(astro.resolveUrl('/'));
		await initialLog;

		const el = page.locator('#hoisted-script');
		expect(await el.innerText()).toContain('Hoisted success');

		const updatedLog = page.waitForEvent(
			'console',
			(message) => message.text() === 'Hello, updated Astro!',
		);

		// Edit the script on the page
		await astro.editFile('./src/pages/index.astro', (content) =>
			content.replace('Hello, Astro!', 'Hello, updated Astro!'),
		);

		await updatedLog;
	});

	test('inline scripts', async ({ page, astro }) => {
		const initialLog = page.waitForEvent(
			'console',
			(message) => message.text() === 'Hello, inline Astro!',
		);

		await page.goto(astro.resolveUrl('/'));
		await initialLog;

		const updatedLog = page.waitForEvent(
			'console',
			(message) => message.text() === 'Hello, updated inline Astro!',
		);

		// Edit the inline script on the page
		await astro.editFile('./src/pages/index.astro', (content) =>
			content.replace('Hello, inline Astro!', 'Hello, updated inline Astro!'),
		);

		await updatedLog;
	});

	test('update linked dep Astro html', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));
		let h1 = page.locator('#astro-linked-lib');
		expect(await h1.textContent()).toBe('astro-linked-lib');
		await Promise.all([
			page.waitForLoadState('networkidle'),
			await astro.editFile('../_deps/astro-linked-lib/Component.astro', (content) =>
				content.replace('>astro-linked-lib<', '>astro-linked-lib-update<'),
			),
		]);
		h1 = page.locator('#astro-linked-lib');
		expect(await h1.textContent()).toBe('astro-linked-lib-update');
	});

	test('update linked dep Astro style', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));
		let h1 = page.locator('#astro-linked-lib');
		await expect(h1).toHaveCSS('color', 'rgb(255, 0, 0)');
		await Promise.all([
			page.waitForLoadState('networkidle'),
			await astro.editFile('../_deps/astro-linked-lib/Component.astro', (content) =>
				content.replace('color: red', 'color: green'),
			),
		]);
		h1 = page.locator('#astro-linked-lib');
		await expect(h1).toHaveCSS('color', 'rgb(0, 128, 0)');
	});
});
