import { before, describe, it } from 'node:test';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';
describe('SSR Preview', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-preview/',
			output: 'server',
			adapter: testAdapter({ extendAdapter: { previewEntrypoint: './preview.mjs' } }),
		});
		await fixture.build();
	});

	it('preview server works', async () => {
		/** @type {import('./test-utils').PreviewServer} */
		const previewServer = await fixture.preview();
		await previewServer.stop();
	});
});
