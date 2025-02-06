import fs from 'node:fs/promises';
import type { PluginContainer } from 'vite';

export const frontmatterRE = /^---(.*?)^---/ms;

export async function loadId(pluginContainer: PluginContainer, id: string) {
	const result = await pluginContainer.load(id, { ssr: true });

	if (result) {
		if (typeof result === 'string') {
			return result;
		} else {
			return result.code;
		}
	}

	// Fallback to reading from fs (Vite doesn't add this by default)
	try {
		return await fs.readFile(id, 'utf-8');
	} catch {}
}
