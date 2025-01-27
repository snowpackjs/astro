import { defineCollection, z } from 'astro:content';

const withData = defineCollection({
	type: 'data',
	schema: z.object({
		title: z.string(),
	}),
});

const withCustomSlugs = defineCollection({
	// Ensure schema passes even when `slug` is present
	schema: z.object({}).strict(),
});

const withSchemaConfig = defineCollection({
	schema: z.object({
		title: z.string(),
		isDraft: z.boolean().default(false),
		lang: z.enum(['en', 'fr', 'es']).default('en'),
		publishedAt: z.date().transform((val) => new Date(val)),
	}),
});

const withUnionSchema = defineCollection({
	schema: z.discriminatedUnion('type', [
		z.object({
			type: z.literal('post'),
			title: z.string(),
			description: z.string(),
		}),
		z.object({
			type: z.literal('newsletter'),
			subject: z.string(),
		}),
	]),
});

const withSymlinkedData = defineCollection({
	type: 'data',
	schema: ({ image }) =>
		z.object({
			alt: z.string(),
			src: image(),
		}),
});

const withSymlinkedContent = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		date: z.date(),
	}),
});

export const collections = {
	'with-data': withData,
	'with-custom-slugs': withCustomSlugs,
	'with-schema-config': withSchemaConfig,
	'with-union-schema': withUnionSchema,
	'with-symlinked-data': withSymlinkedData,
	'with-symlinked-content': withSymlinkedContent,
};
