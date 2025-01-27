import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	schema: z.object({
		title: z.string(),
		description: z.string().max(60, 'For SEO purposes, keep descriptions short!'),
	}),
});

export const collections = { blog };
