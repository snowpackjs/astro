import type { APIRoute, SSRLoadedRenderer } from 'astro';
import { experimental_AstroContainer } from 'astro/container';
import renderer from '@astrojs/react/server.js';
import Component from '../components/buttonDirective.astro';

export const GET: APIRoute = async (ctx) => {
	const container = await experimental_AstroContainer.create();
	container.addServerRenderer({ renderer });
	container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });
	return await container.renderToResponse(Component);
};
