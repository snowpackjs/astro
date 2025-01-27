import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import mri from 'mri';
import { makeProject } from './bench/_util.js';

const args = mri(process.argv.slice(2));

if (args.help || args.h) {
	console.log(`\
astro-benchmark <command> [options]

Command
  [empty]         Run all benchmarks
  memory          Run build memory and speed test
  render          Run rendering speed test
  server-stress   Run server stress test
  cli-startup     Run CLI startup speed test

Options
  --project <project-name>       Project to use for benchmark, see benchmark/make-project/ for available names
  --output  <output-file>        Output file to write results to
`);
	process.exit(0);
}

const commandName = args._[0];
const benchmarks = {
	memory: () => import('./bench/memory.js'),
	render: () => import('./bench/render.js'),
	'server-stress': () => import('./bench/server-stress.js'),
	'cli-startup': () => import('./bench/cli-startup.js'),
};

if (commandName && !(commandName in benchmarks)) {
	console.error(`Invalid benchmark name: ${commandName}`);
	process.exit(1);
}

if (commandName) {
	// Run single benchmark
	const bench = benchmarks[commandName];
	const benchMod = await bench();
	const projectDir = await makeProject(args.project || benchMod.defaultProject);
	const outputFile = await getOutputFile(commandName);
	await benchMod.run(projectDir, outputFile);
} else {
	// Run all benchmarks
	for (const name in benchmarks) {
		const bench = benchmarks[name];
		const benchMod = await bench();
		const projectDir = await makeProject(args.project || benchMod.defaultProject);
		const outputFile = await getOutputFile(name);
		await benchMod.run(projectDir, outputFile);
	}
}

/**
 * @param {string} benchmarkName
 */
export async function getOutputFile(benchmarkName) {
	let file;
	if (args.output) {
		file = pathToFileURL(path.resolve(args.output));
	} else {
		file = new URL(`./results/${benchmarkName}-bench-${Date.now()}.json`, import.meta.url);
	}

	// Prepare output file directory
	await fs.mkdir(new URL('./', file), { recursive: true });
	return file;
}
