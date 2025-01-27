import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import testAdapter from '../../astro/test/test-adapter.js';
import { loadFixture } from '../../astro/test/test-utils.js';
import { setupRemoteDbServer } from './test-utils.js';

describe('missing app token', () => {
	let fixture;
	let remoteDbServer;
	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/no-apptoken/', import.meta.url),
			output: 'server',
			adapter: testAdapter(),
		});

		remoteDbServer = await setupRemoteDbServer(fixture.config);
		await fixture.build();
		// Ensure there's no token at runtime
		delete process.env.ASTRO_STUDIO_APP_TOKEN;
	});

	after(async () => {
		await remoteDbServer?.stop();
	});

	it('Errors as runtime', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/');
		const response = await app.render(request);
		try {
			await response.text();
		} catch {
			assert.equal(response.status, 501);
		}
	});
});
