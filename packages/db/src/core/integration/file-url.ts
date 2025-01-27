import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { AstroConfig, AstroIntegration } from 'astro';
import type { VitePlugin } from '../utils.js';

async function copyFile(toDir: URL, fromUrl: URL, toUrl: URL) {
	await fs.promises.mkdir(toDir, { recursive: true });
	await fs.promises.rename(fromUrl, toUrl);
}

export function fileURLIntegration(): AstroIntegration {
	const fileNames: string[] = [];

	function createVitePlugin(command: 'build' | 'preview' | 'dev' | 'sync'): VitePlugin {
		let referenceIds: string[] = [];
		return {
			name: '@astrojs/db/file-url',
			enforce: 'pre',
			async load(id) {
				if (id.endsWith('?fileurl')) {
					const filePath = id.slice(0, id.indexOf('?'));
					if (command === 'build') {
						const data = await fs.promises.readFile(filePath);
						const name = path.basename(filePath);
						const referenceId = this.emitFile({
							name,
							source: data,
							type: 'asset',
						});
						referenceIds.push(referenceId);
						return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
					}
					// dev mode
					else {
						return `export default new URL(${JSON.stringify(pathToFileURL(filePath).toString())})`;
					}
				}
			},
			generateBundle() {
				// Save file names so we can copy them back over.
				for (const referenceId of referenceIds) {
					fileNames.push(this.getFileName(referenceId));
				}
				// Reset `referenceIds` for later generateBundle() runs.
				// Prevents lookup for ids that have already been copied.
				referenceIds = [];
			},
		};
	}

	let config: AstroConfig;
	return {
		name: '@astrojs/db/file-url',
		hooks: {
			'astro:config:setup'({ updateConfig, command }) {
				updateConfig({
					vite: {
						plugins: [createVitePlugin(command)],
					},
				});
			},
			'astro:config:done': ({ config: _config }) => {
				config = _config;
			},
			async 'astro:build:done'() {
				if (config.output === 'static') {
					// Delete the files since they are only used for the build process.
					const unlinks: Promise<unknown>[] = [];
					for (const fileName of fileNames) {
						const url = new URL(fileName, config.outDir);
						unlinks.push(fs.promises.unlink(url));
					}
					await Promise.all(unlinks);
					// Delete the assets directory if it is empty.
					// NOTE(fks): Ignore errors here because this is expected to fail
					// if the directory contains files, or if it does not exist.
					// If it errors for some unknown reason, it's not a big deal.
					const assetDir = new URL(config.build.assets, config.outDir);
					await fs.promises.rmdir(assetDir).catch(() => []);
				} else {
					// Move files back over to the dist output path
					const moves: Promise<unknown>[] = [];
					for (const fileName of fileNames) {
						const fromUrl = new URL(fileName, config.build.client);
						const toUrl = new URL(fileName, config.build.server);
						const toDir = new URL('./', toUrl);
						moves.push(copyFile(toDir, fromUrl, toUrl));
					}
					await Promise.all(moves);
				}
			},
		},
	};
}
