import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  schema: ({image}) => z.object({
    title: z.string(),
    image: image(),
		cover: z.object({
			image: image()
		})
  }),
});

export const collections = {
	blog: blogCollection
};
