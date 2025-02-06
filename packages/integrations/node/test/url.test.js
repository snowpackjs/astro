import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { TLSSocket } from 'node:tls';
import * as cheerio from 'cheerio';
import nodejs from '../dist/index.js';
import { createRequestAndResponse, loadFixture } from './test-utils.js';

describe('URL', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/url/',
			output: 'server',
			adapter: nodejs({ mode: 'standalone' }),
		});
		await fixture.build();
	});

	it('return http when non-secure', async () => {
		const { handler } = await import('./fixtures/url/dist/server/entry.mjs');
		const { req, res, text } = createRequestAndResponse({
			url: '/',
		});

		handler(req, res);
		req.send();

		const html = await text();
		assert.equal(html.includes('http:'), true);
	});

	it('return https when secure', async () => {
		const { handler } = await import('./fixtures/url/dist/server/entry.mjs');
		const { req, res, text } = createRequestAndResponse({
			socket: new TLSSocket(),
			url: '/',
		});

		handler(req, res);
		req.send();

		const html = await text();
		assert.equal(html.includes('https:'), true);
	});

	it('return http when the X-Forwarded-Proto header is set to http', async () => {
		const { handler } = await import('./fixtures/url/dist/server/entry.mjs');
		const { req, res, text } = createRequestAndResponse({
			headers: { 'X-Forwarded-Proto': 'http' },
			url: '/',
		});

		handler(req, res);
		req.send();

		const html = await text();
		assert.equal(html.includes('http:'), true);
	});

	it('return https when the X-Forwarded-Proto header is set to https', async () => {
		const { handler } = await import('./fixtures/url/dist/server/entry.mjs');
		const { req, res, text } = createRequestAndResponse({
			headers: { 'X-Forwarded-Proto': 'https' },
			url: '/',
		});

		handler(req, res);
		req.send();

		const html = await text();
		assert.equal(html.includes('https:'), true);
	});

	it('includes forwarded host and port in the url', async () => {
		const { handler } = await import('./fixtures/url/dist/server/entry.mjs');
		const { req, res, text } = createRequestAndResponse({
			headers: {
				'X-Forwarded-Proto': 'https',
				'X-Forwarded-Host': 'abc.xyz',
				'X-Forwarded-Port': '444',
			},
			url: '/',
		});

		handler(req, res);
		req.send();

		const html = await text();
		const $ = cheerio.load(html);

		assert.equal($('body').text(), 'https://abc.xyz:444/');
	});

	it('accepts port in forwarded host and forwarded port', async () => {
		const { handler } = await import('./fixtures/url/dist/server/entry.mjs');
		const { req, res, text } = createRequestAndResponse({
			headers: {
				'X-Forwarded-Proto': 'https',
				'X-Forwarded-Host': 'abc.xyz:444',
				'X-Forwarded-Port': '444',
			},
			url: '/',
		});

		handler(req, res);
		req.send();

		const html = await text();
		const $ = cheerio.load(html);

		assert.equal($('body').text(), 'https://abc.xyz:444/');
	});
});
