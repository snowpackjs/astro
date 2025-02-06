import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/dev-toolbar/',
});

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Dev Toolbar - Audits', () => {
	test('can warn about perf issues', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/audits-perf'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlights = auditCanvas.locator('astro-dev-toolbar-highlight');

		const count = await auditHighlights.count();
		expect(count).toEqual(2);

		for (const auditHighlight of await auditHighlights.all()) {
			await expect(auditHighlight).toBeVisible();

			const auditCode = await auditHighlight.getAttribute('data-audit-code');
			expect(auditCode.startsWith('perf-')).toBe(true);

			await auditHighlight.hover();
			const auditHighlightTooltip = auditHighlight.locator('astro-dev-toolbar-tooltip');
			await expect(auditHighlightTooltip).toBeVisible();
		}

		// Toggle app off
		await appButton.click();
	});

	test('does not warn about perf issue for below the fold image after mutation when body is unscrollable', async ({
		page,
		astro,
	}) => {
		await page.goto(astro.resolveUrl('/audits-perf-body-unscrollable'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlights = auditCanvas.locator('astro-dev-toolbar-highlight');

		expect(auditHighlights).toHaveCount(1);

		await page.click('body');

		let consolePromise = page.waitForEvent('console');
		await page.locator('#mutation-button').click();
		await consolePromise;

		await appButton.click();

		expect(auditHighlights).toHaveCount(1);
	});

	test('does not warn about perf issue for below the fold image in relative container', async ({
		page,
		astro,
	}) => {
		await page.goto(astro.resolveUrl('/audits-perf-relative'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlights = auditCanvas.locator('astro-dev-toolbar-highlight');

		expect(auditHighlights).toHaveCount(0);
	});

	test('can warn about perf issue for below the fold image in absolute container', async ({
		page,
		astro,
	}) => {
		await page.goto(astro.resolveUrl('/audits-perf-absolute'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlights = auditCanvas.locator('astro-dev-toolbar-highlight');

		expect(auditHighlights).toHaveCount(1);
	});

	test('can handle mutations', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/audits-mutations'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlights = auditCanvas.locator('astro-dev-toolbar-highlight');
		const auditWindow = auditCanvas.locator('astro-dev-toolbar-audit-window');
		const auditCards = auditWindow.locator('astro-dev-toolbar-audit-list-item');
		await expect(auditHighlights).toHaveCount(1);
		await expect(auditCards).toHaveCount(1);

		await page.click('body');

		const badButton = page.locator('#bad-button');

		let consolePromise = page.waitForEvent('console');
		await badButton.click();
		await consolePromise;

		await appButton.click();
		await expect(auditHighlights).toHaveCount(2);
		await expect(auditCards).toHaveCount(2);
	});

	test('multiple changes only result in one audit update', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		await page.evaluate(() => {
			localStorage.setItem(
				'astro:dev-toolbar:settings',
				JSON.stringify({
					verbose: true,
				}),
			);
		});

		await page.goto(astro.resolveUrl('/audits-mutations'));

		let logs = [];
		page.on('console', (msg) => {
			logs.push(msg.text());
		});

		const badButton = page.locator('#bad-button');

		let consolePromise = page.waitForEvent('console', (msg) =>
			msg.text().includes('Rerunning audit lints'),
		);
		await badButton.click({ clickCount: 5 });
		await consolePromise;

		await page.click('body');

		expect(
			logs.filter((log) => log.includes('Rerunning audit lints because the DOM has been updated'))
				.length === 1,
		).toBe(true);
	});

	test('handle mutations properly during view transitions', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		await page.evaluate(() => {
			localStorage.setItem(
				'astro:dev-toolbar:settings',
				JSON.stringify({
					verbose: true,
				}),
			);
		});

		await page.goto(astro.resolveUrl('/audits-mutations'));

		let logs = [];
		page.on('console', (msg) => {
			logs.push(msg.text());
		});

		const linkToOtherPage = page.locator('#link-to-2');
		let consolePromise = page.waitForEvent('console');
		await linkToOtherPage.click();
		await consolePromise;

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');

		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlights = auditCanvas.locator('astro-dev-toolbar-highlight');
		await expect(auditHighlights).toHaveCount(1);

		await page.click('body');

		const badButton = page.locator('#bad-button-2');

		consolePromise = page.waitForEvent('console');
		await badButton.click();
		await consolePromise;

		await appButton.click();
		await expect(auditHighlights).toHaveCount(2);

		// Make sure we only reran audits once
		expect(
			logs.filter((log) => log.includes('Rerunning audit lints because the DOM has been updated'))
				.length === 1,
		).toBe(true);
	});

	test('does not warn for non-interactive element', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/a11y-exceptions'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlights = auditCanvas.locator('astro-dev-toolbar-highlight');

		const count = await auditHighlights.count();
		expect(count).toEqual(0);
	});

	test('does not warn about label with valid labelable elements', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/a11y-labelable'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlights = auditCanvas.locator('astro-dev-toolbar-highlight');

		const count = await auditHighlights.count();
		expect(count).toEqual(0);
	});
});
