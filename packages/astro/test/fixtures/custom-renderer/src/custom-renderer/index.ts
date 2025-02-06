import type { AstroIntegration, AstroRenderer, ContainerRenderer } from 'astro';

const getRenderer = (): AstroRenderer => ({
    name: 'custom-renderer',
    clientEntrypoint: '@custom-renderer/client',
    serverEntrypoint: '@custom-renderer/server',
})

export const getContainerRenderer = (): ContainerRenderer => ({
    name: 'custom-renderer',
    serverEntrypoint: '@custom-renderer/server',
})

export default function (): AstroIntegration {
	return {
		name: 'custom-renderer',
		hooks: {
			'astro:config:setup': ({ addRenderer }) => {
				addRenderer(getRenderer());
			},
		},
	};
}