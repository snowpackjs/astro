import { expect } from '@playwright/test';
import { prepareTestFactory } from './shared-component-tests.js';

const { test, createTests } = prepareTestFactory(import.meta.url, {
	root: './fixtures/react-component/',
});

const config = {
	counterComponentFilePath: './src/components/Counter.jsx',
	componentFilePath: './src/components/JSXComponent.jsx',
};

test.describe('React components in Astro files', () => {
	createTests({
		...config,
		pageUrl: '/',
		pageSourceFilePath: './src/pages/index.astro',
	});
});

test.describe('React components in MDX files', () => {
	createTests({
		...config,
		pageUrl: '/mdx/',
		pageSourceFilePath: './src/pages/mdx.mdx',
	});
});

test.describe('dev', () => {
	test('Loads .react suffix', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const suffix = page.locator('#suffix');
		expect(await suffix.textContent()).toBe('suffix toggle false');
		await suffix.click();
		expect(await suffix.textContent()).toBe('suffix toggle true');
	});
});

test.describe('React client id generation', () => {
	test('react components generate unique ids', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const components = page.locator('.react-use-id');
		await expect(components).toHaveCount(5);
		const staticId = await components.nth(0).getAttribute('id');
		const hydratedId0 = await components.nth(1).getAttribute('id');
		const hydratedId1 = await components.nth(2).getAttribute('id');
		const clientOnlyId0 = await components.nth(3).getAttribute('id');
		const clientOnlyId1 = await components.nth(4).getAttribute('id');
		expect(staticId).not.toEqual(hydratedId0);
		expect(hydratedId0).not.toEqual(hydratedId1);
		expect(hydratedId1).not.toEqual(clientOnlyId0);
		expect(clientOnlyId0).not.toEqual(clientOnlyId1);
	});
});
