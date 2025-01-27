import { promises as fs, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { posixRelative } from '../utils.js';
import type { Loader, LoaderContext } from './types.js';

export interface FileOptions {
	/**
	 * the parsing function to use for this data
	 * @default JSON.parse or yaml.load, depending on the extension of the file
	 * */
	parser?: (
		text: string,
	) => Record<string, Record<string, unknown>> | Array<Record<string, unknown>>;
}

/**
 * Loads entries from a JSON file. The file must contain an array of objects that contain unique `id` fields, or an object with string keys.
 * @param fileName The path to the JSON file to load, relative to the content directory.
 * @param options Additional options for the file loader
 */
export function file(fileName: string, options?: FileOptions): Loader {
	if (fileName.includes('*')) {
		// TODO: AstroError
		throw new Error('Glob patterns are not supported in `file` loader. Use `glob` loader instead.');
	}

	let parse: ((text: string) => any) | null = null;

	const ext = fileName.split('.').at(-1);
	if (ext === 'json') {
		parse = JSON.parse;
	} else if (ext === 'yml' || ext === 'yaml') {
		parse = (text) =>
			yaml.load(text, {
				filename: fileName,
			});
	}
	if (options?.parser) parse = options.parser;

	if (parse === null) {
		// TODO: AstroError
		throw new Error(
			`No parser found for file '${fileName}'. Try passing a parser to the \`file\` loader.`,
		);
	}

	async function syncData(filePath: string, { logger, parseData, store, config }: LoaderContext) {
		let data: Array<Record<string, unknown>> | Record<string, Record<string, unknown>>;

		try {
			const contents = await fs.readFile(filePath, 'utf-8');
			data = parse!(contents);
		} catch (error: any) {
			logger.error(`Error reading data from ${fileName}`);
			logger.debug(error.message);
			return;
		}

		const normalizedFilePath = posixRelative(fileURLToPath(config.root), filePath);

		if (Array.isArray(data)) {
			if (data.length === 0) {
				logger.warn(`No items found in ${fileName}`);
			}
			logger.debug(`Found ${data.length} item array in ${fileName}`);
			store.clear();
			for (const rawItem of data) {
				const id = (rawItem.id ?? rawItem.slug)?.toString();
				if (!id) {
					logger.error(`Item in ${fileName} is missing an id or slug field.`);
					continue;
				}
				const parsedData = await parseData({ id, data: rawItem, filePath });
				store.set({ id, data: parsedData, filePath: normalizedFilePath });
			}
		} else if (typeof data === 'object') {
			const entries = Object.entries<Record<string, unknown>>(data);
			logger.debug(`Found object with ${entries.length} entries in ${fileName}`);
			store.clear();
			for (const [id, rawItem] of entries) {
				const parsedData = await parseData({ id, data: rawItem, filePath });
				store.set({ id, data: parsedData, filePath: normalizedFilePath });
			}
		} else {
			logger.error(`Invalid data in ${fileName}. Must be an array or object.`);
		}
	}

	return {
		name: 'file-loader',
		load: async (context) => {
			const { config, logger, watcher } = context;
			logger.debug(`Loading data from ${fileName}`);
			const url = new URL(fileName, config.root);
			if (!existsSync(url)) {
				logger.error(`File not found: ${fileName}`);
				return;
			}
			const filePath = fileURLToPath(url);

			await syncData(filePath, context);

			watcher?.add(filePath);

			watcher?.on('change', async (changedPath) => {
				if (changedPath === filePath) {
					logger.info(`Reloading data from ${fileName}`);
					await syncData(filePath, context);
				}
			});
		},
	};
}
