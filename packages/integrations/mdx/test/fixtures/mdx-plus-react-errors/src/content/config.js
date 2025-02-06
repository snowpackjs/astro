import { z, defineCollection } from "astro:content";

const filesSchema = () => {
  return z.object({});
};

const filesCollection = defineCollection({
  type: "content",
  schema: filesSchema(),
});

export const collections = { files: filesCollection, };
