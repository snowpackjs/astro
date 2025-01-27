import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PartytownConfig } from '@qwik.dev/partytown/integration';
import { partytownSnippet } from '@qwik.dev/partytown/integration';
import { copyLibFiles, libDirPath } from '@qwik.dev/partytown/utils';
import type { AstroIntegration } from 'astro';
import sirv from './sirv.js';
const resolve = createRequire(import.meta.url).resolve;

export type PartytownOptions = {
	config?: PartytownConfig;
};

function appendForwardSlash(str: string) {
	return str.endsWith('/') ? str : str + '/';
}

export default function createPlugin(options?: PartytownOptions): AstroIntegration {
	let partytownSnippetHtml: string;
	const partytownEntrypoint = resolve('@qwik.dev/partytown/package.json');
	const partytownLibDirectory = path.resolve(partytownEntrypoint, '../lib');
	return {
		name: '@astrojs/partytown',
		hooks: {
			'astro:config:setup': ({ config: _config, command, injectScript }) => {
				const lib = `${appendForwardSlash(_config.base)}~partytown/`;
				const recreateIFrameScript = `;(e=>{e.addEventListener("astro:before-swap",e=>{let r=document.body.querySelector("iframe[src*='${lib}']");if(r)e.newDocument.body.append(r)})})(document);`;
				const partytownConfig = {
					lib,
					...options?.config,
					debug: options?.config?.debug ?? command === 'dev',
				};
				partytownSnippetHtml = partytownSnippet(partytownConfig);
				partytownSnippetHtml += recreateIFrameScript;
				injectScript('head-inline', partytownSnippetHtml);
			},
			'astro:server:setup': ({ server }) => {
				const lib = `/~partytown/`;
				server.middlewares.use(
					sirv(partytownLibDirectory, {
						mount: lib,
						dev: true,
						etag: true,
						extensions: [],
					}),
				);
			},
			'astro:build:done': async ({ dir }) => {
				await copyLibFiles(fileURLToPath(new URL('~partytown', dir)), {
					debugDir: options?.config?.debug ?? false,
				});
			},
			'astro:build:ssr': async ({ manifest }) => {
				const dirpath = libDirPath({ debugDir: false });
				const files = await fs.promises.readdir(dirpath);
				for (const file of files) {
					if (file === 'debug') continue;
					manifest.assets.push(`/~partytown/${file}`);
				}
			},
		},
	};
}
