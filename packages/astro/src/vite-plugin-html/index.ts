import { transform } from './transform/index.js';

export default function html() {
	return {
		name: 'astro:html',
		options(options: any) {
			options.plugins = options.plugins?.filter((p: any) => p.name !== 'vite:build-html');
		},
		async transform(source: string, id: string) {
			if (!id.endsWith('.html')) return;
			return await transform(source, id);
		},
	};
}
