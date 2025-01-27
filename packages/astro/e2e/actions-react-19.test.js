import { expect } from '@playwright/test';
import { testFactory, waitForHydrate } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/actions-react-19/' });

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterEach(async ({ astro }) => {
	// Force database reset between tests
	await astro.editFile('./db/seed.ts', (original) => original, false);
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Astro Actions - React 19', () => {
	test('Like action - client pending state', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/'));
		const likeButton = page.getByLabel('likes-client');
		await waitForHydrate(page, likeButton);
		await new Promise((resolve) => setTimeout(resolve, 500));

		await expect(likeButton).toBeVisible();
		await likeButton.click();
		await expect(likeButton, 'like button should be disabled when pending').toBeDisabled();
		await expect(likeButton).not.toBeDisabled();
	});

	test('Like action - server progressive enhancement', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/'));

		const likeButton = page.getByLabel('likes-server');
		await expect(likeButton, 'like button starts with 10 likes').toContainText('10');
		await likeButton.click();

		await expect(likeButton, 'like button increments').toContainText('11');
	});

	test('Like action - client useActionState', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/'));

		const likeButton = page.getByLabel('likes-action-client');
		await waitForHydrate(page, likeButton);

		await expect(likeButton).toBeVisible();
		await likeButton.click();

		await expect(likeButton, 'like button increments').toContainText('11');
	});

	test('Like action - server useActionState progressive enhancement', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/blog/first-post/'));

		const likeButton = page.getByLabel('likes-action-server');
		await expect(likeButton, 'like button starts with 10 likes').toContainText('10');
		await likeButton.click();

		await expect(likeButton, 'like button increments').toContainText('11');
	});
});
