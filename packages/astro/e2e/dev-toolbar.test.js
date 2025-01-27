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

test.describe('Dev Toolbar', () => {
	test('dev toolbar exists in the page', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const devToolbar = page.locator('astro-dev-toolbar');
		await expect(devToolbar).toHaveCount(1);
	});

	test('shows app name on hover', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:home"]');
		const appButtonTooltip = appButton.locator('.item-tooltip');
		await appButton.hover();

		await expect(appButtonTooltip).toBeVisible();
	});

	test('can open Astro app', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:home"]');
		await appButton.click();

		const astroAppCanvas = toolbar.locator(
			'astro-dev-toolbar-app-canvas[data-app-id="astro:home"]',
		);
		const astroWindow = astroAppCanvas.locator('astro-dev-toolbar-window');
		await expect(astroWindow).toHaveCount(1);
		await expect(astroWindow).toBeVisible();

		// Toggle app off
		await appButton.click();
		await expect(astroWindow).not.toBeVisible();
	});

	test('show integration app', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/view-transition-a'));

		let toolbar = page.locator('astro-dev-toolbar');
		let appButton = toolbar.locator('button[data-app-id="astro:home"]');
		await appButton.click();

		let astroAppCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:home"]');
		let astroToolbarCards = await astroAppCanvas.locator('astro-dev-toolbar-card');
		await page.waitForSelector('astro-dev-toolbar-card');
		await expect(astroToolbarCards.first()).toBeVisible();

		let consolePromise = page.waitForEvent('console');
		await page.click('#go-to-b');
		await consolePromise;

		toolbar = page.locator('astro-dev-toolbar');
		appButton = toolbar.locator('button[data-app-id="astro:home"]');
		await appButton.click();

		astroAppCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:home"]');
		astroToolbarCards = await astroAppCanvas.locator('astro-dev-toolbar-card');
		await page.waitForSelector('astro-dev-toolbar-card');
		await expect(astroToolbarCards.first()).toBeVisible();
	});

	test('xray shows highlights and tooltips', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:xray"]');
		await appButton.click();

		const xrayCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:xray"]');
		const xrayHighlight = xrayCanvas.locator('astro-dev-toolbar-highlight');
		await expect(xrayHighlight).toBeVisible();

		await xrayHighlight.hover();
		const xrayHighlightTooltip = xrayHighlight.locator('astro-dev-toolbar-tooltip');
		await expect(xrayHighlightTooltip).toBeVisible();

		// Toggle app off
		await appButton.click();
		await expect(xrayHighlight).not.toBeVisible();
		await expect(xrayHighlightTooltip).not.toBeVisible();
	});

	test("xray tooltips don't overflow", async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/xray-overlay-positioning'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:xray"]');
		await appButton.click();

		const executeTest = async () => {
			const xrayCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:xray"]');
			const xrayHighlights = xrayCanvas.locator('astro-dev-toolbar-highlight');
			const xrayHighlightsCount = await xrayHighlights.count();

			for (let i = 0; i < xrayHighlightsCount; i++) {
				const currentHighlight = xrayHighlights.nth(i);
				await currentHighlight.hover();
				await expect(currentHighlight.locator('astro-dev-toolbar-tooltip')).toBeInViewport({
					ratio: 0.9,
				});
			}
		};

		// LTR
		await executeTest();

		// RTL
		await page.locator('body').evaluate((element) => (element.dir = 'rtl'));
		await executeTest();
	});

	test('xray escapes props content', async ({ page, astro }) => {
		let isAlertCalled = false;
		page.on('dialog', async (dialog) => {
			isAlertCalled = true;
			await dialog.accept();
		});

		await page.goto(astro.resolveUrl('/xray-props-escape'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:xray"]');
		await appButton.click();

		const xrayCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:xray"]');
		const xrayHighlight = xrayCanvas.locator('astro-dev-toolbar-highlight');
		await expect(xrayHighlight).toBeVisible();

		await xrayHighlight.hover();
		const xrayHighlightTooltip = xrayHighlight.locator('astro-dev-toolbar-tooltip');
		await expect(xrayHighlightTooltip).toBeVisible();

		const code = xrayHighlightTooltip.locator('pre > code');
		await expect(code).toHaveText(
			JSON.stringify({ name: `<img src='' onerror='alert(1)'>` }, undefined, 2),
		);
		expect(isAlertCalled).toBe(false);
	});

	test('xray shows no islands message when there are none', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/xray-no-islands'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:xray"]');
		await appButton.click();

		const xrayCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:xray"]');
		const auditHighlight = xrayCanvas.locator('astro-dev-toolbar-highlight');
		await expect(auditHighlight).not.toBeVisible();

		const xrayWindow = xrayCanvas.locator('astro-dev-toolbar-window');
		await expect(xrayWindow).toHaveCount(1);
		await expect(xrayWindow).toBeVisible();

		await expect(xrayWindow.locator('astro-dev-toolbar-icon[icon=lightbulb]')).toBeVisible();
	});

	test('audit shows highlights and tooltips', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlights = auditCanvas.locator('astro-dev-toolbar-highlight');

		for (const auditHighlight of await auditHighlights.all()) {
			await expect(auditHighlight).toBeVisible();

			await auditHighlight.hover();
			const auditHighlightTooltip = auditHighlight.locator('astro-dev-toolbar-tooltip');
			await expect(auditHighlightTooltip).toBeVisible();
		}

		// Toggle app off
		await appButton.click();
	});

	test('audit shows no issues message when there are no issues', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/audit-no-warning'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlight = auditCanvas.locator('astro-dev-toolbar-highlight');
		await expect(auditHighlight).not.toBeVisible();

		const auditWindow = auditCanvas.locator('astro-dev-toolbar-audit-window');
		await expect(auditWindow).toHaveCount(1);
		await expect(auditWindow).toBeVisible();

		await expect(auditWindow.locator('.no-audit-container')).toBeVisible();
	});

	test('audit shows a window with list of problems', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditWindow = auditCanvas.locator('astro-dev-toolbar-audit-window');
		await expect(auditWindow).toHaveCount(1);
		await expect(auditWindow).toBeVisible();

		// Toggle app off
		await appButton.click();
		await expect(auditWindow).not.toBeVisible();
	});

	test('adjusts tooltip position if off-screen', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/tooltip-position'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:audit"]');
		await appButton.click();

		const auditCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="astro:audit"]');
		const auditHighlights = auditCanvas.locator('astro-dev-toolbar-highlight');
		for (const highlight of await auditHighlights.all()) {
			await expect(highlight).toBeVisible();
			await highlight.hover();
			const tooltip = highlight.locator('astro-dev-toolbar-tooltip');
			await expect(tooltip).toBeVisible();
			const tooltipBox = await tooltip.boundingBox();
			const { clientWidth, clientHeight } = await page.evaluate(() => ({
				clientWidth: document.documentElement.clientWidth,
				clientHeight: document.documentElement.clientHeight,
			}));
			expect(tooltipBox.x + tooltipBox.width).toBeLessThan(clientWidth);
			expect(tooltipBox.y + tooltipBox.height).toBeLessThan(clientHeight);
		}
	});

	test('can open Settings app', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="astro:settings"]');
		await appButton.click();

		const settingsAppCanvas = toolbar.locator(
			'astro-dev-toolbar-app-canvas[data-app-id="astro:settings"]',
		);
		const settingsWindow = settingsAppCanvas.locator('astro-dev-toolbar-window');
		await expect(settingsWindow).toHaveCount(1);
		await expect(settingsWindow).toBeVisible();

		// Toggle app off
		await appButton.click();
		await expect(settingsWindow).not.toBeVisible();
	});

	test('Opening a app closes the currently opened app', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		let appButton = toolbar.locator('button[data-app-id="astro:settings"]');
		await appButton.click();

		const settingsAppCanvas = toolbar.locator(
			'astro-dev-toolbar-app-canvas[data-app-id="astro:settings"]',
		);
		const settingsWindow = settingsAppCanvas.locator('astro-dev-toolbar-window');
		await expect(settingsWindow).toHaveCount(1);
		await expect(settingsWindow).toBeVisible();

		// Click the astro app
		appButton = toolbar.locator('button[data-app-id="astro:home"]');
		await appButton.click();

		const astroAppCanvas = toolbar.locator(
			'astro-dev-toolbar-app-canvas[data-app-id="astro:home"]',
		);
		const astroWindow = astroAppCanvas.locator('astro-dev-toolbar-window');
		await expect(astroWindow).toHaveCount(1);
		await expect(astroWindow).toBeVisible();

		await expect(settingsWindow).not.toBeVisible();
	});

	test('Settings app contains message on disabling the toolbar', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		let appButton = toolbar.locator('button[data-app-id="astro:settings"]');
		await appButton.click();

		const settingsAppCanvas = toolbar.locator(
			'astro-dev-toolbar-app-canvas[data-app-id="astro:settings"]',
		);
		const settingsWindow = settingsAppCanvas.locator('astro-dev-toolbar-window');
		await expect(settingsWindow).toHaveCount(1);
		await expect(settingsWindow).toBeVisible();

		const hideToolbar = settingsWindow.getByRole('heading', { name: 'Hide toolbar' });
		await expect(hideToolbar).toBeVisible();
	});

	test('supports third-party apps', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="my-plugin"]');
		await appButton.click();

		const myAppCanvas = toolbar.locator('astro-dev-toolbar-app-canvas[data-app-id="my-plugin"]');
		const myAppWindow = myAppCanvas.locator('astro-dev-toolbar-window');
		await expect(myAppWindow).toHaveCount(1);
		await expect(myAppWindow).toBeVisible();

		await expect(myAppWindow).toContainText('Hello from the server!');

		// Toggle app off
		await appButton.click();
		await expect(myAppWindow).not.toBeVisible();
	});

	test('islands include their server and client render time', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const island = page.locator('astro-island');
		await expect(island).toHaveCount(1);

		const serverRenderTime = await island.getAttribute('server-render-time');
		const clientRenderTime = await island.getAttribute('client-render-time');

		expect(serverRenderTime).not.toBe(null);
		expect(clientRenderTime).not.toBe(null);
	});

	test('apps can show notifications', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		const appButton = toolbar.locator('button[data-app-id="my-plugin"]');
		await appButton.click();

		const customAppNotification = appButton.locator('.icon .notification');
		await expect(customAppNotification).toHaveAttribute('data-active');
		await expect(customAppNotification).toHaveAttribute('data-level', 'warning');

		await expect(customAppNotification).toBeVisible();
	});

	test('can quit apps by clicking outside the window', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');
		for (const appId of ['astro:home', 'astro:audit', 'astro:xray', 'astro:settings']) {
			const appButton = toolbar.locator(`button[data-app-id="${appId}"]`);
			await appButton.click();

			await expect(appButton).toHaveClass('item active');
			await page.click('body');
			await expect(appButton).not.toHaveClass('active');
		}
	});

	test('can adjust the placement', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/audit-no-warning'));

		const toolbar = page.locator('astro-dev-toolbar');
		const settingsAppButton = toolbar.locator('button[data-app-id="astro:settings"]');
		await settingsAppButton.click();

		const settingsAppCanvas = toolbar.locator(
			'astro-dev-toolbar-app-canvas[data-app-id="astro:settings"]',
		);
		const settingsWindow = settingsAppCanvas.locator('astro-dev-toolbar-window');
		await expect(settingsWindow).toBeVisible();

		for (const placement of ['bottom-left', 'bottom-center', 'bottom-right']) {
			const select = toolbar.getByRole('combobox');
			await expect(select).toBeVisible();
			await select.selectOption(placement);

			const toolbarRoot = toolbar.locator('#dev-toolbar-root');
			await expect(toolbarRoot).toHaveAttribute('data-placement', placement);

			for (const appId of ['astro:home', 'astro:xray', 'astro:settings']) {
				const appButton = toolbar.locator(`button[data-app-id="${appId}"]`);
				await appButton.click();

				const appCanvas = toolbar.locator(`astro-dev-toolbar-app-canvas[data-app-id="${appId}"]`);
				const appWindow = appCanvas.locator('astro-dev-toolbar-window');
				await expect(appWindow).toBeVisible();
				await expect(appWindow).toHaveJSProperty('placement', placement);
			}
		}
	});

	test('hidden on print media', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const toolbar = page.locator('astro-dev-toolbar');

		const settingsAppButton = toolbar.locator('button[data-app-id="astro:settings"]');
		await settingsAppButton.click();

		const settingsAppCanvas = toolbar.locator(
			'astro-dev-toolbar-app-canvas[data-app-id="astro:settings"]',
		);
		const settingsWindow = settingsAppCanvas.locator('astro-dev-toolbar-window');
		await expect(settingsWindow).toBeVisible();

		await page.emulateMedia({ media: 'print' });
		await expect(settingsWindow).not.toBeVisible();

		await page.emulateMedia({ media: 'screen' });
		await expect(settingsWindow).toBeVisible();

		await settingsAppButton.click();
		await expect(settingsWindow).not.toBeVisible();
	});
});
