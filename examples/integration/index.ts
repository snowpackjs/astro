import type { AstroIntegration } from 'astro';

export default function createIntegration(): AstroIntegration {
	// See the Integration API docs for full details
	// https://docs.astro.build/en/reference/integrations-reference/
	return {
		name: '@example/my-integration',
		hooks: {
			'astro:config:setup': () => {
				// See the @astrojs/react integration for an example
				// https://github.com/withastro/astro/blob/main/packages/integrations/react/src/index.ts
			},
			'astro:build:setup': () => {
				// See the @astrojs/react integration for an example
				// https://github.com/withastro/astro/blob/main/packages/integrations/react/src/index.ts
			},
			'astro:build:done': () => {
				// See the @astrojs/partytown integration for an example
				// https://github.com/withastro/astro/blob/main/packages/integrations/partytown/src/index.ts
			},
		},
	};
}
