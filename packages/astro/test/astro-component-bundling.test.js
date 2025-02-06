import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Component bundling', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/astro-component-bundling/' });
		await fixture.build();
	});

	it('should treeshake FooComponent', async () => {
		const astroChunkDir = await fixture.readdir('/_astro');
		const manyComponentsChunkName = astroChunkDir.find((chunk) =>
			chunk.startsWith('ManyComponents'),
		);
		const manyComponentsChunkContent = await fixture.readFile(`/_astro/${manyComponentsChunkName}`);
		assert.equal(manyComponentsChunkContent.includes('FooComponent'), false);
	});
});
