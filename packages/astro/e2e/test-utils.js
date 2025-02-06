import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test as testBase } from '@playwright/test';
import { loadFixture as baseLoadFixture } from '../test/test-utils.js';

export const isWindows = process.platform === 'win32';

export { silentLogging } from '../test/test-utils.js';

// Get all test files in directory, assign unique port for each of them so they don't conflict
const testFiles = await fs.readdir(new URL('.', import.meta.url));
const testFileToPort = new Map();
for (let i = 0; i < testFiles.length; i++) {
	const file = testFiles[i];
	if (file.endsWith('.test.js')) {
		// Port 4045 is an unsafe port in Chrome, so skip it.
		if (4000 + i === 4045) {
			i++;
		}
		testFileToPort.set(file, 4000 + i);
	}
}

export function loadFixture(testFile, inlineConfig) {
	if (!inlineConfig?.root) throw new Error("Must provide { root: './fixtures/...' }");

	const port = testFileToPort.get(path.basename(testFile));

	// resolve the relative root (i.e. "./fixtures/tailwindcss") to a full filepath
	// without this, the main `loadFixture` helper will resolve relative to `packages/astro/test`
	return baseLoadFixture({
		...inlineConfig,
		root: fileURLToPath(new URL(inlineConfig.root, import.meta.url)),
		server: {
			...inlineConfig?.server,
			port,
		},
		vite: {
			...inlineConfig?.vite,
			server: {
				...inlineConfig?.vite?.server,
				strictPort: true,
			},
		},
	});
}

export function testFactory(testFile, inlineConfig) {
	let fixture;

	const test = testBase.extend({
		astro: async ({}, use) => {
			fixture = fixture || (await loadFixture(testFile, inlineConfig));
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
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{message: string, hint: string, absoluteFileLocation: string, fileLocation: string, codeFrame: import('@playwright/test').ElementHandle}>}
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

	const codeFrame = await overlay.$('#code pre code');

	return { message, hint, absoluteFileLocation, fileLocation, codeFrame };
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
