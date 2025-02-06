import type { AstroIntegration } from 'astro';

export default function createIntegration(): AstroIntegration {
	return {
		name: '@benchmark/timer',
		hooks: {
			'astro:config:setup': ({ updateConfig }) => {
				updateConfig({
					vite: {
						ssr: {
							noExternal: ['@benchmark/timer'],
						},
					},
				});
			},
			'astro:config:done': ({ setAdapter }) => {
				setAdapter({
					name: '@benchmark/adapter',
					serverEntrypoint: '@benchmark/adapter/server.js',
					exports: ['manifest', 'createApp'],
					supportedAstroFeatures: {
						serverOutput: 'stable',
						envGetSecret: 'experimental',
						staticOutput: 'stable',
						hybridOutput: 'stable',
						i18nDomains: 'stable',
					},
				});
			},
		},
	};
}
