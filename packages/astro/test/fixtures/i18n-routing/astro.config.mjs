import { defineConfig} from "astro/config";

export default defineConfig({
		i18n: {
			defaultLocale: 'spanish',
			locales: [
				'en', 
				'pt', 
				'it', 
				{
					path: "spanish",
					codes: ["es", "es-SP"]
				}
			],
		}
})
