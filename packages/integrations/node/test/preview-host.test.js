import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import nodejs from '../dist/index.js';
import { loadFixture } from './test-utils.js';

describe('Astro preview host', () => {
	it('defaults to localhost', async () => {
		const fixture = await loadFixture({
			root: './fixtures/preview-headers/',
			output: 'server',
			adapter: nodejs({ mode: 'standalone' }),
		});
		await fixture.build();
		const devPreview = await fixture.preview();
		assert.equal(devPreview.host, 'localhost');
		await devPreview.stop();
	});

	it('uses default when set to false', async () => {
		const fixture = await loadFixture({
			root: './fixtures/preview-headers/',
			output: 'server',
			adapter: nodejs({ mode: 'standalone' }),
			server: {
				host: false,
			},
		});
		await fixture.build();
		const devPreview = await fixture.preview();
		assert.equal(devPreview.host, 'localhost');
		await devPreview.stop();
	});

	it('sets wildcard host if set to true', async () => {
		const fixture = await loadFixture({
			root: './fixtures/preview-headers/',
			output: 'server',
			adapter: nodejs({ mode: 'standalone' }),
			server: {
				host: true,
			},
		});
		await fixture.build();
		const devPreview = await fixture.preview();
		assert.equal(devPreview.host, '0.0.0.0');
		await devPreview.stop();
	});

	it('allows setting specific host', async () => {
		const fixture = await loadFixture({
			root: './fixtures/preview-headers/',
			output: 'server',
			adapter: nodejs({ mode: 'standalone' }),
			server: {
				host: '127.0.0.1',
			},
		});
		await fixture.build();
		const devPreview = await fixture.preview();
		assert.equal(devPreview.host, '127.0.0.1');
		await devPreview.stop();
	});
});
