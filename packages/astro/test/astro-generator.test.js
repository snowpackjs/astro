import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Astro generator', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-generator/',
		});
		await fixture.build();
	});

	describe('build', () => {
		it('Defines Astro.generator', async () => {
			const html = await fixture.readFile(`/index.html`);
			const $ = cheerio.load(html);

			assert.match($('meta[name="generator"]').attr('content'), /^Astro v/);
		});
	});
});
