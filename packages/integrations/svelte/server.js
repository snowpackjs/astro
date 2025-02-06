import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';

function check(Component) {
	if (typeof Component !== 'function') return false;
	// Svelte 5 generated components always accept a `$$payload` prop.
	// This assumes that the SSR build does not minify it (which Astro enforces by default).
	// This isn't the best check, but the only other option otherwise is to try to render the
	// component, which is taxing. We'll leave it as a last resort for the future for now.
	return Component.toString().includes('$$payload');
}

function needsHydration(metadata) {
	// Adjust how this is hydrated only when the version of Astro supports `astroStaticSlot`
	return metadata.astroStaticSlot ? !!metadata.hydrate : true;
}

async function renderToStaticMarkup(Component, props, slotted, metadata) {
	const tagName = needsHydration(metadata) ? 'astro-slot' : 'astro-static-slot';

	let children = undefined;
	let $$slots = undefined;
	const renderProps = {};

	for (const [key, value] of Object.entries(slotted)) {
		// Legacy slot support
		$$slots ??= {};
		if (key === 'default') {
			$$slots.default = true;
			children = createRawSnippet(() => ({
				render: () => `<${tagName}>${value}</${tagName}>`,
			}));
		} else {
			$$slots[key] = createRawSnippet(() => ({
				render: () => `<${tagName} name="${key}">${value}</${tagName}>`,
			}));
		}
		// @render support for Svelte ^5.0
		const slotName = key === 'default' ? 'children' : key;
		renderProps[slotName] = createRawSnippet(() => ({
			render: () => `<${tagName}${key !== 'default' ? ` name="${key}"` : ''}>${value}</${tagName}>`,
		}));
	}

	const result = render(Component, {
		props: {
			...props,
			children,
			$$slots,
			...renderProps,
		},
	});
	return { html: result.body };
}

export default {
	name: '@astrojs/svelte',
	check,
	renderToStaticMarkup,
	supportsAstroStaticSlot: true,
};
