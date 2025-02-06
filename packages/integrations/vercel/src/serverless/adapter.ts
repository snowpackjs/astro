import type { AstroIntegration } from 'astro';
import type { VercelServerlessConfig } from '../index.js';
import vercelIntegration from '../index.js';

export default function serverless(config: VercelServerlessConfig): AstroIntegration {
	console.warn(
		'The "@astrojs/vercel/serverless" import is deprecated and will be removed in a future release. Please import from "@astrojs/vercel" instead.'
	);
	return vercelIntegration(config);
}
