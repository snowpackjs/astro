import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

const reptiles = defineCollection({
	loader: glob({
		pattern: '*.mdx',
		base: new URL('../content-outside-src-mdx', import.meta.url),
	}),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			publishedDate: z.coerce.date(),
			tags: z.array(z.string()),
		}),
});

export const collections = { reptiles };
