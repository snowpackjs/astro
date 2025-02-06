import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import * as cheerio from 'cheerio';
import nodejs from '../dist/index.js';
import { loadFixture } from './test-utils.js';

describe('Errors', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/errors/',
			output: 'server',
			adapter: nodejs({ mode: 'standalone' }),
		});
		await fixture.build();
	});
	let devPreview;

	// biome-ignore lint/suspicious/noDuplicateTestHooks: <explanation>
	before(async () => {
		// The two tests that need the server to run are skipped
		// devPreview = await fixture.preview();
	});
	after(async () => {
		await devPreview?.stop();
	});

	it('stays alive after offshoot promise rejections', async () => {
		// this test needs to happen in a worker because node test runner adds a listener for unhandled rejections in the main thread
		const url = new URL('./fixtures/errors/dist/server/entry.mjs', import.meta.url);
		const worker = new Worker(fileURLToPath(url), {
			type: 'module',
			env: { ASTRO_NODE_LOGGING: 'enabled' },
		});

		await new Promise((resolve, reject) => {
			worker.stdout.on('data', (data) => {
				setTimeout(() => reject('Server took too long to start'), 1000);
				if (data.toString().includes('Server listening on http://localhost:4321')) resolve();
			});
		});

		await fetch('http://localhost:4321/offshoot-promise-rejection');

		// if there was a crash, it becomes an error here
		await worker.terminate();
	});

	it(
		'rejected promise in template',
		{ skip: true, todo: 'Review the response from the in-stream' },
		async () => {
			const res = await fixture.fetch('/in-stream');
			const html = await res.text();
			const $ = cheerio.load(html);

			assert.equal($('p').text().trim(), 'Internal server error');
		},
	);

	it(
		'generator that throws called in template',
		{ skip: true, todo: 'Review the response from the generator' },
		async () => {
			const result = ['<!DOCTYPE html><h1>Astro</h1> 1', 'Internal server error'];

			/** @type {Response} */
			const res = await fixture.fetch('/generator');
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			const chunk1 = await reader.read();
			const chunk2 = await reader.read();
			const chunk3 = await reader.read();
			assert.equal(chunk1.done, false);
			console.log(chunk1);
			console.log(chunk2);
			console.log(chunk3);
			if (chunk2.done) {
				assert.equal(decoder.decode(chunk1.value), result.join(''));
			} else if (chunk3.done) {
				assert.equal(decoder.decode(chunk1.value), result[0]);
				assert.equal(decoder.decode(chunk2.value), result[1]);
			} else {
				throw new Error('The response should take at most 2 chunks.');
			}
		},
	);
});
