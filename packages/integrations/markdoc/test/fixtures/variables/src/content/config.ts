import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	schema: z.object({
		title: z.string().transform(v => 'Processed by schema: ' + v),
	}),
});

export const collections = { blog }
