import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createLoader } from '../../../dist/core/module-loader/index.js';
import {
	createController,
	runWithErrorHandling,
} from '../../../dist/vite-plugin-astro-server/index.js';

describe('vite-plugin-astro-server', () => {
	describe('controller', () => {
		it('calls the onError method when an error occurs in the handler', async () => {
			const controller = createController({ loader: createLoader() });
			let error = undefined;
			await runWithErrorHandling({
				controller,
				pathname: '/',
				run() {
					throw new Error('oh no');
				},
				onError(err) {
					error = err;
				},
			});
			assert.equal(typeof error !== 'undefined', true);
			assert.equal(error instanceof Error, true);
		});

		it('sets the state to error when an error occurs in the handler', async () => {
			const controller = createController({ loader: createLoader() });
			await runWithErrorHandling({
				controller,
				pathname: '/',
				run() {
					throw new Error('oh no');
				},
				onError() {},
			});
			assert.equal(controller.state.state, 'error');
		});

		it('calls reload when a file change occurs when in an error state', async () => {
			let reloads = 0;
			const loader = createLoader({
				eachModule() {},
				clientReload() {
					reloads++;
				},
			});
			const controller = createController({ loader });
			loader.events.emit('file-change');
			assert.equal(reloads, 0);
			await runWithErrorHandling({
				controller,
				pathname: '/',
				run() {
					throw new Error('oh no');
				},
				onError() {},
			});
			assert.equal(reloads, 0);
			loader.events.emit('file-change');
			assert.equal(reloads, 1);
		});

		it('does not call reload on file change if not in an error state', async () => {
			let reloads = 0;
			const loader = createLoader({
				eachModule() {},
				clientReload() {
					reloads++;
				},
			});
			const controller = createController({ loader });
			loader.events.emit('file-change');
			assert.equal(reloads, 0);
			await runWithErrorHandling({
				controller,
				pathname: '/',
				run() {
					throw new Error('oh no');
				},
				onError() {},
			});
			assert.equal(reloads, 0);
			loader.events.emit('file-change');
			assert.equal(reloads, 1);
			loader.events.emit('file-change');
			assert.equal(reloads, 2);

			await runWithErrorHandling({
				controller,
				pathname: '/',
				// No error here
				run() {},
			});
			loader.events.emit('file-change');
			assert.equal(reloads, 2);
		});

		it('Invalidates broken modules when a change occurs in an error state', async () => {
			const mods = [
				{ id: 'one', ssrError: new Error('one') },
				{ id: 'two', ssrError: null },
				{ id: 'three', ssrError: new Error('three') },
			];

			const loader = createLoader({
				eachModule(cb) {
					return mods.forEach(cb);
				},
				invalidateModule(mod) {
					mod.ssrError = null;
				},
			});
			const controller = createController({ loader });

			await runWithErrorHandling({
				controller,
				pathname: '/',
				run() {
					throw new Error('oh no');
				},
				onError() {},
			});

			loader.events.emit('file-change');

			assert.deepEqual(mods, [
				{ id: 'one', ssrError: null },
				{ id: 'two', ssrError: null },
				{ id: 'three', ssrError: null },
			]);
		});
	});
});
