import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Slots: React', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/slots-react/' });
		await fixture.build();
	});

	it('Renders default slot', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#default-self-closing').text().trim(), 'Fallback');
		assert.equal($('#default-empty').text().trim(), 'Fallback');
		assert.equal($('#zero').text().trim(), '0');
		assert.equal($('#false').text().trim(), '');
		assert.equal($('#string').text().trim(), '');
		assert.equal($('#content').text().trim(), 'Hello world!');
	});

	it('Renders named slot', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		assert.equal($('#named').text().trim(), 'Fallback / Named');
	});

	it('Converts dash-case slot to camelCase', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		assert.equal($('#dash-case').text().trim(), 'Fallback / Dash Case');
	});

	describe('For MDX Pages', () => {
		it('Renders default slot', async () => {
			const html = await fixture.readFile('/mdx/index.html');
			const $ = cheerio.load(html);
			assert.equal($('#content').text().trim(), 'Hello world!');
		});

		it('Renders named slot', async () => {
			const html = await fixture.readFile('/mdx/index.html');
			const $ = cheerio.load(html);
			assert.equal($('#named').text().trim(), 'Fallback / Named');
		});

		it('Converts dash-case slot to camelCase', async () => {
			const html = await fixture.readFile('/mdx/index.html');
			const $ = cheerio.load(html);
			assert.equal($('#dash-case').text().trim(), 'Fallback / Dash Case');
		});
	});

	describe('Slots.render() API', async () => {
		it('Simple imperative slot render', async () => {
			const html = await fixture.readFile('/slottedapi-render/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#render').length, 1);
			assert.equal($('#render').text(), 'render');
		});

		it('Child function render without args', async () => {
			const html = await fixture.readFile('/slottedapi-render/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#render-fn').length, 1);
			assert.equal($('#render-fn').text(), 'render-fn');
		});

		it('Child function render with args', async () => {
			const html = await fixture.readFile('/slottedapi-render/index.html');
			const $ = cheerio.load(html);

			assert.equal($('#render-args').length, 1);
			assert.equal($('#render-args span').length, 1);
			assert.equal($('#render-args').text(), 'render-args');
		});
	});
});
