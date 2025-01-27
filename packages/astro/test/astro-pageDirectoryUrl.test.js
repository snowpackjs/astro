import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { before, describe, it } from 'node:test';
import { Logger } from '../dist/core/logger/core.js';
import { loadFixture } from './test-utils.js';

describe('build format', () => {
	describe('build.format: file', () => {
		/** @type {import('./test-utils.js').Fixture} */
		let fixture;
		const logs = [];

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-page-directory-url',
				build: {
					format: 'file',
				},
			});
			await fixture.build({
				logger: new Logger({
					level: 'info',
					dest: new Writable({
						objectMode: true,
						write(event, _, callback) {
							logs.push(event);
							callback();
						},
					}),
				}),
			});
		});

		it('outputs', async () => {
			assert.ok(await fixture.readFile('/client.html'));
			assert.ok(await fixture.readFile('/nested-md.html'));
			assert.ok(await fixture.readFile('/nested-astro.html'));
		});

		it('logs correct output paths', () => {
			assert.ok(logs.find((log) => log.level === 'info' && log.message.includes('/client.html')));
			assert.ok(
				logs.find((log) => log.level === 'info' && log.message.includes('/nested-md.html')),
			);
			assert.ok(
				logs.find((log) => log.level === 'info' && log.message.includes('/nested-astro.html')),
			);
		});
	});

	describe('build.format: preserve', () => {
		/** @type {import('./test-utils.js').Fixture} */
		let fixture;
		const logs = [];

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/astro-page-directory-url',
				build: {
					format: 'preserve',
				},
			});
			await fixture.build({
				logger: new Logger({
					level: 'info',
					dest: new Writable({
						objectMode: true,
						write(event, _, callback) {
							logs.push(event);
							callback();
						},
					}),
				}),
			});
		});

		it('outputs', async () => {
			assert.ok(await fixture.readFile('/client.html'));
			assert.ok(await fixture.readFile('/nested-md/index.html'));
			assert.ok(await fixture.readFile('/nested-astro/index.html'));
		});

		it('logs correct output paths', () => {
			assert.ok(logs.find((log) => log.level === 'info' && log.message.includes('/client.html')));
			assert.ok(
				logs.find((log) => log.level === 'info' && log.message.includes('/nested-md/index.html')),
			);
			assert.ok(
				logs.find(
					(log) => log.level === 'info' && log.message.includes('/nested-astro/index.html'),
				),
			);
		});
	});
});
