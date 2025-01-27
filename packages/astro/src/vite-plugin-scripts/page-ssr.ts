import MagicString from 'magic-string';
import { type Plugin as VitePlugin, normalizePath } from 'vite';
import { isPage } from '../core/util.js';
import type { AstroSettings } from '../types/astro.js';
import { PAGE_SSR_SCRIPT_ID } from './index.js';

export default function astroScriptsPostPlugin({
	settings,
}: {
	settings: AstroSettings;
}): VitePlugin {
	return {
		name: 'astro:scripts:page-ssr',
		enforce: 'post',
		transform(this, code, id, options) {
			if (!options?.ssr) return;

			const hasInjectedScript = settings.scripts.some((s) => s.stage === 'page-ssr');
			if (!hasInjectedScript) return;

			const filename = normalizePath(id);
			let fileURL: URL;
			try {
				fileURL = new URL(`file://${filename}`);
			} catch {
				// If we can't construct a valid URL, exit early
				return;
			}

			const fileIsPage = isPage(fileURL, settings);
			if (!fileIsPage) return;

			const s = new MagicString(code, { filename });
			s.prepend(`import '${PAGE_SSR_SCRIPT_ID}';\n`);

			return {
				code: s.toString(),
				map: s.generateMap({ hires: 'boundary' }),
			};
		},
	};
}
