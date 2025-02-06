/** @file Remove all smoke tests and may remove extra smoke-test dependencies from `pnpm-lock.yaml`. */

// @ts-check

import { exec } from 'tinyexec';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';

/* Configuration
/* ========================================================================== */

/** URL directory containing this current script. */
const scriptDir = new URL('./', import.meta.url);

/** URL directory containing the entire project. */
const rootDir = new URL('../../', import.meta.url);

/* Application
/* ========================================================================== */

/** Runs all smoke tests. */
async function run() {
	const dirs = await getChildDirectories(scriptDir);

	if (dirs.length) {
		console.log();

		for (const dir of await getChildDirectories(scriptDir)) {
			console.log('🤖', 'Removing', dir.pathname.split('/').at(-1));

			fs.rm(dir, { force: true, recursive: true });
		}
	}

	console.log();

	console.log('🤖', 'Resetting', 'pnpm');

	await exec('pnpm', ['install'], {
		nodeOptions: { cwd: fileURLToPath(rootDir), stdio: ['pipe', 'inherit', 'inherit'] },
		throwOnError: true
	});
}

/* Functionality
/* ========================================================================== */

/** Returns all child directories of the given directory. */
const getChildDirectories = async (/** @type {URL} */ dir) => {
	/** @type {URL[]} */
	const dirs = [];

	for await (const dirent of await fs.opendir(dir)) {
		if (dirent.isDirectory()) {
			dirs.push(new URL(dirent.name, dir));
		}
	}

	return dirs;
};

/* Execution
/* -------------------------------------------------------------------------- */

run();
