import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { RenderContext } from '../../../dist/core/render-context.js';
import {
	Fragment,
	createComponent,
	maybeRenderHead,
	render,
	renderComponent,
	renderHead,
	renderSlot,
} from '../../../dist/runtime/server/index.js';
import { createBasicPipeline } from '../test-utils.js';

const createAstroModule = (AstroComponent) => ({ default: AstroComponent });

describe('core/render', () => {
	describe('Injected head contents', () => {
		let pipeline;
		before(async () => {
			pipeline = createBasicPipeline();
			pipeline.headElements = () => ({
				links: new Set([
					{ name: 'link', props: { rel: 'stylesheet', href: '/main.css' }, children: '' },
				]),
				scripts: new Set(),
				styles: new Set(),
			});
		});

		it('Multi-level layouts and head injection, with explicit head', async () => {
			const BaseLayout = createComponent((result, _props, slots) => {
				return render`<html>
					<head>
					${renderSlot(result, slots['head'])}
					${renderHead(result)}
					</head>
					${maybeRenderHead(result)}
					<body>
						${renderSlot(result, slots['default'])}
					</body>
				</html>`;
			});

			const PageLayout = createComponent((result, _props, slots) => {
				return render`${renderComponent(
					result,
					'Layout',
					BaseLayout,
					{},
					{
						default: () => render`
							${maybeRenderHead(result)}
							<main>
								${renderSlot(result, slots['default'])}
							</main>
						`,
						head: () => render`
							${renderComponent(
								result,
								'Fragment',
								Fragment,
								{ slot: 'head' },
								{
									default: () => render`${renderSlot(result, slots['head'])}`,
								},
							)}
						`,
					},
				)}
				`;
			});

			const Page = createComponent((result) => {
				return render`${renderComponent(
					result,
					'PageLayout',
					PageLayout,
					{},
					{
						default: () => render`${maybeRenderHead(result)}<div>hello world</div>`,
						head: () => render`
						${renderComponent(
							result,
							'Fragment',
							Fragment,
							{ slot: 'head' },
							{
								default: () => render`<meta charset="utf-8">`,
							},
						)}
					`,
					},
				)}`;
			});

			const PageModule = createAstroModule(Page);
			const request = new Request('http://example.com/');
			const routeData = {
				type: 'page',
				pathname: '/index',
				component: 'src/pages/index.astro',
				params: {},
			};
			const renderContext = await RenderContext.create({ pipeline, request, routeData });
			const response = await renderContext.render(PageModule);

			const html = await response.text();
			const $ = cheerio.load(html);

			assert.equal($('head link').length, 1);
			assert.equal($('body link').length, 0);
		});

		it('Multi-level layouts and head injection, without explicit head', async () => {
			const BaseLayout = createComponent((result, _props, slots) => {
				return render`<html>
					${renderSlot(result, slots['head'])}
					${maybeRenderHead(result)}
					<body>
						${renderSlot(result, slots['default'])}
					</body>
				</html>`;
			});

			const PageLayout = createComponent((result, _props, slots) => {
				return render`${renderComponent(
					result,
					'Layout',
					BaseLayout,
					{},
					{
						default: () => render`
							${maybeRenderHead(result)}
							<main>
								${renderSlot(result, slots['default'])}
							</main>
						`,
						head: () => render`
							${renderComponent(
								result,
								'Fragment',
								Fragment,
								{ slot: 'head' },
								{
									default: () => render`${renderSlot(result, slots['head'])}`,
								},
							)}
						`,
					},
				)}
				`;
			});

			const Page = createComponent((result) => {
				return render`${renderComponent(
					result,
					'PageLayout',
					PageLayout,
					{},
					{
						default: () => render`${maybeRenderHead(result)}<div>hello world</div>`,
						head: () => render`
						${renderComponent(
							result,
							'Fragment',
							Fragment,
							{ slot: 'head' },
							{
								default: () => render`<meta charset="utf-8">`,
							},
						)}
					`,
					},
				)}`;
			});

			const PageModule = createAstroModule(Page);
			const request = new Request('http://example.com/');
			const routeData = {
				type: 'page',
				pathname: '/index',
				component: 'src/pages/index.astro',
				params: {},
			};
			const renderContext = await RenderContext.create({ pipeline, request, routeData });
			const response = await renderContext.render(PageModule);

			const html = await response.text();
			const $ = cheerio.load(html);

			assert.equal($('head link').length, 1);
			assert.equal($('body link').length, 0);
		});

		it('Multi-level layouts and head injection, without any content in layouts', async () => {
			const BaseLayout = createComponent((result, _props, slots) => {
				return render`${renderSlot(result, slots['default'])}`;
			});

			const PageLayout = createComponent((result, _props, slots) => {
				return render`${renderComponent(
					result,
					'Layout',
					BaseLayout,
					{},
					{
						default: () => render`${renderSlot(result, slots['default'])}	`,
					},
				)}
				`;
			});

			const Page = createComponent((result) => {
				return render`${renderComponent(
					result,
					'PageLayout',
					PageLayout,
					{},
					{
						default: () => render`${maybeRenderHead(result)}<div>hello world</div>`,
					},
				)}`;
			});

			const PageModule = createAstroModule(Page);
			const request = new Request('http://example.com/');
			const routeData = {
				type: 'page',
				pathname: '/index',
				component: 'src/pages/index.astro',
				params: {},
			};
			const renderContext = await RenderContext.create({ pipeline, request, routeData });
			const response = await renderContext.render(PageModule);

			const html = await response.text();
			const $ = cheerio.load(html);

			assert.equal($('link').length, 1);
		});
	});
});
