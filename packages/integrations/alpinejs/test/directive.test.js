import { expect } from '@playwright/test';
import { prepareTestFactory } from './test-utils.js';

const { test } = prepareTestFactory({ root: './fixtures/basics/' });

test.describe('Basics', () => {
	test('Alpine is working', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const el = page.locator('#foo');
		expect(await el.textContent()).toBe('bar');
	});
});
