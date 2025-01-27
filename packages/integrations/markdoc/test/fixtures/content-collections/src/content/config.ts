import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	schema: z.object({
		title: z.string(),
	}).transform(data => ({
		...data,
		schemaWorks: true,
	}))
});

export const collections = { blog };
