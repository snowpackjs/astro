import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'collection',
	schema: z.object({
		title: z.string()
	})
});

export const collections = { blog };
