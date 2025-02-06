import { toStyleString } from '../../runtime/server/render/util.js';
import type { GetImageResult, ImageLayout, LocalImageProps, RemoteImageProps } from '../types.js';

export function addCSSVarsToStyle(
	vars: Record<string, string | false | undefined>,
	styles?: string | Record<string, any>,
) {
	const cssVars = Object.entries(vars)
		.filter(([_, value]) => value !== undefined && value !== false)
		.map(([key, value]) => `--${key}: ${value};`)
		.join(' ');

	if (!styles) {
		return cssVars;
	}
	const style = typeof styles === 'string' ? styles : toStyleString(styles);

	return `${cssVars} ${style}`;
}

const cssFitValues = ['fill', 'contain', 'cover', 'scale-down'];

export function applyResponsiveAttributes<
	T extends LocalImageProps<unknown> | RemoteImageProps<unknown>,
>({
	layout,
	image,
	props,
	additionalAttributes,
}: {
	layout: Exclude<ImageLayout, 'none'>;
	image: GetImageResult;
	additionalAttributes: Record<string, any>;
	props: T;
}) {
	const attributes = { ...additionalAttributes, ...image.attributes };
	attributes.style = addCSSVarsToStyle(
		{
			w: image.attributes.width ?? props.width ?? image.options.width,
			h: image.attributes.height ?? props.height ?? image.options.height,
			fit: cssFitValues.includes(props.fit ?? '') && props.fit,
			pos: props.position,
		},
		attributes.style,
	);
	attributes['data-astro-image'] = layout;
	return attributes;
}
