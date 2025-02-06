import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	schema: z.object({
		title: z.string(),
	}),
});

const blogMeta = defineCollection({
	type: 'data',
	schema: z.object({
		title: z.string(),
	}),
});

export const collections = {
	blog,
	blogMeta,
};
