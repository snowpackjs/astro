/** @file Runs all smoke tests and may add extra smoke-test dependencies to `pnpm-lock.yaml`. */

// @ts-check

import { exec } from 'tinyexec';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** URL directory containing the entire project. */
const rootDir = new URL('../../', import.meta.url);

/** URL directory containing the example subdirectories. */
const exampleDir = new URL('examples/', rootDir);
const smokeDir = new URL('smoke/', rootDir);

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

/** Runs all smoke tests. */
async function run() {
	console.log('');

	const directories = [...(await getChildDirectories(smokeDir)), ...(await getChildDirectories(exampleDir))];
	/** @type {Partial<import('tinyexec').Options>} */
	const execOptions = {
		nodeOptions: { cwd: fileURLToPath(rootDir), stdio: 'inherit' },
		throwOnError: true,
	};

	console.log('🤖', 'Preparing', 'pnpm');
	
	await exec('pnpm', ['install', '--frozen-lockfile=false'], execOptions);

	for (const directory of directories) {
		const name = directory.pathname.split('/').at(-1) ?? "";
		const isExternal = directory.pathname.includes(smokeDir.pathname);
		console.log('🤖', 'Testing', name);

		try {
			await exec('pnpm', ['install', '--ignore-scripts', '--frozen-lockfile=false'], execOptions);
			await exec('pnpm', ['astro', 'telemetry', 'disable']);
			await exec('pnpm', ['run', 'build'], execOptions);
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	}
}

run();
