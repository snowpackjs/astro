import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	name: 'Astro content layer',
	integrations: [mdx(), {
		name: '@astrojs/my-integration',
		hooks: {
				'astro:server:setup': async ({ server, refreshContent }) => {
						server.middlewares.use('/_refresh', async (req, res) => {
								if(req.method !== 'POST') {
									res.statusCode = 405
									res.end('Method Not Allowed');
									return
								}
								let body = '';
								req.on('data', chunk => {
										body += chunk.toString();
								});
								req.on('end', async () => {
										try {
												const webhookBody = JSON.parse(body);
												await refreshContent({
													context: { webhookBody },
													loaders: ['increment-loader']
												});
												res.writeHead(200, { 'Content-Type': 'application/json' });
												res.end(JSON.stringify({ message: 'Content refreshed successfully' }));
										} catch (error) {
												res.writeHead(500, { 'Content-Type': 'application/json' });
												res.end(JSON.stringify({ error: 'Failed to refresh content: ' + error.message }));
										}
								});
						});
				}
		}
}],
	vite: {
		resolve: {
			alias: {
				'@images': fileURLToPath(new URL('./images', import.meta.url))
			}
		},
	},
	experimental: {
		contentIntellisense: true,
	},
});
