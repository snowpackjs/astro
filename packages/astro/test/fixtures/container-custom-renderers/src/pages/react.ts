import type {APIRoute} from "astro";
import { experimental_AstroContainer } from "astro/container";
import renderer from '@astrojs/react/server.js';
import Component from "../components/button.jsx"

export const GET: APIRoute = async (ctx) => {
		const container = await experimental_AstroContainer.create();
		container.addServerRenderer({ renderer });
		return await container.renderToResponse(Component);
}
