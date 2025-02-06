import { defineCollection, z } from 'astro:content';

const withCustomSlugs = defineCollection({
	schema: z.object({}),
});

const withSchemaConfig = defineCollection({
	schema: z.object({
		title: z.string(),
		isDraft: z.boolean().default(false),
		lang: z.enum(['en', 'fr', 'es']).default('en'),
		publishedAt: z.date().transform((val) => new Date(val)),
	})
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

export const collections = {
	'with-custom-slugs': withCustomSlugs,
	'with-schema-config': withSchemaConfig,
	'with-union-schema': withUnionSchema,
}
