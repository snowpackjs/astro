import * as assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { resolveConfig } from '../../../dist/core/config/index.js';

describe('resolveConfig', () => {
	it('resolves relative inline root correctly', async () => {
		const { astroConfig } = await resolveConfig(
			{
				configFile: false,
				root: 'relative/path',
			},
			'dev',
		);
		const expectedRoot = path.join(process.cwd(), 'relative/path/');
		assert.equal(fileURLToPath(astroConfig.root), expectedRoot);
	});
});
