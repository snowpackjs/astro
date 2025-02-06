//  @ts-check
import { defineConfig } from 'astro/config';
import testAdapter from '../../test-adapter.js';

export default defineConfig({
	adapter: testAdapter(),
	output: 'server',
	experimental: {
		session: {
			driver: 'fs',
			ttl: 20,
		},
	},
});
