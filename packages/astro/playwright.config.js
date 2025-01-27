import { defineConfig } from '@playwright/test';

// NOTE: Sometimes, tests fail with `TypeError: process.stdout.clearLine is not a function`
// for some reason. This comes from Vite, and is conditionally called based on `isTTY`.
// We set it to false here to skip this odd behavior.
process.stdout.isTTY = false;

export default defineConfig({
	testMatch: 'e2e/*.test.js',
	timeout: 40_000,
	expect: {
		timeout: 6_000,
	},
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	projects: [
		{
			name: 'Chrome Stable',
			use: {
				browserName: 'chromium',
				channel: 'chrome',
			},
		},
	],
});
