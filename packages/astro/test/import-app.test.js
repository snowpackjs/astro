import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('Import astro/app', async () => {
	it('Successfully imports astro/app', async () => {
		try {
			await import('astro/app');
			assert.equal(true, true);
		} catch (err) {
			assert.fail(undefined, undefined, `Importing astro/app should not throw an error: ${err}`);
		}
	});
});
