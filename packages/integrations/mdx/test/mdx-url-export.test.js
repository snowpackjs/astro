import mdx from '@astrojs/mdx';

import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from '../../../astro/test/test-utils.js';

describe('MDX url export', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/mdx-url-export/', import.meta.url),
			integrations: [mdx()],
		});

		await fixture.build();
	});

	it('generates correct urls in glob result', async () => {
		const { urls } = JSON.parse(await fixture.readFile('/pages.json'));
		assert.equal(urls.includes('/test-1'), true);
		assert.equal(urls.includes('/test-2'), true);
	});

	it('respects "export url" overrides in glob result', async () => {
		const { urls } = JSON.parse(await fixture.readFile('/pages.json'));
		assert.equal(urls.includes('/AH!'), true);
	});
});
