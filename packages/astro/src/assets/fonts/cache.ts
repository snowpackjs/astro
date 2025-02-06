import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type * as unifont from 'unifont';
import { AstroError, AstroErrorData } from '../../core/errors/index.js';

type Storage = Required<unifont.UnifontOptions>['storage'];

export const createStorage = ({
	base,
}: {
	base: URL;
}): Storage => {
	return {
		getItem: async (key) => {
			const dest = new URL('./' + key, base);
			try {
				if (!existsSync(dest)) {
					return;
				}
				const content = await readFile(dest, 'utf-8');
				try {
					return JSON.parse(content);
				} catch {
					// If we can't parse the content, we assume the entry does not exist
					return;
				}
			} catch (e) {
				throw new AstroError(AstroErrorData.UnknownFilesystemError, { cause: e });
			}
		},
		setItem: async (key, value) => {
			const dest = new URL('./' + key, base);
			try {
				await mkdir(dirname(fileURLToPath(dest)), { recursive: true });
				return await writeFile(dest, JSON.stringify(value), 'utf-8');
			} catch (e) {
				throw new AstroError(AstroErrorData.UnknownFilesystemError, { cause: e });
			}
		},
	};
};

export const createCache = ({ storage }: { storage: Storage }) => {
	return {
		cache: async (
			key: string,
			cb: () => Promise<string>,
		): Promise<{ cached: boolean; data: string }> => {
			const existing = await storage.getItem(key);
			if (existing) {
				return { cached: true, data: existing };
			}
			const data = await cb();
			await storage.setItem(key, data);
			return { cached: false, data };
		},
	};
};

export type Cache = ReturnType<typeof createCache>;
