import type { AstroSettings } from '../types/astro.js';
import { ENV_TYPES_FILE } from './constants.js';
import { getEnvFieldType } from './validators.js';

export function syncAstroEnv(settings: AstroSettings): void {
	let client = '';
	let server = '';

	for (const [key, options] of Object.entries(settings.config.env.schema)) {
		const str = `	export const ${key}: ${getEnvFieldType(options)};	\n`;
		if (options.context === 'client') {
			client += str;
		} else {
			server += str;
		}
	}

	let content = '';
	if (client !== '') {
		content = `declare module 'astro:env/client' {
${client}}`;
	}
	if (server !== '') {
		content += `declare module 'astro:env/server' {
${server}}`;
	}

	if (content !== '') {
		settings.injectedTypes.push({
			filename: ENV_TYPES_FILE,
			content,
		});
	}
}
