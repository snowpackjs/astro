import codspeedPlugin from '@codspeed/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: process.env.CODSPEED ? [codspeedPlugin()] : [],
	include: ['./bench/codspeed.bench.js'],
});
