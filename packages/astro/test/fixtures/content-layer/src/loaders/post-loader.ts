import { z } from 'astro:content';
import type { Loader } from "astro/loaders"

export interface PostLoaderConfig {
	url: string;
}

export function loader(config:PostLoaderConfig): Loader {
	return {
		name: "post-loader",
		load: async ({
			store, meta, logger
		}) => {
			logger.info('Loading posts');

			const lastSynced = meta.get('lastSynced');

			// Don't sync more than once a minute
			if (lastSynced && (Date.now() - Number(lastSynced) < 1000 * 60)) {
					logger.info('Skipping sync');
					return;
			}

			const posts = await fetch(config.url)
				.then((res) => res.json());

			store.clear();

			for (const data of posts) {
				store.set({id: data.id, data});
			}
			meta.set('lastSynced', String(Date.now()));
		},
		schema: async () => {
			// Simulate a delay
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return z.object({
				title: z.string(),
				body: z.string(),
				userId: z.number(),
				id: z.number(),
			});
		}
	};
}
