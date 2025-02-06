import * as assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { toJson } from 'tsconfck';
import { loadTSConfig, updateTSConfigForFramework } from '../../../dist/core/config/index.js';

const cwd = fileURLToPath(new URL('../../fixtures/tsconfig-handling/', import.meta.url));

describe('TSConfig handling', () => {
	describe('tsconfig / jsconfig loading', () => {
		it('can load tsconfig.json', async () => {
			const config = await loadTSConfig(cwd);

			assert.equal(config !== undefined, true);
		});

		it('can resolve tsconfig.json up directories', async () => {
			const config = await loadTSConfig(cwd);

			assert.equal(config !== undefined, true);
			assert.equal(config.tsconfigFile, path.join(cwd, 'tsconfig.json'));
			assert.deepEqual(config.tsconfig.files, ['im-a-test']);
		});

		it('can fallback to jsconfig.json if tsconfig.json does not exists', async () => {
			const config = await loadTSConfig(path.join(cwd, 'jsconfig'));

			assert.equal(config !== undefined, true);
			assert.equal(config.tsconfigFile, path.join(cwd, 'jsconfig', 'jsconfig.json'));
			assert.deepEqual(config.tsconfig.files, ['im-a-test-js']);
		});

		it('properly return errors when not resolving', async () => {
			const invalidConfig = await loadTSConfig(path.join(cwd, 'invalid'));
			const missingConfig = await loadTSConfig(path.join(cwd, 'missing'));

			assert.equal(invalidConfig, 'invalid-config');
			assert.equal(missingConfig, 'missing-config');
		});

		it('does not change baseUrl in raw config', async () => {
			const loadedConfig = await loadTSConfig(path.join(cwd, 'baseUrl'));
			const rawConfig = await readFile(path.join(cwd, 'baseUrl', 'tsconfig.json'), 'utf-8')
				.then(toJson)
				.then((content) => JSON.parse(content));

			assert.deepEqual(loadedConfig.rawConfig, rawConfig);
		});
	});

	describe('tsconfig / jsconfig updates', () => {
		it('can update a tsconfig with a framework config', async () => {
			const config = await loadTSConfig(cwd);
			const updatedConfig = updateTSConfigForFramework(config.tsconfig, 'react');

			assert.notEqual(config.tsconfig, 'react-jsx');
			assert.equal(updatedConfig.compilerOptions.jsx, 'react-jsx');
		});

		it('produce no changes on invalid frameworks', async () => {
			const config = await loadTSConfig(cwd);
			const updatedConfig = updateTSConfigForFramework(config.tsconfig, 'doesnt-exist');

			assert.deepEqual(config.tsconfig, updatedConfig);
		});
	});
});
