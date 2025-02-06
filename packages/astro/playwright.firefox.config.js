import { defineConfig } from '@playwright/test';

// NOTE: Sometimes, tests fail with `TypeError: process.stdout.clearLine is not a function`
// for some reason. This comes from Vite, and is conditionally called based on `isTTY`.
// We set it to false here to skip this odd behavior.
process.stdout.isTTY = false;

export default defineConfig({
	// TODO: add more tests like view transitions and audits, and fix them. Some of them are failing.
	testMatch: ['e2e/css.test.js', 'e2e/prefetch.test.js', 'e2e/view-transitions.test.js'],
	timeout: 40_000,
	expect: {
		timeout: 6_000,
	},
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	projects: [
		{
			name: 'Firefox Stable',
			use: {
				browserName: 'firefox',
				channel: 'firefox',
			},
		},
	],
});
