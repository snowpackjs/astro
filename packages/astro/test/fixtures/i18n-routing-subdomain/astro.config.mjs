import { defineConfig} from "astro/config";

export default defineConfig({
	output: "server",
	trailingSlash: "never",
	i18n: {
		defaultLocale: 'en',
		locales: [
			'en', 'pt', 'it'
		],
		domains: {
			pt: "https://example.pt",
			it: "http://it.example.com"
		},
		routing: {
			prefixDefaultLocale: true,
			redirectToDefaultLocale: false
		}
	},
	site: "https://example.com",
})
