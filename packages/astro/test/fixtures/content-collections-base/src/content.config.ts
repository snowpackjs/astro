import { defineCollection, z } from 'astro:content';


const docs = defineCollection({
	schema: z.object({
		title: z.string(),
	}),
});

export const collections = {
	docs,
}
