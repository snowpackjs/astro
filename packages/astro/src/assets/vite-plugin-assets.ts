import type * as vite from 'vite';
import type { AstroPluginOptions } from '../@types/astro';
import { VIRTUAL_MODULE_ID } from './consts.js';

const resolvedVirtualModuleId = '\0' + VIRTUAL_MODULE_ID;

export default function assets({ settings, logging }: AstroPluginOptions): vite.Plugin {
	return {
		name: 'astro:assets',
		resolveId(id) {
			if (id === VIRTUAL_MODULE_ID) {
				return resolvedVirtualModuleId;
			}
		},
		load(id, options) {
			if (id === resolvedVirtualModuleId) {
				return `
					export function getImage() {
						return "this will be an image one day!";
					}
				`;
			}
		},
	};
}
