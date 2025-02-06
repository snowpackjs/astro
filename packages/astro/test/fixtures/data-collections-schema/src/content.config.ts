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

const func = defineCollection({
	type: 'data',
	schema: () => z.object({
		homepage: z.object({
			greeting: z.string(),
			preamble: z.string(),
		})
	}),
});

const image = defineCollection({
	type: 'data',
	schema: ({ image }) => z.object({
		homepage: z.object({
			greeting: z.string(),
			preamble: z.string(),
			image: image(),
		})
	}),
});

const authors = defineCollection({
	type: 'data',
});

export const collections = { docs, func, image, i18n, authors };
