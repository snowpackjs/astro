import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test as testBase } from '@playwright/test';
import { loadFixture as baseLoadFixture } from '../../../astro/test/test-utils.js';

export const isWindows = process.platform === 'win32';

// Get all test files in directory, assign unique port for each of them so they don't conflict
const testFiles = await fs.readdir(new URL('.', import.meta.url));
const testFileToPort = new Map();
for (let i = 0; i < testFiles.length; i++) {
	const file = testFiles[i];
	if (file.endsWith('.test.js')) {
		testFileToPort.set(file.slice(0, -8), 4000 + i);
	}
}

export function loadFixture(inlineConfig) {
	if (!inlineConfig?.root) throw new Error("Must provide { root: './fixtures/...' }");

	// resolve the relative root (i.e. "./fixtures/tailwindcss") to a full filepath
	// without this, the main `loadFixture` helper will resolve relative to `packages/astro/test`
	return baseLoadFixture({
		...inlineConfig,
		root: fileURLToPath(new URL(inlineConfig.root, import.meta.url)),
		server: {
			port: testFileToPort.get(path.basename(inlineConfig.root)),
		},
	});
}

export function testFactory(inlineConfig) {
	let fixture;

	const test = testBase.extend({
		astro: async ({}, use) => {
			fixture = fixture || (await loadFixture(inlineConfig));
			await use(fixture);
		},
	});

	test.afterEach(() => {
		fixture.resetAllFiles();
	});

	return test;
}

/**
 *
 * @param {string} page
 * @returns {Promise<{message: string, hint: string, absoluteFileLocation: string, fileLocation: string}>}
 */
export async function getErrorOverlayContent(page) {
	const overlay = await page.waitForSelector('vite-error-overlay', {
		strict: true,
		timeout: 10 * 1000,
	});

	expect(overlay).toBeTruthy();

	const message = await overlay.$$eval('#message-content', (m) => m[0].textContent);
	const hint = await overlay.$$eval('#hint-content', (m) => m[0].textContent);
	const [absoluteFileLocation, fileLocation] = await overlay.$$eval('#code header h2', (m) => [
		m[0].title,
		m[0].textContent,
	]);
	return { message, hint, absoluteFileLocation, fileLocation };
}

/**
 * Wait for `astro-island` that contains the `el` to hydrate
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} el
 */
export async function waitForHydrate(page, el) {
	const astroIsland = page.locator('astro-island', { has: el });
	const astroIslandId = await astroIsland.last().getAttribute('uid');
	await page.waitForFunction(
		(selector) => document.querySelector(selector)?.hasAttribute('ssr') === false,
		`astro-island[uid="${astroIslandId}"]`,
	);
}

/**
 * Scroll to element manually without making sure the `el` is stable
 * @param {import('@playwright/test').Locator} el
 */
export async function scrollToElement(el) {
	await el.evaluate((node) => {
		node.scrollIntoView({ behavior: 'auto' });
	});
}

export function prepareTestFactory(opts) {
	const test = testFactory(opts);

	let devServer;

	test.beforeAll(async ({ astro }) => {
		devServer = await astro.startDevServer();
	});

	test.afterAll(async () => {
		await devServer.stop();
	});

	return {
		test,
	};
}
