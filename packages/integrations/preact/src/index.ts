import { fileURLToPath } from 'node:url';
import { type PreactPluginOptions as VitePreactPluginOptions, preact } from '@preact/preset-vite';
import type { AstroIntegration, AstroRenderer, ContainerRenderer, ViteUserConfig } from 'astro';

const babelCwd = new URL('../', import.meta.url);

function getRenderer(development: boolean): AstroRenderer {
	return {
		name: '@astrojs/preact',
		clientEntrypoint: development ? '@astrojs/preact/client-dev.js' : '@astrojs/preact/client.js',
		serverEntrypoint: '@astrojs/preact/server.js',
	};
}

export function getContainerRenderer(): ContainerRenderer {
	return {
		name: '@astrojs/preact',
		serverEntrypoint: '@astrojs/preact/server.js',
	};
}

export interface Options extends Pick<VitePreactPluginOptions, 'include' | 'exclude'> {
	compat?: boolean;
	devtools?: boolean;
}

export default function ({ include, exclude, compat, devtools }: Options = {}): AstroIntegration {
	return {
		name: '@astrojs/preact',
		hooks: {
			'astro:config:setup': ({ addRenderer, updateConfig, command, injectScript }) => {
				const preactPlugin = preact({
					reactAliasesEnabled: compat ?? false,
					include,
					exclude,
					babel: {
						cwd: fileURLToPath(babelCwd),
					},
				});

				const viteConfig: ViteUserConfig = {
					optimizeDeps: {
						include: ['@astrojs/preact/client.js', 'preact', 'preact/jsx-runtime'],
						exclude: ['@astrojs/preact/server.js'],
					},
				};

				if (compat) {
					viteConfig.optimizeDeps!.include!.push(
						'preact/compat',
						'preact/test-utils',
						'preact/compat/jsx-runtime',
					);
					viteConfig.resolve = {
						dedupe: ['preact/compat', 'preact'],
					};
					// noExternal React entrypoints to be bundled, resolved, and aliased by Vite
					viteConfig.ssr = {
						noExternal: ['react', 'react-dom', 'react-dom/test-utils', 'react/jsx-runtime'],
					};
				}

				viteConfig.plugins = [preactPlugin];

				addRenderer(getRenderer(command === 'dev'));
				updateConfig({
					vite: viteConfig,
				});

				if (command === 'dev' && devtools) {
					injectScript('page', 'import "preact/debug";');
				}
			},
			'astro:config:done': ({ logger, config }) => {
				const knownJsxRenderers = ['@astrojs/react', '@astrojs/preact', '@astrojs/solid-js'];
				const enabledKnownJsxRenderers = config.integrations.filter((renderer) =>
					knownJsxRenderers.includes(renderer.name),
				);

				if (enabledKnownJsxRenderers.length > 1 && !include && !exclude) {
					logger.warn(
						'More than one JSX renderer is enabled. This will lead to unexpected behavior unless you set the `include` or `exclude` option. See https://docs.astro.build/en/guides/integrations-guide/preact/#combining-multiple-jsx-frameworks for more information.',
					);
				}
			},
		},
	};
}
