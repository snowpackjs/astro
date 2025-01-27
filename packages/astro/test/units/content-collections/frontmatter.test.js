import { describe, it } from 'node:test';
import { attachContentServerListeners } from '../../../dist/content/index.js';
import { createFixture, runInContainer } from '../test-utils.js';

describe('frontmatter', () => {
	it('errors in content/ does not crash server', async () => {
		const fixture = await createFixture({
			'/src/content/posts/blog.md': `\
					---
					title: One
					---
				`,
			'/src/content.config.ts': `\
					import { defineCollection, z } from 'astro:content';

					const posts = defineCollection({
						schema: z.string()
					});

					export const collections = {
						posts
					};
				`,
			'/src/pages/index.astro': `\
					---
					---
					<html>
						<head><title>Test</title></head>
						<body class="one">
							<h1>Test</h1>
						</body>
					</html>
				`,
		});

		await runInContainer({ inlineConfig: { root: fixture.path } }, async (container) => {
			await attachContentServerListeners(container);

			await fixture.writeFile(
				'/src/content/posts/blog.md',
				`
				---
				title: One
				title: two
				---
				`,
			);
			await new Promise((resolve) => setTimeout(resolve, 100));
			// Note, if we got here, it didn't crash
		});
	});
});
