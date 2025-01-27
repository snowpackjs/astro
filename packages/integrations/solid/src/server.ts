import type { NamedSSRLoadedRendererValue } from 'astro';
import {
	NoHydration,
	Suspense,
	createComponent,
	generateHydrationScript,
	renderToString,
	renderToStringAsync,
	ssr,
} from 'solid-js/web';
import { getContext, incrementId } from './context.js';
import type { RendererContext } from './types.js';

const slotName = (str: string) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());

type RenderStrategy = 'sync' | 'async';

async function check(
	this: RendererContext,
	Component: any,
	props: Record<string, any>,
	children: any,
) {
	if (typeof Component !== 'function') return false;
	if (Component.name === 'QwikComponent') return false;
	// Svelte component renders fine by Solid as an empty string. The only way to detect
	// if this isn't a Solid but Svelte component is to unfortunately copy the check
	// implementation of the Svelte renderer.
	if (Component.toString().includes('$$payload')) return false;

	// There is nothing particularly special about Solid components. Basically they are just functions.
	// In general, components from other frameworks (eg, MDX, React, etc.) tend to render as "undefined",
	// so we take advantage of this trick to decide if this is a Solid component or not.

	let html: string | undefined;
	try {
		const result = await renderToStaticMarkup.call(this, Component, props, children, {
			// The purpose of check() is just to validate that this is a Solid component and not
			// React, etc. We should render in sync mode which should skip Suspense boundaries
			// or loading resources like external API calls.
			renderStrategy: 'sync' as RenderStrategy,
		});
		html = result.html;
	} catch {}

	return typeof html === 'string';
}

// AsyncRendererComponentFn
async function renderToStaticMarkup(
	this: RendererContext,
	Component: any,
	props: Record<string, any>,
	{ default: children, ...slotted }: any,
	metadata?: Record<string, any>,
) {
	const ctx = getContext(this.result);
	const renderId = metadata?.hydrate ? incrementId(ctx) : '';
	const needsHydrate = metadata?.astroStaticSlot ? !!metadata.hydrate : true;
	const tagName = needsHydrate ? 'astro-slot' : 'astro-static-slot';

	const renderStrategy = (metadata?.renderStrategy ?? 'async') as RenderStrategy;

	const renderFn = () => {
		const slots: Record<string, any> = {};
		for (const [key, value] of Object.entries(slotted)) {
			const name = slotName(key);
			slots[name] = ssr(`<${tagName} name="${name}">${value}</${tagName}>`);
		}
		// Note: create newProps to avoid mutating `props` before they are serialized
		const newProps = {
			...props,
			...slots,
			// In Solid SSR mode, `ssr` creates the expected structure for `children`.
			children: children != null ? ssr(`<${tagName}>${children}</${tagName}>`) : children,
		};

		if (renderStrategy === 'sync') {
			// Sync Render:
			// <Component />
			// This render mode is not exposed directly to the end user. It is only
			// used in the check() function.
			return createComponent(Component, newProps);
		} else {
			if (needsHydrate) {
				// Hydrate + Async Render:
				// <Suspense>
				//   <Component />
				// </Suspense>
				return createComponent(Suspense, {
					get children() {
						return createComponent(Component, newProps);
					},
				});
			} else {
				// Static + Async Render
				// <NoHydration>
				//   <Suspense>
				//     <Component />
				// 	 </Suspense>
				// </NoHydration>
				return createComponent(NoHydration, {
					get children() {
						return createComponent(Suspense, {
							get children() {
								return createComponent(Component, newProps);
							},
						});
					},
				});
			}
		}
	};

	const componentHtml =
		renderStrategy === 'async'
			? await renderToStringAsync(renderFn, {
					renderId,
					// New setting since Solid 1.8.4 that fixes an errant hydration event appearing in
					// server only components. Not available in TypeScript types yet.
					// https://github.com/solidjs/solid/issues/1931
					// https://github.com/ryansolid/dom-expressions/commit/e09e255ac725fd59195aa0f3918065d4bd974e6b
					...({ noScripts: !needsHydrate } as any),
				})
			: renderToString(renderFn, { renderId });

	return {
		attrs: {
			'data-solid-render-id': renderId,
		},
		html: componentHtml,
	};
}

const renderer: NamedSSRLoadedRendererValue = {
	name: '@astrojs/solid',
	check,
	renderToStaticMarkup,
	supportsAstroStaticSlot: true,
	renderHydrationScript: () => generateHydrationScript(),
};

export default renderer;
