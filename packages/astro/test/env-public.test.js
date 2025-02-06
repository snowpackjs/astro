import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { ServerOnlyModule } from '../dist/core/errors/errors-data.js';
import { AstroError } from '../dist/core/errors/errors.js';
import { loadFixture } from './test-utils.js';

describe('astro:env public variables', () => {
	/** @type {Awaited<ReturnType<typeof loadFixture>>} */
	let fixture;

	describe('Client variables', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-env/',
			});
			await fixture.build();
		});

		it('builds without throwing', async () => {
			assert.equal(true, true);
		});

		it('includes client/public env in build', async () => {
			const indexHtml = await fixture.readFile('/index.html');

			assert.equal(indexHtml.includes('ABC'), true);
			assert.equal(indexHtml.includes('DEF'), true);
		});

		it('does not include server/public env in build', async () => {
			const indexHtml = await fixture.readFile('/index.html');

			assert.equal(indexHtml.includes('GHI'), false);
		});
	});

	describe('Server variables', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-env-server-fail/',
			});
		});

		it('throws if server module is called on the client', async () => {
			const error = await fixture.build().catch((err) => err);
			assert.equal(error instanceof AstroError, true);
			assert.equal(error.name, ServerOnlyModule.name);
		});
	});
});
