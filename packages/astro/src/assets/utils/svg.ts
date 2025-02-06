import { parse, renderSync } from 'ultrahtml';
import type { SvgComponentProps } from '../runtime.js';
import { dropAttributes } from '../runtime.js';
import type { ImageMetadata } from '../types.js';

function parseSvg(contents: string) {
	const root = parse(contents);
	const svgNode = root.children.find(
		({ name, type }: { name: string; type: number }) => type === 1 /* Element */ && name === 'svg',
	);
	if (!svgNode) {
		throw new Error('SVG file does not contain an <svg> element');
	}
	const { attributes, children } = svgNode;
	const body = renderSync({ ...root, children });

	return { attributes, body };
}

export type SvgRenderMode = 'inline' | 'sprite';

export function makeSvgComponent(
	meta: ImageMetadata,
	contents: Buffer | string,
	options?: { mode?: SvgRenderMode },
) {
	const file = typeof contents === 'string' ? contents : contents.toString('utf-8');
	const { attributes, body: children } = parseSvg(file);
	const props: SvgComponentProps = {
		meta,
		attributes: dropAttributes({ mode: options?.mode, ...attributes }),
		children,
	};

	return `import { createSvgComponent } from 'astro/assets/runtime';
export default createSvgComponent(${JSON.stringify(props)})`;
}
