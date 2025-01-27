import { expect } from '@playwright/test';
import { prepareTestFactory } from './shared-component-tests.js';
const { test, createTests } = prepareTestFactory(import.meta.url, {
	root: './fixtures/vue-component/',
});

const config = {
	componentFilePath: './src/components/VueComponent.vue',
	counterCssFilePath: './src/components/Counter.vue',
	counterComponentFilePath: './src/components/Counter.vue',
};

test.describe('Vue components in Astro files', () => {
	createTests({
		...config,
		pageUrl: '/',
		pageSourceFilePath: './src/pages/index.astro',
	});
});

test.describe('Vue components in MDX files', () => {
	createTests({
		...config,
		pageUrl: '/mdx/',
		pageSourceFilePath: './src/pages/mdx.mdx',
	});
});

test('test the async vue component in astro', async ({ page, astro }) => {
	await page.goto(astro.resolveUrl('/'));

	const label = page.locator('#client-test');

	await expect(label, 'component not hydrated').toHaveText('2');
});

test('test the async vue component in mdx', async ({ page, astro }) => {
	await page.goto(astro.resolveUrl('/mdx/'));

	const label = page.locator('#client-test');

	await expect(label, 'component not hydrated').toHaveText('2');
});

test('hmr works', async ({ page, astro }) => {
	await page.goto(astro.resolveUrl('/'));

	const span = page.locator('#state');
	await expect(span).toHaveText('Count is 1');

	await astro.editFile('./src/components/State.vue', (content) =>
		content.replace('ref(1)', 'ref(2)'),
	);

	await expect(span).toHaveText('Count is 2');
});
