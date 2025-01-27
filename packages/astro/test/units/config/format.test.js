import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createFixture, runInContainer } from '../test-utils.js';

describe('Astro config formats', () => {
	it('An mjs config can import TypeScript modules', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': ``,
			'/src/stuff.ts': `export default 'works';`,
			'/astro.config.mjs': `\
					import stuff from './src/stuff.ts';
					export default {}
				`,
		});

		await runInContainer({ inlineConfig: { root: fixture.path } }, () => {
			assert.equal(
				true,
				true,
				'We were able to get into the container which means the config loaded.',
			);
		});
	});
});
