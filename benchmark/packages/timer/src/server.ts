import type { IncomingMessage, ServerResponse } from 'node:http';
import type { SSRManifest } from 'astro';
import { NodeApp, applyPolyfills } from 'astro/app/node';

applyPolyfills();

export function createExports(manifest: SSRManifest) {
	const app = new NodeApp(manifest);
	return {
		handler: async (req: IncomingMessage, res: ServerResponse) => {
			const start = performance.now();
			await app.render(req);
			const end = performance.now();
			res.write(end - start + '');
			res.end();
		},
	};
}
