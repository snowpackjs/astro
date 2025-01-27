import { createRenderInstruction } from './instruction.js';

import { clsx } from 'clsx';
import { AstroError, AstroErrorData } from '../../../core/errors/index.js';
import { markHTMLString } from '../escape.js';
import { extractDirectives, generateHydrateScript } from '../hydration.js';
import { serializeProps } from '../serialize.js';
import { shorthash } from '../shorthash.js';
import { isPromise } from '../util.js';
import { type AstroComponentFactory, isAstroComponentFactory } from './astro/factory.js';
import { renderTemplate } from './astro/index.js';
import { createAstroComponentInstance } from './astro/instance.js';

import type {
	AstroComponentMetadata,
	RouteData,
	SSRLoadedRenderer,
	SSRResult,
} from '../../../types/public/internal.js';
import {
	Fragment,
	type RenderDestination,
	type RenderInstance,
	Renderer,
	chunkToString,
} from './common.js';
import { componentIsHTMLElement, renderHTMLElement } from './dom.js';
import { maybeRenderHead } from './head.js';
import { containsServerDirective, renderServerIsland } from './server-islands.js';
import { type ComponentSlots, renderSlotToString, renderSlots } from './slot.js';
import { formatList, internalSpreadAttributes, renderElement, voidElementNames } from './util.js';

const needsHeadRenderingSymbol = Symbol.for('astro.needsHeadRendering');
const rendererAliases = new Map([['solid', 'solid-js']]);
const clientOnlyValues = new Set(['solid-js', 'react', 'preact', 'vue', 'svelte']);

function guessRenderers(componentUrl?: string): string[] {
	const extname = componentUrl?.split('.').pop();
	switch (extname) {
		case 'svelte':
			return ['@astrojs/svelte'];
		case 'vue':
			return ['@astrojs/vue'];
		case 'jsx':
		case 'tsx':
			return ['@astrojs/react', '@astrojs/preact', '@astrojs/solid-js', '@astrojs/vue (jsx)'];
		case undefined:
		default:
			return [
				'@astrojs/react',
				'@astrojs/preact',
				'@astrojs/solid-js',
				'@astrojs/vue',
				'@astrojs/svelte',
			];
	}
}

function isFragmentComponent(Component: unknown) {
	return Component === Fragment;
}

function isHTMLComponent(Component: unknown) {
	return Component && (Component as any)['astro:html'] === true;
}

const ASTRO_SLOT_EXP = /<\/?astro-slot\b[^>]*>/g;
const ASTRO_STATIC_SLOT_EXP = /<\/?astro-static-slot\b[^>]*>/g;

function removeStaticAstroSlot(html: string, supportsAstroStaticSlot = true) {
	const exp = supportsAstroStaticSlot ? ASTRO_STATIC_SLOT_EXP : ASTRO_SLOT_EXP;
	return html.replace(exp, '');
}

async function renderFrameworkComponent(
	result: SSRResult,
	displayName: string,
	Component: unknown,
	_props: Record<string | number, any>,
	slots: any = {},
): Promise<RenderInstance> {
	if (!Component && 'client:only' in _props === false) {
		throw new Error(
			`Unable to render ${displayName} because it is ${Component}!\nDid you forget to import the component or is it possible there is a typo?`,
		);
	}

	const { renderers, clientDirectives } = result;
	const metadata: AstroComponentMetadata = {
		astroStaticSlot: true,
		displayName,
	};

	const { hydration, isPage, props, propsWithoutTransitionAttributes } = extractDirectives(
		_props,
		clientDirectives,
	);
	let html = '';
	let attrs: Record<string, string> | undefined = undefined;

	if (hydration) {
		metadata.hydrate = hydration.directive as AstroComponentMetadata['hydrate'];
		metadata.hydrateArgs = hydration.value;
		metadata.componentExport = hydration.componentExport;
		metadata.componentUrl = hydration.componentUrl;
	}

	const probableRendererNames = guessRenderers(metadata.componentUrl);
	const validRenderers = renderers.filter((r) => r.name !== 'astro:jsx');
	const { children, slotInstructions } = await renderSlots(result, slots);

	// Call the renderers `check` hook to see if any claim this component.
	let renderer: SSRLoadedRenderer | undefined;
	if (metadata.hydrate !== 'only') {
		// If this component ran through `__astro_tag_component__`, we already know
		// which renderer to match to and can skip the usual `check` calls.
		// This will help us throw most relevant error message for modules with runtime errors
		let isTagged = false;
		try {
			isTagged = Component && (Component as any)[Renderer];
		} catch {
			// Accessing `Component[Renderer]` may throw if `Component` is a Proxy that doesn't
			// return the actual read-only value. In this case, ignore.
		}
		if (isTagged) {
			const rendererName = (Component as any)[Renderer];
			renderer = renderers.find(({ name }) => name === rendererName);
		}

		if (!renderer) {
			let error;
			for (const r of renderers) {
				try {
					if (await r.ssr.check.call({ result }, Component, props, children)) {
						renderer = r;
						break;
					}
				} catch (e) {
					error ??= e;
				}
			}

			// If no renderer is found and there is an error, throw that error because
			// it is likely a problem with the component code.
			if (!renderer && error) {
				throw error;
			}
		}

		if (!renderer && typeof HTMLElement === 'function' && componentIsHTMLElement(Component)) {
			const output = await renderHTMLElement(
				result,
				Component as typeof HTMLElement,
				_props,
				slots,
			);
			return {
				render(destination) {
					destination.write(output);
				},
			};
		}
	} else {
		// Attempt: use explicitly passed renderer name
		if (metadata.hydrateArgs) {
			const rendererName = rendererAliases.has(metadata.hydrateArgs)
				? rendererAliases.get(metadata.hydrateArgs)
				: metadata.hydrateArgs;
			if (clientOnlyValues.has(rendererName)) {
				renderer = renderers.find(
					({ name }) => name === `@astrojs/${rendererName}` || name === rendererName,
				);
			}
		}
		// Attempt: user only has a single renderer, default to that
		if (!renderer && validRenderers.length === 1) {
			renderer = validRenderers[0];
		}
		// Attempt: can we guess the renderer from the export extension?
		if (!renderer) {
			const extname = metadata.componentUrl?.split('.').pop();
			renderer = renderers.find(({ name }) => name === `@astrojs/${extname}` || name === extname);
		}
	}

	let componentServerRenderEndTime;
	// If no one claimed the renderer
	if (!renderer) {
		if (metadata.hydrate === 'only') {
			const rendererName = rendererAliases.has(metadata.hydrateArgs)
				? rendererAliases.get(metadata.hydrateArgs)
				: metadata.hydrateArgs;
			if (clientOnlyValues.has(rendererName)) {
				// throw an error if provide correct client:only directive but not find the renderer
				const plural = validRenderers.length > 1;
				throw new AstroError({
					...AstroErrorData.NoMatchingRenderer,
					message: AstroErrorData.NoMatchingRenderer.message(
						metadata.displayName,
						metadata?.componentUrl?.split('.').pop(),
						plural,
						validRenderers.length,
					),
					hint: AstroErrorData.NoMatchingRenderer.hint(
						formatList(probableRendererNames.map((r) => '`' + r + '`')),
					),
				});
			} else {
				// throw an error if an invalid hydration directive was provided
				throw new AstroError({
					...AstroErrorData.NoClientOnlyHint,
					message: AstroErrorData.NoClientOnlyHint.message(metadata.displayName),
					hint: AstroErrorData.NoClientOnlyHint.hint(
						probableRendererNames.map((r) => r.replace('@astrojs/', '')).join('|'),
					),
				});
			}
		} else if (typeof Component !== 'string') {
			const matchingRenderers = validRenderers.filter((r) =>
				probableRendererNames.includes(r.name),
			);
			const plural = validRenderers.length > 1;
			if (matchingRenderers.length === 0) {
				throw new AstroError({
					...AstroErrorData.NoMatchingRenderer,
					message: AstroErrorData.NoMatchingRenderer.message(
						metadata.displayName,
						metadata?.componentUrl?.split('.').pop(),
						plural,
						validRenderers.length,
					),
					hint: AstroErrorData.NoMatchingRenderer.hint(
						formatList(probableRendererNames.map((r) => '`' + r + '`')),
					),
				});
			} else if (matchingRenderers.length === 1) {
				// We already know that renderer.ssr.check() has failed
				// but this will throw a much more descriptive error!
				renderer = matchingRenderers[0];
				({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
					{ result },
					Component,
					propsWithoutTransitionAttributes,
					children,
					metadata,
				));
			} else {
				throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
			}
		}
	} else {
		if (metadata.hydrate === 'only') {
			html = await renderSlotToString(result, slots?.fallback);
		} else {
			const componentRenderStartTime = performance.now();
			({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
				{ result },
				Component,
				propsWithoutTransitionAttributes,
				children,
				metadata,
			));
			if (process.env.NODE_ENV === 'development')
				componentServerRenderEndTime = performance.now() - componentRenderStartTime;
		}
	}

	// This is a custom element without a renderer. Because of that, render it
	// as a string and the user is responsible for adding a script tag for the component definition.
	if (!html && typeof Component === 'string') {
		// Sanitize tag name because some people might try to inject attributes 🙄
		const Tag = sanitizeElementName(Component);
		const childSlots = Object.values(children).join('');

		const renderTemplateResult = renderTemplate`<${Tag}${internalSpreadAttributes(
			props,
		)}${markHTMLString(
			childSlots === '' && voidElementNames.test(Tag) ? `/>` : `>${childSlots}</${Tag}>`,
		)}`;

		html = '';
		const destination: RenderDestination = {
			write(chunk) {
				if (chunk instanceof Response) return;
				html += chunkToString(result, chunk);
			},
		};
		await renderTemplateResult.render(destination);
	}

	if (!hydration) {
		return {
			render(destination) {
				// If no hydration is needed, start rendering the html and return
				if (slotInstructions) {
					for (const instruction of slotInstructions) {
						destination.write(instruction);
					}
				}
				if (isPage || renderer?.name === 'astro:jsx') {
					destination.write(html);
				} else if (html && html.length > 0) {
					destination.write(
						markHTMLString(removeStaticAstroSlot(html, renderer?.ssr?.supportsAstroStaticSlot)),
					);
				}
			},
		};
	}

	// Include componentExport name, componentUrl, and props in hash to dedupe identical islands
	const astroId = shorthash(
		`<!--${metadata.componentExport!.value}:${metadata.componentUrl}-->\n${html}\n${serializeProps(
			props,
			metadata,
		)}`,
	);

	const island = await generateHydrateScript(
		{ renderer: renderer!, result, astroId, props, attrs },
		metadata as Required<AstroComponentMetadata>,
	);

	if (componentServerRenderEndTime && process.env.NODE_ENV === 'development')
		island.props['server-render-time'] = componentServerRenderEndTime;

	// Render template if not all astro fragments are provided.
	let unrenderedSlots: string[] = [];
	if (html) {
		if (Object.keys(children).length > 0) {
			for (const key of Object.keys(children)) {
				let tagName = renderer?.ssr?.supportsAstroStaticSlot
					? !!metadata.hydrate
						? 'astro-slot'
						: 'astro-static-slot'
					: 'astro-slot';
				let expectedHTML = key === 'default' ? `<${tagName}>` : `<${tagName} name="${key}">`;
				if (!html.includes(expectedHTML)) {
					unrenderedSlots.push(key);
				}
			}
		}
	} else {
		unrenderedSlots = Object.keys(children);
	}
	const template =
		unrenderedSlots.length > 0
			? unrenderedSlots
					.map(
						(key) =>
							`<template data-astro-template${key !== 'default' ? `="${key}"` : ''}>${
								children[key]
							}</template>`,
					)
					.join('')
			: '';

	island.children = `${html ?? ''}${template}`;

	if (island.children) {
		island.props['await-children'] = '';
		// Marker to signal that Astro island children is completed while streaming
		island.children += `<!--astro:end-->`;
	}

	return {
		render(destination) {
			// Render the html
			if (slotInstructions) {
				for (const instruction of slotInstructions) {
					destination.write(instruction);
				}
			}
			destination.write(createRenderInstruction({ type: 'directive', hydration }));
			if (hydration.directive !== 'only' && renderer?.ssr.renderHydrationScript) {
				destination.write(
					createRenderInstruction({
						type: 'renderer-hydration-script',
						rendererName: renderer.name,
						render: renderer.ssr.renderHydrationScript,
					}),
				);
			}
			const renderedElement = renderElement('astro-island', island, false);
			destination.write(markHTMLString(renderedElement));
		},
	};
}

function sanitizeElementName(tag: string) {
	const unsafe = /[&<>'"\s]+/;
	if (!unsafe.test(tag)) return tag;
	return tag.trim().split(unsafe)[0].trim();
}

async function renderFragmentComponent(
	result: SSRResult,
	slots: ComponentSlots = {},
): Promise<RenderInstance> {
	const children = await renderSlotToString(result, slots?.default);
	return {
		render(destination) {
			if (children == null) return;
			destination.write(children);
		},
	};
}

async function renderHTMLComponent(
	result: SSRResult,
	Component: unknown,
	_props: Record<string | number, any>,
	slots: any = {},
): Promise<RenderInstance> {
	const { slotInstructions, children } = await renderSlots(result, slots);
	const html = (Component as any)({ slots: children });
	const hydrationHtml = slotInstructions
		? slotInstructions.map((instr) => chunkToString(result, instr)).join('')
		: '';
	return {
		render(destination) {
			destination.write(markHTMLString(hydrationHtml + html));
		},
	};
}

function renderAstroComponent(
	result: SSRResult,
	displayName: string,
	Component: AstroComponentFactory,
	props: Record<string | number, any>,
	slots: any = {},
): RenderInstance {
	if (containsServerDirective(props)) {
		return renderServerIsland(result, displayName, props, slots);
	}

	const instance = createAstroComponentInstance(result, displayName, Component, props, slots);
	return {
		async render(destination) {
			// NOTE: This render call can't be pre-invoked outside of this function as it'll also initialize the slots
			// recursively, which causes each Astro components in the tree to be called bottom-up, and is incorrect.
			// The slots are initialized eagerly for head propagation.
			await instance.render(destination);
		},
	};
}

export async function renderComponent(
	result: SSRResult,
	displayName: string,
	Component: unknown,
	props: Record<string | number, any>,
	slots: ComponentSlots = {},
): Promise<RenderInstance> {
	if (isPromise(Component)) {
		Component = await Component.catch(handleCancellation);
	}

	if (isFragmentComponent(Component)) {
		return await renderFragmentComponent(result, slots).catch(handleCancellation);
	}

	// Ensure directives (`class:list`) are processed
	props = normalizeProps(props);

	// .html components
	if (isHTMLComponent(Component)) {
		return await renderHTMLComponent(result, Component, props, slots).catch(handleCancellation);
	}

	if (isAstroComponentFactory(Component)) {
		return renderAstroComponent(result, displayName, Component, props, slots);
	}

	return await renderFrameworkComponent(result, displayName, Component, props, slots).catch(
		handleCancellation,
	);

	function handleCancellation(e: unknown) {
		if (result.cancelled)
			return {
				render() {},
			};
		throw e;
	}
}

function normalizeProps(props: Record<string, any>): Record<string, any> {
	if (props['class:list'] !== undefined) {
		const value = props['class:list'];
		delete props['class:list'];
		props['class'] = clsx(props['class'], value);
		if (props['class'] === '') {
			delete props['class'];
		}
	}
	return props;
}

export async function renderComponentToString(
	result: SSRResult,
	displayName: string,
	Component: unknown,
	props: Record<string | number, any>,
	slots: any = {},
	isPage = false,
	route?: RouteData,
): Promise<string> {
	let str = '';
	let renderedFirstPageChunk = false;

	// Handle head injection if required. Note that this needs to run early so
	// we can ensure getting a value for `head`.
	let head = '';
	if (isPage && !result.partial && nonAstroPageNeedsHeadInjection(Component)) {
		head += chunkToString(result, maybeRenderHead());
	}

	try {
		const destination: RenderDestination = {
			write(chunk) {
				// Automatic doctype and head insertion for pages
				if (isPage && !result.partial && !renderedFirstPageChunk) {
					renderedFirstPageChunk = true;
					if (!/<!doctype html/i.test(String(chunk))) {
						const doctype = result.compressHTML ? '<!DOCTYPE html>' : '<!DOCTYPE html>\n';
						str += doctype + head;
					}
				}

				// `renderToString` doesn't work with emitting responses, so ignore here
				if (chunk instanceof Response) return;

				str += chunkToString(result, chunk);
			},
		};

		const renderInstance = await renderComponent(result, displayName, Component, props, slots);
		await renderInstance.render(destination);
	} catch (e) {
		// We don't have a lot of information downstream, and upstream we can't catch the error properly
		// So let's add the location here
		if (AstroError.is(e) && !e.loc) {
			e.setLocation({
				file: route?.component,
			});
		}

		throw e;
	}

	return str;
}

export type NonAstroPageComponent = {
	name: string;
	[needsHeadRenderingSymbol]: boolean;
};

function nonAstroPageNeedsHeadInjection(
	pageComponent: any,
): pageComponent is NonAstroPageComponent {
	return !!pageComponent?.[needsHeadRenderingSymbol];
}
