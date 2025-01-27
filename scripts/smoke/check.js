// @ts-check

import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import pLimit from 'p-limit';
import { toJson } from 'tsconfck';

const skippedExamples = ['toolbar-app', 'component', 'server-islands'];

function checkExamples() {
	let examples = readdirSync('./examples', { withFileTypes: true });
	examples = examples.filter((dirent) => dirent.isDirectory()).filter((dirent) => !skippedExamples.includes(dirent.name));

	console.log(`Running astro check on ${examples.length} examples...`);

	// Run astro check in parallel with 5 at most
	const checkPromises = [];
	const limit = pLimit(5);

	for (const example of examples) {
		checkPromises.push(
			limit(
				() =>
					new Promise((resolve) => {
						// Sometimes some examples may get deleted, but after a `git pull` the directory still exists.
						// This can stall the process time as it'll typecheck the entire monorepo, so do a quick exist
						// check here before typechecking this directory.
						if (!existsSync(path.join('./examples/', example.name, 'package.json'))) {
							resolve(0);
							return;
						}

						const originalConfig = prepareExample(example.name);
						let data = '';
						const child = spawn('node', ['../../packages/astro/astro.js', 'check'], {
							cwd: path.join('./examples', example.name),
							env: { ...process.env, FORCE_COLOR: 'true' },
						});

						child.stdout.on('data', function (buffer) {
							data += buffer.toString();
						});

						child.on('exit', (code) => {
							if (code !== 0) {
								console.error(data);
							}
							if (originalConfig) {
								resetExample(example.name, originalConfig);
							}
							resolve(code);
						});
					})
			)
		);
	}

	Promise.all(checkPromises).then((codes) => {
		if (codes.some((code) => code !== 0)) {
			process.exit(1);
		}

		console.log('No errors found!');
	});
}

/**
 * @param {string} examplePath
 */
function prepareExample(examplePath) {
	const tsconfigPath = path.join('./examples/', examplePath, 'tsconfig.json');
	if (!existsSync(tsconfigPath)) return
	
	const originalConfig = readFileSync(tsconfigPath, 'utf-8');
	const tsconfig = JSON.parse(toJson(originalConfig));

	// Swap to strictest config to make sure it also passes
	tsconfig.extends = 'astro/tsconfigs/strictest';
	tsconfig.compilerOptions ??= {}
	tsconfig.compilerOptions.types = tsconfig.compilerOptions.types ?? []; // Speeds up tests

	writeFileSync(tsconfigPath, JSON.stringify(tsconfig));

	return originalConfig;
}

/**
 * @param {string} examplePath
 * @param {string} originalConfig
 */
function resetExample(examplePath, originalConfig) {
	const tsconfigPath = path.join('./examples/', examplePath, 'tsconfig.json');
	writeFileSync(tsconfigPath, originalConfig);
}

checkExamples();
