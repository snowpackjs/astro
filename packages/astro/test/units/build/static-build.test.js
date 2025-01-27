import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { makeAstroPageEntryPointFileName } from '../../../dist/core/build/static-build.js';

describe('astro/src/core/build', () => {
	describe('makeAstroPageEntryPointFileName', () => {
		const routes = [
			{
				route: '/',
				component: 'src/pages/index.astro',
				pathname: '/',
			},
			{
				route: '/injected',
				component: '../node_modules/my-dep/injected.astro',
				pathname: '/injected',
			},
			{
				route: '/injected-workspace',
				component: '../../packages/demo/[...all].astro',
				pathname: undefined,
			},
			{
				route: '/blog/[year]/[...slug]',
				component: 'src/pages/blog/[year]/[...slug].astro',
				pathname: undefined,
			},
		];

		it('handles local pages', async () => {
			const input = '@astro-page:src/pages/index@_@astro';
			const output = 'pages/index.astro.mjs';
			const result = makeAstroPageEntryPointFileName('@astro-page:', input, routes);
			assert.equal(result, output);
		});

		it('handles dynamic pages', async () => {
			const input = '@astro-page:src/pages/blog/[year]/[...slug]@_@astro';
			const output = 'pages/blog/_year_/_---slug_.astro.mjs';
			const result = makeAstroPageEntryPointFileName('@astro-page:', input, routes);
			assert.equal(result, output);
		});

		it('handles node_modules pages', async () => {
			const input = '@astro-page:../node_modules/my-dep/injected@_@astro';
			const output = 'pages/injected.astro.mjs';
			const result = makeAstroPageEntryPointFileName('@astro-page:', input, routes);
			assert.equal(result, output);
		});

		// Fix #7561
		it('handles local workspace pages', async () => {
			const input = '@astro-page:../../packages/demo/[...all]@_@astro';
			const output = 'pages/injected-workspace.astro.mjs';
			const result = makeAstroPageEntryPointFileName('@astro-page:', input, routes);
			assert.equal(result, output);
		});
	});
});
