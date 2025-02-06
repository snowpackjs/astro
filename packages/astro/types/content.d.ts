declare module 'astro:content' {
	export { z } from 'astro/zod';

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	export interface DataEntry {
		id: string;
		data: Record<string, unknown>;
		filePath?: string;
		body?: string;
	}

	export interface DataStore {
		get: (key: string) => DataEntry;
		entries: () => Array<[id: string, DataEntry]>;
		set: (key: string, data: Record<string, unknown>, body?: string, filePath?: string) => void;
		values: () => Array<DataEntry>;
		keys: () => Array<string>;
		delete: (key: string) => void;
		clear: () => void;
		has: (key: string) => boolean;
	}

	export interface MetaStore {
		get: (key: string) => string | undefined;
		set: (key: string, value: string) => void;
		delete: (key: string) => void;
		has: (key: string) => boolean;
	}

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	export type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type ContentLayerConfig<S extends BaseSchema, TData extends { id: string } = { id: string }> = {
		type?: 'content_layer';
		schema?: S | ((context: SchemaContext) => S);
		loader:
			| import('astro/loaders').Loader
			| (() =>
					| Array<TData>
					| Promise<Array<TData>>
					| Record<string, Omit<TData, 'id'> & { id?: string }>
					| Promise<Record<string, Omit<TData, 'id'> & { id?: string }>>);
	};

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
		loader?: never;
	};

	export type CollectionConfig<S extends BaseSchema> =
		| ContentCollectionConfig<S>
		| DataCollectionConfig<S>
		| ContentLayerConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>,
	): CollectionConfig<S>;

	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	export const getEntryBySlug: (...args: any[]) => any;
	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	export const getDataEntryById: (...args: any[]) => any;
	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	export const getCollection: (...args: any[]) => any;
	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	export const getEntry: (...args: any[]) => any;
	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	export const getEntries: (...args: any[]) => any;
	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	export const reference: (...args: any[]) => any;
	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	export type CollectionKey = any;
	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	// biome-ignore lint/correctness/noUnusedVariables: stub generic type to match generated type
	export type CollectionEntry<C> = any;
	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	export type ContentCollectionKey = any;
	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	export type DataCollectionKey = any;
	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	export type ContentConfig = any;
	/** Run `astro dev` or `astro sync` to generate high fidelity types */
	export const render: (entry: any) => any;
}
