import * as assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import nodejs from '../dist/index.js';
import { createRequestAndResponse, loadFixture } from './test-utils.js';

describe('API routes', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	/** @type {import('../../../astro/src/types/public/preview.js').PreviewServer} */
	let previewServer;
	/** @type {URL} */
	let baseUri;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/api-route/',
			output: 'server',
			adapter: nodejs({ mode: 'middleware' }),
		});
		await fixture.build();
		previewServer = await fixture.preview();
		baseUri = new URL(`http://${previewServer.host ?? 'localhost'}:${previewServer.port}/`);
	});

	after(() => previewServer.stop());

	it('Can get the request body', async () => {
		const { handler } = await import('./fixtures/api-route/dist/server/entry.mjs');
		const { req, res, done } = createRequestAndResponse({
			method: 'POST',
			url: '/recipes',
		});

		req.once('async_iterator', () => {
			req.send(JSON.stringify({ id: 2 }));
		});

		handler(req, res);

		const [buffer] = await done;

		const json = JSON.parse(buffer.toString('utf-8'));

		assert.equal(json.length, 1);

		assert.equal(json[0].name, 'Broccoli Soup');
	});

	it('Can get binary data', async () => {
		const { handler } = await import('./fixtures/api-route/dist/server/entry.mjs');

		const { req, res, done } = createRequestAndResponse({
			method: 'POST',
			url: '/binary',
		});

		req.once('async_iterator', () => {
			req.send(Buffer.from(new Uint8Array([1, 2, 3, 4, 5])));
		});

		handler(req, res);

		const [out] = await done;
		const arr = Array.from(new Uint8Array(out.buffer));
		assert.deepEqual(arr, [5, 4, 3, 2, 1]);
	});

	it('Can post large binary data', async () => {
		const { handler } = await import('./fixtures/api-route/dist/server/entry.mjs');

		const { req, res, done } = createRequestAndResponse({
			method: 'POST',
			url: '/hash',
		});

		handler(req, res);

		let expectedDigest = null;
		req.once('async_iterator', () => {
			// Send 256MB of garbage data in 256KB chunks. This should be fast (< 1sec).
			let remainingBytes = 256 * 1024 * 1024;
			const chunkSize = 256 * 1024;

			const hash = crypto.createHash('sha256');
			while (remainingBytes > 0) {
				const size = Math.min(remainingBytes, chunkSize);
				const chunk = Buffer.alloc(size, Math.floor(Math.random() * 256));
				hash.update(chunk);
				req.emit('data', chunk);
				remainingBytes -= size;
			}

			req.emit('end');
			expectedDigest = hash.digest();
		});

		const [out] = await done;
		assert.deepEqual(new Uint8Array(out.buffer), new Uint8Array(expectedDigest));
	});

	it('Can bail on streaming', async () => {
		const { handler } = await import('./fixtures/api-route/dist/server/entry.mjs');
		const { req, res, done } = createRequestAndResponse({
			url: '/streaming',
		});

		const locals = { cancelledByTheServer: false };

		handler(req, res, () => {}, locals);
		req.send();

		await new Promise((resolve) => setTimeout(resolve, 500));
		res.emit('close');

		await done;

		assert.deepEqual(locals, { cancelledByTheServer: true });
	});

	it('Can respond with SSR redirect', async () => {
		const controller = new AbortController();
		setTimeout(() => controller.abort(), 1000);
		const response = await fetch(new URL('/redirect', baseUri), {
			redirect: 'manual',
			signal: controller.signal,
		});
		assert.equal(response.status, 302);
		assert.equal(response.headers.get('location'), '/destination');
	});

	it('Can respond with Astro.redirect', async () => {
		const controller = new AbortController();
		setTimeout(() => controller.abort(), 1000);
		const response = await fetch(new URL('/astro-redirect', baseUri), {
			redirect: 'manual',
			signal: controller.signal,
		});
		assert.equal(response.status, 303);
		assert.equal(response.headers.get('location'), '/destination');
	});

	it('Can respond with Response.redirect', async () => {
		const controller = new AbortController();
		setTimeout(() => controller.abort(), 1000);
		const response = await fetch(new URL('/response-redirect', baseUri), {
			redirect: 'manual',
			signal: controller.signal,
		});
		assert.equal(response.status, 307);
		assert.equal(response.headers.get('location'), String(new URL('/destination', baseUri)));
	});
});
