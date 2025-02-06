import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createVitest } from 'vitest/node';

describe('vitest', () => {
	it('basics', async () => {
		const config = new URL('./fixtures/vitest/vitest.config.js', import.meta.url);

		const vitest = await createVitest('test', {
			config: fileURLToPath(config),
			root: fileURLToPath(new URL('./fixtures/vitest/', import.meta.url)),
			watch: false,
		});

		try {
			await vitest.start();
		} catch (_) {
			assert.ok(false, 'test failed');
		} finally {
			await vitest.close();
		}
	});
});
