import vercel from "@astrojs/vercel";
import {defineConfig} from "astro/config";

export default defineConfig({
    adapter: vercel({
        edgeMiddleware: true
    }),
    output: 'server'
});
