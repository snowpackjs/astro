import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  schema: ({image}) => z.object({
    title: z.string(),
    cover: image(),
  }),
});

export const collections = {
  blog: blogCollection,
};
