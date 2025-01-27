import type { AstroConfig, AstroIntegration, ContentEntryType, HookParameters } from 'astro';
import { getContentEntryType } from './content-entry-type.js';
import {
	type MarkdocConfigResult,
	SUPPORTED_MARKDOC_CONFIG_FILES,
	loadMarkdocConfig,
} from './load-config.js';
import type { MarkdocIntegrationOptions } from './options.js';

type SetupHookParams = HookParameters<'astro:config:setup'> & {
	// `contentEntryType` is not a public API
	// Add type defs here
	addContentEntryType: (contentEntryType: ContentEntryType) => void;
};

export default function markdocIntegration(options?: MarkdocIntegrationOptions): AstroIntegration {
	let markdocConfigResult: MarkdocConfigResult | undefined;
	let astroConfig: AstroConfig;
	return {
		name: '@astrojs/markdoc',
		hooks: {
			'astro:config:setup': async (params) => {
				const { updateConfig, addContentEntryType } = params as SetupHookParams;
				astroConfig = params.config;

				markdocConfigResult = await loadMarkdocConfig(astroConfig);

				addContentEntryType(
					await getContentEntryType({ markdocConfigResult, astroConfig, options }),
				);

				updateConfig({
					vite: {
						ssr: {
							external: ['@astrojs/markdoc/prism', '@astrojs/markdoc/shiki'],
						},
					},
				});
			},
			'astro:server:setup': async ({ server }) => {
				server.watcher.on('all', (_event, entry) => {
					if (SUPPORTED_MARKDOC_CONFIG_FILES.some((f) => entry.endsWith(f))) {
						server.restart();
					}
				});
			},
		},
	};
}
