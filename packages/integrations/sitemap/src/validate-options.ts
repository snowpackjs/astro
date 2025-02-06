import { z } from 'zod';
import type { SitemapOptions } from './index.js';
import { SitemapOptionsSchema } from './schema.js';

// @internal
export const validateOptions = (site: string | undefined, opts: SitemapOptions) => {
	const result = SitemapOptionsSchema.parse(opts);

	z.object({
		site: z.string().optional(), // Astro takes care of `site`: how to validate, transform and refine
		canonicalURL: z.string().optional(), // `canonicalURL` is already validated in prev step
	})
		.refine((options) => options.site || options.canonicalURL, {
			message: 'Required `site` astro.config option or `canonicalURL` integration option',
		})
		.parse({
			site,
			canonicalURL: result.canonicalURL,
		});

	return result;
};
