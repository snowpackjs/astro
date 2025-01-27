// Q: Why is this not in @types?
// A: `@types` is for types that are part of the public API. This is just a bunch of utilities we use throughout the codebase. (Mostly by Erika)

// Merge all the intersection of a type into one type. This is useful for making tooltips better in the editor for complex types
// Ex: The Image component props are a merge of all the properties that can be on an `img` tag and our props, in the editor
// this results in a very opaque type that just says `ImgAttributes & ImageComponentProps`. With this, all the props shows.
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

// Mark certain properties of a type as required. Think of it like "This type, with those specific properties required"
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Name is pretty self descriptive, but it removes the index signature of an object
export type OmitIndexSignature<ObjectType> = {
	[KeyType in keyof ObjectType as object extends Record<KeyType, unknown>
		? never
		: KeyType]: ObjectType[KeyType];
};

// This is an alternative `Omit<T, K>` implementation that _doesn't_ remove the index signature of an object.
export type OmitPreservingIndexSignature<T, K extends PropertyKey> = {
	[P in keyof T as Exclude<P, K>]: T[P];
};

// Transform a string into its kebab case equivalent (camelCase -> kebab-case). Useful for CSS-in-JS to CSS.
export type Kebab<T extends string, A extends string = ''> = T extends `${infer F}${infer R}`
	? Kebab<R, `${A}${F extends Lowercase<F> ? '' : '-'}${Lowercase<F>}`>
	: A;

// Transform every key of an object to its kebab case equivalent using the above utility
export type KebabKeys<T> = { [K in keyof T as K extends string ? Kebab<K> : K]: T[K] };

// Similar to `keyof`, gets the type of all the values of an object
export type ValueOf<T> = T[keyof T];

// Gets the type of the values of a Map
export type MapValue<T> = T extends Map<any, infer V> ? V : never;

// Allow the user to create a type where all keys are optional.
// Useful for functions where props are merged.
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
		? DeepPartial<U>[]
		: T[P] extends object | undefined
			? DeepPartial<T[P]>
			: T[P];
};
