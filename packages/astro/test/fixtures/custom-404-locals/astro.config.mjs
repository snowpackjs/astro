import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [{
		name: 'locals-integration',
		hooks: {
			'astro:server:setup': ({ server }) => {
				server.middlewares.use(async function middleware(req, res, next) {
						const clientLocalsSymbol = Symbol.for('astro.locals');
						Reflect.set(req, clientLocalsSymbol, {
							runtime: 'locals'
					});
					next();
				});
			},
		},
	}]
});
