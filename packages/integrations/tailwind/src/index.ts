import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import autoprefixerPlugin from 'autoprefixer';
import tailwindPlugin from 'tailwindcss';
import type { CSSOptions, UserConfig } from 'vite';

async function getPostCssConfig(
	root: UserConfig['root'],
	postcssInlineOptions: CSSOptions['postcss'],
) {
	let postcssConfigResult;
	// Check if postcss config is not inlined
	if (!(typeof postcssInlineOptions === 'object' && postcssInlineOptions !== null)) {
		let { default: postcssrc } = await import('postcss-load-config');
		const searchPath = typeof postcssInlineOptions === 'string' ? postcssInlineOptions : root!;
		try {
			postcssConfigResult = await postcssrc({}, searchPath);
		} catch {
			postcssConfigResult = null;
		}
	}
	return postcssConfigResult;
}

async function getViteConfiguration(
	tailwindConfigPath: string | undefined,
	nesting: boolean,
	root: string,
	postcssInlineOptions: CSSOptions['postcss'],
): Promise<Partial<UserConfig>> {
	// We need to manually load postcss config files because when inlining the tailwind and autoprefixer plugins,
	// that causes vite to ignore postcss config files
	const postcssConfigResult = await getPostCssConfig(root, postcssInlineOptions);

	const postcssOptions = postcssConfigResult?.options ?? {};
	const postcssPlugins = postcssConfigResult?.plugins?.slice() ?? [];

	if (nesting) {
		const tailwindcssNestingPlugin = (await import('tailwindcss/nesting/index.js')).default;
		postcssPlugins.push(tailwindcssNestingPlugin());
	}

	postcssPlugins.push(tailwindPlugin(tailwindConfigPath));
	postcssPlugins.push(autoprefixerPlugin());

	return {
		css: {
			postcss: {
				...postcssOptions,
				plugins: postcssPlugins,
			},
		},
	};
}

type TailwindOptions = {
	/**
	 * Path to your tailwind config file
	 * @default 'tailwind.config.mjs'
	 */
	configFile?: string;
	/**
	 * Apply Tailwind's base styles
	 * Disabling this is useful when further customization of Tailwind styles
	 * and directives is required. See {@link https://tailwindcss.com/docs/functions-and-directives#tailwind Tailwind's docs}
	 * for more details on directives and customization.
	 * @default true
	 */
	applyBaseStyles?: boolean;
	/**
	 * Add CSS nesting support using `tailwindcss/nesting`. See {@link https://tailwindcss.com/docs/using-with-preprocessors#nesting Tailwind's docs}
	 * for how this works with `postcss-nesting` and `postcss-nested`.
	 */
	nesting?: boolean;
};

export default function tailwindIntegration(options?: TailwindOptions): AstroIntegration {
	const applyBaseStyles = options?.applyBaseStyles ?? true;
	const customConfigPath = options?.configFile;
	const nesting = options?.nesting ?? false;

	return {
		name: '@astrojs/tailwind',
		hooks: {
			'astro:config:setup': async ({ config, updateConfig, injectScript }) => {
				// Inject the Tailwind postcss plugin
				updateConfig({
					vite: await getViteConfiguration(
						customConfigPath,
						nesting,
						fileURLToPath(config.root),
						config.vite.css?.postcss,
					),
				});

				if (applyBaseStyles) {
					// Inject the Tailwind base import
					injectScript('page-ssr', `import '@astrojs/tailwind/base.css';`);
				}
			},
		},
	};
}
