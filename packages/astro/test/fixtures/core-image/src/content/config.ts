import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  schema: ({image}) => z.object({
    title: z.string(),
    image: image(),
		cover: z.object({
			image: image()
		}),
		arrayOfImages: z.array(image()),
		refinedImage: image().refine((img) => img.width > 200)
  }),
});


export const collections = {
	blog: blogCollection
};
