import { promises as fs } from 'node:fs';

import type { APIRoute } from 'astro';

export const GET: APIRoute = async function get(ctx) {
	try {
		// Image is in the public domain. Sourced from
		// https://en.wikipedia.org/wiki/File:Portrait_placeholder.png
		const buffer = await fs.readFile('./test/fixtures/non-html-pages/src/images/placeholder.png');
		// NOTE: SSG only so not Content-Type needed
		return new Response(buffer.buffer);
	} catch (error: unknown) {
		throw new Error(`Something went wrong in placeholder.png route!: ${error as string}`);
	}
};
