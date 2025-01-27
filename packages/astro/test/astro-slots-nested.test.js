import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Nested Slots', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/astro-slots-nested/' });
		await fixture.build();
	});

	it('Hidden nested slots see their hydration scripts hoisted', async () => {
		const html = await fixture.readFile('/hidden-nested/index.html');
		const $ = cheerio.load(html);
		assert.equal($('script').length, 1, 'script rendered');
		const scriptInTemplate = $($('template')[0].children[0]).find('script');
		assert.equal(scriptInTemplate.length, 0, 'script defined outside of the inner template');
	});

	it('Slots rendered via Astro.slots.render have the hydration script', async () => {
		const html = await fixture.readFile('/component-slot/index.html');
		const $ = cheerio.load(html);
		assert.equal($('script').length, 1, 'script rendered');
	});

	describe('Client components nested inside server-only framework components', () => {
		/** @type {cheerio.CheerioAPI} */
		let $;
		before(async () => {
			const html = await fixture.readFile('/server-component-nested/index.html');
			$ = cheerio.load(html);
		});

		it('react', () => {
			assert.equal($('#react astro-slot').length, 1);
			assert.equal($('#react astro-static-slot').length, 0);
		});

		it('vue', () => {
			assert.equal($('#vue astro-slot').length, 1);
			assert.equal($('#vue astro-static-slot').length, 0);
		});

		it('preact', () => {
			assert.equal($('#preact astro-slot').length, 1);
			assert.equal($('#preact astro-static-slot').length, 0);
		});

		it('solid', () => {
			assert.equal($('#solid astro-slot').length, 1);
			assert.equal($('#solid astro-static-slot').length, 0);
		});

		it('svelte', () => {
			assert.equal($('#svelte astro-slot').length, 1);
			assert.equal($('#svelte astro-static-slot').length, 0);
		});
	});
});
