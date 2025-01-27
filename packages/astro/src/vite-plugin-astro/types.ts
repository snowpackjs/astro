import type { HoistedScript, TransformResult } from '@astrojs/compiler';
import type { CompileCssResult } from '../core/compile/types.js';
import type { PropagationHint } from '../types/public/internal.js';

export interface PageOptions {
	prerender?: boolean;
}

export interface PluginMetadata {
	astro: {
		hydratedComponents: TransformResult['hydratedComponents'];
		clientOnlyComponents: TransformResult['clientOnlyComponents'];
		serverComponents: TransformResult['serverComponents'];
		scripts: TransformResult['scripts'];
		containsHead: TransformResult['containsHead'];
		propagation: PropagationHint;
		pageOptions: PageOptions;
	};
}

export interface PluginCssMetadata {
	astroCss: {
		/**
		 * For Astro CSS virtual modules, it can scope to the main Astro module's default export
		 * so that if those exports are treeshaken away, the CSS module will also be treeshaken.
		 *
		 * Example config if the CSS id is `/src/Foo.astro?astro&type=style&lang.css`:
		 * ```js
		 * cssScopeTo: {
		 *   '/src/Foo.astro': ['default']
		 * }
		 * ```
		 *
		 * The above is the only config we use today, but we're exposing as a `Record` to follow the
		 * upstream Vite implementation: https://github.com/vitejs/vite/pull/16058. When/If that lands,
		 * we can also remove our custom implementation.
		 */
		cssScopeTo: Record<string, string[]>;
	};
}

export interface CompileMetadata {
	/** Used for HMR to compare code changes */
	originalCode: string;
	/** For Astro CSS virtual module */
	css: CompileCssResult[];
	/** For Astro scripts virtual module */
	scripts: HoistedScript[];
}
