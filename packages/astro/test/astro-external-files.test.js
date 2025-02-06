import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('External file references', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/astro-external-files/' });
		await fixture.build();
	});

	it('Build with externeal reference', async () => {
		const html = await fixture.readFile('/index.html');
		assert.equal(html.includes('<script src="/external-file.js"'), true);
	});
});

it.skip('is skipped', () => {});
