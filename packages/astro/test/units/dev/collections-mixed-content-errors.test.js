import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import _sync from '../../../dist/core/sync/index.js';
import { createFixture } from '../test-utils.js';

async function sync(root) {
	try {
		await _sync({
			root,
			logLevel: 'silent',
		});
		return 0;
	} catch {
		return 1;
	}
}

const baseFileTree = {
	'/astro.config.mjs': `export default { legacy: { collections: true }}`,
	'/src/content/authors/placeholder.json': `{ "name": "Placeholder" }`,
	'/src/content/blog/placeholder.md': `\
---
title: Placeholder post
---
`,
	'/src/pages/authors.astro': `\
---
import { getCollection } from 'astro:content';
try {
	await getCollection('authors')
} catch (e) {
	return e
}
---

<h1>Worked</h1>
`,
	'/src/pages/blog.astro': `\
---
import { getCollection } from 'astro:content';

await getCollection('blog')
---

<h1>Worked</h1>`,
};

describe('Content Collections - mixed content errors', () => {
	it('raises "mixed content" error when content in data collection', async () => {
		const fixture = await createFixture({
			...baseFileTree,
			'/src/content/authors/ben.md': `\
---
name: Ben
---

# Ben
`,
			'/src/content/authors/tony.json': `{ "name": "Tony" }`,
			'/src/content.config.ts': `\
import { z, defineCollection } from 'astro:content';

const authors = defineCollection({
	type: 'data',
	schema: z.object({
		name: z.string(),
	}),
});

export const collections = { authors };
`,
		});

		assert.equal(await sync(fixture.path), 1);
	});

	it('raises "mixed content" error when data in content collection', async () => {
		const fixture = await createFixture({
			...baseFileTree,
			'/src/content/blog/post.md': `\
---
title: Post
---

# Post
`,
			'/src/content/blog/post.yaml': `title: YAML Post`,
			'/src/content.config.ts': `\
import { z, defineCollection } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
	}),
});

export const collections = { blog };
`,
		});

		assert.equal(await sync(fixture.path), 1);
	});

	it('raises error when data collection configured as content collection', async () => {
		const fixture = await createFixture({
			...baseFileTree,
			'/src/content/banners/welcome.json': `{ "src": "/example", "alt": "Welcome" }`,
			'/src/content/config.ts': `\
import { z, defineCollection } from 'astro:content';

const banners = defineCollection({
	schema: z.object({
		src: z.string(),
		alt: z.string(),
	}),
});

export const collections = { banners };
`,
		});

		assert.equal(await sync(fixture.path), 1);
	});

	it('does not raise error for empty collection with config', async () => {
		const fixture = await createFixture({
			...baseFileTree,
			// Add placeholder to ensure directory exists
			'/src/content/i18n/_placeholder.txt': 'Need content here',
			'/src/content.config.ts': `\
import { z, defineCollection } from 'astro:content';

const i18n = defineCollection({
	type: 'data',
	schema: z.object({
		greeting: z.string(),
	}),
});

export const collections = { i18n };
`,
		});

		assert.equal(await sync(fixture.path), 0);
	});
});
