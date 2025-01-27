import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';
import { createRequestAndResponse } from './units/test-utils.js';

describe('NodeClientAddress', () => {
	describe('single value', () => {
		it('clientAddress is 1.1.1.1', async () => {
			const fixture = await loadFixture({
				root: './fixtures/client-address-node/',
			});
			await fixture.build();
			const handle = await fixture.loadNodeAdapterHandler();
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/',
				headers: {
					'x-forwarded-for': '1.1.1.1',
				},
			});
			handle(req, res);
			const html = await text();
			const $ = cheerio.load(html);
			assert.equal(res.statusCode, 200);
			assert.equal($('#address').text(), '1.1.1.1');
		});
	});

	describe('multiple values', () => {
		it('clientAddress is 1.1.1.1', async () => {
			const fixture = await loadFixture({
				root: './fixtures/client-address-node/',
			});
			await fixture.build();
			const handle = await fixture.loadNodeAdapterHandler();
			const { req, res, text } = createRequestAndResponse({
				method: 'GET',
				url: '/',
				headers: {
					'x-forwarded-for': '1.1.1.1,8.8.8.8, 8.8.8.2',
				},
			});
			handle(req, res);
			const html = await text();
			const $ = cheerio.load(html);
			assert.equal(res.statusCode, 200);
			assert.equal($('#address').text(), '1.1.1.1');
		});
	});
});
