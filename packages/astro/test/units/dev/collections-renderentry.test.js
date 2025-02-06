import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cheerio from 'cheerio';

import { attachContentServerListeners } from '../../../dist/content/server-listeners.js';
import { createFixture, createRequestAndResponse, runInContainer } from '../test-utils.js';

const baseFileTree = {
	'astro.config.mjs': `\
import mdx from '@astrojs/mdx';
export default {
	integrations: [mdx()],
	legacy: {
		// Enable legacy content collections as we test layout fields
		collections: true
	}
};
`,
	'/src/content/blog/promo/_launch-week-styles.css': `\
body {
	font-family: 'Comic Sans MS', sans-serif;
}
`,
	'/src/content/blog/promo/launch-week.mdx': `\
---
title: 'Launch week!'
description: 'Join us for the exciting launch of SPACE BLOG'
publishedDate: 'Sat May 21 2022 00:00:00 GMT-0400 (Eastern Daylight Time)'
tags: ['announcement']
---

import './_launch-week-styles.css';

Join us for the space blog launch!

- THIS THURSDAY
- Houston, TX
- Dress code: **interstellar casual** ✨
`,
};

/** @type {typeof runInContainer} */
async function runInContainerWithContentListeners(params, callback) {
	return await runInContainer(params, async (container) => {
		await attachContentServerListeners(container);
		await callback(container);
	});
}

describe('Content Collections - render()', () => {
	it('can be called in a page component', async () => {
		const fixture = await createFixture({
			...baseFileTree,
			'/src/content/config.ts': `
					import { z, defineCollection } from 'astro:content';

					const blog = defineCollection({
						schema: z.object({
							title: z.string(),
							description: z.string().max(60, 'For SEO purposes, keep descriptions short!'),
						}),
					});

					export const collections = { blog };
				`,
			'/src/pages/index.astro': `
					---
					import { getCollection } from 'astro:content';
					const blog = await getCollection('blog');
					const launchWeekEntry = blog.find(post => post.id === 'promo/launch-week.mdx');
					const { Content } = await launchWeekEntry.render();
					---
					<html>
						<head><title>Testing</title></head>
						<body>
							<h1>testing</h1>
							<Content />
						</body>
					</html>
				`,
		});

		await runInContainerWithContentListeners(
			{
				inlineConfig: {
					root: fixture.path,
					vite: { server: { middlewareMode: true } },
				},
			},
			async (container) => {
				const { req, res, done, text } = createRequestAndResponse({
					method: 'GET',
					url: '/',
				});
				container.handle(req, res);
				await done;
				const html = await text();

				const $ = cheerio.load(html);
				// Rendered the content
				assert.equal($('ul li').length, 3);

				// Rendered the styles
				assert.equal($('style').length, 1);
			},
		);
	});

	it('can be used in a layout component', async () => {
		const fixture = await createFixture({
			...baseFileTree,
			'/src/components/Layout.astro': `
					---
					import { getCollection } from 'astro:content';
					const blog = await getCollection('blog');
					const launchWeekEntry = blog.find(post => post.id === 'promo/launch-week.mdx');
					const { Content } = await launchWeekEntry.render();
					---
					<html>
						<head></head>
						<body>
							<slot name="title"></slot>
							<article>
								<Content />
							</article>
						</body>
					</html>

				`,
			'/src/pages/index.astro': `
					---
					import Layout from '../components/Layout.astro';
					---
					<Layout>
						<h1 slot="title">Index page</h2>
					</Layout>
				`,
		});

		await runInContainerWithContentListeners(
			{
				inlineConfig: {
					root: fixture.path,
					vite: { server: { middlewareMode: true } },
				},
			},
			async (container) => {
				const { req, res, done, text } = createRequestAndResponse({
					method: 'GET',
					url: '/',
				});
				container.handle(req, res);
				await done;
				const html = await text();

				const $ = cheerio.load(html);
				// Rendered the content
				assert.equal($('ul li').length, 3);

				// Rendered the styles
				assert.equal($('style').length, 1);
			},
		);
	});

	it('can be used in a slot', async () => {
		const fixture = await createFixture({
			...baseFileTree,
			'/src/content.config.ts': `
					import { z, defineCollection } from 'astro:content';

					const blog = defineCollection({
						schema: z.object({
							title: z.string(),
							description: z.string().max(60, 'For SEO purposes, keep descriptions short!'),
						}),
					});

					export const collections = { blog };
				`,
			'/src/components/Layout.astro': `
					<html>
						<head></head>
						<body>
							<slot name="title"></slot>
							<article>
								<slot name="main"></slot>
							</article>
						</body>
					</html>
				`,
			'/src/pages/index.astro': `
					---
					import Layout from '../components/Layout.astro';
					import { getCollection } from 'astro:content';
					const blog = await getCollection('blog');
					const launchWeekEntry = blog.find(post => post.id === 'promo/launch-week.mdx');
					const { Content } = await launchWeekEntry.render();
					---
					<Layout>
						<h1 slot="title">Index page</h2>
						<Content slot="main" />
					</Layout>
				`,
		});

		await runInContainerWithContentListeners(
			{
				inlineConfig: {
					root: fixture.path,
					vite: { server: { middlewareMode: true } },
				},
			},
			async (container) => {
				const { req, res, done, text } = createRequestAndResponse({
					method: 'GET',
					url: '/',
				});
				container.handle(req, res);
				await done;
				const html = await text();

				const $ = cheerio.load(html);
				// Rendered the content
				assert.equal($('ul li').length, 3);

				// Rendered the styles
				assert.equal($('style').length, 1);
			},
		);
	});

	it('can be called from any js/ts file', async () => {
		const fixture = await createFixture({
			...baseFileTree,
			'/src/content.config.ts': `
					import { z, defineCollection } from 'astro:content';

					const blog = defineCollection({
						schema: z.object({
							title: z.string(),
							description: z.string().max(60, 'For SEO purposes, keep descriptions short!'),
						}),
					});

					export const collections = { blog };
				`,
			'/src/launch-week.ts': `
					import { getCollection } from 'astro:content';

					export let Content;

					const blog = await getCollection('blog');
					const launchWeekEntry = blog.find(post => post.id === 'promo/launch-week.mdx');
					const mod = await launchWeekEntry.render();

					Content = mod.Content;
				`,
			'/src/pages/index.astro': `
					---
					import { Content } from '../launch-week.ts';
					---
					<html>
						<head><title>Testing</title></head>
						<body>
							<h1>Testing</h1>
							<Content />
						</body>
					</html>
				`,
		});

		await runInContainerWithContentListeners(
			{
				inlineConfig: {
					root: fixture.path,
					vite: { server: { middlewareMode: true } },
				},
			},
			async (container) => {
				const { req, res, done, text } = createRequestAndResponse({
					method: 'GET',
					url: '/',
				});
				container.handle(req, res);
				await done;
				const html = await text();

				const $ = cheerio.load(html);
				// Rendered the content
				assert.equal($('ul li').length, 3);

				// Rendered the styles
				assert.equal($('style').length, 1);
			},
		);
	});
});
