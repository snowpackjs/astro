import { expect } from '@playwright/test';
import { getErrorOverlayContent, testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/errors/',
	// Only test the error overlay, don't print to console
	vite: {
		logLevel: 'silent',
	},
});

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async ({ astro }) => {
	await devServer.stop();
	astro.resetAllFiles();
});

test.describe('Error display', () => {
	test('detect syntax errors in template', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/astro-syntax-error'), { waitUntil: 'networkidle' });

		const message = (await getErrorOverlayContent(page)).message;
		expect(message).toMatch('Unexpected "while"');

		await Promise.all([
			// Wait for page reload
			page.waitForNavigation(),
			// Edit the component file
			await astro.editFile(
				'./src/pages/astro-syntax-error.astro',
				() => `<h1>No syntax error</h1>`,
			),
		]);

		expect(await page.locator('vite-error-overlay').count()).toEqual(0);
	});

	test('shows useful error when frontmatter import is not found', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/import-not-found'), { waitUntil: 'networkidle' });

		const message = (await getErrorOverlayContent(page)).message;
		expect(message).toMatch('Could not import ../abc.astro');

		await Promise.all([
			// Wait for page reload
			page.waitForNavigation(),
			// Edit the component file
			astro.editFile('./src/pages/import-not-found.astro', () => `<h1>No import error</h1>`),
		]);

		expect(await page.locator('vite-error-overlay').count()).toEqual(0);
	});

	test('shows correct file path when a page has an error', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/import-not-found'), { waitUntil: 'networkidle' });

		const { fileLocation, absoluteFileLocation } = await getErrorOverlayContent(page);
		const absoluteFileUrl = 'file://' + absoluteFileLocation.replace(/:\d+:\d+$/, '');
		const fileExists = astro.pathExists(absoluteFileUrl);

		expect(fileExists).toBeTruthy();
		expect(fileLocation).toMatch(/^pages\/import-not-found\.astro/);
	});

	// NOTE: It's not possible to detect some JSX components if they have errors because
	// their renderers' check functions run the render directly, and if a runtime error is
	// thrown, it assumes that it's simply not that renderer's component and skips it
	test('shows correct file path when a component has an error', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/vue-runtime-error'), { waitUntil: 'networkidle' });

		const { fileLocation, absoluteFileLocation } = await getErrorOverlayContent(page);
		const absoluteFileUrl = 'file://' + absoluteFileLocation.replace(/:\d+:\d+$/, '');
		const fileExists = astro.pathExists(absoluteFileUrl);

		expect(fileExists).toBeTruthy();
		expect(fileLocation).toMatch(/^vue\/VueRuntimeError.vue/);
	});

	// TODO: unskip when upgrading to Vite 6.0.0-beta.7 or above
	test.skip('shows correct line when a style preprocess has an error', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/astro-sass-error'), { waitUntil: 'networkidle' });

		const { fileLocation, absoluteFileLocation } = await getErrorOverlayContent(page);
		const absoluteFileUrl = 'file://' + absoluteFileLocation.replace(/:\d+:\d+$/, '');

		const fileExists = astro.pathExists(absoluteFileUrl);
		expect(fileExists).toBeTruthy();

		const fileContent = await astro.readFile(absoluteFileUrl);
		const lineNumber = /:(\d+):\d+$/.exec(absoluteFileLocation)[1];
		const highlightedLine = fileContent.split('\n')[lineNumber - 1];
		expect(highlightedLine).toContain(`@use '../styles/inexistent' as *;`);

		expect(fileLocation).toMatch(/^pages\/astro-sass-error.astro/);
	});

	test('framework errors recover when fixed', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/svelte-syntax-error'), { waitUntil: 'networkidle' });

		const message = (await getErrorOverlayContent(page)).message;
		expect(message).toMatch('</div> attempted to close an element that was not open');

		await Promise.all([
			// Wait for page reload
			page.waitForNavigation(),
			// Edit the component file
			astro.editFile(
				'./src/components/svelte/SvelteSyntaxError.svelte',
				() => `<h1>No mismatch</h1>`,
			),
		]);

		expect(await page.locator('vite-error-overlay').count()).toEqual(0);
	});

	test('astro glob no match error', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/astro-glob-no-match'), { waitUntil: 'networkidle' });
		const message = (await getErrorOverlayContent(page)).message;
		expect(message).toMatch('did not return any matching files');
	});

	test('astro glob used outside of an astro file', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/astro-glob-outside-astro'), { waitUntil: 'networkidle' });
		const message = (await getErrorOverlayContent(page)).message;
		expect(message).toMatch('can only be used in');
	});

	test('can handle DomException errors', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/dom-exception'), { waitUntil: 'networkidle' });
		const message = (await getErrorOverlayContent(page)).message;
		expect(message).toMatch('The operation was aborted due to timeout');
	});

	test('properly highlight the line with the error', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/import-not-found'), { waitUntil: 'networkidle' });

		const { codeFrame } = await getErrorOverlayContent(page);
		const codeFrameContent = await codeFrame.innerHTML();
		expect(codeFrameContent).toContain('error-line');
	});
});
