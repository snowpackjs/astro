import path from 'node:path';
import {fileURLToPath} from "node:url";

/** @type {import('tailwindcss').Config} */
export default {
	content: [path.join(path.dirname(fileURLToPath(import.meta.url)), 'src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}')],
};
