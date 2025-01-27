import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z
    .object({
      title: z.string(),
    })
    .transform((data) => ({
      ...data,
      someOtherField: 'Added by transform',
    })),
});

export const collections = { docs };
