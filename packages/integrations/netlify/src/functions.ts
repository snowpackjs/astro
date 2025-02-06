import type { AstroIntegration } from 'astro';
import netlifyIntegration, { type NetlifyIntegrationConfig } from './index.js';

export default function functionsIntegration(config: NetlifyIntegrationConfig): AstroIntegration {
	console.warn(
		'The @astrojs/netlify/functions import is deprecated and will be removed in a future release. Please use @astrojs/netlify instead.',
	);
	return netlifyIntegration(config);
}
