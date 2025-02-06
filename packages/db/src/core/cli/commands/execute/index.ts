import { existsSync } from 'node:fs';
import type { AstroConfig } from 'astro';
import { green } from 'kleur/colors';
import type { Arguments } from 'yargs-parser';
import { isDbError } from '../../../../runtime/utils.js';
import {
	EXEC_DEFAULT_EXPORT_ERROR,
	EXEC_ERROR,
	FILE_NOT_FOUND_ERROR,
	MISSING_EXECUTE_PATH_ERROR,
} from '../../../errors.js';
import {
	getLocalVirtualModContents,
	getStudioVirtualModContents,
} from '../../../integration/vite-plugin-db.js';
import { bundleFile, importBundledFile } from '../../../load-file.js';
import type { DBConfig } from '../../../types.js';
import { getManagedRemoteToken } from '../../../utils.js';

export async function cmd({
	astroConfig,
	dbConfig,
	flags,
}: {
	astroConfig: AstroConfig;
	dbConfig: DBConfig;
	flags: Arguments;
}) {
	const filePath = flags._[4];
	if (typeof filePath !== 'string') {
		console.error(MISSING_EXECUTE_PATH_ERROR);
		process.exit(1);
	}

	const fileUrl = new URL(filePath, astroConfig.root);
	if (!existsSync(fileUrl)) {
		console.error(FILE_NOT_FOUND_ERROR(filePath));
		process.exit(1);
	}

	let virtualModContents: string;
	if (flags.remote) {
		const appToken = await getManagedRemoteToken(flags.token);
		virtualModContents = getStudioVirtualModContents({
			tables: dbConfig.tables ?? {},
			appToken: appToken.token,
			isBuild: false,
			output: 'server',
		});
	} else {
		virtualModContents = getLocalVirtualModContents({
			tables: dbConfig.tables ?? {},
			root: astroConfig.root,
		});
	}
	const { code } = await bundleFile({ virtualModContents, root: astroConfig.root, fileUrl });

	const mod = await importBundledFile({ code, root: astroConfig.root });
	if (typeof mod.default !== 'function') {
		console.error(EXEC_DEFAULT_EXPORT_ERROR(filePath));
		process.exit(1);
	}
	try {
		await mod.default();
		console.info(`${green('✔')} File run successfully.`);
	} catch (e) {
		if (isDbError(e)) throw new Error(EXEC_ERROR(e.message));
		else throw e;
	}
}
