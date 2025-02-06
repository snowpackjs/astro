import { defineCollection, reference, z } from 'astro:content';

const banners = defineCollection({
	type: 'data',
	schema: ({ image }) =>
		z.object({
			alt: z.string(),
			src: image(),
		}),
});

const authors = defineCollection({
	type: 'data',
	schema: z.object({
		name: z.string(),
		twitter: z.string().url(),
	}),
});

const blog = defineCollection({
	schema: z.object({
		title: z.string(),
		banner: reference('banners'),
		author: reference('authors'),
		relatedPosts: z.array(reference('blog')).optional(),
	}),
});

export const collections = { blog, authors, banners };
