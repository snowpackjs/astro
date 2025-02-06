import { defineConfig } from 'astro/config';

export default defineConfig({
	vite: {
		build: {
				rollupOptions: {
						output: {
								chunkFileNames: 'assets/testing-[name].mjs',
								assetFileNames: 'assets/testing-[name].[ext]'
						}
				}
		}
	}
})
