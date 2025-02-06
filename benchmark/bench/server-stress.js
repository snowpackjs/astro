import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import autocannon from 'autocannon';
import { markdownTable } from 'markdown-table';
import { waitUntilBusy } from 'port-authority';
import pb from 'pretty-bytes';
import { exec } from 'tinyexec';
import { astroBin } from './_util.js';

const port = 4321;

export const defaultProject = 'server-stress-default';

/**
 * @param {URL} projectDir
 * @param {URL} outputFile
 */
export async function run(projectDir, outputFile) {
	const root = fileURLToPath(projectDir);

	console.log('Building...');
	await exec(astroBin, ['build'], {
		nodeOptions: {
			cwd: root,
			stdio: 'inherit',
		},
		throwOnError: true,
	});

	console.log('Previewing...');
	const previewProcess = await exec(astroBin, ['preview', '--port', port], {
		nodeOptions: {
			cwd: root,
			stdio: 'inherit',
		},
	});

	console.log('Waiting for server ready...');
	await waitUntilBusy(port, { timeout: 5000 });

	console.log('Running benchmark...');
	const result = await benchmarkCannon();

	console.log('Killing server...');
	if (!previewProcess.kill('SIGTERM')) {
		console.warn('Failed to kill server process id:', previewProcess.pid);
	}

	console.log('Writing results to', fileURLToPath(outputFile));
	await fs.writeFile(outputFile, JSON.stringify(result, null, 2));

	console.log('Result preview:');
	console.log('='.repeat(10));
	console.log(`#### Server stress\n\n`);
	console.log(printResult(result));
	console.log('='.repeat(10));

	console.log('Done!');
}

/**
 * @returns {Promise<import('autocannon').Result>}
 */
export async function benchmarkCannon() {
	return new Promise((resolve, reject) => {
		const instance = autocannon(
			{
				url: `http://localhost:${port}`,
				connections: 100,
				duration: 30,
				pipelining: 10,
			},
			(err, result) => {
				if (err) {
					reject(err);
				} else {
					// @ts-expect-error untyped but documented
					instance.stop();
					resolve(result);
				}
			},
		);
		autocannon.track(instance, { renderResultsTable: false });
	});
}

/**
 * @param {import('autocannon').Result} output
 */
function printResult(output) {
	const { latency: l, requests: r, throughput: t } = output;

	const latencyTable = markdownTable(
		[
			['', 'Avg', 'Stdev', 'Max'],
			['Latency', `${l.average} ms`, `${l.stddev} ms`, `${l.max} ms`],
		],
		{
			align: ['l', 'r', 'r', 'r'],
		},
	);

	const reqAndBytesTable = markdownTable(
		[
			['', 'Avg', 'Stdev', 'Min', 'Total in 30s'],
			['Req/Sec', r.average, r.stddev, r.min, `${(r.total / 1000).toFixed(1)}k requests`],
			['Bytes/Sec', pb(t.average), pb(t.stddev), pb(t.min), `${pb(t.total)} read`],
		],
		{
			align: ['l', 'r', 'r', 'r', 'r'],
		},
	);

	return `${latencyTable}\n\n${reqAndBytesTable}`;
}
