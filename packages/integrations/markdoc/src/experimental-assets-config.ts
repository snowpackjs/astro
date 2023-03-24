import type { Config as MarkdocConfig } from '@markdoc/markdoc';
import Markdoc from '@markdoc/markdoc';
import { Image } from 'astro:assets';

// Separate module to avoid importing `astro:assets` when
// `experimental.assets` flag is not set in a project.
// TODO: merge with `./default-config.ts` when `experimental.assets` is baselined.
export const experimentalAssetsConfig: MarkdocConfig = {
	nodes: {
		image: {
			attributes: {
				...Markdoc.nodes.image.attributes,
				__optimizedSrc: { type: 'Object' },
			},
			transform(node, config) {
				const attributes = node.transformAttributes(config);
				const children = node.transformChildren(config);

				if (node.type === 'image' && '__optimizedSrc' in node.attributes) {
					const { __optimizedSrc, ...rest } = node.attributes;
					return new Markdoc.Tag(Image, { ...rest, src: __optimizedSrc }, children);
				} else {
					return new Markdoc.Tag('img', attributes, children);
				}
			},
		},
	},
};
