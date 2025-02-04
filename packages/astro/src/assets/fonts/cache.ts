import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type * as unifont from 'unifont';

type Storage = Required<unifont.UnifontOptions>['storage'];

export const createStorage = ({
	bases,
}: {
	bases: Array<URL>;
}): Storage => {
	return {
		getItem: async (key) => {
			for (const base of bases) {
				const dest = new URL('./' + key, base);
				if (!existsSync(dest)) {
					return;
				}
				return JSON.parse(await readFile(dest, 'utf-8'));
			}
		},
		setItem: async (key, value) => {
			for (const base of bases) {
				const dest = new URL('./' + key, base);
				await mkdir(dirname(fileURLToPath(dest)), { recursive: true });
				return await writeFile(dest, JSON.stringify(value), 'utf-8');
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
