import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Slots', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/astro-slots/' });
		await fixture.build();
	});

	it('Basic named slots work', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#a').text().trim(), 'A');
		assert.equal($('#b').text().trim(), 'B');
		assert.equal($('#c').text().trim(), 'C');
		assert.equal($('#default').text().trim(), 'Default');
	});

	it('Dynamic named slots work', async () => {
		const html = await fixture.readFile('/dynamic/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#a').text().trim(), 'A');
		assert.equal($('#b').text().trim(), 'B');
		assert.equal($('#c').text().trim(), 'C');
		assert.equal($('#default').text().trim(), 'Default');
	});

	it('Conditional named slots work', async () => {
		const html = await fixture.readFile('/conditional/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#a').text().trim(), 'A');
		assert.equal($('#b').text().trim(), 'B');
		assert.equal($('#c').text().trim(), 'C');
		assert.equal($('#default').text().trim(), 'Default');
	});

	it('Slots of a component render fallback content by default', async () => {
		const html = await fixture.readFile('/fallback/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#default').length, 1);
	});

	it('Slots of a page render fallback content', async () => {
		const html = await fixture.readFile('/fallback-own/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#default').length, 1);
	});

	it('Slots override fallback content', async () => {
		const html = await fixture.readFile('/fallback-override/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#override').length, 1);
		assert.equal($('#fallback-2').text(), 'Slotty slot.');
	});

	it('Slots work with multiple elements', async () => {
		const html = await fixture.readFile('/multiple/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#a').text().trim(), 'ABC');
	});

	it('Slots work on Components', async () => {
		const html = await fixture.readFile('/component/index.html');
		const $ = cheerio.load(html);

		// test 1: #a renders
		assert.equal($('#a').length, 1);

		// test 2: Slotted component into #a
		assert.equal($('#a').children('astro-component').length, 1);
		// test 3: Slotted component into default slot
		assert.equal($('#default').children('astro-component').length, 1);
	});

	describe('Slots API work on Components', () => {
		it('IDs will exist whether the slots are filled or not', async () => {
			const html = await fixture.readFile('/slottedapi-default/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#a').length, 1);
			assert.equal($('#b').length, 1);
			assert.equal($('#c').length, 1);
			assert.equal($('#default').length, 1);
		});

		it('IDs will not exist because the slots are not filled', async () => {
			const html = await fixture.readFile('/slottedapi-empty/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#a').length, 0);
			assert.equal($('#b').length, 0);
			assert.equal($('#c').length, 0);
			assert.equal($('#default').length, 0);
		});

		it('IDs will exist because the slots are filled', async () => {
			const html = await fixture.readFile('/slottedapi-filled/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#a').length, 1);
			assert.equal($('#b').length, 1);
			assert.equal($('#c').length, 1);

			assert.equal($('#default').length, 0); // the default slot is not filled
		});

		it('Default ID will exist because the default slot is filled', async () => {
			const html = await fixture.readFile('/slottedapi-default-filled/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#a').length, 0);
			assert.equal($('#b').length, 0);
			assert.equal($('#c').length, 0);

			assert.equal($('#default').length, 1); // the default slot is not filled
		});
	});

	it('Slots.render() API', async () => {
		// Simple imperative slot render
		{
			const html = await fixture.readFile('/slottedapi-render/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#render').length, 1);
			assert.equal($('#render').text(), 'render');
		}

		// Child function render without args
		{
			const html = await fixture.readFile('/slottedapi-render/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#render-fn').length, 1);
			assert.equal($('#render-fn').text(), 'render-fn');
		}

		// Child function render with args
		{
			const html = await fixture.readFile('/slottedapi-render/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#render-args').length, 1);
			assert.equal($('#render-args span').length, 1);
			assert.equal($('#render-args').text(), 'render-args');
		}

		{
			const html = await fixture.readFile('/rendered-multiple-times/index.html');
			const $ = cheerio.load(html);

			const elements = $('div');
			assert.equal(elements.length, 10);

			const [first, second, third] = elements;

			assert.notEqual(first.children[0].data, second.children[0].data);
			assert.notEqual(second.children[0].data, third.children[0].data);
			assert.notEqual(third.children[0].data, first.children[0].data);
		}
	});

	it('Arguments can be passed to named slots with Astro.slots.render()', async () => {
		const html = await fixture.readFile('/slotted-named-functions/index.html');
		const $ = cheerio.load(html);
		const beforeDiv = $('div#before');
		const [beforeChildren] = beforeDiv.children('div');
		assert.deepEqual(beforeChildren.firstChild.data, 'Test Content BEFORE');
		const afterDiv = $('div#after');
		const [afterChildren] = afterDiv.children('div');
		assert.deepEqual(afterChildren.firstChild.data, 'Test Content AFTER');
	});
});
