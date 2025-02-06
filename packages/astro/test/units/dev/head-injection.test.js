import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { createFixture, createRequestAndResponse, runInContainer } from '../test-utils.js';

const root = new URL('../../fixtures/alias/', import.meta.url);

describe('head injection', () => {
	it('Dynamic injection from component created in the page frontmatter', async () => {
		const fixture = await createFixture(
			{
				'/src/components/Other.astro': `
					<style>
						div {
							background: grey;
						}
					</style>
					<div id="other">Other</div>
				`,
				'/src/common/head.js': `
					// astro-head-inject
					import Other from '../components/Other.astro';
					import {
						createComponent,
						createHeadAndContent,
						renderComponent,
						renderTemplate,
						renderUniqueStylesheet,
						unescapeHTML
					} from 'astro/runtime/server/index.js';

					export function renderEntry() {
						return createComponent({
							factory(result, props, slots) {
								return createHeadAndContent(
									unescapeHTML(renderUniqueStylesheet(result, {
										type: 'external',
										src: '/some/fake/styles.css'
									})),
									renderTemplate\`$\{renderComponent(result, 'Other', Other, props, slots)}\`
								);
							},
							propagation: 'self'
						});
					}
				`.trim(),
				'/src/pages/index.astro': `
					---
					import { renderEntry } from '../common/head.js';
					const Head = renderEntry();
					---
					<html>
						<head><title>Testing</title></head>
						<body>
							<h1>testing</h1>
							<Head />
						</body>
					</html>
				`,
			},
			root,
		);

		await runInContainer(
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

				assert.equal($('link[rel=stylesheet][href="/some/fake/styles.css"]').length, 1);
				assert.equal($('#other').length, 1);
			},
		);
	});

	it('Dynamic injection from a layout component', async () => {
		const fixture = await createFixture(
			{
				'/src/components/Other.astro': `
					<style>
						div {
							background: grey;
						}
					</style>
					<div id="other">Other</div>
				`,
				'/src/common/head.js': `
					// astro-head-inject
					import Other from '../components/Other.astro';
					import {
						createComponent,
						createHeadAndContent,
						renderComponent,
						renderTemplate,
						renderUniqueStylesheet,
						unescapeHTML,
					} from 'astro/runtime/server/index.js';

					export function renderEntry() {
						return createComponent({
							factory(result, props, slots) {
								return createHeadAndContent(
									unescapeHTML(renderUniqueStylesheet(result, {
										type: 'external',
										src: '/some/fake/styles.css'
									})),
									renderTemplate\`$\{renderComponent(result, 'Other', Other, props, slots)}\`
								);
							},
							propagation: 'self'
						});
					}
				`.trim(),
				'/src/components/Content.astro': `
				---
				import { renderEntry } from '../common/head.js';
				const ExtraHead = renderEntry();
				---
				<ExtraHead />
				`,
				'/src/components/Inner.astro': `
				---
				import Content from './Content.astro';
				---
				<Content />
				`,
				'/src/components/Layout.astro': `
					<html>
						<head>
							<title>Normal head stuff</title>
						</head>
						<body>
							<slot name="title" />
							<slot name="inner" />
						</body>
					</html>
				`,
				'/src/pages/index.astro': `
					---
					import Layout from '../components/Layout.astro';
					import Inner from '../components/Inner.astro';
					---
					<Layout>
						<h1 slot="title">Test page</h1>
						<Inner slot="inner" />
					</Layout>
				`,
			},
			root,
		);

		await runInContainer(
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

				assert.equal(
					$('link[rel=stylesheet][href="/some/fake/styles.css"]').length,
					1,
					'found inner link',
				);
				assert.equal($('#other').length, 1, 'Found the #other div');
			},
		);
	});
});
