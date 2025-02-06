import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Public', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/astro-public/' });
		await fixture.build();
	});

	it('css and js files do not get bundled', async () => {
		let indexHtml = await fixture.readFile('/index.html');
		assert.equal(indexHtml.includes('<script src="/example.js"></script>'), true);
		assert.equal(indexHtml.includes('<link href="/example.css" rel="stylesheet">'), true);
		assert.equal(indexHtml.includes('<img src="/images/twitter.png">'), true);
	});
});
