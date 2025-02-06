import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import nodejs from '../dist/index.js';
import { loadFixture } from './test-utils.js';

describe('Bad URLs', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devPreview;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/bad-urls/',
			output: 'server',
			adapter: nodejs({ mode: 'standalone' }),
		});
		await fixture.build();
		devPreview = await fixture.preview();
	});

	after(async () => {
		await devPreview.stop();
	});

	it('Does not crash on bad urls', async () => {
		const weirdURLs = [
			'/\\xfs.bxss.me%3Fastrojs.com/hello-world',
			'/asdasdasd@ax_zX=.zxczas🐥%/úadasd000%/',
			'%',
			'%80',
			'%c',
			'%c0%80',
			'%20foobar%',
		];

		const statusCodes = [400, 404, 500];
		for (const weirdUrl of weirdURLs) {
			const fetchResult = await fixture.fetch(weirdUrl);
			assert.equal(
				statusCodes.includes(fetchResult.status),
				true,
				`${weirdUrl} returned something else than 400, 404, or 500`,
			);
		}
		const stillWork = await fixture.fetch('/');
		const text = await stillWork.text();
		assert.equal(text, '<!DOCTYPE html>Hello!');
	});
});
