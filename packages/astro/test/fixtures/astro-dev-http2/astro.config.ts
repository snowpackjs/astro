import { defineConfig } from "astro/config";
import { readFileSync } from "fs";
// https://astro.build/config
export default defineConfig({
	output: "static",
  vite: {
    server: {
      https: {
        key: readFileSync(new URL(".cert/key.pem", import.meta.url)),
        cert: readFileSync(new URL(".cert/cert.pem", import.meta.url)),
      },
    },
		plugins: [
			{
				name: 'http-version-plugin',
				// This plugin allows tests to track the version of HTTP used in the request
					configureServer: (server) => {
						server.middlewares.use((req, res, next) => {
							req.headers['x-http-version'] = req.httpVersion;
							next();
						});
					}
			},
		],
  },
});
