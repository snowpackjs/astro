import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Sourcemap', async () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/sourcemap/' });
		await fixture.build();
	});

	it('Builds sourcemap', async () => {
		const dir = await fixture.readdir('./_astro');
		const counterMap = dir.find((file) => file.match(/^Counter\.[\w-]+\.js\.map$/));
		assert.ok(counterMap);
	});

	it('Builds non-empty sourcemap', async () => {
		const assets = await fixture.readdir('/_astro');
		const maps = assets.filter((file) => file.endsWith('.map'));
		assert.ok(maps.length > 0, 'got source maps');
		for (const mapName of maps) {
			const filename = `/_astro/${mapName}`;
			const map = await fixture.readFile(filename);
			assert.equal(map.includes('"sources":[]'), false);
		}
	});
});
