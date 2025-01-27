import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({
		pattern: '*.mdoc',
		base: 'content/blog',
	}),
});

export const collections = { blog };
