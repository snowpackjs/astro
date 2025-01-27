import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAstro } from '../../../dist/runtime/server/index.js';

describe('astro global', () => {
	it('Glob should error if passed incorrect value', async () => {
		const Astro = createAstro(undefined);
		assert.throws(
			() => {
				Astro.glob('./**/*.md');
			},
			{
				message: /can only be used in/,
			},
		);
	});

	it('Glob should error if has no results', async () => {
		const Astro = createAstro(undefined);
		assert.throws(
			() => {
				Astro.glob([], () => './**/*.md');
			},
			{
				message: /did not return any matching files/,
			},
		);
	});
});
