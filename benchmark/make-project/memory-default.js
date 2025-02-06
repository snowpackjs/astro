import fs from 'node:fs/promises';
import { loremIpsum } from './_util.js';

/**
 * @param {URL} projectDir
 */
export async function run(projectDir) {
	await fs.rm(projectDir, { recursive: true, force: true });
	await fs.mkdir(new URL('./src/pages/blog', projectDir), { recursive: true });
	await fs.mkdir(new URL('./src/content/blog', projectDir), { recursive: true });

	const promises = [];

	for (let i = 0; i < 100; i++) {
		const content = `\
---
const i = ${i};
---

<span>{i}</span>
`;
		promises.push(
			fs.writeFile(new URL(`./src/pages/page-${i}.astro`, projectDir), content, 'utf-8'),
		);
	}

	for (let i = 0; i < 100; i++) {
		const content = `\
# Article ${i}

${loremIpsum}
`;
		promises.push(
			fs.writeFile(new URL(`./src/content/blog/article-${i}.md`, projectDir), content, 'utf-8'),
		);
	}

	for (let i = 0; i < 100; i++) {
		const content = `\
# Post ${i}

${loremIpsum}
`;
		promises.push(
			fs.writeFile(new URL(`./src/content/blog/post-${i}.mdx`, projectDir), content, 'utf-8'),
		);
	}

	await fs.writeFile(
		new URL(`./src/pages/blog/[...slug].astro`, projectDir),
		`\
---
import { getCollection } from 'astro:content';
export async function getStaticPaths() {
  const blogEntries = await getCollection('blog');
  return blogEntries.map(entry => ({
    params: { slug: entry.slug }, props: { entry },
  }));
}
const { entry } = Astro.props;
const { Content } = await entry.render();
---
<h1>{entry.data.title}</h1>
<Content />
`,
		'utf-8',
	);

	await Promise.all(promises);

	await fs.writeFile(
		new URL('./astro.config.js', projectDir),
		`\
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
});`,
		'utf-8',
	);
}
