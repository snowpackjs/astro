import mdx from '@astrojs/mdx';

import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

const FIXTURE_ROOT = new URL('./fixtures/mdx-escape/', import.meta.url);

describe('MDX frontmatter', () => {
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: FIXTURE_ROOT,
			integrations: [mdx()],
		});
		await fixture.build();
	});

	it('does not have unescaped HTML at top-level', async () => {
		const html = await fixture.readFile('/index.html');
		const { document } = parseHTML(html);

		assert.equal(document.body.textContent.includes('<em'), false);
	});

	it('does not have unescaped HTML inside html tags', async () => {
		const html = await fixture.readFile('/html-tag/index.html');
		const { document } = parseHTML(html);

		assert.equal(document.body.textContent.includes('<em'), false);
	});
});
