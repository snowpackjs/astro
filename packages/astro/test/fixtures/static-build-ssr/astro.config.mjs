import nodejs from '@astrojs/node';
import { defineConfig } from 'astro/config';

export default defineConfig({
	adapter: nodejs({ mode: 'middleware' }),
	output: 'server',
});
