import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	env: {
		schema: {
			KNOWN_SECRET: envField.number({ context: "server", access: "secret" })
		}
	}
});
