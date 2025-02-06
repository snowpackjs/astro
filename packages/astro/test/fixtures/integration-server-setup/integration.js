import { setTimeout } from "node:timers/promises";

export default function() {
	return {
		name: '@astrojs/test-integration',
		hooks: {
			'astro:server:setup': async ({ server }) => {
				// Ensure that `async` is respected
				await setTimeout(100);
				server.middlewares.use(
					function middleware(req, res, next) {
						res.setHeader('x-middleware', 'true');
						next();
					}
				);
			}
		}
	}
}
