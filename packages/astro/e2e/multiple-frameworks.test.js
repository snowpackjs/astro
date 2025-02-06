import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/multiple-frameworks/' });

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.skip('Multiple frameworks', () => {
	test.skip('React counter', async ({ page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#react-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		const increment = counter.locator('.increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Preact counter', async ({ page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#preact-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		const increment = counter.locator('.increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test.skip('Solid counter', async ({ page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#solid-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		const increment = counter.locator('.increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Vue counter', async ({ page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#vue-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		const increment = counter.locator('.increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Svelte counter', async ({ page }) => {
		await page.goto(astro.resolveUrl('/'));

		const counter = page.locator('#svelte-counter');
		await expect(counter, 'component is visible').toBeVisible();

		const count = counter.locator('pre');
		await expect(count, 'initial count is 0').toHaveText('0');

		const increment = counter.locator('.increment');
		await increment.click();

		await expect(count, 'count incremented by 1').toHaveText('1');
	});

	test('Astro components', async ({ page }) => {
		await page.goto(astro.resolveUrl('/'));

		const aComponent = page.locator('#astro-a');
		await expect(aComponent, 'component is visible').toBeVisible();
		await expect(aComponent, 'component text is visible').toHaveText('Hello Astro (A)');

		const bComponent = page.locator('#astro-b');
		await expect(bComponent, 'component is visible').toBeVisible();
		await expect(bComponent, 'component text is visible').toHaveText('Hello Astro (B)');
	});

	test.describe('HMR', () => {
		test('Page template', async ({ astro, page }) => {
			await page.goto(astro.resolveUrl('/'));

			const slot = page.locator('#preact-counter + .counter-message');
			await expect(slot, 'initial slot content').toHaveText('Hello Preact!');

			await astro.editFile('./src/pages/index.astro', (content) =>
				content.replace('Hello Preact!', 'Hello Preact, updated!'),
			);

			await expect(slot, 'slot content updated').toHaveText('Hello Preact, updated!');
		});

		test('React component', async ({ astro, page }) => {
			await page.goto(astro.resolveUrl('/'));

			const count = page.locator('#react-counter pre');
			await expect(count, 'initial count updated to 0').toHaveText('0');

			await astro.editFile('./src/components/ReactCounter.jsx', (content) =>
				content.replace('useState(0)', 'useState(5)'),
			);

			await expect(count, 'initial count updated to 5').toHaveText('5');
		});

		test('Preact component', async ({ astro, page }) => {
			await page.goto(astro.resolveUrl('/'));

			const count = page.locator('#preact-counter pre');
			await expect(count, 'initial count updated to 0').toHaveText('0');

			await astro.editFile('./src/components/PreactCounter.tsx', (content) =>
				content.replace('useState(0)', 'useState(5)'),
			);

			await expect(count, 'initial count updated to 5').toHaveText('5');
		});

		test('Solid component', async ({ astro, page }) => {
			await page.goto(astro.resolveUrl('/'));

			const count = page.locator('#solid-counter pre');
			await expect(count, 'initial count updated to 0').toHaveText('0');

			await astro.editFile('./src/components/SolidCounter.tsx', (content) =>
				content.replace('createSignal(0)', 'createSignal(5)'),
			);

			await expect(count, 'initial count updated to 5').toHaveText('5');
		});

		test('Vue component', async ({ astro, page }) => {
			await page.goto(astro.resolveUrl('/'));

			const count = page.locator('#vue-counter pre');
			await expect(count, 'initial count updated to 0').toHaveText('0');

			await astro.editFile('./src/components/VueCounter.vue', (content) =>
				content.replace('ref(0)', 'ref(5)'),
			);

			await expect(count, 'initial count updated to 5').toHaveText('5');
		});

		test('Svelte component', async ({ astro, page }) => {
			await page.goto(astro.resolveUrl('/'));

			const count = page.locator('#svelte-counter pre');
			await expect(count, 'initial count is 0').toHaveText('0');

			await astro.editFile('./src/components/SvelteCounter.svelte', (content) =>
				content.replace('let count = 0;', 'let count = 5;'),
			);

			await expect(count, 'initial count updated to 5').toHaveText('5');
		});
	});
});
