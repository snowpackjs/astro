import fs from 'node:fs/promises';
import path from 'node:path';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import glob from 'fast-glob';

const isCI = !!process.env.CI;
const defaultTimeout = isCI ? 1400000 : 600000;

export default async function test() {
	const args = parseArgs({
		allowPositionals: true,
		options: {
			// aka --test-name-pattern: https://nodejs.org/api/test.html#filtering-tests-by-name
			match: { type: 'string', alias: 'm' },
			// aka --test-only: https://nodejs.org/api/test.html#only-tests
			only: { type: 'boolean', alias: 'o' },
			// aka --test-concurrency: https://nodejs.org/api/test.html#test-runner-execution-model
			parallel: { type: 'boolean', alias: 'p' },
			// experimental: https://nodejs.org/api/test.html#watch-mode
			watch: { type: 'boolean', alias: 'w' },
			// Test timeout in milliseconds (default: 30000ms)
			timeout: { type: 'string', alias: 't' },
			// Test setup file
			setup: { type: 'string', alias: 's' },
			// Test teardown file
			teardown: { type: 'string' },
		},
	});

	const pattern = args.positionals[1];
	if (!pattern) throw new Error('Missing test glob pattern');

	const files = await glob(pattern, {
		filesOnly: true,
		absolute: true,
		ignore: ['**/node_modules/**'],
	});

	// For some reason, the `only` option does not work and we need to explicitly set the CLI flag instead.
	// Node.js requires opt-in to run .only tests :(
	// https://nodejs.org/api/test.html#only-tests
	if (args.values.only) {
		process.env.NODE_OPTIONS ??= '';
		process.env.NODE_OPTIONS += ' --test-only';
	}

	if (!args.values.parallel) {
		// If not parallel, we create a temporary file that imports all the test files
		// so that it all runs in a single process.
		const tempTestFile = path.resolve('./node_modules/.astro/test.mjs');
		await fs.mkdir(path.dirname(tempTestFile), { recursive: true });
		await fs.writeFile(
			tempTestFile,
			files.map((f) => `import ${JSON.stringify(pathToFileURL(f).toString())};`).join('\n'),
		);

		files.length = 0;
		files.push(tempTestFile);
	}

	const teardownModule = args.values.teardown
		? await import(pathToFileURL(path.resolve(args.values.teardown)).toString())
		: undefined;

	// https://nodejs.org/api/test.html#runoptions
	run({
		files,
		testNamePatterns: args.values.match,
		concurrency: args.values.parallel,
		only: args.values.only,
		setup: args.values.setup,
		watch: args.values.watch,
		timeout: args.values.timeout ? Number(args.values.timeout) : defaultTimeout, // Node.js defaults to Infinity, so set better fallback
	})
		.on('test:fail', () => {
			// For some reason, a test fail using the JS API does not set an exit code of 1,
			// so we set it here manually
			process.exitCode = 1;
		})
		.on('end', () => {
			const testPassed = process.exitCode === 0 || process.exitCode === undefined;
			teardownModule?.default(testPassed);
		})
		.pipe(new spec())
		.pipe(process.stdout);
}
