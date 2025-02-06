import { defineConfig } from 'astro/config';
import nodejs from "@astrojs/node"
// https://astro.build/config
export default defineConfig({
	i18n: {
		defaultLocale: "en",
		locales: [
			"en",
			"fr",
			"es",
			{
				path: "portuguese",
				codes: [
					"pt-AO",
					"pt",
					"pt-BR",
				],
		}],
	},
	output: 'static',
	adapter: nodejs({ mode: 'standalone' }),
});
