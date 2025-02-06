import { expect } from '@playwright/test';
import { testFactory, waitForHydrate } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/actions-blog/' });

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.afterEach(async ({ astro }) => {
	// Force database reset between tests
	await astro.editFile('./db/seed.ts', (original) => original, false);
});

test.describe('Astro Actions - Blog', () => {
	test('Like action', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/'));
		const likeButton = page.getByLabel('Like');
		await waitForHydrate(page, likeButton);
		await new Promise((resolve) => setTimeout(resolve, 500));
		await expect(likeButton, 'like button starts with 10 likes').toContainText('10');
		await likeButton.click();
		await expect(likeButton, 'like button should increment likes').toContainText('11');
	});

	test('Like action - server-side', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/'));

		const likeButton = page.getByLabel('get-request');
		const likeCount = page.getByLabel('Like');
		await expect(likeCount, 'like button starts with 10 likes').toContainText('10');
		await likeButton.click();
		await expect(likeCount, 'like button should increment likes').toContainText('11');
	});

	test('Comment action - validation error', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/'));

		const form = page.getByTestId('client');
		const authorInput = form.locator('input[name="author"]');
		const bodyInput = form.locator('textarea[name="body"]');

		await authorInput.fill('Ben');
		await bodyInput.fill('Too short');

		const submitButton = form.getByRole('button');
		await submitButton.click();

		await expect(form.locator('p[data-error="body"]')).toBeVisible();
	});

	test('Comment action - progressive fallback validation error', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/'));

		const form = page.getByTestId('progressive-fallback');
		const authorInput = form.locator('input[name="author"]');
		const bodyInput = form.locator('textarea[name="body"]');

		await authorInput.fill('Ben');
		await bodyInput.fill('Too short');

		const submitButton = form.getByRole('button');
		await submitButton.click();

		await expect(form.locator('p[data-error="body"]')).toBeVisible();
	});

	test('Comment action - progressive fallback lots of validation errors', async ({
		page,
		astro,
	}) => {
		await page.goto(astro.resolveUrl('/lots-of-fields/'));

		const form = page.getByTestId('lots');
		const submitButton = form.getByRole('button');
		await submitButton.click();

		const expectedText = 'Expected string, received null';

		const fields = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

		for await (const field of fields) {
			await expect(form.locator(`.${field}.error`)).toHaveText(expectedText);
		}
	});

	test('Comment action - progressive fallback success', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/'));

		const form = page.getByTestId('progressive-fallback');
		const authorInput = form.locator('input[name="author"]');
		const bodyInput = form.locator('textarea[name="body"]');

		const body = 'Fallback - This should be long enough.';
		await authorInput.fill('Ben');
		await bodyInput.fill(body);

		const submitButton = form.getByRole('button');
		await submitButton.click();

		const comments = page.getByTestId('server-comments');
		await expect(comments).toBeVisible();
		await expect(comments).toContainText(body);
	});

	test('Comment action - custom error', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/?commentPostIdOverride=bogus'));

		const form = page.getByTestId('client');
		const authorInput = form.locator('input[name="author"]');
		const bodyInput = form.locator('textarea[name="body"]');
		await authorInput.fill('Ben');
		await bodyInput.fill('This should be long enough.');

		const submitButton = form.getByRole('button');
		await submitButton.click();

		const unexpectedError = form.locator('p[data-error="unexpected"]');
		await expect(unexpectedError).toBeVisible();
		await expect(unexpectedError).toContainText('NOT_FOUND: Post not found');
	});

	test('Comment action - success', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/'));

		const form = page.getByTestId('client');
		const authorInput = form.locator('input[name="author"]');
		const bodyInput = form.locator('textarea[name="body"]');

		const body = 'Client: This should be long enough.';
		await authorInput.fill('Ben');
		await bodyInput.fill(body);

		const submitButton = form.getByRole('button');
		await submitButton.click();

		const comments = page.getByTestId('client-comments');
		await expect(comments).toBeVisible();
		await expect(comments).toContainText(body);
	});

	test('Logout action redirects', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/'));

		const logoutButton = page.getByTestId('logout-button');
		await waitForHydrate(page, logoutButton);
		await logoutButton.click();
		await expect(page).toHaveURL(astro.resolveUrl('/blog/'));
	});

	test('Should redirect to the origin pathname when there is a rewrite from an Astro page', async ({
		page,
		astro,
	}) => {
		await page.goto(astro.resolveUrl('/sum'));
		const submitButton = page.getByTestId('submit');
		await submitButton.click();
		await expect(page).toHaveURL(astro.resolveUrl('/sum?_action=sum'));
		const p = page.locator('p').nth(0);
		await expect(p).toContainText('Form result: {"data":3}');
	});
});
