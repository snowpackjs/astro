import './astro-jsx';
import type { OmitIndexSignature, Simplify } from './dist/type-utils.js';
import type { AstroBuiltinAttributes } from './dist/types/public/elements.js';

/** Any supported HTML or SVG element name, as defined by the HTML specification */
export type HTMLTag = keyof astroHTML.JSX.DefinedIntrinsicElements;

/** The built-in attributes for any known HTML or SVG element name */
export type HTMLAttributes<Tag extends HTMLTag> = Omit<
	astroHTML.JSX.DefinedIntrinsicElements[Tag],
	keyof Omit<AstroBuiltinAttributes, 'class:list'>
>;

/**
 * All the CSS properties available, as defined by the CSS specification
 */
export type CSSProperty = keyof astroHTML.JSX.KebabCSSDOMProperties;

type PolymorphicAttributes<P extends { as: HTMLTag }> = Omit<P, 'as'> & {
	as?: P['as'];
} & Omit<
		// This is the same as HTMLAttributes<P['as']>, except we're using OmitIndexSignature to remove the index signature,
		// used for data attribute, because it seems like it get too complex for TypeScript with it, not sure why.
		OmitIndexSignature<astroHTML.JSX.DefinedIntrinsicElements[P['as']]>,
		keyof Omit<AstroBuiltinAttributes, 'class:list'>
	>;

export type Polymorphic<P extends { as: HTMLTag }> = PolymorphicAttributes<
	Omit<P, 'as'> & { as: NonNullable<P['as']> }
>;

export type ComponentProps<T extends (args: any) => any> = Simplify<Parameters<T>[0]>;
