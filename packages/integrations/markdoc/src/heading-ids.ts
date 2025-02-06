import Markdoc, {
	type Config as MarkdocConfig,
	type RenderableTreeNode,
	type Schema,
} from '@markdoc/markdoc';
import Slugger from 'github-slugger';
import { getTextContent } from './runtime.js';
import { MarkdocError } from './utils.js';

function getSlug(
	attributes: Record<string, any>,
	children: RenderableTreeNode[],
	headingSlugger: Slugger,
): string {
	if (attributes.id && typeof attributes.id === 'string') {
		return attributes.id;
	}
	const textContent = attributes.content ?? getTextContent(children);
	let slug = headingSlugger.slug(textContent);

	if (slug.endsWith('-')) slug = slug.slice(0, -1);
	return slug;
}

type HeadingIdConfig = MarkdocConfig & {
	ctx: { headingSlugger: Slugger };
};

/*
	Expose standalone node for users to import in their config.
	Allows users to apply a custom `render: AstroComponent`
	and spread our default heading attributes.
*/
export const heading: Schema = {
	children: ['inline'],
	attributes: {
		id: { type: String },
		level: { type: Number, required: true, default: 1 },
	},
	transform(node, config: HeadingIdConfig) {
		const { level, ...attributes } = node.transformAttributes(config);
		const children = node.transformChildren(config);

		if (!config.ctx?.headingSlugger) {
			throw new MarkdocError({
				message:
					'Unexpected problem adding heading IDs to Markdoc file. Did you modify the `ctx.headingSlugger` property in your Markdoc config?',
			});
		}
		const slug = getSlug(attributes, children, config.ctx.headingSlugger);

		const render = config.nodes?.heading?.render ?? `h${level}`;

		const tagProps =
			// For components, pass down `level` as a prop,
			// alongside `__collectHeading` for our `headings` collector.
			// Avoid accidentally rendering `level` as an HTML attribute otherwise!
			typeof render === 'string'
				? { ...attributes, id: slug }
				: { ...attributes, id: slug, __collectHeading: true, level };

		return new Markdoc.Tag(render, tagProps, children);
	},
};

// Called internally to ensure `ctx` is generated per-file, instead of per-build.
export function setupHeadingConfig(): HeadingIdConfig {
	const headingSlugger = new Slugger();
	return {
		ctx: {
			headingSlugger,
		},
		nodes: {
			heading,
		},
	};
}
