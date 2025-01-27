import { defineConfig, envField } from 'astro/config';

export default defineConfig({
	env: {
		schema: {
			TITLE: envField.string({
				context: 'client',
				access: 'public',
				optional: true,
				default: 'unset',
			}),
		},
	},
});
