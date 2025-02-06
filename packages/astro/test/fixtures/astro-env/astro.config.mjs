import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	env: {
		schema: {
			FOO: envField.string({ context: "client", access: "public", optional: true, default: "ABC" }),
			BAR: envField.string({ context: "client", access: "public", optional: true, default: "DEF" }),
			BAZ: envField.string({ context: "server", access: "public", optional: true, default: "GHI" }),
		}
	}
});
