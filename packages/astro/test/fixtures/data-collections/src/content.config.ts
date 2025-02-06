import { defineCollection, z } from 'astro:content';

const docs = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
	})
});

const i18n = defineCollection({
	type: 'data',
	schema: z.object({
		homepage: z.object({
			greeting: z.string(),
			preamble: z.string(),
		})
	}),
});

const authors = defineCollection({
	type: 'data'
});

export const collections = { docs, i18n, authors };
