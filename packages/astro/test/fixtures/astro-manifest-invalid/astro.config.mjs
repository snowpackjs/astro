import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://astro.build/",
	experimental: {
		serializeConfig: true,
	},
	i18n: {
		locales: ["en", "fr"],
		defaultLocale: "en",
	}
});
