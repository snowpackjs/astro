import { defineCollection, z } from "astro:content";
import { FOO } from "astro:env/client"

console.log({ FOO, BAR: import.meta.env.BAR })

export const collections = {
    foo: defineCollection({
        loader: () => [{
            id: 'x',
            title: import.meta.env.BAR
        }],
        schema: z.object({
            title: z.string()
        })
    })
}