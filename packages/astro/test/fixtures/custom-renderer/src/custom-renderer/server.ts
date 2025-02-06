import type { NamedSSRLoadedRendererValue, SSRResult } from 'astro';

type RendererContext = {
	result: SSRResult;
};

async function check(
	this: RendererContext,
	Component: any,
	//props: Record<string, any>,
	//children: any,
) {

	if (typeof Component !== 'function') return false;

	// in a real-world scenario, this would be a more complex function 
	// that checks if the component should be rendered
	return true;
}

async function renderToStaticMarkup(
	this: RendererContext,
	Component: any,
	props: Record<string, any>,
	//{ default: children, ...slotted }: Record<string, any>,
	//metadata: AstroComponentMetadata | undefined,
) {		
	// in a real-world scenario, this would be a more complex function
	// actually rendering the components return value (which might be an AST/VDOM)
	// and render it as an HTML string
	const vdom = Component(props);
	return { attrs: {}, html: `<${vdom.tag}>${vdom.text} (rendered by server.ts)</${vdom.tag}>` };
}

const renderer: NamedSSRLoadedRendererValue = {
	name: 'custom-renderer',
	check,
	renderToStaticMarkup,
	supportsAstroStaticSlot: false,
};

export default renderer;