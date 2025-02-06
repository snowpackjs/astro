import { defineCollection } from "astro:content";
import { glob } from "astro/loaders"

const posts = defineCollection({
	loader: glob({
		pattern: "*.mdx",
		base: "src/data/posts",
	})
});

const blog = defineCollection({
	loader: glob({
		pattern: "*.mdx",
		base: "src/data/blog",
	})
});

export const collections = { posts, blog };
