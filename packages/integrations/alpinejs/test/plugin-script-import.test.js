import { expect } from '@playwright/test';
import { prepareTestFactory } from './test-utils.js';

const { test } = prepareTestFactory({ root: './fixtures/plugin-script-import/' });

test.describe('Plugin Script Import', () => {
	test('Extending Alpine using a script import should work', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/'));

		const el = page.locator('#foo');
		expect(await el.getAttribute('hidden')).toBe('');
	});
});
