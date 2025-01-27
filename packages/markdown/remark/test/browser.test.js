import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import esbuild from 'esbuild';

describe('Bundle for browsers', async () => {
	it('esbuild browser build should work', async () => {
		try {
			const result = await esbuild.build({
				platform: 'browser',
				entryPoints: ['@astrojs/markdown-remark'],
				bundle: true,
				write: false,
			});
			assert.ok(result.outputFiles.length > 0);
		} catch (error) {
			// Capture any esbuild errors and fail the test
			assert.fail(error.message);
		}
	});
});
