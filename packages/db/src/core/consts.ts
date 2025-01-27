import { readFileSync } from 'node:fs';

export const PACKAGE_NAME = JSON.parse(
	readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
).name;

export const RUNTIME_IMPORT = JSON.stringify(`${PACKAGE_NAME}/runtime`);

export const RUNTIME_VIRTUAL_IMPORT = JSON.stringify(`${PACKAGE_NAME}/dist/runtime/virtual.js`);

export const DB_TYPES_FILE = 'db-types.d.ts';

export const VIRTUAL_MODULE_ID = 'astro:db';

export const DB_PATH = '.astro/content.db';

export const CONFIG_FILE_NAMES = ['config.ts', 'config.js', 'config.mts', 'config.mjs'];

export const MIGRATION_VERSION = '2024-03-12';
