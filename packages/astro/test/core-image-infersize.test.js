import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';

import { Logger } from '../dist/core/logger/core.js';
import { loadFixture } from './test-utils.js';

describe('astro:image:infersize', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	describe('dev', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;
		/** @type {Array<{ type: any, level: 'error', message: string; }>} */
		let logs = [];

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-infersize/',
			});

			devServer = await fixture.startDevServer({
				logger: new Logger({
					level: 'error',
					dest: new Writable({
						objectMode: true,
						write(event, _, callback) {
							logs.push(event);
							callback();
						},
					}),
				}),
			});
		});

		after(async () => {
			await devServer.stop();
		});

		describe('inferSize works', () => {
			let $;
			before(async () => {
				let res = await fixture.fetch('/');
				let html = await res.text();
				$ = cheerio.load(html);
			});

			it('Image component works', async () => {
				let $img = $('img');
				assert.equal(
					$img.attr('src').startsWith('/_image') && $img.attr('src').endsWith('f=webp'),
					true,
				);
			});

			it('Picture component works', async () => {
				let $img = $('picture img');
				assert.equal(
					$img.attr('src').startsWith('/_image') && $img.attr('src').endsWith('f=png'),
					true,
				);
			});

			it('getImage works', async () => {
				let $img = $('#getImage');
				assert.equal(
					$img.attr('src').startsWith('/_image') && $img.attr('src').endsWith('f=webp'),
					true,
				);
			});

			it('direct function call work', async () => {
				let $dimensions = $('#direct');
				assert.equal($dimensions.text().trim(), '64x64');
			});
		});
	});
});
